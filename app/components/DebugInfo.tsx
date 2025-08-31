'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { getContractAddress } from '../config/contracts';

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const updateDebugInfo = async () => {
      const info: any = {
        isConnected,
        address,
        chainId,
        hasPublicClient: !!publicClient,
        hasWalletClient: !!walletClient,
        contractAddress: getContractAddress('FlarePredict'),
        timestamp: new Date().toISOString(),
      };

      // Verificar si el contrato existe
      if (publicClient) {
        try {
          const code = await publicClient.getBytecode({
            address: getContractAddress('FlarePredict') as `0x${string}`,
          });
          info.contractExists = code !== undefined && code !== '0x';
          info.contractCodeLength = code ? code.length : 0;
        } catch (error) {
          info.contractError = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // Verificar balance si hay wallet conectada
      if (isConnected && address && publicClient) {
        try {
          const balance = await publicClient.getBalance({ address });
          info.balance = balance.toString();
          info.balanceInEth = (Number(balance) / 1e18).toFixed(4);
        } catch (error) {
          info.balanceError = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000);
    return () => clearInterval(interval);
  }, [isConnected, address, chainId, publicClient, walletClient]);

  return (
    <div className="bg-red-900/20 backdrop-blur-md rounded-xl p-4 border border-red-500/30">
      <h3 className="text-lg font-semibold text-red-400 mb-3">🔧 Debug Info</h3>
      
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-300">Wallet Conectada:</div>
          <div className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? '✅ Sí' : '❌ No'}
          </div>
          
          <div className="text-gray-300">Chain ID:</div>
          <div className="text-white">{chainId}</div>
          
          <div className="text-gray-300">Public Client:</div>
          <div className={debugInfo.hasPublicClient ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasPublicClient ? '✅ Disponible' : '❌ No disponible'}
          </div>
          
          <div className="text-gray-300">Wallet Client:</div>
          <div className={debugInfo.hasWalletClient ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasWalletClient ? '✅ Disponible' : '❌ No disponible'}
          </div>
          
          <div className="text-gray-300">Contrato Existe:</div>
          <div className={debugInfo.contractExists ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.contractExists ? '✅ Sí' : '❌ No'}
          </div>
          
          {isConnected && (
            <>
              <div className="text-gray-300">Balance:</div>
              <div className="text-white">
                {debugInfo.balanceInEth ? `${debugInfo.balanceInEth} C2FLR` : 'Cargando...'}
              </div>
            </>
          )}
        </div>
        
        <div className="mt-3 p-2 bg-black/30 rounded text-xs">
          <div className="text-gray-400 mb-1">Contrato:</div>
          <div className="text-white font-mono break-all">
            {debugInfo.contractAddress}
          </div>
        </div>
        
        {debugInfo.address && (
          <div className="mt-2 p-2 bg-black/30 rounded text-xs">
            <div className="text-gray-400 mb-1">Wallet:</div>
            <div className="text-white font-mono break-all">
              {debugInfo.address}
            </div>
          </div>
        )}
        
        {debugInfo.contractError && (
          <div className="mt-2 p-2 bg-red-900/30 rounded text-xs">
            <div className="text-red-400 mb-1">Error Contrato:</div>
            <div className="text-red-300">{debugInfo.contractError}</div>
          </div>
        )}
      </div>
    </div>
  );
}
