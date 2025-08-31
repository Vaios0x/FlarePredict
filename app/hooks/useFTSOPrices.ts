'use client';

import { useState, useEffect } from 'react';
import { useReadContract, usePublicClient } from 'wagmi';
import { getContractAddress, FTSO_FEEDS, FTSO_V2_ABI, CONTRACT_REGISTRY_ABI } from '../config/contracts';

export function useFTSOPrices() {
  const [btcPrice, setBtcPrice] = useState<string>('0');
  const [ethPrice, setEthPrice] = useState<string>('0');
  const [flrPrice, setFlrPrice] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const contractRegistryAddress = getContractAddress('ContractRegistry');

  // Función para obtener la dirección del FTSO V2 desde el ContractRegistry
  const getFtsoV2Address = async () => {
    if (!publicClient) return null;
    
    try {
      // Primero intentar obtener la dirección de producción
      const ftsoV2Address = await publicClient.readContract({
        address: contractRegistryAddress as `0x${string}`,
        abi: CONTRACT_REGISTRY_ABI,
        functionName: 'getFtsoV2',
      });
      
      return ftsoV2Address;
    } catch (error) {
      console.log('⚠️ No se pudo obtener FTSO V2 de producción, intentando test...');
      
      try {
        // Fallback a test FTSO
        const testFtsoV2Address = await publicClient.readContract({
          address: contractRegistryAddress as `0x${string}`,
          abi: CONTRACT_REGISTRY_ABI,
          functionName: 'getTestFtsoV2',
        });
        
        return testFtsoV2Address;
      } catch (testError) {
        console.error('❌ Error obteniendo dirección FTSO:', testError);
        return null;
      }
    }
  };

  // Función para obtener precio FTSO usando la documentación oficial
  const getFTSOPrice = async (feedId: string) => {
    if (!publicClient) return '0';
    
    try {
      // Obtener la dirección del FTSO V2
      const ftsoV2Address = await getFtsoV2Address();
      if (!ftsoV2Address) {
        throw new Error('No se pudo obtener la dirección del FTSO V2');
      }

      console.log(`🔗 Usando FTSO V2 en: ${ftsoV2Address}`);
      
      // Usar el contrato FTSOv2 oficial según la documentación
      // https://dev.flare.network/ftso/guides/build-first-app
      const result = await publicClient.readContract({
        address: ftsoV2Address as `0x${string}`,
        abi: FTSO_V2_ABI,
        functionName: 'getFeedById',
        args: [feedId] as any,
      });

      const priceValue = result[0];
      const decimals = result[1];
      const timestamp = result[2];

      // Convertir el precio usando los decimales correctos
      const price = parseFloat(priceValue.toString()) / Math.pow(10, Number(decimals));
      
      console.log(`✅ Precio obtenido: $${price.toFixed(6)} (decimals: ${decimals})`);
      return price.toFixed(6);
    } catch (error) {
      console.error('❌ Error obteniendo precio FTSO para feed', feedId, ':', error);
      
      // Fallback a precios simulados si hay error
      const fallbackPrices: { [key: string]: string } = {
        [FTSO_FEEDS.BTC_USD]: '43250.00',
        [FTSO_FEEDS.ETH_USD]: '2650.00',
        [FTSO_FEEDS.FLR_USD]: '0.0250',
        [FTSO_FEEDS.SGB_USD]: '0.0150',
        [FTSO_FEEDS.XRP_USD]: '0.5800',
        [FTSO_FEEDS.LTC_USD]: '68.50',
        [FTSO_FEEDS.DOGE_USD]: '0.0850',
        [FTSO_FEEDS.ADA_USD]: '0.4800',
      };
      
      console.log(`🔄 Usando precio simulado para ${feedId}: ${fallbackPrices[feedId] || '0'}`);
      return fallbackPrices[feedId] || '0';
    }
  };

  // Función para obtener múltiples precios a la vez
  const getMultipleFTSOPrices = async (feedIds: string[]) => {
    if (!publicClient) return {};
    
    try {
      const ftsoV2Address = await getFtsoV2Address();
      if (!ftsoV2Address) {
        throw new Error('No se pudo obtener la dirección del FTSO V2');
      }

      const result = await publicClient.readContract({
        address: ftsoV2Address as `0x${string}`,
        abi: FTSO_V2_ABI,
        functionName: 'getFeedsById',
        args: [feedIds] as any,
      });

      const feedValues = result[0];
      const decimals = result[1];
      const timestamp = result[2];

      const prices: { [key: string]: string } = {};
      
      feedIds.forEach((feedId, index) => {
        const priceValue = feedValues[index];
        const decimal = decimals[index];
        const price = parseFloat(priceValue.toString()) / Math.pow(10, Number(decimal));
        prices[feedId] = price.toFixed(6);
      });

      return prices;
    } catch (error) {
      console.error('❌ Error obteniendo múltiples precios FTSO:', error);
      return {};
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
        getFTSOPrice(FTSO_FEEDS.BTC_USD),
        getFTSOPrice(FTSO_FEEDS.ETH_USD),
        getFTSOPrice(FTSO_FEEDS.FLR_USD),
      ]);
      
      setBtcPrice(btc);
      setEthPrice(eth);
      setFlrPrice(flr);
      
    } catch (error) {
      console.error('❌ Error cargando precios FTSO:', error);
      setError('Error loading FTSO prices');
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
      case FTSO_FEEDS.BTC_USD:
        return btcPrice;
      case FTSO_FEEDS.ETH_USD:
        return ethPrice;
      case FTSO_FEEDS.FLR_USD:
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
    getFTSOPrice,
    getMultipleFTSOPrices,
    FTSO_FEEDS,
  };
}
