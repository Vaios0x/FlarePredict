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
    
    if (!isConnected || !walletClient) throw new Error('Wallet not connected');
    
    // Validate that the deadline is in the future and within the allowed range
    const currentTime = Math.floor(Date.now() / 1000);
    if (deadline <= currentTime + 3600) {
      throw new Error('Deadline must be at least 1 hour in the future');
    }
    if (deadline > currentTime + 30 * 24 * 3600) {
      throw new Error('Deadline cannot be more than 30 days in the future');
    }
    
    // Validate the title
    if (!title || title.length === 0 || title.length > 100) {
      throw new Error('Title must be between 1 and 100 characters');
    }
    
    console.log('📋 Market data to create:', {
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
      console.log('📝 Executing createMarket transaction...');
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
      
      console.log('✅ Market created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating market:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('insufficient funds')) {
          throw new Error('Insufficient balance to create the market');
        } else if (errorMessage.includes('user rejected')) {
          throw new Error('Transaction cancelled by user');
        } else if (errorMessage.includes('execution reverted')) {
          if (errorMessage.includes('deadline too soon')) {
            throw new Error('Deadline must be at least 1 hour in the future');
          } else if (errorMessage.includes('deadline too far')) {
            throw new Error('Deadline cannot be more than 30 days in the future');
          } else if (errorMessage.includes('invalid title')) {
            throw new Error('Invalid title (must be between 1 and 100 characters)');
          } else {
            throw new Error(`Contract error: ${error.message}`);
          }
        }
      }
      
      throw error;
    }
  };

  const placeBet = async (marketId: number, isYes: boolean, amount: string) => {
    console.log('💰 Starting bet placement...');
    console.log('Connection status:', { isConnected, walletClient: !!walletClient });
    
    if (!isConnected || !walletClient) throw new Error('Wallet not connected');
    
    // Validate that the wallet is connected and ready
    if (!walletClient.account) {
      throw new Error('Wallet account not available');
    }
    
    // Validate that the amount is valid
    const amountBigInt = BigInt(amount);
    if (amountBigInt <= BigInt(0)) {
      throw new Error('Bet amount must be greater than 0');
    }
    
    // Ejecutar la transacción real para todos los mercados - el contrato validará todo
    try {
      console.log('📝 Executing bet transaction with:', {
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
      
      console.log('✅ Bet transaction executed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in bet transaction:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('insufficient funds')) {
          throw new Error('Insufficient balance to place this bet');
        } else if (errorMessage.includes('user rejected')) {
          throw new Error('Transaction cancelled by user');
        } else if (errorMessage.includes('execution reverted')) {
          if (errorMessage.includes('market not open')) {
            throw new Error('Market is not open for betting');
          } else if (errorMessage.includes('market expired')) {
            throw new Error('Market has expired');
          } else if (errorMessage.includes('invalid bet amount')) {
            throw new Error('Invalid bet amount (must be between 0.1 and 1000 FLR)');
          } else if (errorMessage.includes('position already exists')) {
            throw new Error('You already have a position in this market');
          } else {
            throw new Error(`Contract error: ${error.message}`);
          }
        }
      }
      
      throw error;
    }
  };

  const resolveMarket = async (marketId: number, finalValue: string) => {
    if (!isConnected || !walletClient) throw new Error('Wallet not connected');
    
    return await writeContractAsync({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'resolveMarket',
      args: [BigInt(marketId), BigInt(finalValue)],
    });
  };

  const claimWinnings = async (marketId: number) => {
    if (!isConnected || !walletClient) throw new Error('Wallet not connected');
    
    return await writeContractAsync({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'claimWinnings',
      args: [BigInt(marketId)],
    });
  };

  // Funciones de lectura usando useReadContract
  const getMarket = async (marketId: number) => {
    console.log(`🔍 getMarket called for marketId: ${marketId}`);
    
    if (!publicClient) throw new Error('Public client not available');
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FlarePredict__factory.abi,
        functionName: 'markets',
        args: [BigInt(marketId)],
      });
      console.log(`✅ getMarket result for ${marketId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error in getMarket for ${marketId}:`, error);
      throw error;
    }
  };

  const getMarketCounter = async () => {
    console.log('🔍 getMarketCounter called');
    console.log('publicClient available:', !!publicClient);
    console.log('contractAddress:', contractAddress);
    
    if (!publicClient) throw new Error('Public client not available');
    
    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FlarePredict__factory.abi,
        functionName: 'marketCounter',
      });
      console.log('✅ getMarketCounter result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in getMarketCounter:', error);
      throw error;
    }
  };

  const calculateOdds = async (marketId: number, isYes: boolean) => {
    if (!publicClient) throw new Error('Public client not available');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'calculateOdds',
      args: [BigInt(marketId), isYes],
    });
  };

  const getPosition = async (marketId: number, userAddress: string) => {
    if (!publicClient) throw new Error('Public client not available');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'positions',
      args: [BigInt(marketId), userAddress as `0x${string}`],
    });
  };

  const getTotalVolume = async () => {
    if (!publicClient) throw new Error('Public client not available');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'totalVolume',
    });
  };

  const getTotalFeesCollected = async () => {
    if (!publicClient) throw new Error('Public client not available');
    
    return await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: FlarePredict__factory.abi,
      functionName: 'totalFeesCollected',
    });
  };

  const isReadyState = !!publicClient && isConnected;
  
  console.log('🔍 useFlarePredict state:', {
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
    // Functions
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
    // State
    isReady: isReadyState,
    isConnected,
    isPending,
    chainId,
  };
}
