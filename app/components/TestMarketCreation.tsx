'use client';

import { useState } from 'react';
import { useFlarePredict } from '../hooks/useFlarePredict';
import { useAccount, useChainId } from 'wagmi';
import { getTokenSymbol } from '../config/chains';

export function TestMarketCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string>('');
  const { createMarket, isReady } = useFlarePredict();
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const handleCreateTestMarket = async () => {
    if (!isConnected) {
      setResult('Error: Wallet no conectada');
      return;
    }

    if (!isReady) {
      setResult('Error: Contrato no listo');
      return;
    }

    setIsCreating(true);
    setResult('Creando mercado de prueba...');

    try {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hora desde ahora
      const threshold = (50000 * 1e18).toString(); // $50,000 USD

      const tx = await createMarket(
        'Test: ¿BTC alcanzará $50k?',
        'Mercado de prueba - BTC/USD >= $50,000',
        '0x014254432f55534400000000000000000000000000', // BTC/USD feed
        0, // BINARY market type
        threshold,
        deadline
      );

      setResult(`✅ Mercado creado exitosamente! Hash: ${tx}`);
    } catch (error) {
      console.error('Error creating test market:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">Prueba de Creación de Mercados</h3>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-300">
          <div>Estado de Wallet: {isConnected ? '✅ Conectada' : '❌ Desconectada'}</div>
          <div>Estado del Contrato: {isReady ? '✅ Listo' : '❌ No listo'}</div>
          <div>Red: {getTokenSymbol(chainId)} (Chain ID: {chainId})</div>
        </div>

        <button
          onClick={handleCreateTestMarket}
          disabled={!isConnected || !isReady || isCreating}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creando...' : 'Crear Mercado de Prueba'}
        </button>

        {result && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-300 whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
