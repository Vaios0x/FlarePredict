'use client';

import { useState, useEffect } from 'react';
import { useFlarePredict } from './useFlarePredict';
import { useMarkets } from './useMarkets';

export function useContractStats() {
  const [totalVolume, setTotalVolume] = useState<string>('0');
  const [totalFees, setTotalFees] = useState<string>('0');
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  const { getTotalVolume, getTotalFeesCollected, isReady } = useFlarePredict();
  const { markets } = useMarkets();

  // Load contract statistics
  const loadStats = async () => {
    if (!isReady) return;

    try {
      setLoading(true);
      
      // Get total volume
      const volume = await getTotalVolume();
      setTotalVolume(volume.toString());
      
      // Get total fees
      const fees = await getTotalFeesCollected();
      setTotalFees(fees.toString());
      
      // Calculate active users (unique users who have created markets or placed bets)
      const uniqueUsers = new Set<string>();
      markets.forEach(market => {
        if (market.creator) uniqueUsers.add(market.creator);
      });
      setActiveUsers(uniqueUsers.size);
      
    } catch (error) {
      console.error('Error loading contract stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload statistics when connection or markets change
  useEffect(() => {
    loadStats();
  }, [isReady, markets.length]);

  // Format volume in FLR
  const formatVolume = (volume: string) => {
    const volumeInFlr = parseFloat(volume) / 1e18;
    return volumeInFlr.toFixed(2);
  };

  // Format fees in FLR
  const formatFees = (fees: string) => {
    const feesInFlr = parseFloat(fees) / 1e18;
    return feesInFlr.toFixed(4);
  };

  return {
    totalVolume: formatVolume(totalVolume),
    totalFees: formatFees(totalFees),
    activeUsers,
    loading,
    reload: loadStats,
  };
}
