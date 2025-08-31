'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Clock, 
  DollarSign, 
  Globe, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';

interface LandingPageProps {
  onStartPredicting: () => void;
}

export function LandingPage({ onStartPredicting }: LandingPageProps) {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Predicciones en Tiempo Real",
      description: "Apuesta en mercados de predicción con liquidación instantánea usando datos FTSO verificados."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Seguridad Blockchain",
      description: "Todas las transacciones están protegidas por la seguridad de Flare Network y contratos inteligentes."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Liquidación Instantánea",
      description: "Los resultados se resuelven automáticamente usando oráculos FTSO sin intervención manual."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Comunidad Global",
      description: "Únete a una comunidad global de traders y predictores en la red Flare."
    }
  ];

  const benefits = [
    "Sin intermediarios - Transacciones directas P2P",
    "Liquidación automática con oráculos FTSO",
    "Mercados de cualquier tipo de evento",
    "Interfaz intuitiva y fácil de usar",
    "Soporte para múltiples activos",
    "Transparencia total en blockchain"
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Conecta tu Wallet",
      description: "Conecta tu wallet de Flare Network para comenzar a predecir.",
      icon: <Target className="w-6 h-6" />
    },
    {
      step: "2", 
      title: "Elige un Mercado",
      description: "Selecciona entre mercados existentes o crea uno nuevo.",
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      step: "3",
      title: "Haz tu Predicción", 
      description: "Apuesta SÍ o NO en el resultado que crees que ocurrirá.",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      step: "4",
      title: "Recibe tu Recompensa",
      description: "Si aciertas, recibe automáticamente tu recompensa en FLR.",
      icon: <DollarSign className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-8xl mb-8 mx-auto w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
              >
                🔮
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                El Futuro de las
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Predicciones</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                La primera plataforma de mercados de predicción descentralizada en Flare Network. 
                Apuesta en tiempo real con liquidación instantánea usando datos FTSO verificados.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartPredicting}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
              >
                <span>Comenzar a Predecir</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¿Por qué <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FlarePredict</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              La plataforma más avanzada para mercados de predicción descentralizados
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="text-purple-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¿Cómo <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Funciona</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              En solo 4 simples pasos puedes comenzar a predecir y ganar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto">
                    {step.step}
                  </div>
                  <div className="text-purple-400 mb-4 flex justify-center">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
                </div>
                
                {/* Arrow to next step */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Beneficios <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Únicos</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                FlarePredict ofrece ventajas que ninguna otra plataforma de predicción puede igualar
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-purple-500/30">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Próximamente</h3>
                  <p className="text-gray-300 mb-6">
                    Mercados de predicción para:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl mb-2">🌤️</div>
                      <div className="text-white font-medium">Clima</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl mb-2">⚽</div>
                      <div className="text-white font-medium">Deportes</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl mb-2">🗳️</div>
                      <div className="text-white font-medium">Política</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl mb-2">📈</div>
                      <div className="text-white font-medium">Economía</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Predecir</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están ganando con FlarePredict
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartPredicting}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              <span>Comenzar Ahora</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
