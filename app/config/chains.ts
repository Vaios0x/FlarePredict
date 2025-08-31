import { flareCoston2 } from './wagmi';

export const FLARE_CHAINS = {
  coston2: flareCoston2,
} as const;

export const getChainInfo = (chainId: number) => {
  switch (chainId) {
    case flareCoston2.id:
      return flareCoston2;
    default:
      return null;
  }
};

export const getTokenSymbol = (chainId: number) => {
  const chainInfo = getChainInfo(chainId);
  return chainInfo?.nativeCurrency.symbol || 'FLR';
};

export const getChainName = (chainId: number) => {
  const chainInfo = getChainInfo(chainId);
  return chainInfo?.name || 'Desconocida';
};
