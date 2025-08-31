// Configuración de contratos desplegados
export const CONTRACTS = {
  // Coston2 Testnet
  coston2: {
    FlarePredict: '0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D',
    FTSO_V2: '0x1000000000000000000000000000000000000003',
    Registry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019',
  },
} as const;

// Obtener dirección del contrato según la red
export const getContractAddress = (contractName: keyof typeof CONTRACTS.coston2) => {
  // Por defecto usa Coston2 testnet
  return CONTRACTS.coston2[contractName];
};

// Configuración de feeds FTSOv2 oficiales según la documentación
export const FTSO_FEEDS = {
  FLR_USD: '0x01464c522f55534400000000000000000000000000', // "FLR/USD"
  BTC_USD: '0x014254432f55534400000000000000000000000000', // "BTC/USD"
  ETH_USD: '0x014554482f55534400000000000000000000000000', // "ETH/USD"
  SGB_USD: '0x015347422f55534400000000000000000000000000', // "SGB/USD"
} as const;

// Tipos de mercado
export const MARKET_TYPES = {
  BINARY: 0,
  RANGE: 1,
  MULTI_OUTCOME: 2,
} as const;

// Estados de mercado
export const MARKET_STATUS = {
  OPEN: 0,
  CLOSED: 1,
  RESOLVED: 2,
  CANCELLED: 3,
} as const;

// Configuración de la plataforma
export const PLATFORM_CONFIG = {
  MIN_BET: '0.1', // 0.1 FLR
  MAX_BET: '1000', // 1000 FLR
  PLATFORM_FEE: 200, // 2% en basis points
  RESOLUTION_BUFFER: 300, // 5 minutos
} as const;

// ABI del contrato FlarePredict
export const FLAREPREDICT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes21",
        "name": "feedId",
        "type": "bytes21"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      }
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isYes",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newOdds",
        "type": "uint256"
      }
    ],
    "name": "PositionTaken",
    "type": "event"
  }
] as const;
