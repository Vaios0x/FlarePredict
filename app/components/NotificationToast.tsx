'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X, TrendingUp, DollarSign } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: {
    amount?: string;
    currency?: string;
    side?: string;
    marketTitle?: string;
    txHash?: string;
  };
  timestamp: number;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const getNotificationConfig = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle,
        bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
        borderColor: 'border-green-400/30',
        iconColor: 'text-green-400',
        glowColor: 'shadow-green-500/20',
      };
    case 'error':
      return {
        icon: XCircle,
        bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
        borderColor: 'border-red-400/30',
        iconColor: 'text-red-400',
        glowColor: 'shadow-red-500/20',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-600',
        borderColor: 'border-yellow-400/30',
        iconColor: 'text-yellow-400',
        glowColor: 'shadow-yellow-500/20',
      };
    case 'info':
      return {
        icon: TrendingUp,
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        borderColor: 'border-blue-400/30',
        iconColor: 'text-blue-400',
        glowColor: 'shadow-blue-500/20',
      };
  }
};

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = getNotificationConfig(notification.type);
  const IconComponent = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(notification.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={`relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} backdrop-blur-xl shadow-2xl ${config.glowColor} min-w-[380px] max-w-[450px]`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          {/* Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className={`p-2 rounded-xl bg-white/10 backdrop-blur-sm ${config.iconColor}`}
                >
                  <IconComponent className="w-5 h-5" />
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white font-semibold text-lg"
                  >
                    {notification.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 text-sm"
                  >
                    {notification.message}
                  </motion.p>
                </div>
              </div>
              
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Details */}
            {notification.details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                {/* Bet Details */}
                {notification.details.amount && notification.details.side && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">Apuesta:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {notification.details.amount} {notification.details.currency || 'FLR'}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        notification.details.side === 'yes' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {notification.details.side.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Title */}
                {notification.details.marketTitle && (
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-white/60 text-xs mb-1">Mercado</div>
                    <div className="text-white text-sm font-medium truncate">
                      {notification.details.marketTitle}
                    </div>
                  </div>
                )}

                {/* Transaction Hash */}
                {notification.details.txHash && (
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="text-white/60 text-xs mb-1">Transacción</div>
                    <div className="text-white/80 text-xs font-mono break-all">
                      {notification.details.txHash.slice(0, 10)}...{notification.details.txHash.slice(-8)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Progress Bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
