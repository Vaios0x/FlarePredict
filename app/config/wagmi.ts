import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { ENV_CONFIG } from './env';

// Configuración personalizada para Flare Network
export const flareCoston2 = {
  id: ENV_CONFIG.CHAIN_ID,
  name: ENV_CONFIG.NETWORK_NAME,
  network: 'coston2',
  nativeCurrency: {
    decimals: ENV_CONFIG.NETWORK_DECIMALS,
    name: ENV_CONFIG.NETWORK_CURRENCY,
    symbol: ENV_CONFIG.NETWORK_CURRENCY,
  },
  rpcUrls: {
    public: { http: [ENV_CONFIG.RPC_URL] },
    default: { http: [ENV_CONFIG.RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: ENV_CONFIG.BLOCK_EXPLORER },
  },
  testnet: true,
} as const;

// Log de configuración para debugging
if (typeof window !== 'undefined') {
  console.log('🔧 Configuración de Wagmi:', {
    appName: ENV_CONFIG.APP_NAME,
    projectId: ENV_CONFIG.WALLETCONNECT_PROJECT_ID,
    chainId: ENV_CONFIG.CHAIN_ID,
    networkName: ENV_CONFIG.NETWORK_NAME,
    rpcUrl: ENV_CONFIG.RPC_URL,
    contractAddress: ENV_CONFIG.CONTRACT_ADDRESS
  });
}

export const config = getDefaultConfig({
  appName: ENV_CONFIG.APP_NAME,
  projectId: ENV_CONFIG.WALLETCONNECT_PROJECT_ID,
  chains: [flareCoston2, mainnet, sepolia],
  ssr: true,
});
