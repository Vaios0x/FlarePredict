'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useFlarePredict } from './useFlarePredict';
import { FTSO_FEEDS, MARKET_STATUS } from '../config/contracts';

export interface Market {
  id: number;
  title: string;
  description: string;
  feedId: string;
  marketType: number;
  status: number;
  threshold: string;
  lowerBound: string;
  upperBound: string;
  deadline: number;
  resolutionTime: number;
  totalYesStake: string;
  totalNoStake: string;
  finalValue: string;
  creator: string;
  creatorReward: string;
  emergencyResolved: boolean;
}

export interface Position {
  amount: string;
  isYes: boolean;
  claimed: boolean;
  timestamp: number;
}

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { getMarketCounter, getMarket, isReady } = useFlarePredict();

  // Cargar mercados desde el contrato
  const loadMarkets = async () => {
    if (!isReady) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const marketCount = await getMarketCounter();
      console.log('Total de mercados:', marketCount);

      if (Number(marketCount) === 0) {
        setMarkets([]);
        setLoading(false);
        return;
      }

      const marketsData: Market[] = [];
      
      // Cargar los últimos 20 mercados para evitar sobrecarga
      const startIndex = Math.max(0, Number(marketCount) - 20);
      
      for (let i = startIndex; i < Number(marketCount); i++) {
        try {
          const marketData = await getMarket(i);
          
          if (marketData) {
            const market: Market = {
              id: i,
              title: marketData[0] || '',
              description: marketData[1] || '',
              feedId: marketData[2] || '',
              marketType: Number(marketData[3]) || 0,
              status: Number(marketData[4]) || 0,
              threshold: marketData[5]?.toString() || '0',
              lowerBound: marketData[6]?.toString() || '0',
              upperBound: marketData[7]?.toString() || '0',
              deadline: Number(marketData[8]) || 0,
              resolutionTime: Number(marketData[9]) || 0,
              totalYesStake: marketData[10]?.toString() || '0',
              totalNoStake: marketData[11]?.toString() || '0',
              finalValue: marketData[12]?.toString() || '0',
              creator: marketData[13] || '',
              creatorReward: marketData[14]?.toString() || '0',
              emergencyResolved: Boolean(marketData[15]) || false,
            };
            
            marketsData.push(market);
          }
        } catch (error) {
          console.warn(`Error cargando mercado ${i}:`, error);
          // Continuar con el siguiente mercado
        }
      }

      // Ordenar por ID descendente (más recientes primero)
      marketsData.sort((a, b) => b.id - a.id);
      
      setMarkets(marketsData);
    } catch (error) {
      console.error('Error cargando mercados:', error);
      setError('Error al cargar mercados');
    } finally {
      setLoading(false);
    }
  };

  // Recargar mercados
  const reload = () => {
    loadMarkets();
  };

  // Agregar nuevo mercado a la lista
  const addNewMarket = (market: Market) => {
    setMarkets(prev => [market, ...prev]);
  };

  // Cargar mercados cuando el hook esté listo
  useEffect(() => {
    loadMarkets();
  }, [isReady]);

  // Funciones de utilidad
  const calculateOdds = (market: Market, side: 'yes' | 'no'): number => {
    const totalYes = parseFloat(market.totalYesStake) / 1e18;
    const totalNo = parseFloat(market.totalNoStake) / 1e18;
    const total = totalYes + totalNo;
    
    if (total === 0) return 50; // 50/50 si no hay apuestas
    
    if (side === 'yes') {
      return totalYes > 0 ? Math.round((totalYes / total) * 100) : 0;
    } else {
      return totalNo > 0 ? Math.round((totalNo / total) * 100) : 0;
    }
  };

  const formatDeadline = (deadline: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadline - now;
    
    if (timeLeft <= 0) {
      return 'Expirado';
    }
    
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatFLRAmount = (amount: string): string => {
    const num = parseFloat(amount) / 1e18;
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    } else if (num >= 1) {
      return num.toFixed(2);
    } else {
      return num.toFixed(4);
    }
  };

  return {
    markets,
    loading,
    error,
    reload,
    addNewMarket,
    calculateOdds,
    formatDeadline,
    formatFLRAmount,
  };
}
