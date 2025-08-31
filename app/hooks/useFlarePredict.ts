'use client';

import { useReadContract, useWriteContract, usePublicClient, useWalletClient, useAccount, useChainId } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { FlarePredict__factory } from '../../typechain-types';

export function useFlarePredict() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // Obtener dirección del contrato según la red
  const contractAddress = getContractAddress('FlarePredict');

  // Funciones del contrato usando useWriteContract
  const { writeContractAsync, isPending } = useWriteContract();

  // Funciones del contrato
  const createMarket = async (
    title: string,
    description: string,
    feedId: string,
    marketType: number,
    threshold: string,
    deadline: number
  ) => {
    console.log('🚀 Iniciando creación de mercado...');
    console.log('Estado de conexión:', { isConnected, walletClient: !!walletClient });
    
    if (!isConnected || !walletClient) throw new Error('Wallet no conectada');
    
    // Validar que el deadline esté en el futuro y dentro del rango permitido
    const currentTime = Math.floor(Date.now() / 1000);
    if (deadline <= currentTime + 3600) {
      throw new Error('El deadline debe ser al menos 1 hora en el futuro');
    }
    if (deadline > currentTime + 30 * 24 * 3600) {
      throw new Error('El deadline no puede ser más de 30 días en el futuro');
    }
    
    // Validar el título
    if (!title || title.length === 0 || title.length > 100) {
      throw new Error('El título debe tener entre 1 y 100 caracteres');
    }
    
    console.log('📋 Datos del mercado a crear:', {
      title,
      description,
      feedId,
      marketType,
      threshold,
      deadline,
      currentTime,
      contractAddress
    });
    
    try {
      console.log('📝 Ejecutando transacción createMarket...');
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: FlarePredict__factory.abi,
        functionName: 'createMarket',
        args: [
          title, 
          description, 
          feedId as `0x${string}`, 
          marketType, 
          BigInt(threshold), 
          BigInt(deadline)
        ],
      });
      
      console.log('✅ Mercado creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creando mercado:', error);
      
      // Manejar errores específicos
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('insufficient funds')) {
          throw new Error('Saldo insuficiente para crear el mercado');
        } else if (errorMessage.includes('user rejected')) {
          throw new Error('Transacción cancelada por el usuario');
        } else if (errorMessage.includes('execution reverted')) {
          if (errorMessage.includes('deadline too soon')) {
            throw new Error('El deadline debe ser al menos 1 hora en el futuro');
          } else if (errorMessage.includes('deadline too far')) {
            throw new Error('El deadline no puede ser más de 30 días en el futuro');
          } else if (errorMessage.includes('invalid title')) {
            throw new Error('Título inválido (debe tener entre 1 y 100 caracteres)');
          } else {
            throw new Error(`Error en el contrato: ${error.message}`);
          }
        }
      }
      
      throw error;
    }
  };

  const placeBet = async (marketId: number, isYes: boolean, amount: string) => {
    console.log('💰 Iniciando colocación de apuesta...');
    console.log('Estado de conexión:', { isConnected, walletClient: !!walletClient });
    
    if (!isConnected || !walletClient) throw new Error('Wallet no conectada');
    
    // Validar que el wallet esté conectado y listo
    if (!walletClient.account) {
      throw new Error('Cuenta de wallet no disponible');
    }
    
    // Validar que el monto sea válido
    const amountBigInt = BigInt(amount);
    if (amountBigInt <= BigInt(0)) {
      throw new Error('Monto de apuesta debe ser mayor a 0');
    }
    
    // Ejecutar la transacción real para todos los mercados - el contrato validará todo
    try {
      console.log('📝 Ejecutando transacción de apuesta con:', {
        marketId,
        isYes,
        amount: amountBigInt.toString(),
        contractAddress,
        isDemo: marketId >= 1000
      });
      
      const result = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: FlarePredict__factory.abi,
        functionName: 'placeBet',
        args: [BigInt(marketId), isYes],
        value: amountBigInt,
      });
      
      console.log('✅ Transacción de apuesta ejecutada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en transacción de apuesta:', error);
      
      // Manejar errores específicos
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('insufficient funds')) {
          throw new Error('Saldo insuficiente para realizar esta apuesta');
        } else if (errorMessage.includes('user rejected')) {
          throw new Error('Transacción cancelada por el usuario');
        } else if (errorMessage.includes('execution reverted')) {
          if (errorMessage.includes('market not open')) {
            throw new Error('Mercado no está abierto para apuestas');
          } else if (errorMessage.includes('market expired')) {
            throw new Error('Mercado ha expirado');
          } else if (errorMessage.includes('invalid bet amount')) {
            throw new Error('Monto de apuesta inválido (debe estar entre 0.1 y 1000 FLR)');
          } else if (errorMessage.includes('position already exists')) {
            throw new Error('Ya tienes una posición en este mercado');
          } else {
            throw new Error(`Error en el contrato: ${error.message}`);
          }
        }
      }
      
      throw error;
    }
  };

  const resolveMarket = async (marketId: number, finalValue: string) => {
    if (!isConnected || !walletClient) throw new Error('Wallet no conectada');
    
    return await writeContractAsync({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'resolveMarket',
      args: [BigInt(marketId), BigInt(finalValue)],
    });
  };

  const claimWinnings = async (marketId: number) => {
    if (!isConnected || !walletClient) throw new Error('Wallet no conectada');
    
    return await writeContractAsync({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'claimWinnings',
      args: [BigInt(marketId)],
    });
  };

  // Funciones de lectura usando useReadContract
  const getMarket = async (marketId: number) => {
    console.log(`🔍 getMarket llamado para marketId: ${marketId}`);
    
    if (!publicClient) throw new Error('Cliente público no disponible');
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FlarePredict__factory.abi,
        functionName: 'markets',
        args: [BigInt(marketId)],
      });
      console.log(`✅ getMarket resultado para ${marketId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error en getMarket para ${marketId}:`, error);
      throw error;
    }
  };

  const getMarketCounter = async () => {
    console.log('🔍 getMarketCounter llamado');
    console.log('publicClient disponible:', !!publicClient);
    console.log('contractAddress:', contractAddress);
    
    if (!publicClient) throw new Error('Cliente público no disponible');
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FlarePredict__factory.abi,
        functionName: 'marketCounter',
      });
      console.log('✅ getMarketCounter resultado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en getMarketCounter:', error);
      throw error;
    }
  };

  const calculateOdds = async (marketId: number, isYes: boolean) => {
    if (!publicClient) throw new Error('Cliente público no disponible');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'calculateOdds',
      args: [BigInt(marketId), isYes],
    });
  };

  const getPosition = async (marketId: number, userAddress: string) => {
    if (!publicClient) throw new Error('Cliente público no disponible');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'positions',
      args: [BigInt(marketId), userAddress as `0x${string}`],
    });
  };

  const getTotalVolume = async () => {
    if (!publicClient) throw new Error('Cliente público no disponible');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'totalVolume',
    });
  };

  const getTotalFeesCollected = async () => {
    if (!publicClient) throw new Error('Cliente público no disponible');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'totalFeesCollected',
    });
  };

  const isReadyState = !!publicClient && isConnected;
  
  console.log('🔍 Estado de useFlarePredict:', {
    publicClient: !!publicClient,
    walletClient: !!walletClient,
    isConnected,
    chainId,
    address,
    isReady: isReadyState,
    contractAddress
  });
  
  return {
    contractAddress,
    // Funciones
    createMarket,
    placeBet,
    resolveMarket,
    claimWinnings,
    getMarket,
    getMarketCounter,
    calculateOdds,
    getPosition,
    getTotalVolume,
    getTotalFeesCollected,
    // Estado
    isReady: isReadyState,
    isConnected,
    isPending,
    chainId,
  };
}
