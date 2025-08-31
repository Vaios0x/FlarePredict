# 🚀 FlarePredict - Real-Time Prediction Markets

<div align="center">

![FlarePredict Logo](https://img.shields.io/badge/FlarePredict-Prediction%20Markets-blue?style=for-the-badge&logo=ethereum)
![Flare Network](https://img.shields.io/badge/Flare%20Network-Mainnet-green?style=for-the-badge&logo=flare)
![FTSO Oracle](https://img.shields.io/badge/FTSO-Oracle%20Data-orange?style=for-the-badge&logo=oracle)

**The Future of Decentralized Prediction Markets is Here** ⚡

*Leveraging Flare's free FTSO oracles for sub-2-second resolution with instant settlement*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Now-brightgreen?style=for-the-badge&logo=globe)](https://flarepredict.vercel.app)
[![Documentation](https://img.shields.io/badge/Documentation-Read%20More-blue?style=for-the-badge&logo=book)](https://dev.flare.network/ftso/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-purple?style=for-the-badge&logo=discord)](https://discord.gg/flare)

</div>

---

## 🎯 **The Story**

Imagine a world where anyone can predict the future and get rewarded for being right. A world where market wisdom is harnessed through decentralized prediction markets, powered by real-time oracle data. That world is **FlarePredict**.

Born from the vision of democratizing access to prediction markets, FlarePredict leverages Flare Network's revolutionary **FTSO (Flare Time Series Oracle)** to provide instant, accurate, and free price feeds. No more waiting for centralized oracles or paying exorbitant fees. The future of prediction markets is decentralized, fast, and accessible to everyone.

---

## ✨ **Why FlarePredict?**

<div align="center">

| 🚀 **Instant Settlement** | 🔒 **Decentralized** | 💰 **Free Oracles** | ⚡ **Real-Time** |
|---------------------------|----------------------|---------------------|------------------|
| Sub-2-second resolution using FTSO | No single point of failure | FTSO provides free price feeds | Updates every 1.8 seconds |
| Automatic token distribution | Community-driven markets | No oracle fees | Block-latency feeds |
| Smart contract execution | Transparent and verifiable | Built into Flare protocol | Live market data |

</div>

---

## 🛠️ **Tech Stack**

<div align="center">

### **Frontend & UI**
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-10-black?style=for-the-badge&logo=framer)

### **Blockchain & Web3**
![Flare Network](https://img.shields.io/badge/Flare%20Network-Mainnet-green?style=for-the-badge&logo=ethereum)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-Development-yellow?style=for-the-badge&logo=hardhat)
![Wagmi](https://img.shields.io/badge/Wagmi-2.0-blue?style=for-the-badge&logo=wagmi)
![RainbowKit](https://img.shields.io/badge/RainbowKit-1.0-purple?style=for-the-badge&logo=rainbow)

### **Oracles & Data**
![FTSO](https://img.shields.io/badge/FTSO-V2-orange?style=for-the-badge&logo=oracle)
![Viem](https://img.shields.io/badge/Viem-2.0-blue?style=for-the-badge&logo=viem)
![PWA](https://img.shields.io/badge/PWA-Enabled-green?style=for-the-badge&logo=pwa)

</div>

---

## 🎮 **Features**

### **🎯 Core Functionality**
- **Real-time Prediction Markets**: Create and participate in markets with instant settlement
- **FTSO Integration**: Leverage Flare's free oracle data for accurate price feeds
- **Smart Contract Automation**: Automatic resolution and token distribution
- **Multi-Asset Support**: FLR/USD, BTC/USD, ETH/USD, XRP/USD, and more

### **💎 Advanced Features**
- **Instant Settlement**: Sub-2-second resolution using FTSO block-latency feeds
- **Decentralized Oracle**: No single point of failure, community-driven data
- **Free Price Feeds**: No oracle fees, built into Flare protocol
- **Mobile-First PWA**: Progressive Web App with offline capabilities
- **Real-Time Updates**: Live market data and activity feeds

### **🔧 Developer Experience**
- **TypeScript**: Full type safety across the entire stack
- **Modern React**: Hooks, context, and functional components
- **Smart Contract Testing**: Comprehensive test suite with Hardhat
- **Deployment Ready**: Configured for Vercel and mainnet deployment

---

## 🚀 **Quick Start**

### **Prerequisites**
```bash
# Node.js 18+ and npm/yarn
node --version  # v18.0.0 or higher
npm --version   # 8.0.0 or higher
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/your-username/FlarePredict.git
cd FlarePredict

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration
```

### **Development**
```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### **Smart Contract Deployment**
```bash
# Compile contracts
npx hardhat compile

# Deploy to Coston2 testnet
npx hardhat run scripts/deploy.ts --network coston2

# Deploy to Flare mainnet
npx hardhat run scripts/deploy.ts --network flare
```

---

## 📊 **Market Examples**

<div align="center">

| **Category** | **Market Example** | **Resolution** |
|--------------|-------------------|----------------|
| 🏦 **Crypto** | Will FLR reach $0.05 by Dec 31, 2024? | FTSO FLR/USD feed |
| 🏈 **Sports** | Will Team A win the championship? | Manual resolution |
| 🌍 **Politics** | Who will win the next election? | Manual resolution |
| 📈 **Economy** | Will BTC reach $50,000 by Q1 2025? | FTSO BTC/USD feed |
| 🌤️ **Weather** | Will it rain on Christmas Day? | Manual resolution |

</div>

---

## 🔧 **Architecture**

<div align="center">

```mermaid
graph TB
    A[User Interface] --> B[React Frontend]
    B --> C[Wagmi/RainbowKit]
    C --> D[Flare Network]
    D --> E[FlarePredict Contract]
    E --> F[FTSO Oracle]
    F --> G[Price Feeds]
    G --> H[Market Resolution]
    H --> I[Token Distribution]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#fbb,stroke:#333,stroke-width:2px
```

</div>

### **Smart Contract Features**
- **Market Creation**: Create binary prediction markets with custom thresholds
- **Bet Placement**: Place bets with FLR tokens (0.1 - 1000 FLR range)
- **Automatic Resolution**: Use FTSO oracle data for instant settlement
- **Token Distribution**: Automatic payout calculation and distribution
- **Platform Fees**: 2% fee with 10% creator reward

---

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run specific test file
npm test test/FlarePredict.test.ts

# Run with coverage
npm run test:coverage

# Verify FTSO integration
npx hardhat run scripts/verify-ftso-official.js --network coston2
```

---

## 📈 **Performance**

<div align="center">

| **Metric** | **Value** | **Status** |
|------------|-----------|------------|
| ⚡ **Resolution Time** | < 2 seconds | ✅ FTSO Block-latency |
| 💰 **Oracle Cost** | Free | ✅ Built into Flare |
| 🔒 **Decentralization** | 100+ Data Providers | ✅ FTSO Network |
| 📊 **Accuracy** | 99%+ | ✅ Statistical Analysis |
| 🚀 **Uptime** | 99.9% | ✅ Flare Network |

</div>

---

## 🌟 **Roadmap**

### **Phase 1: Foundation** ✅
- [x] Smart contract development
- [x] FTSO integration
- [x] Basic UI/UX
- [x] Testnet deployment

### **Phase 2: Enhancement** 🚧
- [ ] Advanced market types (range, multi-outcome)
- [ ] Mobile app development
- [ ] Social features and leaderboards
- [ ] API for third-party integrations

### **Phase 3: Scale** 📋
- [ ] Cross-chain compatibility
- [ ] Institutional features
- [ ] Advanced analytics
- [ ] Governance token

---

## 🤝 **Contributing**

We welcome contributions from the community! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commits

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Flare Network** for the revolutionary FTSO oracle system
- **Flare Community** for continuous support and feedback
- **Open Source Contributors** who made this possible

---

<div align="center">

**Built with ❤️ for the Flare ecosystem**

[![Flare Network](https://img.shields.io/badge/Powered%20by-Flare%20Network-green?style=for-the-badge&logo=flare)](https://flare.network)
[![FTSO](https://img.shields.io/badge/Oracle%20Data-FTSO-orange?style=for-the-badge&logo=oracle)](https://dev.flare.network/ftso/)

*The future of prediction markets is decentralized, fast, and accessible to everyone.*

</div>
