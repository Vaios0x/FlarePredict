'use client';

import { useState, useEffect } from 'react';
import { useFlarePredict } from '../hooks/useFlarePredict';
import { useAccount } from 'wagmi';

export function MarketDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { getMarketCounter, getMarket, isReady } = useFlarePredict();
  const { isConnected } = useAccount();

  const checkMarkets = async () => {
    if (!isReady) return;

    setIsLoading(true);
    try {
      const marketCount = await getMarketCounter();
      console.log('Número total de mercados:', marketCount);

      const marketsData = [];
      for (let i = 0; i < marketCount; i++) {
        try {
          const market = await getMarket(i);
          console.log(`Mercado ${i}:`, market);
          
          marketsData.push({
            id: i,
            title: market[0],
            description: market[1],
            feedId: market[2],
            marketType: Number(market[3]),
            status: Number(market[4]),
            threshold: market[5].toString(),
            deadline: Number(market[8]),
            creator: market[13],
          });
        } catch (err) {
          console.warn(`Error cargando mercado ${i}:`, err);
        }
      }

      setDebugInfo({
        marketCount,
        markets: marketsData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error verificando mercados:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && isConnected) {
      checkMarkets();
    }
  }, [isReady, isConnected]);

  return (
    <div className="bg-yellow-900/20 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
      <h3 className="text-lg font-semibold text-yellow-400 mb-3">🔍 Debug Mercados</h3>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-300">
          <div>Estado: {isConnected ? '✅ Conectada' : '❌ Desconectada'}</div>
          <div>Contrato: {isReady ? '✅ Listo' : '❌ No listo'}</div>
        </div>

        <button
          onClick={checkMarkets}
          disabled={!isReady || isLoading}
          className="w-full py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verificando...' : 'Verificar Mercados'}
        </button>

        {debugInfo.marketCount !== undefined && (
          <div className="mt-3 p-3 bg-black/30 rounded-lg">
            <div className="text-sm text-gray-300">
              <div className="mb-2">
                <strong>Total de mercados:</strong> {debugInfo.marketCount}
              </div>
              
              {debugInfo.markets && debugInfo.markets.length > 0 && (
                <div className="space-y-2">
                  <strong>Mercados encontrados:</strong>
                  {debugInfo.markets.map((market: any) => (
                    <div key={market.id} className="ml-4 p-2 bg-gray-800/50 rounded text-xs">
                      <div><strong>ID:</strong> {market.id}</div>
                      <div><strong>Título:</strong> {market.title}</div>
                      <div><strong>Estado:</strong> {market.status}</div>
                      <div><strong>Umbral:</strong> {market.threshold}</div>
                      <div><strong>Deadline:</strong> {new Date(market.deadline * 1000).toLocaleString()}</div>
                      <div><strong>Creador:</strong> {market.creator}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-400">
                Última verificación: {debugInfo.timestamp}
              </div>
            </div>
          </div>
        )}

        {debugInfo.error && (
          <div className="mt-3 p-3 bg-red-900/30 rounded-lg">
            <div className="text-sm text-red-300">
              <strong>Error:</strong> {debugInfo.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
