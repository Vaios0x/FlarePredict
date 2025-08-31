import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { parseAbiItem, decodeEventLog } from 'viem';
import { FLAREPREDICT_ABI, getContractAddress } from '../config/contracts';

export interface ActivityEvent {
  id: string;
  type: 'market_created' | 'bet_placed' | 'market_resolved';
  marketId?: string;
  marketTitle?: string;
  user: string;
  amount?: string;
  side?: 'yes' | 'no';
  timestamp: number;
  txHash: string;
}

export function useLiveActivity() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();
  const { address } = useAccount();
  
  // Get contract address
  const contractAddress = getContractAddress('FlarePredict');

  // Load manual activity from localStorage
  const loadManualActivities = (): ActivityEvent[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('flarepredict_manual_activities');
      if (stored) {
        const activities = JSON.parse(stored);
        console.log('Loaded manual activities from localStorage:', activities.length);
        
        // Filter activities older than 7 days (longer time)
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filteredActivities = activities.filter((activity: ActivityEvent) => activity.timestamp > oneWeekAgo);
        
        console.log('Filtered manual activities (last 7 days):', filteredActivities.length);
        return filteredActivities;
      }
    } catch (error) {
      console.error('Error loading manual activities from localStorage:', error);
    }
    return [];
  };

  // Save manual activity to localStorage
  const saveManualActivities = (activities: ActivityEvent[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('flarepredict_manual_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving manual activities to localStorage:', error);
    }
  };

  const addActivity = (activity: ActivityEvent) => {
    setActivities(prev => {
      const newActivities = [activity, ...prev.slice(0, 19)]; // Keep only the last 20
      
      // If it's a manual activity, save it to localStorage
      if (activity.id.startsWith('manual-')) {
        const manualActivities = loadManualActivities();
        const updatedManualActivities = [activity, ...manualActivities].slice(0, 50); // Keep last 50
        saveManualActivities(updatedManualActivities);
        console.log('Saved manual activity to localStorage:', activity);
      }
      
      return newActivities;
    });
  };

     const loadRecentActivity = async () => {
     if (!publicClient || !contractAddress) {
       console.log('No publicClient or contractAddress available');
       return;
     }

     setLoading(true);
     try {
       console.log('Loading recent activity from contract:', contractAddress);
       
       // Get the last 100 blocks to search for events (wider range)
       const latestBlock = await publicClient.getBlockNumber();
       const fromBlock = latestBlock - BigInt(100);
       
       console.log('Searching blocks:', { fromBlock: fromBlock.toString(), toBlock: latestBlock.toString() });

       // Market creation events
       const marketCreatedLogs = await publicClient.getLogs({
         address: contractAddress as `0x${string}`,
         event: parseAbiItem('event MarketCreated(uint256 indexed marketId, address indexed creator, bytes21 feedId, uint256 deadline, string title)'),
         fromBlock,
         toBlock: latestBlock,
       });

       // Bet events
       const betPlacedLogs = await publicClient.getLogs({
         address: contractAddress as `0x${string}`,
         event: parseAbiItem('event PositionTaken(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount, uint256 newOdds)'),
         fromBlock,
         toBlock: latestBlock,
       });

       console.log('Events found:', {
         marketCreated: marketCreatedLogs.length,
         betPlaced: betPlacedLogs.length,
         fromBlock: fromBlock.toString(),
         toBlock: latestBlock.toString(),
         contractAddress
       });
       
       // Detailed log of each event found
       if (marketCreatedLogs.length > 0) {
         console.log('MarketCreated logs:', marketCreatedLogs);
       }
       if (betPlacedLogs.length > 0) {
         console.log('PositionTaken logs:', betPlacedLogs);
       }

      const newActivities: ActivityEvent[] = [];

             // Process market creation events
       for (const log of marketCreatedLogs) {
         try {
           const decoded = decodeEventLog({
             abi: FLAREPREDICT_ABI,
             data: log.data,
             topics: log.topics,
           });

           console.log('Decoded MarketCreated event:', decoded);

           if ('title' in decoded.args && 'creator' in decoded.args) {
             newActivities.push({
               id: `${log.transactionHash}-${log.logIndex}`,
               type: 'market_created',
               marketId: decoded.args.marketId?.toString(),
               marketTitle: decoded.args.title,
               user: decoded.args.creator,
               timestamp: Date.now() - (100 - Number(log.blockNumber)) * 1000, // Simular timestamp real
               txHash: log.transactionHash,
             });
           }
         } catch (error) {
           console.error('Error decoding MarketCreated event:', error, log);
         }
       }

       // Process bet events
       for (const log of betPlacedLogs) {
         try {
           const decoded = decodeEventLog({
             abi: FLAREPREDICT_ABI,
             data: log.data,
             topics: log.topics,
           });

           console.log('Decoded PositionTaken event:', decoded);

           if ('user' in decoded.args && 'amount' in decoded.args && 'isYes' in decoded.args) {
             newActivities.push({
               id: `${log.transactionHash}-${log.logIndex}`,
               type: 'bet_placed',
               marketId: decoded.args.marketId?.toString(),
               user: decoded.args.user,
               amount: decoded.args.amount?.toString(),
               side: decoded.args.isYes ? 'yes' : 'no',
               timestamp: Date.now() - (100 - Number(log.blockNumber)) * 1000, // Simular timestamp real
               txHash: log.transactionHash,
             });
           }
         } catch (error) {
           console.error('Error decoding PositionTaken event:', error, log);
         }
       }

      // Combine with saved manual activity
      const manualActivities = loadManualActivities();
      console.log('Combining activities:', {
        blockchain: newActivities.length,
        manual: manualActivities.length
      });
      
      const allActivities = [...newActivities, ...manualActivities];
      
      // Sort by timestamp (most recent first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log('Final activities to display:', allActivities.length);
      console.log('Activity details:', allActivities.map(a => ({
        id: a.id,
        type: a.type,
        timestamp: new Date(a.timestamp).toLocaleString(),
        isManual: a.id.startsWith('manual-')
      })));
      
      setActivities(allActivities.slice(0, 20)); // Show more activities
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

       // Load initial activity
  useEffect(() => {
    if (publicClient) {
      console.log('Initializing live activity...');
      cleanupOldActivities(); // Clean old activities when loading
      loadRecentActivity();
    }
  }, [publicClient]);

   // Reload activity every 30 seconds
   useEffect(() => {
     if (!publicClient) return;

     const interval = setInterval(() => {
       loadRecentActivity();
     }, 30000);

     return () => clearInterval(interval);
   }, [publicClient]);



  // Function to clean old activities
  const cleanupOldActivities = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('flarepredict_manual_activities');
      if (stored) {
        const activities = JSON.parse(stored);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filteredActivities = activities.filter((activity: ActivityEvent) => activity.timestamp > oneWeekAgo);
        
        console.log('Cleaning up old activities:', {
          before: activities.length,
          after: filteredActivities.length,
          removed: activities.length - filteredActivities.length
        });
        
        localStorage.setItem('flarepredict_manual_activities', JSON.stringify(filteredActivities));
      }
    } catch (error) {
      console.error('Error cleaning up old activities:', error);
    }
  };

  // Function to add activity manually after a successful transaction
  const addManualActivity = (type: 'market_created' | 'bet_placed', data: {
    marketId?: string;
    marketTitle?: string;
    user?: string;
    amount?: string;
    side?: 'yes' | 'no';
    txHash?: string;
  }) => {
    const activity: ActivityEvent = {
      id: `manual-${Date.now()}`,
      type,
      marketId: data.marketId,
      marketTitle: data.marketTitle,
      user: data.user || address || 'Unknown',
      amount: data.amount,
      side: data.side,
      timestamp: Date.now(),
      txHash: data.txHash || `0x${Math.random().toString(16).slice(2, 42)}`,
    };
    
    console.log('Creating manual activity:', activity);
    addActivity(activity);
    console.log('Manual activity added successfully');
  };

  // Function to force complete reload
  const forceReload = async () => {
    console.log('Force reloading activities...');
    cleanupOldActivities();
    await loadRecentActivity();
  };

  return {
    activities,
    loading,
    loadRecentActivity,
    addActivity,
    addManualActivity,
    cleanupOldActivities,
    forceReload,
  };
}
