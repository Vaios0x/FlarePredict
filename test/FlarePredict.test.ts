import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("FlarePredict", function () {
  async function deployFlarePredictFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy FlarePredict
    const FlarePredict = await ethers.getContractFactory("FlarePredict");
    const flarePredict = await FlarePredict.deploy();
    
    return { flarePredict, owner, user1, user2 };
  }
  
  describe("Market Creation", function () {
    it("Should create a new market", async function () {
      const { flarePredict, user1 } = await loadFixture(deployFlarePredictFixture);
      
      const title = "Will BTC reach $100k?";
      const description = "Market resolves YES if BTC >= $100,000";
      const feedId = ethers.encodeBytes32String("BTC/USD");
      const threshold = ethers.parseEther("100000");
      const deadline = (await time.latest()) + 86400; // 1 day
      
      await expect(
        flarePredict.connect(user1).createMarket(
          title,
          description,
          feedId,
          0, // BINARY
          threshold,
          deadline
        )
      ).to.emit(flarePredict, "MarketCreated");
      
      const market = await flarePredict.markets(0);
      expect(market.title).to.equal(title);
      expect(market.threshold).to.equal(threshold);
    });
    
    it("Should reject market with invalid deadline", async function () {
      const { flarePredict, user1 } = await loadFixture(deployFlarePredictFixture);
      
      const deadline = (await time.latest()) + 1800; // 30 minutes
      
      await expect(
        flarePredict.connect(user1).createMarket(
          "Test",
          "Test",
          ethers.encodeBytes32String("BTC/USD"),
          0,
          ethers.parseEther("100000"),
          deadline
        )
      ).to.be.revertedWith("Deadline too soon");
    });
  });
  
  describe("Betting", function () {
    it("Should place a bet", async function () {
      const { flarePredict, user1, user2 } = await loadFixture(deployFlarePredictFixture);
      
      // Create market
      const deadline = (await time.latest()) + 86400;
      await flarePredict.connect(user1).createMarket(
        "Test Market",
        "Description",
        ethers.encodeBytes32String("BTC/USD"),
        0,
        ethers.parseEther("100000"),
        deadline
      );
      
      // Place bet
      const betAmount = ethers.parseEther("10");
      await expect(
        flarePredict.connect(user2).placeBet(0, true, { value: betAmount })
      ).to.emit(flarePredict, "PositionTaken");
      
      const market = await flarePredict.markets(0);
      expect(market.totalYesStake).to.equal(betAmount);
    });
    
    it("Should calculate correct odds", async function () {
      const { flarePredict, user1, user2 } = await loadFixture(deployFlarePredictFixture);
      
      // Create and bet on market
      const deadline = (await time.latest()) + 86400;
      await flarePredict.connect(user1).createMarket(
        "Test",
        "Test",
        ethers.encodeBytes32String("BTC/USD"),
        0,
        ethers.parseEther("100000"),
        deadline
      );
      
      await flarePredict.connect(user1).placeBet(0, true, { 
        value: ethers.parseEther("30") 
      });
      await flarePredict.connect(user2).placeBet(0, false, { 
        value: ethers.parseEther("70") 
      });
      
      const yesOdds = await flarePredict.calculateOdds(0, true);
      const noOdds = await flarePredict.calculateOdds(0, false);
      
      expect(yesOdds).to.equal(3000); // 30%
      expect(noOdds).to.equal(7000); // 70%
    });
  });
  
  describe("Resolution", function () {
    it("Should resolve market and distribute winnings", async function () {
      const { flarePredict, user1, user2 } = await loadFixture(
        deployFlarePredictFixture
      );
      
      // Setup market and bets
      const deadline = (await time.latest()) + 86400;
      await flarePredict.connect(user1).createMarket(
        "Test",
        "Test",
        ethers.encodeBytes32String("BTC/USD"),
        0,
        ethers.parseEther("100000"),
        deadline
      );
      
      const bet1 = ethers.parseEther("40");
      const bet2 = ethers.parseEther("60");
      
      await flarePredict.connect(user1).placeBet(0, true, { value: bet1 });
      await flarePredict.connect(user2).placeBet(0, false, { value: bet2 });
      
      // Advance time and resolve
      await time.increaseTo(deadline + 1);
      await flarePredict.resolveMarket(0, ethers.parseEther("105000"));
      
      // Winner claims
      const initialBalance = await ethers.provider.getBalance(user1.address);
      await flarePredict.connect(user1).claimWinnings(0);
      const finalBalance = await ethers.provider.getBalance(user1.address);
      
      // Check payout (minus gas)
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
  
  describe("Security", function () {
    it("Should handle emergency resolution", async function () {
      const { flarePredict, owner } = await loadFixture(deployFlarePredictFixture);
      
      // Create market
      const deadline = (await time.latest()) + 86400;
      await flarePredict.createMarket(
        "Test",
        "Test",
        ethers.encodeBytes32String("BTC/USD"),
        0,
        ethers.parseEther("100000"),
        deadline
      );
      
      // Wait past resolution buffer
      await time.increaseTo(deadline + 400);
      
      await expect(
        flarePredict.connect(owner).emergencyResolve(
          0,
          ethers.parseEther("105000"),
          "Oracle failure"
        )
      ).to.emit(flarePredict, "EmergencyResolution");
    });
  });
});
