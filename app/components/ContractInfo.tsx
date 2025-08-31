'use client';

import { useFlarePredict } from '../hooks/useFlarePredict';
import { useMarkets } from '../hooks/useMarkets';
import { getChainName } from '../config/chains';
import { motion } from 'framer-motion';
import { Activity, Users, DollarSign, Clock } from 'lucide-react';

export function ContractInfo() {
  const { contractAddress, chainId, getTotalVolume, getTotalFeesCollected, isReady } = useFlarePredict();
  const { markets, loading } = useMarkets();

  if (!isReady) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-400">
          Conecta tu wallet para ver información del contrato
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Información del Contrato
      </h3>

      <div className="space-y-4">
        {/* Dirección del contrato */}
        <div>
          <label className="text-sm text-gray-400">Contrato</label>
          <div className="flex items-center space-x-2">
            <code className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
              {contractAddress?.slice(0, 10)}...{contractAddress?.slice(-8)}
            </code>
            <a
              href={`https://coston2-explorer.flare.network/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              Ver en Explorer
            </a>
          </div>
        </div>

        {/* Red */}
        <div>
          <label className="text-sm text-gray-400">Red</label>
          <div className="text-white font-medium">{getChainName(chainId)}</div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs text-gray-400">Mercados</div>
              <div className="text-white font-medium">
                {loading ? '...' : markets.length}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-xs text-gray-400">Volumen</div>
              <div className="text-white font-medium">
                {loading ? '...' : '0.00'} FLR
              </div>
            </div>
          </div>
        </div>

        {/* Estado del contrato */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Contrato Activo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
