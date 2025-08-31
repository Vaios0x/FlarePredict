'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Plus, 
  Trophy, 
  FileText,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

interface QuickLinksProps {
  onNavigate: (section: string) => void;
  currentSection: string;
  marketsCount: number;
  isConnected: boolean;
}

export function QuickLinks({ onNavigate, currentSection, marketsCount, isConnected }: QuickLinksProps) {
  const quickLinks = [
    {
      id: 'markets',
      label: 'Mercados Activos',
      icon: <BarChart3 className="w-5 h-5" />,
      description: `${marketsCount} mercados disponibles`,
      action: () => onNavigate('predict')
    },
    {
      id: 'create',
      label: 'Crear Mercado',
      icon: <Plus className="w-5 h-5" />,
      description: 'Crea un nuevo mercado de predicción',
      action: () => onNavigate('create-market'),
      requiresConnection: true
    },
    {
      id: 'leaderboard',
      label: 'Tabla de Posiciones',
      icon: <Trophy className="w-5 h-5" />,
      description: 'Ver los mejores predictores',
      action: () => onNavigate('leaderboard')
    },
    {
      id: 'docs',
      label: 'Documentación',
      icon: <FileText className="w-5 h-5" />,
      description: 'Guías y tutoriales',
      action: () => onNavigate('documentation')
    }
  ];

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/10">
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center space-x-2">
        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
        <span className="hidden sm:inline">Enlaces Rápidos</span>
        <span className="sm:hidden">Accesos</span>
      </h3>
      
      <div className="space-y-2 sm:space-y-3">
        {quickLinks.map((link, index) => {
          const isDisabled = link.requiresConnection && !isConnected;
          
          return (
            <motion.button
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={link.action}
              disabled={isDisabled}
              className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all duration-300 group ${
                isDisabled 
                  ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20 text-white hover:border-purple-500/30 border border-white/10'
              }`}
              aria-label={link.label}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${
                  isDisabled 
                    ? 'bg-gray-600/50 text-gray-400' 
                    : 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30'
                }`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs sm:text-sm truncate">{link.label}</div>
                  <div className={`text-xs ${
                    isDisabled ? 'text-gray-500' : 'text-gray-300'
                  } truncate`}>
                    {link.description}
                  </div>
                </div>
                {isDisabled && (
                  <div className="text-xs text-gray-500 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded flex-shrink-0">
                    Conectar
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Stats Preview */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-purple-400 font-medium text-sm">{marketsCount}</div>
            <div className="text-gray-400 text-xs">Mercados</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-green-400 font-medium text-sm">
              {isConnected ? '✅' : '❌'}
            </div>
            <div className="text-gray-400 text-xs">Estado</div>
          </div>
        </div>
      </div>
    </div>
  );
}
