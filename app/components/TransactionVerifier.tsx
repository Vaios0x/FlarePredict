'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TransactionVerifierProps {
  txHash?: string;
  onComplete?: (success: boolean) => void;
  onError?: (error: string) => void;
}

export function TransactionVerifier({ txHash, onComplete, onError }: TransactionVerifierProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [confirmations, setConfirmations] = useState(0);
  const [error, setError] = useState<string>('');
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!txHash || !isConnected || !publicClient) {
      return;
    }

    const checkTransaction = async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({
          hash: txHash as `0x${string}`,
        });

        if (receipt.status === 'success') {
          setStatus('confirmed');
          setConfirmations(1); // Confirmado = 1 confirmación
          onComplete?.(true);
        } else {
          setStatus('failed');
          setError('La transacción falló en la blockchain');
          onComplete?.(false);
          onError?.('La transacción falló en la blockchain');
        }
      } catch (err) {
        console.log('Transacción aún pendiente...');
        // La transacción aún está pendiente
        setTimeout(checkTransaction, 2000);
      }
    };

    checkTransaction();
  }, [txHash, isConnected, publicClient, onComplete, onError]);

  if (!txHash) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-400/30',
          message: 'Confirmando transacción...',
        };
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-400/30',
          message: 'Transacción confirmada',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400/30',
          message: 'Transacción falló',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={status === 'pending' ? { rotate: 360 } : {}}
          transition={status === 'pending' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
          className={`p-2 rounded-lg bg-white/10 ${config.color}`}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>
        
        <div className="flex-1">
          <div className="text-white font-medium">{config.message}</div>
          <div className="text-white/60 text-sm font-mono">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </div>
          {status === 'pending' && (
            <div className="text-yellow-300 text-xs mt-1">
              Confirmaciones: {confirmations}
            </div>
          )}
          {status === 'failed' && error && (
            <div className="text-red-300 text-xs mt-1">{error}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
