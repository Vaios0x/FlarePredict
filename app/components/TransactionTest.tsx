'use client';

import { useState } from 'react';
import { useFlarePredict } from '../hooks/useFlarePredict';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { TestTube, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export function TransactionTest() {
  const [testResults, setTestResults] = useState<{
    createMarket: 'pending' | 'success' | 'error' | 'not-tested';
    placeBet: 'pending' | 'success' | 'error' | 'not-tested';
  }>({
    createMarket: 'not-tested',
    placeBet: 'not-tested'
  });
  
  const [logs, setLogs] = useState<string[]>([]);
  const { isConnected } = useAccount();
  const { createMarket, placeBet, isReady, contractAddress } = useFlarePredict();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreateMarket = async () => {
    if (!isReady) {
      addLog('❌ Hook no está listo para crear mercado');
      return;
    }

    setTestResults(prev => ({ ...prev, createMarket: 'pending' }));
    addLog('🚀 Iniciando prueba de creación de mercado...');

    try {
      const deadline = Math.floor(Date.now() / 1000) + 7200; // 2 horas en el futuro
      const threshold = '25000'; // $250.00 en centavos
      
      addLog(`📋 Creando mercado con deadline: ${new Date(deadline * 1000).toLocaleString()}`);
      addLog(`📋 Threshold: $${parseInt(threshold) / 100}`);

      const result = await createMarket(
        'Mercado de Prueba',
        'Este es un mercado de prueba para verificar la funcionalidad',
        '0x01464c522f55534400000000000000000000000000', // FLR/USD
        0, // BINARY
        threshold,
        deadline
      );

      addLog(`✅ Mercado creado exitosamente: ${result}`);
      setTestResults(prev => ({ ...prev, createMarket: 'success' }));
    } catch (error) {
      addLog(`❌ Error creando mercado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setTestResults(prev => ({ ...prev, createMarket: 'error' }));
    }
  };

  const testPlaceBet = async () => {
    if (!isReady) {
      addLog('❌ Hook no está listo para colocar apuesta');
      return;
    }

    setTestResults(prev => ({ ...prev, placeBet: 'pending' }));
    addLog('💰 Iniciando prueba de colocación de apuesta...');

    try {
      const amount = '100000000000000000'; // 0.1 FLR en wei
      
      addLog(`📋 Colocando apuesta de 0.1 FLR en mercado 0 (SÍ)`);

      const result = await placeBet(
        0, // Primer mercado
        true, // SÍ
        amount
      );

      addLog(`✅ Apuesta colocada exitosamente: ${result}`);
      setTestResults(prev => ({ ...prev, placeBet: 'success' }));
    } catch (error) {
      addLog(`❌ Error colocando apuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setTestResults(prev => ({ ...prev, placeBet: 'error' }));
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults({
      createMarket: 'not-tested',
      placeBet: 'not-tested'
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-medium">Conecta tu wallet para probar transacciones</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center space-x-2 mb-4">
        <TestTube className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Prueba de Transacciones</h3>
      </div>

      <div className="space-y-4">
        {/* Estado del contrato */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-sm text-gray-300 mb-2">Estado del Contrato:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-gray-300">Hook Listo: {isReady ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-gray-300">Contrato: {contractAddress?.slice(0, 10)}...</span>
            </div>
          </div>
        </div>

        {/* Botones de prueba */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={testCreateMarket}
            disabled={!isReady || testResults.createMarket === 'pending'}
            className={`p-3 rounded-lg font-medium transition-all ${
              testResults.createMarket === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : testResults.createMarket === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : testResults.createMarket === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
            } disabled:opacity-50`}
          >
            <div className="flex items-center justify-center space-x-2">
              {testResults.createMarket === 'pending' && <Loader className="w-4 h-4 animate-spin" />}
              {testResults.createMarket === 'success' && <CheckCircle className="w-4 h-4" />}
              {testResults.createMarket === 'error' && <AlertCircle className="w-4 h-4" />}
              <span>Crear Mercado</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={testPlaceBet}
            disabled={!isReady || testResults.placeBet === 'pending'}
            className={`p-3 rounded-lg font-medium transition-all ${
              testResults.placeBet === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : testResults.placeBet === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : testResults.placeBet === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
            } disabled:opacity-50`}
          >
            <div className="flex items-center justify-center space-x-2">
              {testResults.placeBet === 'pending' && <Loader className="w-4 h-4 animate-spin" />}
              {testResults.placeBet === 'success' && <CheckCircle className="w-4 h-4" />}
              {testResults.placeBet === 'error' && <AlertCircle className="w-4 h-4" />}
              <span>Colocar Apuesta</span>
            </div>
          </motion.button>
        </div>

        {/* Logs */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-300">Logs de Prueba:</div>
            <button
              onClick={clearLogs}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Limpiar
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <div className="text-xs text-gray-500">No hay logs aún...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-300 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
