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
  const { getMarketCounter, getMarket, createMarket, isReady } = useFlarePredict();

  // Crear mercados demo en el contrato si no existen
  const createDemoMarkets = async () => {
    if (!isReady || !address) return;

    try {
      const marketCount = await getMarketCounter();
      console.log('Mercados existentes:', marketCount);

      // Solo crear mercados demo si hay menos de 5 mercados existentes
      if (marketCount < 5) {
        const demoData = [
          {
            title: "¿FLR alcanzará $2.50 en septiembre 2025?",
            description: "Mercado resuelve SÍ si FLR/USD >= $2.50 antes del deadline",
            threshold: "250", // $2.50 en centavos
            feedId: FTSO_FEEDS.FLR_USD,
          },
          {
            title: "¿ETH superará $8,000 en octubre 2025?",
            description: "Mercado resuelve SÍ si ETH/USD >= $8,000 antes del deadline",
            threshold: "800000", // $8,000 en centavos
            feedId: FTSO_FEEDS.ETH_USD,
          },
          {
            title: "¿FLR alcanzará $2.50 en noviembre 2025?",
            description: "Mercado resuelve SÍ si FLR/USD >= $2.50 antes del deadline",
            threshold: "250", // $2.50 en centavos
            feedId: FTSO_FEEDS.FLR_USD,
          },
          {
            title: "¿FLR superará $3.00 en diciembre 2025?",
            description: "Mercado resuelve SÍ si FLR/USD >= $3.00 antes del deadline",
            threshold: "300", // $3.00 en centavos
            feedId: FTSO_FEEDS.FLR_USD,
          },
          {
            title: "¿ETH superará $10,000 en enero 2026?",
            description: "Mercado resuelve SÍ si ETH/USD >= $10,000 antes del deadline",
            threshold: "1000000", // $10,000 en centavos
            feedId: FTSO_FEEDS.ETH_USD,
          }
        ];

        const baseDate = new Date('2025-09-01T14:00:00');
        
        for (let i = 0; i < Math.min(demoData.length, 5 - Number(marketCount)); i++) {
          const data = demoData[i];
          const deadline = new Date(baseDate);
          deadline.setDate(deadline.getDate() + (i * 30));
          
          console.log('Creando mercado demo:', data.title);
          
          try {
            await createMarket(
              data.title,
              data.description,
              data.feedId,
              0, // BINARY market type
              data.threshold,
              Math.floor(deadline.getTime() / 1000)
            );
            
            console.log('Mercado demo creado exitosamente:', data.title);
            
            // Esperar un poco entre cada creación para evitar errores de nonce
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error('Error creando mercado demo:', data.title, error);
          }
        }
      }
    } catch (error) {
      console.error('Error en createDemoMarkets:', error);
    }
  };



  // Cargar todos los mercados
  const loadMarkets = async () => {
    if (!isReady) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar mercados reales del contrato
      let realMarkets: Market[] = [];
      try {
        const marketCount = await getMarketCounter();
        console.log('Mercados reales encontrados:', marketCount);

        for (let i = 0; i < marketCount; i++) {
          try {
            const market = await getMarket(i);
            // El contrato devuelve un array, no un objeto
            realMarkets.push({
              id: i,
              title: market[0],
              description: market[1],
              feedId: market[2],
              marketType: Number(market[3]),
              status: Number(market[4]),
              threshold: market[5].toString(),
              lowerBound: market[6].toString(),
              upperBound: market[7].toString(),
              deadline: Number(market[8]),
              resolutionTime: Number(market[9]),
              totalYesStake: market[10].toString(),
              totalNoStake: market[11].toString(),
              finalValue: market[12].toString(),
              creator: market[13],
              creatorReward: market[14].toString(),
              emergencyResolved: market[15],
            });
          } catch (err) {
            console.warn(`Error loading market ${i}:`, err);
          }
        }
      } catch (err) {
        console.warn('Error cargando mercados reales:', err);
      }

             // Filtrar mercados reales para eliminar los de prueba con títulos cortos
       const filteredRealMarkets = realMarkets.filter(market => 
         market.title.length > 5 && 
         !market.title.toLowerCase().includes('fd') &&
         !market.title.toLowerCase().includes('jhfg') &&
         !market.title.toLowerCase().includes('gfs') &&
         !market.title.toLowerCase().includes('ghf') &&
         !market.title.toLowerCase().includes('df') &&
         !market.title.toLowerCase().includes('bfr') &&
         !market.title.toLowerCase().includes('bcfx') &&
         !market.title.toLowerCase().includes('t') &&
         !market.title.toLowerCase().includes('g') &&
         !market.title.toLowerCase().includes('gf')
       );
       
       // Combinar mercados reales filtrados y manuales guardados
       const manualMarkets = loadManualMarkets();
       
       // Filtrar mercados manuales que ya existen en los reales para evitar duplicados
       const existingMarketIds = new Set(filteredRealMarkets.map(m => m.id));
       const uniqueManualMarkets = manualMarkets.filter(market => !existingMarketIds.has(market.id));
       
       const allMarkets = [...filteredRealMarkets, ...uniqueManualMarkets];
       setMarkets(allMarkets);
       console.log('Total de mercados cargados:', allMarkets.length);
       console.log('Mercados reales filtrados:', filteredRealMarkets.length);
       console.log('Mercados manuales guardados:', uniqueManualMarkets.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando mercados');
    } finally {
      setLoading(false);
    }
  };

  // Cargar mercados al montar el componente y cuando cambie la conexión
  useEffect(() => {
    if (isReady) {
      cleanupOldMarkets(); // Limpiar mercados antiguos al cargar
      loadMarkets();
      // Crear mercados demo si no existen
      createDemoMarkets();
    }
  }, [isReady, address]);

  // Obtener mercados activos
  const getActiveMarkets = () => {
    return markets.filter(market => market.status === MARKET_STATUS.OPEN);
  };

  // Obtener mercados resueltos
  const getResolvedMarkets = () => {
    return markets.filter(market => market.status === MARKET_STATUS.RESOLVED);
  };

  // Obtener mercados por feed
  const getMarketsByFeed = (feedId: string) => {
    return markets.filter(market => market.feedId === feedId);
  };

  // Obtener mercados creados por el usuario
  const getUserMarkets = () => {
    if (!address) return [];
    return markets.filter(market => market.creator.toLowerCase() === address.toLowerCase());
  };

  // Calcular probabilidades
  const calculateOdds = (market: Market, side: 'yes' | 'no') => {
    const totalYes = parseFloat(market.totalYesStake);
    const totalNo = parseFloat(market.totalNoStake);
    const total = totalYes + totalNo;

    if (total === 0) return 50;

    const sideStake = side === 'yes' ? totalYes : totalNo;
    return Math.round((sideStake / total) * 100);
  };

  // Obtener nombre del feed
  const getFeedName = (feedId: string) => {
    const feedEntries = Object.entries(FTSO_FEEDS);
    const feed = feedEntries.find(([_, id]) => id === feedId);
    return feed ? feed[0].replace('_', '/') : 'Desconocido';
  };

  // Obtener estado del mercado como texto
  const getMarketStatusText = (status: number) => {
    switch (status) {
      case MARKET_STATUS.OPEN:
        return 'Activo';
      case MARKET_STATUS.CLOSED:
        return 'Cerrado';
      case MARKET_STATUS.RESOLVED:
        return 'Resuelto';
      case MARKET_STATUS.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  // Formatear fecha del deadline
  const formatDeadline = (deadline: number) => {
    if (!deadline || deadline === 0) return 'Fecha no definida';
    
    try {
      const date = new Date(deadline * 1000); // Convertir de timestamp Unix a milisegundos
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting deadline:', error);
      return 'Fecha inválida';
    }
  };

  // Formatear cantidad de FLR
  const formatFLRAmount = (amount: string) => {
    if (!amount || amount === '0') return '0.00';
    
    try {
      const weiAmount = parseFloat(amount);
      const flrAmount = weiAmount / 1e18; // Convertir de wei a FLR
      return flrAmount.toFixed(2);
    } catch (error) {
      console.error('Error formatting FLR amount:', error);
      return '0.00';
    }
  };

  // Formatear precio umbral
  const formatThreshold = (threshold: string) => {
    if (!threshold || threshold === '0') return '0.00';
    
    try {
      const centAmount = parseFloat(threshold);
      const usdAmount = centAmount / 100; // Convertir de centavos a USD
      return usdAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (error) {
      console.error('Error formatting threshold:', error);
      return '$0.00';
    }
  };

  // Cargar mercados manuales desde localStorage
  const loadManualMarkets = (): Market[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('flarepredict_manual_markets');
      if (stored) {
        const markets = JSON.parse(stored);
        // Filtrar mercados más antiguos de 7 días
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return markets.filter((market: Market) => market.deadline * 1000 > oneWeekAgo);
      }
    } catch (error) {
      console.error('Error loading manual markets from localStorage:', error);
    }
    return [];
  };

  // Guardar mercados manuales en localStorage
  const saveManualMarkets = (markets: Market[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('flarepredict_manual_markets', JSON.stringify(markets));
    } catch (error) {
      console.error('Error saving manual markets to localStorage:', error);
    }
  };

  // Función para agregar un nuevo mercado a la lista
  const addNewMarket = (newMarket: Market) => {
    setMarkets(prevMarkets => {
      // Verificar si el mercado ya existe
      const exists = prevMarkets.some(market => market.id === newMarket.id);
      if (exists) {
        return prevMarkets;
      }
      
      // Agregar el nuevo mercado al inicio de la lista
      const updatedMarkets = [newMarket, ...prevMarkets];
      
      // Guardar en localStorage si es un mercado real (no demo)
      if (newMarket.id < 1000) {
        const manualMarkets = loadManualMarkets();
        const updatedManualMarkets = [newMarket, ...manualMarkets].slice(0, 50); // Mantener últimos 50
        saveManualMarkets(updatedManualMarkets);
      }
      
      return updatedMarkets;
    });
  };

  // Función para limpiar mercados antiguos
  const cleanupOldMarkets = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('flarepredict_manual_markets');
      if (stored) {
        const markets = JSON.parse(stored);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filteredMarkets = markets.filter((market: Market) => market.deadline * 1000 > oneWeekAgo);
        localStorage.setItem('flarepredict_manual_markets', JSON.stringify(filteredMarkets));
      }
    } catch (error) {
      console.error('Error cleaning up old markets:', error);
    }
  };

  // Cargar mercados al montar el componente y cuando cambie la conexión
  useEffect(() => {
    if (isReady) {
      loadMarkets();
      // Crear mercados demo si no existen
      createDemoMarkets();
    }
  }, [isReady, address]);



  return {
    markets,
    loading,
    error,
    // Funciones de filtrado
    getActiveMarkets,
    getResolvedMarkets,
    getMarketsByFeed,
    getUserMarkets,
    // Funciones de utilidad
    calculateOdds,
    getFeedName,
    getMarketStatusText,
    formatDeadline,
    formatFLRAmount,
    formatThreshold,
    // Recargar datos
    reload: loadMarkets,
    addNewMarket, // Exportar la función para agregar mercados
    cleanupOldMarkets, // Exportar la función de limpieza
  };
}
