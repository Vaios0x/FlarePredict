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

  // Cargar estadísticas del contrato
  const loadStats = async () => {
    if (!isReady) return;

    try {
      setLoading(true);
      
      // Obtener volumen total
      const volume = await getTotalVolume();
      setTotalVolume(volume.toString());
      
      // Obtener comisiones totales
      const fees = await getTotalFeesCollected();
      setTotalFees(fees.toString());
      
      // Calcular usuarios activos (usuarios únicos que han creado mercados o apostado)
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

  // Recargar estadísticas cuando cambie la conexión o los mercados
  useEffect(() => {
    loadStats();
  }, [isReady, markets.length]);

  // Formatear volumen en FLR
  const formatVolume = (volume: string) => {
    const volumeInFlr = parseFloat(volume) / 1e18;
    return volumeInFlr.toFixed(2);
  };

  // Formatear comisiones en FLR
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
