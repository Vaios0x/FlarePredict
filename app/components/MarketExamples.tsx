'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Zap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface MarketExample {
  id: number;
  title: string;
  description: string;
  threshold: string;
  days: number;
  category: 'bullish' | 'bearish' | 'stable';
}

const marketExamples: MarketExample[] = [
  {
    id: 1,
    title: "¿FLR alcanzará $0.50?",
    description: "Mercado resuelve SÍ si FLR/USD >= $0.50 al final del período",
    threshold: "250",
    days: 7,
    category: 'bullish'
  },
  {
    id: 2,
    title: "¿FLR superará $0.30?",
    description: "Mercado resuelve SÍ si FLR/USD >= $0.30 al final del período",
    threshold: "150",
    days: 5,
    category: 'bullish'
  },
  {
    id: 3,
    title: "¿FLR llegará a $1.00?",
    description: "Mercado resuelve SÍ si FLR/USD >= $1.00 al final del período",
    threshold: "100",
    days: 10,
    category: 'bullish'
  },
  {
    id: 4,
    title: "¿FLR caerá por debajo de $0.20?",
    description: "Mercado resuelve SÍ si FLR/USD <= $0.20 al final del período",
    threshold: "200",
    days: 3,
    category: 'bearish'
  },
  {
    id: 5,
    title: "¿FLR mantendrá $0.25?",
    description: "Mercado resuelve SÍ si FLR/USD se mantiene en $0.25 ±5%",
    threshold: "125",
    days: 14,
    category: 'stable'
  }
];

export function MarketExamples() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (example: MarketExample) => {
    const text = `Título: ${example.title}\nDescripción: ${example.description}\nPrecio Umbral: ${example.threshold}\nDías: ${example.days}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(example.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable':
        return <DollarSign className="w-4 h-4 text-blue-400" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bullish':
        return 'border-green-500/30 bg-green-500/10';
      case 'bearish':
        return 'border-red-500/30 bg-red-500/10';
      case 'stable':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          📊 Ejemplos de Mercados
        </h3>
        <p className="text-sm text-gray-400">
          Haz clic en cualquier ejemplo para copiarlo al portapapeles
        </p>
      </div>

      <div className="grid gap-3">
        {marketExamples.map((example) => (
          <motion.div
            key={example.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => copyToClipboard(example)}
            className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:border-white/20 ${getCategoryColor(example.category)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getCategoryIcon(example.category)}
                  <h4 className="font-medium text-white text-sm">
                    {example.title}
                  </h4>
                </div>
                
                <p className="text-xs text-gray-300 mb-2">
                  {example.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>💰 Umbral: {example.threshold}</span>
                  <span>⏰ {example.days} días</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0 ml-3"
              >
                {copiedId === example.id ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                )}
              </motion.button>
            </div>

            {copiedId === example.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
              >
                ¡Copiado!
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500 mt-4">
        💡 Copia estos ejemplos y úsalos en el formulario de crear mercado
      </div>
    </motion.div>
  );
}
