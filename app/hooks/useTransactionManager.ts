'use client';

import { useState, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useNotifications } from './useNotifications';

interface TransactionState {
  isPending: boolean;
  txHash?: string;
  error?: string;
  success?: boolean;
}

export function useTransactionManager() {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isPending: false,
  });
  
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { showSuccess, showError, showInfo } = useNotifications();

  const executeTransaction = useCallback(async (
    transactionFn: () => Promise<string>,
    successMessage: string,
    errorMessage: string
  ) => {
    if (!isConnected) {
      showError('Wallet No Conectada', 'Por favor conecta tu wallet para realizar transacciones');
      return null;
    }

    if (!publicClient) {
      showError('Error de Conexión', 'No se pudo conectar con la blockchain');
      return null;
    }

    setTransactionState({ isPending: true });
    showInfo('Procesando Transacción', 'Por favor confirma la transacción en tu wallet...');

    try {
      const txHash = await transactionFn();
      
      setTransactionState({ 
        isPending: false, 
        txHash, 
        success: true 
      });

      showSuccess('Transacción Enviada', successMessage, {
        txHash,
      });

      // Esperar confirmación de la transacción
      await waitForTransaction(txHash);
      
      return txHash;
    } catch (error) {
      console.error('Error en transacción:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setTransactionState({ 
        isPending: false, 
        error: errorMsg 
      });

      // Mostrar error específico
      let finalErrorMessage = errorMessage;
      if (errorMsg.includes('insufficient funds')) {
        finalErrorMessage = 'Saldo insuficiente para realizar esta transacción';
      } else if (errorMsg.includes('user rejected')) {
        finalErrorMessage = 'Transacción cancelada por el usuario';
      } else if (errorMsg.includes('execution reverted')) {
        finalErrorMessage = 'Error en el contrato. Verifica que los parámetros sean correctos.';
      }

      showError('Error en Transacción', finalErrorMessage);
      return null;
    }
  }, [isConnected, publicClient, showSuccess, showError, showInfo]);

  const waitForTransaction = useCallback(async (txHash: string) => {
    if (!publicClient) return;

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        confirmations: 1,
        timeout: 60000, // 60 segundos
      });

      if (receipt.status === 'success') {
        console.log('Transacción confirmada:', txHash);
      } else {
        throw new Error('La transacción falló en la blockchain');
      }
    } catch (error) {
      console.error('Error esperando confirmación:', error);
      throw error;
    }
  }, [publicClient]);

  const resetTransactionState = useCallback(() => {
    setTransactionState({ isPending: false });
  }, []);

  return {
    executeTransaction,
    waitForTransaction,
    resetTransactionState,
    transactionState,
  };
}
