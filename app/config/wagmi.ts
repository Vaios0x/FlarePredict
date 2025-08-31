import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Configuración personalizada para Flare Network
export const flareCoston2 = {
  id: 114,
  name: 'Coston2 Testnet',
  network: 'coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'C2FLR',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [flareCoston2, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '95004ec3a30ad2f28fa8914e345297da' 
    }),
  ],
  transports: {
    [flareCoston2.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
