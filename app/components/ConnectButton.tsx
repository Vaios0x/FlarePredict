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

  // Limpiar errores cuando cambie el estado y redirigir si es necesario
  useEffect(() => {
    if (isConnected) {
      setLastError(null);
      // Llamar a la función de redirección si está disponible
      if (onConnect) {
        onConnect();
      }
    }
  }, [isConnected, onConnect]);

  // Función para agregar Coston2 a MetaMask
  const addCoston2Network = async () => {
    console.log('Iniciando proceso de agregar red Coston2...');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('MetaMask detectado, procediendo...');
      setIsAddingNetwork(true);
      try {
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
        
        console.log('Coston2 agregada exitosamente a MetaMask:', result);
        setLastError(null);
        
        // Opcional: cambiar a la red Coston2 después de agregarla
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x72' }],
          });
          console.log('Cambiado a red Coston2');
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            console.log('La red ya está agregada pero no se pudo cambiar automáticamente');
          }
        }
      } catch (error: any) {
        console.error('Error agregando Coston2:', error);
        if (error.code === 4001) {
          setLastError('Usuario canceló la operación');
        } else if (error.code === -32602) {
          setLastError('La red Coston2 ya está agregada a MetaMask');
        } else {
          setLastError(`Error al agregar Coston2: ${error.message || 'Error desconocido'}`);
        }
      } finally {
        setIsAddingNetwork(false);
      }
    } else {
      console.log('MetaMask no está disponible');
      setLastError('MetaMask no está disponible. Por favor instala MetaMask.');
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
          aria-label="Conectando wallet"
        >
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Conectando...</span>
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
                        aria-label="Conectar wallet"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-sm font-medium">Conectar Wallet</span>
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
                        aria-label="Red no soportada"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Red no soportada</span>
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
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                <span className="text-xs text-gray-400">
                                  {getChainName(chainId)}
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
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </RainbowKitConnectButton.Custom>

        {/* Botón para agregar Coston2 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addCoston2Network}
          disabled={isAddingNetwork}
          className="group relative overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 w-full sm:w-auto"
          aria-label="Agregar Coston2 Testnet a MetaMask"
        >
          <div className="flex items-center justify-center space-x-2">
            {isAddingNetwork ? (
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
            )}
            <span className="text-sm sm:text-base font-medium">
              {isAddingNetwork ? 'Agregando...' : 'Coston2'}
            </span>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">
                  {getChainName(chainId)}
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
      
      {/* Botón para agregar Coston2 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addCoston2Network}
        disabled={isAddingNetwork}
        className="group relative overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 w-full sm:w-auto"
        aria-label="Agregar Coston2 Testnet a MetaMask"
      >
        <div className="flex items-center justify-center space-x-2">
          {isAddingNetwork ? (
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
          )}
          <span className="text-sm sm:text-base font-medium">
            {isAddingNetwork ? 'Agregando...' : 'Coston2'}
          </span>
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </motion.div>
  );
}
