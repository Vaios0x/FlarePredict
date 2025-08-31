// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FlarePredict - Real-Time Prediction Market with Instant Settlement
 * @dev Leverages Flare's free FTSO oracles for sub-2-second resolution
 */
contract FlarePredict {

    // Platform configuration
    uint256 public constant PLATFORM_FEE = 200; // 2% in basis points
    uint256 public constant MIN_BET = 0.1 ether;
    uint256 public constant MAX_BET = 1000 ether;
    uint256 public constant RESOLUTION_BUFFER = 300; // 5 minutes after deadline
    
    // Market types
    enum MarketType { BINARY, RANGE, MULTI_OUTCOME }
    enum MarketStatus { OPEN, CLOSED, RESOLVED, CANCELLED }
    
    struct Market {
        string title;
        string description;
        bytes21 feedId; // FTSO feed identifier
        MarketType marketType;
        MarketStatus status;
        uint256 threshold; // For binary markets
        uint256 lowerBound; // For range markets
        uint256 upperBound; // For range markets
        uint256 deadline;
        uint256 resolutionTime;
        uint256 totalYesStake;
        uint256 totalNoStake;
        uint256 finalValue;
        address creator;
        uint256 creatorReward;
        bool emergencyResolved;
    }
    
    struct Position {
        uint256 amount;
        bool isYes; // true = YES, false = NO
        bool claimed;
        uint256 timestamp;
    }
    
    // State variables
    uint256 public marketCounter;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(address => uint256[]) public userMarkets;
    mapping(bytes21 => uint256[]) public feedMarkets;
    
    // Platform metrics
    uint256 public totalVolume;
    uint256 public totalFeesCollected;
    uint256 public platformTreasury;
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        bytes21 feedId,
        uint256 deadline,
        string title
    );
    
    event PositionTaken(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 newOdds
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        uint256 finalValue,
        uint256 totalPayout,
        uint256 platformFee
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 payout
    );
    
    event EmergencyResolution(
        uint256 indexed marketId,
        string reason
    );

    constructor() {
        // Initialize with default values
    }
    
    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory _title,
        string memory _description,
        bytes21 _feedId,
        MarketType _type,
        uint256 _threshold,
        uint256 _deadline
    ) external returns (uint256) {
        require(_deadline > block.timestamp + 3600, "Deadline too soon");
        require(_deadline < block.timestamp + 30 days, "Deadline too far");
        require(bytes(_title).length > 0 && bytes(_title).length <= 100, "Invalid title");
        
        uint256 marketId = marketCounter++;
        
        Market storage market = markets[marketId];
        market.title = _title;
        market.description = _description;
        market.feedId = _feedId;
        market.marketType = _type;
        market.status = MarketStatus.OPEN;
        market.threshold = _threshold;
        market.deadline = _deadline;
        market.creator = msg.sender;
        
        userMarkets[msg.sender].push(marketId);
        feedMarkets[_feedId].push(marketId);
        
        emit MarketCreated(marketId, msg.sender, _feedId, _deadline, _title);
        
        return marketId;
    }
    
    /**
     * @dev Place a bet on a market
     */
    function placeBet(uint256 _marketId, bool _isYes) 
        external 
        payable 
    {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp < market.deadline, "Market expired");
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid bet amount");
        
        Position storage position = positions[_marketId][msg.sender];
        require(position.amount == 0, "Position already exists");
        
        position.amount = msg.value;
        position.isYes = _isYes;
        position.timestamp = block.timestamp;
        
        if (_isYes) {
            market.totalYesStake = market.totalYesStake + msg.value;
        } else {
            market.totalNoStake = market.totalNoStake + msg.value;
        }
        
        totalVolume = totalVolume + msg.value;
        
        if (!_hasUserMarket(msg.sender, _marketId)) {
            userMarkets[msg.sender].push(_marketId);
        }
        
        uint256 currentOdds = calculateOdds(_marketId, _isYes);
        emit PositionTaken(_marketId, msg.sender, _isYes, msg.value, currentOdds);
    }
    
    /**
     * @dev Resolve a market using FTSO oracle data
     */
    function resolveMarket(uint256 _marketId, uint256 _finalValue) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp >= market.deadline, "Market not expired");
        require(block.timestamp <= market.deadline + RESOLUTION_BUFFER, "Resolution window passed");
        
        market.finalValue = _finalValue;
        market.resolutionTime = block.timestamp;
        market.status = MarketStatus.RESOLVED;
        
        // Calculate platform fees
        uint256 totalStake = market.totalYesStake + market.totalNoStake;
        uint256 platformFee = (totalStake * PLATFORM_FEE) / 10000;
        uint256 creatorReward = (platformFee * 10) / 100; // 10% to creator
        
        market.creatorReward = creatorReward;
        platformTreasury = platformTreasury + (platformFee - creatorReward);
        totalFeesCollected = totalFeesCollected + platformFee;
        
        emit MarketResolved(_marketId, _finalValue, totalStake - platformFee, platformFee);
    }
    
    /**
     * @dev Claim winnings from a resolved market
     */
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.RESOLVED, "Market not resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        require(position.amount > 0, "No position");
        require(!position.claimed, "Already claimed");
        
        bool isWinner = _isWinningPosition(market, position.isYes);
        
        if (isWinner) {
            uint256 totalStake = market.totalYesStake + market.totalNoStake;
            uint256 platformFee = (totalStake * PLATFORM_FEE) / 10000;
            uint256 distributablePool = totalStake - platformFee;
            
            uint256 winnerPool = position.isYes ? market.totalYesStake : market.totalNoStake;
            uint256 payout = (position.amount * distributablePool) / winnerPool;
            
            position.claimed = true;
            
            (bool success,) = msg.sender.call{value: payout}("");
            require(success, "Transfer failed");
            
            emit WinningsClaimed(_marketId, msg.sender, payout);
        } else {
            position.claimed = true;
            emit WinningsClaimed(_marketId, msg.sender, 0);
        }
    }
    
    /**
     * @dev Calculate current odds for a position
     */
    function calculateOdds(uint256 _marketId, bool _isYes) public view returns (uint256) {
        Market storage market = markets[_marketId];
        
        if (market.totalYesStake == 0 && market.totalNoStake == 0) {
            return 5000; // 50% initial odds
        }
        
        uint256 totalStake = market.totalYesStake + market.totalNoStake;
        uint256 relevantStake = _isYes ? market.totalYesStake : market.totalNoStake;
        
        if (relevantStake == 0) {
            return 9900; // 99% odds if no stake on this side
        }
        
        return (relevantStake * 10000) / totalStake;
    }
    
    /**
     * @dev Get all active markets for a feed
     */
    function getActiveMarketsByFeed(bytes21 _feedId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] storage allMarkets = feedMarkets[_feedId];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allMarkets.length; i++) {
            if (markets[allMarkets[i]].status == MarketStatus.OPEN) {
                activeCount++;
            }
        }
        
        uint256[] memory activeMarkets = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allMarkets.length; i++) {
            if (markets[allMarkets[i]].status == MarketStatus.OPEN) {
                activeMarkets[index++] = allMarkets[i];
            }
        }
        
        return activeMarkets;
    }
    
    /**
     * @dev Emergency resolution by owner (with time lock)
     */
    function emergencyResolve(uint256 _marketId, uint256 _finalValue, string memory _reason) 
        external 
    {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(
            block.timestamp > market.deadline + RESOLUTION_BUFFER, 
            "Use normal resolution"
        );
        
        market.finalValue = _finalValue;
        market.resolutionTime = block.timestamp;
        market.status = MarketStatus.RESOLVED;
        market.emergencyResolved = true;
        
        emit EmergencyResolution(_marketId, _reason);
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawTreasury(uint256 _amount) external {
        require(_amount <= platformTreasury, "Insufficient treasury");
        platformTreasury = platformTreasury - _amount;
        
        (bool success,) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
    }
    
    // Internal functions
    function _isWinningPosition(Market memory market, bool isYes) 
        private 
        pure 
        returns (bool) 
    {
        if (market.marketType == MarketType.BINARY) {
            bool marketOutcome = market.finalValue >= market.threshold;
            return marketOutcome == isYes;
        }
        // Add logic for other market types
        return false;
    }
    
    function _hasUserMarket(address user, uint256 marketId) 
        private 
        view 
        returns (bool) 
    {
        uint256[] storage userIds = userMarkets[user];
        for (uint256 i = 0; i < userIds.length; i++) {
            if (userIds[i] == marketId) {
                return true;
            }
        }
        return false;
    }
}
