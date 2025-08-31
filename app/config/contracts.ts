// Configuración de contratos desplegados
export const CONTRACTS = {
  // Coston2 Testnet
  coston2: {
    FlarePredict: '0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D',
    // FTSOv2 según documentación oficial
    FTSO_V2: '0x1000000000000000000000000000000000000003',
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019',
    // Scaling contracts
    FtsoFeedPublisher: '0x1000000000000000000000000000000000000004',
    FtsoInflationConfigurations: '0x1000000000000000000000000000000000000005',
  },
} as const;

// Obtener dirección del contrato según la red
export const getContractAddress = (contractName: keyof typeof CONTRACTS.coston2) => {
  // Por defecto usa Coston2 testnet
  return CONTRACTS.coston2[contractName];
};

// Feed IDs oficiales según documentación FTSOv2
// https://dev.flare.network/ftso/feeds
export const FTSO_FEEDS = {
  // Feeds principales disponibles
  FLR_USD: '0x01464c522f55534400000000000000000000000000', // "FLR/USD"
  BTC_USD: '0x014254432f55534400000000000000000000000000', // "BTC/USD"
  ETH_USD: '0x014554482f55534400000000000000000000000000', // "ETH/USD"
  SGB_USD: '0x015347422f55534400000000000000000000000000', // "SGB/USD"
  
  // Feeds adicionales disponibles
  XRP_USD: '0x01585250502f555344000000000000000000000000', // "XRP/USD"
  LTC_USD: '0x014c54432f55534400000000000000000000000000', // "LTC/USD"
  DOGE_USD: '0x01444f47452f5553440000000000000000000000', // "DOGE/USD"
  ADA_USD: '0x014144412f55534400000000000000000000000000', // "ADA/USD"
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

// ABI para FTSOv2 según documentación oficial
export const FTSO_V2_ABI = [
  {
    "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
    "name": "getFeedById",
    "outputs": [
      {"internalType": "uint256", "name": "_feedValue", "type": "uint256"},
      {"internalType": "int8", "name": "_decimals", "type": "int8"},
      {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes21", "name": "_feedId", "type": "bytes21"}],
    "name": "getFeedByIdInWei",
    "outputs": [
      {"internalType": "uint256", "name": "_feedValue", "type": "uint256"},
      {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes21[]", "name": "_feedIds", "type": "bytes21[]"}],
    "name": "getFeedsById",
    "outputs": [
      {"internalType": "uint256[]", "name": "_feedValues", "type": "uint256[]"},
      {"internalType": "int8[]", "name": "_decimals", "type": "int8[]"},
      {"internalType": "uint64", "name": "_timestamp", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ABI para ContractRegistry
export const CONTRACT_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "getFtsoV2",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTestFtsoV2",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
