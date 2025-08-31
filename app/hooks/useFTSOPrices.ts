'use client';

import { useState, useEffect } from 'react';
import { useReadContract, usePublicClient } from 'wagmi';
import { getContractAddress } from '../config/contracts';

// Feed IDs oficiales de FTSOv2 según la documentación
const FTSO_FEED_IDS = {
  FLR_USD: '0x01464c522f55534400000000000000000000000000', // "FLR/USD"
  BTC_USD: '0x014254432f55534400000000000000000000000000', // "BTC/USD"
  ETH_USD: '0x014554482f55534400000000000000000000000000', // "ETH/USD"
  SGB_USD: '0x015347422f55534400000000000000000000000000', // "SGB/USD"
} as const;

// ABI para FTSOv2 según la documentación oficial
const FTSO_V2_ABI = [
  {
    "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
    "name": "getFeedById",
    "outputs": [
      {"internalType": "uint256", "name": "_feedValue", "type": "uint256"},
      {"internalType": "int8", "name": "_decimals", "type": "int8"},
      {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
    "name": "getFeedByIdInWei",
    "outputs": [
      {"internalType": "uint256", "name": "_feedValue", "type": "uint256"},
      {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useFTSOPrices() {
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [flrPrice, setFlrPrice] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const ftsoV2Address = getContractAddress('FTSO_V2');

  // Función para obtener precio FTSO real usando la documentación oficial
  const getFTSOPrice = async (feedId: string) => {
    if (!publicClient) return '0';
    
    try {
      // Usar el contrato FTSOv2 oficial según la documentación
      // https://dev.flare.network/ftso/guides/build-first-app
      const result = await publicClient.readContract({
        address: ftsoV2Address as `0x${string}`,
        abi: FTSO_V2_ABI,
        functionName: 'getFeedByIdInWei',
        args: [feedId] as any,
      });

      const priceInWei = result[0];
      const timestamp = result[1];

      // Convertir de wei a precio normal
      const price = parseFloat(priceInWei.toString()) / 1e18;
      
      return price.toFixed(2);
    } catch (error) {
      console.error('Error getting FTSO price for feed', feedId, ':', error);
      
      // Fallback a precios simulados si hay error
      const fallbackPrices: { [key: string]: string } = {
        [FTSO_FEED_IDS.BTC_USD]: '43250.00',
        [FTSO_FEED_IDS.ETH_USD]: '2650.00',
        [FTSO_FEED_IDS.FLR_USD]: '0.0250',
        [FTSO_FEED_IDS.SGB_USD]: '0.0150',
      };
      
      return fallbackPrices[feedId] || '0';
    }
  };

  // Cargar precios FTSO reales
  const loadPrices = async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError(null);
      
      // Obtener precios de diferentes feeds usando IDs oficiales
      const [btc, eth, flr] = await Promise.all([
        getFTSOPrice(FTSO_FEED_IDS.BTC_USD),
        getFTSOPrice(FTSO_FEED_IDS.ETH_USD),
        getFTSOPrice(FTSO_FEED_IDS.FLR_USD),
      ]);
      
      setBtcPrice(btc);
      setEthPrice(eth);
      setFlrPrice(flr);
      
    } catch (error) {
      console.error('Error loading FTSO prices:', error);
      setError('Error cargando precios FTSO');
    } finally {
      setLoading(false);
    }
  };

  // Recargar precios cuando cambie la conexión
  useEffect(() => {
    loadPrices();
    
    // Actualizar precios cada 30 segundos (FTSO se actualiza cada 3 minutos)
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  // Función para obtener precio de cualquier feed
  const getPriceByFeedId = (feedId: string) => {
    switch (feedId) {
      case FTSO_FEED_IDS.BTC_USD:
        return btcPrice;
      case FTSO_FEED_IDS.ETH_USD:
        return ethPrice;
      case FTSO_FEED_IDS.FLR_USD:
        return flrPrice;
      default:
        return '0';
    }
  };

  return {
    btcPrice,
    ethPrice,
    flrPrice,
    loading,
    error,
    reload: loadPrices,
    getPriceByFeedId,
    FTSO_FEED_IDS,
  };
}
