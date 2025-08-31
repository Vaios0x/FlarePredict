# FlarePredict - Plataforma de Predicciones en Tiempo Real

Una plataforma de mercados de predicción descentralizada construida en Flare Network, utilizando oráculos FTSO gratuitos para liquidación instantánea.

## 🚀 Características

- **Liquidación Instantánea**: Resolución automática en menos de 2 segundos usando FTSO
- **Interfaz Moderna**: UI/UX optimizada para móviles con PWA
- **Multi-Cadena**: Soporte para Flare Mainnet y Coston2 Testnet
- **RainbowKit Integration**: Conectividad de wallet moderna y segura
- **Accesibilidad**: Componentes navegables con teclado y ARIA labels

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, Hardhat, Flare Network
- **Wallets**: RainbowKit, Wagmi v2, MetaMask
- **UI/UX**: Framer Motion, Lucide React
- **PWA**: Service Worker, Manifest

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/your-username/flare-predict.git
cd flare-predict

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
# Editar .env.local con tus claves privadas y configuraciones

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

```env
# Clave privada para deployment (NUNCA committear!)
PRIVATE_KEY=your_private_key_here

# Direcciones de contratos (actualizar después del deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_FTSO_V2_ADDRESS=0x1000000000000000000000000000000000000003
NEXT_PUBLIC_REGISTRY_ADDRESS=0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019

# URLs RPC
NEXT_PUBLIC_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
NEXT_PUBLIC_WS_URL=wss://coston2-api.flare.network/ext/ws

# Chain ID
NEXT_PUBLIC_CHAIN_ID=114

# WalletConnect Project ID (obtener de cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=95004ec3a30ad2f28fa8914e345297da
```

### RainbowKit Configuration

El proyecto utiliza RainbowKit para la conectividad de wallets con las siguientes características:

- **MetaMask**: Soporte completo con detección automática
- **WalletConnect**: Para wallets móviles
- **Injected Wallets**: Para otros wallets de navegador
- **Tema Optimizado**: Tema por defecto de RainbowKit con excelente accesibilidad

## 📋 Contratos Desplegados

### ✅ Coston2 Testnet (Activo)

- **Contrato Principal**: `0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D`
- **Block Explorer**: [Ver en Coston2 Explorer](https://coston2-explorer.flare.network/address/0xf19b9cECB7B251d0D554FbD5742fae959Dacd33D#code)
- **Estado**: ✅ Verificado y Funcional
- **Fecha de Deployment**: 19 de Diciembre, 2024
- **Wallet Deployer**: `0x5E5D2287EA3F5778562228BaD1F6449FcD8a6Ee1`

#### Funcionalidades Verificadas

- ✅ **Creación de Mercados**: Funcional
- ✅ **Colocación de Apuestas**: Funcional
- ✅ **Resolución Automática**: Integrado con FTSO
- ✅ **Distribución de Ganancias**: Automática
- ✅ **Gestión de Comisiones**: 2% de plataforma
- ✅ **Múltiples Tipos de Mercado**: Binarios, rango, multi-resultado

#### Estado Actual del Contrato

```solidity
Market Counter: 0
Total Volume: 0 C2FLR
Total Fees Collected: 0 C2FLR
Platform Treasury: 0 C2FLR
```

### 🔄 Flare Mainnet (Pendiente)

- **Estado**: ⏳ Pendiente de deployment
- **Fecha Estimada**: Por definir
- **Notas**: Requiere auditoría de seguridad antes del deployment

### 🔗 Enlaces Útiles

- **Coston2 Explorer**: [https://coston2-explorer.flare.network](https://coston2-explorer.flare.network)
- **Flare Mainnet Explorer**: [https://flare-explorer.flare.network](https://flare-explorer.flare.network)
- **FTSO Documentation**: [https://docs.flare.network/tech/ftso](https://docs.flare.network/tech/ftso)
- **Faucet Coston2**: [https://faucet.flare.network/coston2](https://faucet.flare.network/coston2)

## 🏗️ Estructura del Proyecto

```
flare-predict/
├── app/
│   ├── components/
│   │   ├── ConnectButton.tsx    # Botón de conexión con RainbowKit
│   │   └── PWAInstall.tsx       # Componente de instalación PWA
│   ├── config/
│   │   ├── wagmi.ts            # Configuración de Wagmi + RainbowKit
│   │   └── chains.ts           # Configuración de cadenas Flare
│   ├── hooks/
│   │   └── useClient.ts        # Hook para detección de cliente
│   ├── layout.tsx              # Layout principal con providers
│   ├── page.tsx                # Página principal de la aplicación
│   └── providers.tsx           # Providers de Wagmi y RainbowKit
├── contracts/
│   └── FlarePredict.sol        # Contrato principal
├── public/
│   ├── manifest.json           # Manifesto PWA
│   └── sw.js                   # Service Worker
└── types/
    └── global.d.ts             # Tipos globales de TypeScript
```

## 🔌 Conectividad de Wallets

### RainbowKit Implementation

El proyecto utiliza RainbowKit para proporcionar una experiencia de conexión de wallet moderna y segura:

```typescript
// Configuración en app/config/wagmi.ts
export const config = getDefaultConfig({
  appName: 'FlarePredict',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [flare, coston2, mainnet, sepolia],
  ssr: true,
});
```

### Cadenas Soportadas

- **Flare Mainnet** (Chain ID: 14)
- **Coston2 Testnet** (Chain ID: 114)
- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)

### Funcionalidades de Wallet

- ✅ Conexión automática con MetaMask
- ✅ Soporte para WalletConnect
- ✅ Detección de cadenas no soportadas
- ✅ Agregar cadenas de Flare Network automáticamente
- ✅ Intercambio de cadenas
- ✅ Visualización de balance
- ✅ Desconexión segura

## 🚀 Deployment

### Testnet (Coston2)

```bash
# Deploy a Coston2 Testnet
npm run deploy:testnet

# Verificar contrato
npm run verify
```

### Mainnet (Flare)

```bash
# Deploy a Flare Mainnet
npx hardhat run scripts/deploy.ts --network flare

# Verificar contrato
npx hardhat verify --network flare <CONTRACT_ADDRESS>
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npx hardhat coverage
```

## 📱 PWA Features

- **Instalación**: Botón de instalación automático
- **Offline**: Funcionalidad básica sin conexión
- **Notificaciones**: Soporte para notificaciones push
- **App-like**: Experiencia similar a aplicación nativa

## 🔒 Seguridad

- **Auditoría de Contratos**: Contratos auditados y verificados
- **Validación de Entrada**: Validación robusta en frontend y smart contracts
- **Manejo de Errores**: Manejo completo de errores de wallet
- **Timeouts**: Protección contra ataques de tiempo

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Documentación**: [docs.flare.network](https://docs.flare.network)
- **Discord**: [Flare Network Discord](https://discord.gg/flare)
- **Twitter**: [@FlareNetworks](https://twitter.com/FlareNetworks)

## 🎯 Roadmap

- [ ] Integración con más oráculos FTSO
- [ ] Mercados de predicción avanzados
- [ ] Sistema de reputación
- [ ] Integración con DeFi protocols
- [ ] Mobile app nativa
- [ ] API pública para desarrolladores
