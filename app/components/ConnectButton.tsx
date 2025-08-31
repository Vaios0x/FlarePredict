'use client';

import { useAccount, useDisconnect, useBalance, useChainId } from 'wagmi';
import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Plus, Zap, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getTokenSymbol, getChainName } from '../config/chains';
import { useState, useEffect } from 'react';

interface ConnectButtonProps {
  onConnect?: () => void;
}

export function ConnectButton({ onConnect }: ConnectButtonProps = {}) {
  const { isConnected, address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Clear errors when state changes and redirect if necessary
  useEffect(() => {
    if (isConnected) {
      setLastError(null);
      // Call the redirect function if available
      if (onConnect) {
        onConnect();
      }
    }
  }, [isConnected, onConnect]);

  // Function to add Coston2 to MetaMask
  const addCoston2Network = async () => {
    console.log('Starting process to add Coston2 network...');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('MetaMask detected, proceeding...');
      setIsAddingNetwork(true);
      try {
        // Primero intentar cambiar a Coston2 si ya está agregada
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x72' }],
          });
          console.log('Switched to Coston2 network');
          setLastError(null);
          return;
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            console.log('Coston2 is not added, proceeding to add it...');
          } else {
            console.log('Error switching to Coston2:', switchError);
          }
        }

        // If not added, add it
        const result = await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x72', // 114 en hexadecimal
            chainName: 'Coston2 Testnet',
            nativeCurrency: {
              name: 'C2FLR',
              symbol: 'C2FLR',
              decimals: 18,
            },
            rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
            blockExplorerUrls: ['https://coston2-explorer.flare.network'],
            iconUrls: ['https://flare.network/favicon.ico'],
          }],
        });
        
        console.log('Coston2 successfully added to MetaMask:', result);
        setLastError(null);
        
        // Switch to Coston2 network after adding it
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x72' }],
          });
          console.log('Switched to Coston2 network');
        } catch (switchError: any) {
          console.log('Error automatically switching to Coston2:', switchError);
        }
      } catch (error: any) {
        console.error('Error adding Coston2:', error);
        if (error.code === 4001) {
          setLastError('User cancelled the operation');
        } else if (error.code === -32602) {
          setLastError('Coston2 network is already added to MetaMask');
        } else {
          setLastError(`Error adding Coston2: ${error.message || 'Unknown error'}`);
        }
      } finally {
        setIsAddingNetwork(false);
      }
    } else {
      console.log('MetaMask is not available');
      setLastError('MetaMask is not available. Please install MetaMask.');
    }
  };

  // Mostrar estado de conexión
  if (status === 'connecting') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-3"
      >
        <motion.button
          disabled
                  className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-xl transition-all duration-300 backdrop-blur-sm"
        aria-label="Connecting wallet"
        >
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Connecting...</span>
          </div>
        </motion.button>
      </motion.div>
    );
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-3"
      >
        {/* Botón de RainbowKit para conectar wallet */}
        <RainbowKitConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openConnectModal}
                        className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                        aria-label="Connect wallet"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-sm font-medium">Connect Wallet</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openChainModal}
                        className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 rounded-xl hover:from-red-500/30 hover:to-orange-500/30 hover:border-red-400/50 transition-all duration-300 backdrop-blur-sm"
                        aria-label="Unsupported network"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Unsupported network</span>
                        </div>
                      </motion.button>
                    );
                  }

                  return (
                    <div className="flex flex-col space-y-3">
                      {/* Tarjeta principal de wallet */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative group bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:border-white/20 transition-all duration-300"
                      >
                        {/* Indicador de estado de conexión */}
                        <div className="absolute -top-1 -right-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Información de la wallet */}
                          <div className="flex items-center space-x-3">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                              className="relative"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Wallet className="w-5 h-5 text-white" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                <CheckCircle className="w-2.5 h-2.5 text-gray-900" />
                              </div>
                            </motion.div>
                            
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-mono text-white font-medium">
                                  {account.displayName}
                                </span>
                                <Shield className="w-3 h-3 text-blue-400" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-white">
                                  {balance ? `${parseFloat(balance.formatted).toFixed(4)}` : '0.0000'}
                                </span>
                                <span className="text-sm text-gray-300 font-medium">
                                  {getTokenSymbol(chainId)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                  chainId === 114 ? 'bg-green-400' : 'bg-red-400'
                                }`} />
                                <span className={`text-xs ${
                                  chainId === 114 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {chainId === 114 ? 'Coston2 Testnet' : getChainName(chainId)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Botón de desconectar */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => disconnect()}
                            className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-400 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/50 transition-all duration-300 backdrop-blur-sm"
                            aria-label="Disconnect wallet"
                          >
                            <div className="flex items-center space-x-2">
                              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
                              <span className="text-sm font-medium">Disconnect</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </RainbowKitConnectButton.Custom>

              {/* Botón para agregar/cambiar a Coston2 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addCoston2Network}
        disabled={isAddingNetwork}
        className={`group relative overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5 border rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50 w-full sm:w-auto ${
          chainId === 114 
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50'
            : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400/50'
        }`}
        aria-label={chainId === 114 ? "Ya estás en Coston2" : "Cambiar a Coston2 Testnet"}
      >
        <div className="flex items-center justify-center space-x-2">
          {isAddingNetwork ? (
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : chainId === 114 ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
          )}
          <span className="text-sm sm:text-base font-medium">
            {isAddingNetwork ? 'Cambiando...' : chainId === 114 ? 'Coston2 ✓' : 'Cambiar a Coston2'}
          </span>
          {chainId !== 114 && <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:animate-pulse" />}
        </div>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          chainId === 114 
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
            : 'bg-gradient-to-r from-orange-500/10 to-red-500/10'
        }`} />
      </motion.button>

        {/* Mostrar errores */}
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-400">
              {lastError}
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-3"
    >
      {/* Tarjeta principal de wallet */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative group bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:border-white/20 transition-all duration-300"
      >
        {/* Indicador de estado de conexión */}
        <div className="absolute -top-1 -right-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Información de la wallet */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-gray-900" />
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-white font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Shield className="w-3 h-3 text-blue-400" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white">
                  {balance ? `${parseFloat(balance.formatted).toFixed(4)}` : '0.0000'}
                </span>
                <span className="text-sm text-gray-300 font-medium">
                  {getTokenSymbol(chainId)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  chainId === 114 ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className={`text-xs ${
                  chainId === 114 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {chainId === 114 ? 'Coston2 Testnet' : getChainName(chainId)}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de desconectar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => disconnect()}
            className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-400 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/50 transition-all duration-300 backdrop-blur-sm"
            aria-label="Desconectar wallet"
          >
            <div className="flex items-center space-x-2">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
              <span className="text-sm font-medium">Desconectar</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Botón para agregar/cambiar a Coston2 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addCoston2Network}
        disabled={isAddingNetwork}
        className={`group relative overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5 border rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50 w-full sm:w-auto ${
          chainId === 114 
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50'
            : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-400/50'
        }`}
        aria-label={chainId === 114 ? "Ya estás en Coston2" : "Cambiar a Coston2 Testnet"}
      >
        <div className="flex items-center justify-center space-x-2">
          {isAddingNetwork ? (
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : chainId === 114 ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
          )}
          <span className="text-sm sm:text-base font-medium">
            {isAddingNetwork ? 'Cambiando...' : chainId === 114 ? 'Coston2 ✓' : 'Cambiar a Coston2'}
          </span>
          {chainId !== 114 && <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:animate-pulse" />}
        </div>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          chainId === 114 
            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
            : 'bg-gradient-to-r from-orange-500/10 to-red-500/10'
        }`} />
      </motion.button>
    </motion.div>
  );
}
