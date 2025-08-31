'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Video, 
  Code, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface DocumentationProps {
  onBack: () => void;
}

export function Documentation({ onBack }: DocumentationProps) {
  const guides = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Aprende a configurar tu wallet y hacer tu primera predicción',
      icon: <Zap className="w-6 h-6" />,
      difficulty: 'Fácil',
      time: '5 min',
      sections: [
        'Conectar tu wallet de Flare',
        'Explorar mercados disponibles',
        'Hacer tu primera apuesta',
        'Entender las probabilidades'
      ]
    },
    {
      id: 'creating-markets',
      title: 'Crear Mercados',
      description: 'Guía completa para crear tus propios mercados de predicción',
      icon: <TrendingUp className="w-6 h-6" />,
      difficulty: 'Intermedio',
      time: '10 min',
      sections: [
        'Elegir el tipo de evento',
        'Configurar el umbral',
        'Establecer la fecha límite',
        'Promocionar tu mercado'
      ]
    },
    {
      id: 'advanced-strategies',
      title: 'Estrategias Avanzadas',
      description: 'Técnicas avanzadas para maximizar tus ganancias',
      icon: <Users className="w-6 h-6" />,
      difficulty: 'Avanzado',
      time: '15 min',
      sections: [
        'Análisis de probabilidades',
        'Diversificación de apuestas',
        'Timing de mercados',
        'Gestión de riesgo'
      ]
    }
  ];

  const resources = [
    {
      title: 'Whitepaper Técnico',
      description: 'Documentación técnica completa del protocolo',
      icon: <FileText className="w-5 h-5" />,
      link: '#',
      type: 'PDF'
    },
    {
      title: 'Video Tutoriales',
      description: 'Serie de videos paso a paso',
      icon: <Video className="w-5 h-5" />,
      link: '#',
      type: 'Video'
    },
    {
      title: 'API Reference',
      description: 'Documentación de la API para desarrolladores',
      icon: <Code className="w-5 h-5" />,
      link: '#',
      type: 'API'
    },
    {
      title: 'Seguridad',
      description: 'Guías de seguridad y mejores prácticas',
      icon: <Shield className="w-5 h-5" />,
      link: '#',
      type: 'Guía'
    }
  ];

  const faqs = [
    {
      question: '¿Qué es FlarePredict?',
      answer: 'FlarePredict es una plataforma descentralizada de mercados de predicción que utiliza oráculos FTSO para liquidación automática y transparente.'
    },
    {
      question: '¿Cómo funcionan los oráculos FTSO?',
      answer: 'Los oráculos FTSO (Flare Time Series Oracle) proporcionan datos verificados en tiempo real que se utilizan para resolver automáticamente los resultados de los mercados.'
    },
    {
      question: '¿Puedo crear cualquier tipo de mercado?',
      answer: 'Sí, puedes crear mercados sobre cualquier evento que tenga datos verificables, incluyendo precios de activos, eventos deportivos, clima, y más.'
    },
    {
      question: '¿Cómo se calculan las ganancias?',
      answer: 'Las ganancias se calculan automáticamente basándose en las probabilidades del mercado y se distribuyen proporcionalmente entre los ganadores.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Documentación</h1>
          </div>
          <p className="text-gray-300 text-lg">Guías, tutoriales y recursos para dominar FlarePredict</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">{guides.length}</div>
            <div className="text-gray-300 text-sm">Guías</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">{resources.length}</div>
            <div className="text-gray-300 text-sm">Recursos</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">{faqs.length}</div>
            <div className="text-gray-300 text-sm">Preguntas Frecuentes</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-gray-300 text-sm">Soporte</div>
          </motion.div>
        </div>

        {/* Guides Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Guías de Aprendizaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    {guide.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{guide.title}</h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        guide.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-400' :
                        guide.difficulty === 'Intermedio' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {guide.difficulty}
                      </span>
                      <span className="text-gray-400">• {guide.time}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">{guide.description}</p>
                <ul className="space-y-2 mb-4">
                  {guide.sections.map((section, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      <span>{section}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <span>Comenzar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recursos Adicionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                      {resource.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                      <p className="text-gray-300 text-sm">{resource.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                      {resource.type}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <span>← Volver</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
