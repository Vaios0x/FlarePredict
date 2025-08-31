// Configuración de variables de entorno para el cliente
export const ENV_CONFIG = {
  // Contract addresses - Valores hardcodeados para Vercel
  CONTRACT_ADDRESS: '0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D',
  FTSO_V2_ADDRESS: '0x1000000000000000000000000000000000000003',
  REGISTRY_ADDRESS: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019',
  
  // RPC URLs - Valores hardcodeados para Vercel
  RPC_URL: 'https://coston2-api.flare.network/ext/C/rpc',
  WS_URL: 'wss://coston2-api.flare.network/ext/ws',
  
  // Chain ID - Valor hardcodeado para Vercel
  CHAIN_ID: 114,
  
  // WalletConnect - Valor hardcodeado para Vercel
  WALLETCONNECT_PROJECT_ID: '95004ec3a30ad2f28fa8914e345297da',
  
  // FTSO Feeds - Valores hardcodeados para Vercel
  FTSO_FEED_FLR_USD: '0x01464c522f55534400000000000000000000000000',
  FTSO_FEED_BTC_USD: '0x014254432f55534400000000000000000000000000',
  FTSO_FEED_ETH_USD: '0x014554482f55534400000000000000000000000000',
  FTSO_FEED_SGB_USD: '0x015347422f55534400000000000000000000000000',
  
  // App Configuration - Valores hardcodeados para Vercel
  APP_NAME: 'FlarePredict',
  APP_DESCRIPTION: 'Predicciones en Tiempo Real en Flare Network',
  APP_URL: 'https://flare-predict-lc14.vercel.app',
  
  // Network Configuration - Valores hardcodeados para Vercel
  NETWORK_NAME: 'Coston2 Testnet',
  NETWORK_CURRENCY: 'C2FLR',
  NETWORK_DECIMALS: 18,
  BLOCK_EXPLORER: 'https://coston2-explorer.flare.network',
} as const;

// Verificar que las variables críticas estén disponibles
export const validateEnvConfig = () => {
  const required = [
    'CONTRACT_ADDRESS',
    'RPC_URL',
    'CHAIN_ID',
    'WALLETCONNECT_PROJECT_ID'
  ];
  
  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    return false;
  }
  
  return true;
};

// Verificar configuración al cargar
if (typeof window !== 'undefined') {
  console.log('🔧 ENV_CONFIG cargado:', ENV_CONFIG);
  validateEnvConfig();
}
