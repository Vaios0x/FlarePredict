'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, TrendingUp, Users, Clock, DollarSign, Activity } from 'lucide-react';
import { ConnectButton } from './components/ConnectButton';
import { PWAInstall } from './components/PWAInstall';
import { ContractInfo } from './components/ContractInfo';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { QuickLinks } from './components/QuickLinks';
import { Leaderboard } from './components/Leaderboard';
import { Documentation } from './components/Documentation';
import { useClient } from './hooks/useClient';
import { useChainId, useAccount, usePublicClient } from 'wagmi';
import { getTokenSymbol, getChainName } from './config/chains';
import { useMarkets, type Market } from './hooks/useMarkets';
import { useFlarePredict } from './hooks/useFlarePredict';
import { useContractStats } from './hooks/useContractStats';
import { useFTSOPrices } from './hooks/useFTSOPrices';
import { useLiveActivity } from './hooks/useLiveActivity';
import { useNotifications } from './hooks/useNotifications';
import { FTSO_FEEDS } from './config/contracts';

function FlarePredictApp() {
  const [currentSection, setCurrentSection] = useState<'home' | 'predict' | 'leaderboard' | 'documentation' | 'create-market'>('home');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes');
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [newMarket, setNewMarket] = useState({
    title: '',
    description: '',
    threshold: '',
    deadline: '',
  });
  const isClient = useClient();
  const chainId = useChainId();
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  
  // Hooks for contract interaction
  const { markets, loading: marketsLoading, calculateOdds, formatDeadline, formatFLRAmount, reload: reloadMarkets, addNewMarket } = useMarkets();
  const { createMarket, placeBet, getPosition, getMarketCounter, isReady } = useFlarePredict();
  const { totalVolume, activeUsers, loading: statsLoading } = useContractStats();
  const { flrPrice, loading: pricesLoading } = useFTSOPrices();
     const { activities, loading: activityLoading, loadRecentActivity, addManualActivity, forceReload } = useLiveActivity();
  const { showSuccess, showError, showInfo, NotificationContainer } = useNotifications();
  const [userPosition, setUserPosition] = useState<{ amount: string; isYes: boolean } | null>(null);

  // Real deployed contract data

  // Handle market creation
  const handleCreateMarket = async () => {
    if (!newMarket.title || !newMarket.threshold || !newMarket.deadline) {
      showError('Incomplete Fields', 'Please complete all required fields');
      return;
    }

    if (!isReady) {
      showError('Wallet Not Connected', 'Please connect your wallet to create markets');
      return;
    }

    try {
      const deadline = Math.floor(new Date(newMarket.deadline).getTime() / 1000);
      const threshold = (parseFloat(newMarket.threshold) * 100).toString(); // Convertir USD a centavos (1 USD = 100 centavos)
      
      // Determine feedId based on market title
      let feedId: string = FTSO_FEEDS.FLR_USD; // Default FLR/USD
      
      if (newMarket.title.toLowerCase().includes('btc') || newMarket.title.toLowerCase().includes('bitcoin')) {
        feedId = FTSO_FEEDS.BTC_USD;
      } else if (newMarket.title.toLowerCase().includes('eth') || newMarket.title.toLowerCase().includes('ethereum')) {
        feedId = FTSO_FEEDS.ETH_USD;
      } else if (newMarket.title.toLowerCase().includes('sgb')) {
        feedId = FTSO_FEEDS.SGB_USD;
      }
      
      console.log('Creating market with data:', {
        title: newMarket.title,
        description: newMarket.description,
        threshold,
        deadline,
        feedId
      });

      const result = await createMarket(
        newMarket.title,
        newMarket.description,
        feedId,
        0, // BINARY market type
        threshold,
        deadline
      );

       console.log('Market created successfully:', result);
       setIsCreatingMarket(false);
       setNewMarket({ title: '', description: '', threshold: '', deadline: '' });
       
       // Get the ID of the newly created market
       const marketCount = await getMarketCounter();
       const newMarketId = Number(marketCount) - 1; // The last created market
       
       // Create new market object to add immediately
       const newMarketData: Market = {
         id: newMarketId,
         title: newMarket.title,
         description: newMarket.description,
         feedId: '0x01464c522f55534400000000000000000000000000',
         marketType: 0,
         status: 0, // OPEN
         threshold: threshold,
         lowerBound: '0',
         upperBound: '0',
         deadline: deadline,
         resolutionTime: 0,
         totalYesStake: '0',
         totalNoStake: '0',
         finalValue: '0',
         creator: address || '',
         creatorReward: '0',
         emergencyResolved: false,
       };
       
       // Add the new market immediately to the list
       addNewMarket(newMarketData);
       
       // Add manual activity immediately
       addManualActivity('market_created', {
         marketTitle: newMarket.title,
         user: address,
         txHash: result,
       });
       
       // Wait a bit before reloading for the transaction to confirm
       setTimeout(() => {
         loadRecentActivity(); // Reload live activity
       }, 2000);
       
               showSuccess(
          'Market Created!', 
          'Your market has been created successfully. Check the list in a few seconds.',
          {
            marketTitle: newMarket.title,
            txHash: result
          }
        );
      } catch (error) {
        console.error('Error creating market:', error);
        
        // Show more specific error
        let errorTitle = 'Error Creating Market';
        let errorMessage = 'An unexpected error occurred while creating the market.';
        
        if (error instanceof Error) {
          if (error.message.includes('insufficient funds')) {
            errorTitle = 'Insufficient Balance';
            errorMessage = 'You don\'t have enough funds to create the market.';
          } else if (error.message.includes('user rejected')) {
            errorTitle = 'Transaction Cancelled';
            errorMessage = 'The transaction was cancelled by the user.';
          } else if (error.message.includes('execution reverted')) {
            errorTitle = 'Contract Error';
            errorMessage = 'Error in the contract. Verify the entered parameters.';
          } else {
            errorMessage = error.message;
          }
        }
        
        showError(errorTitle, errorMessage);
      }
  };

  // Check user position when market is selected
  const checkUserPosition = async (marketId: number) => {
    if (!isReady) return;
    
    try {
      const position = await getPosition(marketId, address as string);
      if (position && typeof position[0] === 'bigint' && position[0] > BigInt(0)) {
        setUserPosition({
          amount: (Number(position[0]) / 1e18).toString(),
          isYes: typeof position[1] === 'boolean' ? position[1] : false
        });
      } else {
        setUserPosition(null);
      }
    } catch (error) {
      console.warn('Error checking user position:', error);
      setUserPosition(null);
    }
  };

  // Handle bet placement
  const handlePlaceBet = async () => {
    if (!selectedMarket || !betAmount) {
      showError('Amount Required', 'Please enter the bet amount');
      return;
    }

    if (!isReady) {
      showError('Wallet Not Connected', 'Please connect your wallet to place bets');
      return;
    }

    if (!isConnected) {
      showError('Wallet Not Connected', 'Please connect your wallet to place bets');
      return;
    }



    // Validate bet amount
    const betAmountNum = parseFloat(betAmount);
    if (betAmountNum < 0.1) {
      showError('Amount Too Low', 'The minimum bet amount is 0.1 C2FLR');
      return;
    }
    if (betAmountNum > 1000) {
      showError('Amount Too High', 'The maximum bet amount is 1000 C2FLR');
      return;
    }

    // Check balance before attempting the bet
    if (publicClient && address) {
      try {
        const balance = await publicClient.getBalance({ address: address as `0x${string}` });
        const betAmountWei = BigInt((betAmountNum * 1e18).toString());
        
        if (balance < betAmountWei) {
          showError('Insufficient Balance', `Your balance is ${(Number(balance) / 1e18).toFixed(4)} C2FLR. You need at least ${betAmountNum} C2FLR for this bet.`);
          return;
        }
      } catch (error) {
        console.warn('Error checking balance:', error);
        // Continue with the bet if balance cannot be verified
      }
    }

    // Validate that the market is active
    if (selectedMarket.status !== 0) { // 0 = OPEN
      showError('Market Closed', 'This market is not open for bets');
      return;
    }

    // Validate that it hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (selectedMarket.deadline <= now) {
      showError('Market Expired', 'This market has expired and no longer accepts bets');
      return;
    }

    try {
      setIsPlacingBet(true);
      showInfo('Processing Transaction', 'Please confirm the transaction in your wallet...');
      
      const amount = (parseFloat(betAmount) * 1e18).toString(); // Convert to wei
      
      console.log('Placing bet with data:', {
        marketId: selectedMarket.id,
        betSide,
        amount,
        marketTitle: selectedMarket.title
      });

      const result = await placeBet(
        selectedMarket.id,
        betSide === 'yes',
        amount
      );

      console.log('Bet placed successfully:', result);
      setBetAmount('');
      
      // Add manual activity immediately
      addManualActivity('bet_placed', {
        marketId: selectedMarket.id.toString(),
        marketTitle: selectedMarket.title,
        user: address,
        amount: (parseFloat(betAmount) * 1e18).toString(),
        side: betSide,
        txHash: result,
      });
      
      // Wait a bit before reloading for the transaction to confirm
      setTimeout(() => {
        reloadMarkets(); // Reload markets
        loadRecentActivity(); // Reload live activity
      }, 2000);
      
      showSuccess(
        'Bet Placed!', 
        `Your bet of ${betAmount} ${getTokenSymbol(chainId)} has been processed successfully.`,
        {
          amount: betAmount,
          currency: getTokenSymbol(chainId),
          side: betSide,
          marketTitle: selectedMarket.title,
          txHash: result
        }
      );
    } catch (error) {
      console.error('Error placing bet:', error);
      
      // Show more specific error
      let errorTitle = 'Error Placing Bet';
      let errorMessage = 'An unexpected error occurred while processing your bet.';
      
      if (error instanceof Error) {
        const errorMessageLower = error.message.toLowerCase();
        
        if (errorMessageLower.includes('saldo insuficiente')) {
          errorTitle = 'Insufficient Balance';
          errorMessage = 'You don\'t have enough funds to place this bet. Check your C2FLR balance.';
        } else if (errorMessageLower.includes('transacción cancelada')) {
          errorTitle = 'Transaction Cancelled';
          errorMessage = 'The transaction was cancelled by the user.';
        } else if (errorMessageLower.includes('mercado no está abierto')) {
          errorTitle = 'Market Not Open';
          errorMessage = 'The market is not open for bets.';
        } else if (errorMessageLower.includes('mercado ha expirado')) {
          errorTitle = 'Market Expired';
          errorMessage = 'The market has expired and no longer accepts bets.';
        } else if (errorMessageLower.includes('monto de apuesta inválido')) {
          errorTitle = 'Invalid Amount';
          errorMessage = 'The bet amount must be between 0.1 and 1000 C2FLR.';
        } else if (errorMessageLower.includes('ya tienes una posición')) {
          errorTitle = 'Existing Position';
          errorMessage = 'You already have a position in this market. You can only bet once.';
        } else if (errorMessageLower.includes('mercado no encontrado')) {
          errorTitle = 'Market Not Found';
          errorMessage = 'The specified market does not exist.';
        } else if (errorMessageLower.includes('mercado cerrado')) {
          errorTitle = 'Market Closed';
          errorMessage = 'The market is closed for bets.';
        } else if (errorMessageLower.includes('error de nonce')) {
          errorTitle = 'Nonce Error';
          errorMessage = 'Transaction sequence error. Try again.';
        } else if (errorMessageLower.includes('error de gas')) {
          errorTitle = 'Gas Error';
          errorMessage = 'The transaction requires more gas. Try with a smaller amount.';
        } else if (errorMessageLower.includes('error de red')) {
          errorTitle = 'Network Error';
          errorMessage = 'Check your connection to Coston2 testnet.';
        } else if (errorMessageLower.includes('execution reverted')) {
          errorTitle = 'Contract Error';
          errorMessage = 'The transaction was reverted by the contract. Verify the parameters.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Handle navigation to different sections
  const handleNavigate = (section: string) => {
    if (section === 'create-market') {
      setIsCreatingMarket(true);
      setCurrentSection('predict');
    } else {
      setCurrentSection(section as any);
    }
  };

  // Show landing page if current section is home
  if (currentSection === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {/* Header with Connect Button */}
        <header className="border-b border-white/10 backdrop-blur-lg bg-black/20 relative z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-3xl sm:text-4xl"
                  role="img"
                  aria-label="Cristal de predicción girando"
                >
                  🔮
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">FlarePredict</h1>
                  <p className="text-xs sm:text-sm text-gray-300">Real-Time Predictions</p>
                </div>
              </div>
              <ConnectButton onConnect={() => setCurrentSection('predict')} />
            </div>
          </div>
        </header>
        
        <Navigation 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        <LandingPage onStartPredicting={() => setCurrentSection('predict')} />
        <NotificationContainer />
      </div>
    );
  }

  // Show leaderboard
  if (currentSection === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Navigation 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        <Leaderboard onBack={() => setCurrentSection('predict')} />
        <NotificationContainer />
      </div>
    );
  }

  // Show documentation
  if (currentSection === 'documentation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Navigation 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        <Documentation onBack={() => setCurrentSection('predict')} />
        <NotificationContainer />
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-x-hidden">
      
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/20 relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-3xl sm:text-4xl"
                role="img"
                aria-label="Cristal de predicción girando"
              >
                🔮
              </motion.div>
                              <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">FlarePredict</h1>
                  <p className="text-xs sm:text-sm text-gray-300">Real-Time Predictions</p>
                </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />

             {/* Stats Bar */}
       <div className="bg-black/30 backdrop-blur-md border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white space-y-3 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="text-xs sm:text-sm">
                  <span className="text-gray-400">Markets:</span> {markets.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                 <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                 <span className="text-xs sm:text-sm">
                   <span className="text-gray-400">Volume:</span> {statsLoading ? '...' : totalVolume} {getTokenSymbol(chainId)}
                 </span>
               </div>
               <div className="flex items-center space-x-2">
                 <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                 <span className="text-xs sm:text-sm">
                   <span className="text-gray-400">Users:</span> {statsLoading ? '...' : activeUsers}
                 </span>
               </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
               <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-2 sm:px-3 py-2 border border-white/10">
                 <span className="text-lg sm:text-xl">🔥</span>
                 <div>
                   <div className="text-xs text-gray-400">FLR/USDC</div>
                   <div className="text-xs sm:text-sm font-mono">
                     {isClient ? (pricesLoading ? 'Loading...' : `$${flrPrice}`) : '$0.00'}
                   </div>
                   {isConnected && (
                     <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                       Network: {getChainName(chainId)}
                     </div>
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

             {/* Main Content */}
       <div className="container mx-auto px-4 py-4 sm:py-8 relative z-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Markets List */}
          <div className="lg:col-span-2 space-y-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Active Markets</h2>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={reloadMarkets}
                  disabled={marketsLoading}
                  className="px-2 sm:px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-sm sm:text-base"
                  aria-label="Reload markets"
                >
                  {marketsLoading ? 'Loading...' : '🔄'}
                </button>
                <button
                  onClick={() => setIsCreatingMarket(true)}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
                  aria-label="Create new market"
                >
                  + Create Market
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {marketsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">Loading markets...</div>
                </div>
              ) : markets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No active markets</div>
                  <div className="text-sm text-gray-500">Create the first market to start</div>
                </div>
              ) : (
                markets.map((market) => (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 cursor-pointer overflow-hidden"
                                     onClick={() => {
                     setSelectedMarket(market);
                     checkUserPosition(market.id);
                   }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select market: ${market.title}`}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedMarket(market);
                    }
                  }}
                >
                                     <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
                     <div className="flex-1 min-w-0">
                                               <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-white break-words">{market.title}</h3>
                        </div>
                       <p className="text-gray-300 text-sm mb-4 break-words">{market.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 truncate">
                            {formatDeadline(market.deadline)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 truncate">
                            {formatFLRAmount((parseFloat(market.totalYesStake) + parseFloat(market.totalNoStake)).toString())} {getTokenSymbol(chainId)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-400 flex-shrink-0">Threshold:</span>
                          <span className="text-gray-300 truncate">
                            ${(parseFloat(market.threshold) / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:ml-4 w-full lg:w-auto">
                      <div className="text-center mb-2">
                        <div className="text-xs text-gray-400 mb-1">Current Odds</div>
                        <div className="flex justify-center space-x-1 sm:space-x-2">
                          <div className="px-1 sm:px-2 lg:px-3 py-1 bg-green-500/20 rounded text-green-400 text-xs sm:text-sm">
                            SÍ {calculateOdds(market, 'yes')}%
                          </div>
                          <div className="px-1 sm:px-2 lg:px-3 py-1 bg-red-500/20 rounded text-red-400 text-xs sm:text-sm">
                            NO {calculateOdds(market, 'no')}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>
          </div>

          {/* Sidebar - Bet Panel */}
          <div className="space-y-4 lg:space-y-6 overflow-hidden">
            {/* Selected Market Details */}
            {selectedMarket && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 lg:sticky lg:top-4 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Place Bet</h3>
                                      <button
                      onClick={() => setSelectedMarket(null)}
                      className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
                      aria-label="Close bet panel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                 
                {userPosition && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                    <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">
                      You already have a position in this market
                    </div>
                    <div className="text-yellow-300 text-xs">
                      {userPosition.amount} FLR in {userPosition.isYes ? 'YES' : 'NO'}
                    </div>
                  </div>
                )}
                 
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300">Market</label>
                    <p className="text-white font-medium text-sm sm:text-base break-words">{selectedMarket.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300">Choose Side</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => setBetSide('yes')}
                        className={`py-2 sm:py-3 px-2 sm:px-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                          betSide === 'yes'
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        aria-label="Bet YES"
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-bold">SÍ</span>
                          <span className="text-xs opacity-90">{calculateOdds(selectedMarket, 'yes')}%</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setBetSide('no')}
                        className={`py-2 sm:py-3 px-2 sm:px-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                          betSide === 'no'
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        aria-label="Bet NO"
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-bold">NO</span>
                          <span className="text-xs opacity-90">{calculateOdds(selectedMarket, 'no')}%</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-gray-300">Amount ({getTokenSymbol(chainId)})</label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e: any) => setBetAmount(e.target.value)}
                        placeholder="0.0"
                        step="0.1"
                        min="0.1"
                        max="1000"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                        aria-label="Bet amount in FLR"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                        {getTokenSymbol(chainId)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Potential Winnings</span>
                      <span className="text-white font-medium">
                        {betAmount ? (
                          (parseFloat(betAmount) * (100 / calculateOdds(selectedMarket, betSide))).toFixed(2)
                        ) : '0.00'} {getTokenSymbol(chainId)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Commission (2%)</span>
                      <span className="text-white">
                        {betAmount ? (parseFloat(betAmount) * 0.02).toFixed(4) : '0.00'} {getTokenSymbol(chainId)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Total to Pay</span>
                      <span className="text-green-400 font-medium">
                        {betAmount ? parseFloat(betAmount).toFixed(4) : '0.00'} {getTokenSymbol(chainId)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePlaceBet}
                    disabled={!betAmount || !!userPosition}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    aria-label="Place bet"
                  >
                    {userPosition ? 'You already bet on this market' : 'Place Bet'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Quick Links */}
            <QuickLinks 
              onNavigate={handleNavigate}
              currentSection={currentSection}
              marketsCount={markets.length}
              isConnected={isConnected}
            />

            {/* Contract Information */}
            <ContractInfo />

            {/* Live Activity Feed */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 overflow-hidden">
               <div className="flex items-center justify-between mb-3 sm:mb-4">
                 <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                   <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                   <span className="hidden sm:inline">Live Activity</span>
                   <span className="sm:hidden">Activity</span>
                 </h3>
                 <div className="flex gap-1 sm:gap-2">
                   <button
                     onClick={forceReload}
                     disabled={activityLoading}
                     className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-1.5 sm:px-2 py-1 rounded transition-colors disabled:opacity-50"
                     aria-label="Reload entire history"
                     title="Reload entire history"
                   >
                     {activityLoading ? '⏳' : '🔄'}
                   </button>
                   <button
                     onClick={loadRecentActivity}
                     disabled={activityLoading}
                     className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50 px-1.5 sm:px-2 py-1 rounded hover:bg-white/10"
                     aria-label="Update recent activity"
                     title="Update recent activity"
                   >
                     {activityLoading ? '⏳' : '📡'}
                   </button>
                 </div>
               </div>
               <div className="space-y-2 sm:space-y-3">
                 {activityLoading ? (
                   <div className="text-center py-3 sm:py-4">
                     <div className="text-gray-400 text-xs sm:text-sm">Loading activity...</div>
                   </div>
                 ) : activities.length === 0 ? (
                   <div className="text-center py-3 sm:py-4">
                                        <div className="text-gray-400 text-xs sm:text-sm">No recent activity</div>
                   <div className="text-gray-500 text-xs mt-1">Transactions will appear here</div>
                   </div>
                 ) : (
                   <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                     {activities.map((activity) => (
                       <motion.div
                         key={activity.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-black/20 rounded-lg border border-white/10"
                       >
                         <div className="flex-shrink-0 relative">
                           {activity.type === 'market_created' && (
                             <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                               <span className="text-green-400 text-xs">📊</span>
                             </div>
                           )}
                           {activity.type === 'bet_placed' && (
                             <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                               <span className="text-blue-400 text-xs">💰</span>
                             </div>
                           )}
                           {/* Indicador de actividad manual */}
                           {activity.id.startsWith('manual-') && (
                             <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full border border-white"></div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="text-xs sm:text-sm text-white">
                             {activity.type === 'market_created' && (
                               <span>New market created</span>
                             )}
                             {activity.type === 'bet_placed' && (
                               <span>Bet placed</span>
                             )}
                           </div>
                           {activity.marketTitle && (
                             <div className="text-xs text-gray-300 truncate">
                               {activity.marketTitle}
                             </div>
                           )}
                                                        {activity.type === 'bet_placed' && activity.amount && activity.side && (
                               <div className="text-xs text-gray-400 mt-1">
                                 {parseFloat(activity.amount) / 1e18} FLR in {activity.side.toUpperCase()}
                               </div>
                             )}
                           <div className="text-xs text-gray-500 mt-1">
                             {new Date(activity.timestamp).toLocaleTimeString()}
                           </div>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Create Market Modal */}
             {isCreatingMarket && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
           onClick={() => setIsCreatingMarket(false)}
         >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e: any) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-4">Create New Market</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300">Title</label>
                <input
                  type="text"
                  value={newMarket.title}
                  onChange={(e: any) => setNewMarket({ ...newMarket, title: e.target.value })}
                                     placeholder="Will FLR reach $2.50?"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  aria-label="Market title"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300">Description</label>
                <textarea
                  value={newMarket.description}
                  onChange={(e: any) => setNewMarket({ ...newMarket, description: e.target.value })}
                                     placeholder="Market resolves YES if FLR/USD >= $2.50"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  rows={2}
                  aria-label="Market description"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300">Threshold Price</label>
                <input
                  type="number"
                  value={newMarket.threshold}
                  onChange={(e: any) => setNewMarket({ ...newMarket, threshold: e.target.value })}
                                     placeholder="250"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  aria-label="Threshold price"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300">Resolution Date</label>
                <input
                  type="datetime-local"
                  value={newMarket.deadline}
                  onChange={(e: any) => setNewMarket({ ...newMarket, deadline: e.target.value })}
                  min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  aria-label="Resolution date"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setIsCreatingMarket(false)}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all"
                aria-label="Cancel market creation"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMarket}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                aria-label="Create market"
              >
                Create Market
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
             {/* PWA Install Button */}
       <PWAInstall />
       
       {/* Footer */}
       <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 mt-16 relative z-10">
         <div className="container mx-auto px-4 py-12">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
             
             {/* Brand Section */}
             <div className="sm:col-span-2">
               <div className="flex items-center space-x-3 mb-4">
                 <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   className="text-3xl"
                   role="img"
                   aria-label="Cristal de predicción"
                 >
                   🔮
                 </motion.div>
                 <div>
                   <h3 className="text-xl font-bold text-white">FlarePredict</h3>
                   <p className="text-sm text-gray-400">Real-Time Predictions</p>
                 </div>
               </div>
               <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
                 The leading prediction markets platform on Flare Network. 
                 Bet in real-time with instant settlement using FTSO data.
               </p>
               <div className="flex space-x-4">
                 <motion.a
                   href="https://twitter.com/flarepredict"
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all"
                   aria-label="Follow us on Twitter"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                   </svg>
                 </motion.a>
                 <motion.a
                   href="https://discord.gg/flarepredict"
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all"
                   aria-label="Join our Discord"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                   </svg>
                 </motion.a>
                 <motion.a
                   href="https://github.com/flarepredict"
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all"
                   aria-label="Visit our GitHub"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                   </svg>
                 </motion.a>
               </div>
             </div>
             
             {/* Quick Links */}
             <div>
               <h4 className="text-white font-semibold mb-4">Quick Links</h4>
               <ul className="space-y-2">
                 <li>
                   <motion.a
                     href="#markets"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                   >
                     Active Markets
                   </motion.a>
                 </li>
                 <li>
                   <motion.a
                     href="#create"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                   >
                     Create Market
                   </motion.a>
                 </li>
                 <li>
                   <motion.a
                     href="#leaderboard"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                   >
                     Leaderboard
                   </motion.a>
                 </li>
                 <li>
                   <motion.a
                     href="#docs"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                   >
                     Documentation
                   </motion.a>
                 </li>
               </ul>
             </div>
             
             {/* Resources */}
             <div>
               <h4 className="text-white font-semibold mb-4">Resources</h4>
               <ul className="space-y-2">
                 <li>
                   <motion.a
                     href="https://docs.flare.network"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                     target="_blank"
                     rel="noopener noreferrer"
                   >
                     Flare Network Docs
                   </motion.a>
                 </li>
                 <li>
                   <motion.a
                     href="https://docs.flare.network/tech/ftso"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                     target="_blank"
                     rel="noopener noreferrer"
                   >
                     FTSO Documentation
                   </motion.a>
                 </li>
                 <li>
                   <motion.a
                     href="https://faucet.flare.network"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                     target="_blank"
                     rel="noopener noreferrer"
                   >
                     Testnet Faucet
                   </motion.a>
                 </li>
                 <li>
                   <motion.a
                     href="https://flare.network"
                     whileHover={{ x: 5 }}
                     className="text-gray-300 hover:text-white transition-colors text-sm"
                     target="_blank"
                     rel="noopener noreferrer"
                   >
                     Official Site
                   </motion.a>
                 </li>
               </ul>
             </div>
           </div>
           
                        {/* Bottom Section */}
             <div className="border-t border-white/10 mt-8 pt-8">
               {/* Copyright and Creator Info */}
               <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
                 <div className="flex flex-col items-center lg:items-start space-y-2">
                   <div className="text-gray-400 text-sm text-center lg:text-left">
                     © 2025 FlarePredict. All rights reserved.
                   </div>
                   <motion.div
                     whileHover={{ scale: 1.05 }}
                     className="flex items-center space-x-2 text-sm"
                   >
                     <span className="text-gray-500">Made by</span>
                     <motion.a
                       href="https://t.me/Vai0sx"
                       target="_blank"
                       rel="noopener noreferrer"
                       whileHover={{ scale: 1.1 }}
                       className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300 flex items-center space-x-1"
                     >
                       <span>Vai0sx</span>
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                       </svg>
                     </motion.a>
                   </motion.div>
                 </div>
                 
                 {/* Quick Links */}
                 <div className="flex flex-wrap justify-center lg:justify-end space-x-4 lg:space-x-6 text-sm">
                   <motion.a
                     href="/privacy"
                     whileHover={{ scale: 1.05, y: -2 }}
                     className="text-gray-400 hover:text-white transition-all duration-300 flex items-center space-x-1"
                   >
                     <span>Privacy</span>
                   </motion.a>
                   <motion.a
                     href="/terms"
                     whileHover={{ scale: 1.05, y: -2 }}
                     className="text-gray-400 hover:text-white transition-all duration-300 flex items-center space-x-1"
                   >
                     <span>Terms</span>
                   </motion.a>
                   <motion.a
                     href="/support"
                     whileHover={{ scale: 1.05, y: -2 }}
                     className="text-gray-400 hover:text-white transition-all duration-300 flex items-center space-x-1"
                   >
                     <span>Support</span>
                   </motion.a>
                 </div>
               </div>
             
             {/* Network Status */}
             <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-xs text-gray-400">
                 <motion.div 
                   className="flex items-center space-x-2"
                   whileHover={{ scale: 1.05 }}
                 >
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                   <span className="font-medium">Coston2 Testnet</span>
                 </motion.div>
                 <motion.div 
                   className="flex items-center space-x-2"
                   whileHover={{ scale: 1.05 }}
                 >
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                   <span className="font-medium">FTSO Activo</span>
                 </motion.div>
                 <motion.div 
                   className="flex items-center space-x-2"
                   whileHover={{ scale: 1.05 }}
                 >
                   <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                   <span className="font-medium">Instant Settlement</span>
                 </motion.div>
               </div>
               
               {/* Social Links */}
               <div className="flex items-center space-x-4">
                 <motion.a
                   href="https://t.me/Vai0sx"
                   target="_blank"
                   rel="noopener noreferrer"
                   whileHover={{ scale: 1.1, y: -2 }}
                   whileTap={{ scale: 0.95 }}
                   className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                   aria-label="Contact on Telegram"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                   </svg>
                 </motion.a>
                 <motion.a
                   href="https://github.com/flarepredict"
                   target="_blank"
                   rel="noopener noreferrer"
                   whileHover={{ scale: 1.1, y: -2 }}
                   whileTap={{ scale: 0.95 }}
                   className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-gray-500/25 transition-all duration-300"
                   aria-label="Visit GitHub"
                 >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                   </svg>
                 </motion.a>
               </div>
             </div>
           </div>
         </div>
       </footer>
       <NotificationContainer />
     </div>
   );
 }

export default function FlarePredict() {
  return <FlarePredictApp />;
}

