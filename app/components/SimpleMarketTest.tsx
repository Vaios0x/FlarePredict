'use client';

import { useState } from 'react';
import { useFlarePredict } from '../hooks/useFlarePredict';
import { useAccount, useChainId } from 'wagmi';

export function SimpleMarketTest() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string>('');
  const { createMarket, isReady } = useFlarePredict();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const handleCreateSimpleMarket = async () => {
    if (!isConnected) {
      setResult('❌ Error: Wallet no conectada');
      return;
    }

    if (!isReady) {
      setResult('❌ Error: Contrato no listo');
      return;
    }

    setIsCreating(true);
    setResult('🔄 Creando mercado simple...');

    try {
      // Datos de prueba simples
      const title = 'Test Simple Market';
      const description = 'Mercado de prueba simple';
      const feedId = '0x014254432f55534400000000000000000000000000'; // BTC/USD
      const marketType = 0; // BINARY
      const threshold = '50000'; // $50,000 en centavos
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hora desde ahora

      console.log('Datos de mercado:', {
        title,
        description,
        feedId,
        marketType,
        threshold,
        deadline,
        chainId
      });

      const tx = await createMarket(
        title,
        description,
        feedId,
        marketType,
        threshold,
        deadline
      );

      console.log('Transacción exitosa:', tx);
      setResult(`✅ Mercado creado exitosamente!\nHash: ${tx}`);
    } catch (error) {
      console.error('Error detallado:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-blue-900/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
      <h3 className="text-lg font-semibold text-blue-400 mb-3">🧪 Prueba Simple</h3>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-300">
          <div>Estado: {isConnected ? '✅ Conectada' : '❌ Desconectada'}</div>
          <div>Contrato: {isReady ? '✅ Listo' : '❌ No listo'}</div>
          <div>Chain ID: {chainId}</div>
        </div>

        <button
          onClick={handleCreateSimpleMarket}
          disabled={!isConnected || !isReady || isCreating}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creando...' : 'Crear Mercado Simple'}
        </button>

        {result && (
          <div className="mt-3 p-3 bg-black/30 rounded-lg">
            <div className="text-sm text-gray-300 whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
