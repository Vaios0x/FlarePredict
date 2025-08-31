import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
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

export const config = createConfig({
  chains: [flareCoston2, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId: ENV_CONFIG.WALLETCONNECT_PROJECT_ID
    }),
  ],
  transports: {
    [flareCoston2.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
