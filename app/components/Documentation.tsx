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
      title: 'Getting Started',
      description: 'Learn how to set up your wallet and make your first prediction',
      icon: <Zap className="w-6 h-6" />,
      difficulty: 'Easy',
      time: '5 min',
      sections: [
        'Connect your Flare wallet',
        'Explore available markets',
        'Make your first bet',
        'Understand the odds'
      ]
    },
    {
      id: 'creating-markets',
      title: 'Creating Markets',
      description: 'Complete guide to create your own prediction markets',
      icon: <TrendingUp className="w-6 h-6" />,
      difficulty: 'Intermediate',
      time: '10 min',
      sections: [
        'Choose the event type',
        'Configure the threshold',
        'Set the deadline',
        'Promote your market'
      ]
    },
    {
      id: 'advanced-strategies',
      title: 'Advanced Strategies',
      description: 'Advanced techniques to maximize your earnings',
      icon: <Users className="w-6 h-6" />,
      difficulty: 'Advanced',
      time: '15 min',
      sections: [
        'Probability analysis',
        'Bet diversification',
        'Market timing',
        'Risk management'
      ]
    }
  ];

  const resources = [
    {
      title: 'Technical Whitepaper',
      description: 'Complete technical documentation of the protocol',
      icon: <FileText className="w-5 h-5" />,
      link: '#',
      type: 'PDF'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video series',
      icon: <Video className="w-5 h-5" />,
      link: '#',
      type: 'Video'
    },
    {
      title: 'API Reference',
      description: 'API documentation for developers',
      icon: <Code className="w-5 h-5" />,
      link: '#',
      type: 'API'
    },
    {
      title: 'Security',
      description: 'Security guides and best practices',
      icon: <Shield className="w-5 h-5" />,
      link: '#',
      type: 'Guide'
    }
  ];

  const faqs = [
    {
      question: 'What is FlarePredict?',
      answer: 'FlarePredict is a decentralized prediction markets platform that uses FTSO oracles for automatic and transparent settlement.'
    },
    {
      question: 'How do FTSO oracles work?',
      answer: 'FTSO (Flare Time Series Oracle) oracles provide verified real-time data that is used to automatically resolve market outcomes.'
    },
    {
      question: 'Can I create any type of market?',
      answer: 'Yes, you can create markets on any event that has verifiable data, including asset prices, sporting events, weather, and more.'
    },
    {
      question: 'How are earnings calculated?',
      answer: 'Earnings are automatically calculated based on market probabilities and distributed proportionally among winners.'
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
            <h1 className="text-4xl font-bold text-white">Documentation</h1>
          </div>
          <p className="text-gray-300 text-lg">Guides, tutorials and resources to master FlarePredict</p>
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
            <div className="text-gray-300 text-sm">Guides</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">{resources.length}</div>
            <div className="text-gray-300 text-sm">Resources</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">{faqs.length}</div>
            <div className="text-gray-300 text-sm">Frequently Asked Questions</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
          >
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-gray-300 text-sm">Support</div>
          </motion.div>
        </div>

        {/* Guides Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Learning Guides</h2>
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
                                              guide.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      guide.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
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
                  <span>Start</span>
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
          <h2 className="text-2xl font-bold text-white mb-6">Additional Resources</h2>
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
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
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
            <span>← Back</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
