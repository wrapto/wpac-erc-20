import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import { config as dotenvConfig } from "dotenv"
import type { HardhatUserConfig } from "hardhat/config"
import { resolve, join } from "path"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || join(__dirname, ".env");
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const account = process.env.PRIVATE_KEY;

// Testnet RPC URLs
const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC;
const BSC_TESTNET_RPC = process.env.BSC_TESTNET_RPC;
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC;
const Ethereum_SEPOLIA_RPC = process.env.Ethereum_SEPOLIA_RPC;

// Mainnet RPC URLs
const POLYGON_RPC = process.env.POLYGON_RPC_URL;
const BSC_RPC = process.env.BSC_RPC;
const BASE_RPC = process.env.BASE_RPC;
const ETHEREUM_RPC = process.env.ETHEREUM_RPC;

let config: HardhatUserConfig;

if (!process.env.CI) {

	config = {
		defaultNetwork: "hardhat",
		solidity: "0.8.20",
		networks: {
			hardhat: {
				allowUnlimitedContractSize: false,
			},
			// Testnet Networks
			...(POLYGON_AMOY_RPC && {
				polygon_amoy: {
					url: POLYGON_AMOY_RPC,
					accounts: account ? [account] : [],
				},
			}),
			...(BSC_TESTNET_RPC && {
				bsc_testnet: {
					url: BSC_TESTNET_RPC,
					accounts: account ? [account] : [],
				},
			}),
			...(BASE_SEPOLIA_RPC && {
				base_sepolia: {
					url: BASE_SEPOLIA_RPC,
					accounts: account ? [account] : [],
				},
			}),
			...(Ethereum_SEPOLIA_RPC && {
				ethereum_sepolia: {
					url: Ethereum_SEPOLIA_RPC,
					accounts: account ? [account] : [],
				},
			}),
			// Mainnet Networks
			...(POLYGON_RPC && {
				polygon: {
					url: POLYGON_RPC,
					accounts: account ? [account] : [],
				},
			}),
			...(BSC_RPC && {
				bsc: {
					url: BSC_RPC,
					accounts: account ? [account] : [],
				},
			}),
			...(BASE_RPC && {
				base: {
					url: BASE_RPC,
					accounts: account ? [account] : [],
				},
			}),
			...(ETHEREUM_RPC && {
				ethereum: {
					url: ETHEREUM_RPC,
					accounts: account ? [account] : [],
				},
			}),
		},
		etherscan: {
			apiKey: {
				bsc_testnet: etherscanApiKey!,
				polygon_amoy: etherscanApiKey!,
				base_sepolia: etherscanApiKey!,
				ethereum_sepolia: etherscanApiKey!,
				polygon: etherscanApiKey!,
				bsc: etherscanApiKey!,
				base: etherscanApiKey!,
				ethereum: etherscanApiKey!,
			},
			customChains: [
				{
					network: "bsc_testnet",
					chainId: 97,
					urls: {
						apiURL: "https://api-testnet.bscscan.com/api",
						browserURL: "https://testnet.bscscan.com",
					},
				},
				{
					network: "polygon_amoy",
					chainId: 80002,
					urls: {
						apiURL: "https://api-amoy.polygonscan.com/api",
						browserURL: "https://amoy.polygonscan.com",
					},
				},
				{
					network: "base_sepolia",
					chainId: 84532,
					urls: {
						apiURL: "https://api-sepolia.basescan.org/api",
						browserURL: "https://sepolia.basescan.org",
					},
				},
				{
					network: "ethereum_sepolia",
					chainId: 11155111,
					urls: {
						apiURL: "https://api-sepolia.etherscan.io/api",
						browserURL: "https://sepolia.etherscan.io",
					},
				},
				{
					network: "polygon",
					chainId: 137,
					urls: {
						apiURL: "https://api.polygonscan.com/api",
						browserURL: "https://polygonscan.com",
					},
				},
				{
					network: "bsc",
					chainId: 56,
					urls: {
						apiURL: "https://api.bscscan.com/api",
						browserURL: "https://bscscan.com",
					},
				},
				{
					network: "base",
					chainId: 8453,
					urls: {
						apiURL: "https://api.basescan.org/api",
						browserURL: "https://basescan.com",
					},
				},
			],
		},
		gasReporter: {
			currency: "USD",
			enabled: true,
			excludeContracts: [],
			src: "./contracts",
		},
		typechain: {
			outDir: "./types",
		},
		mocha: {
			timeout: 100000000,
		},
		paths: {
			artifacts: "./artifacts",
			cache: "./cache",
			sources: "./contracts",
		},
	};
} else {
	config = {
		defaultNetwork: "hardhat",
		solidity: "0.8.20",
		networks: {
			hardhat: {
				allowUnlimitedContractSize: false,
			},
		},
		gasReporter: {
			currency: "USD",
			enabled: true,
			excludeContracts: [],
			src: "./contracts",
		},
		typechain: {
			outDir: "./types",
		},
		mocha: {
			timeout: 100000000,
		},
		paths: {
			artifacts: "./artifacts",
			cache: "./cache",
			sources: "./contracts",
		},
	};
}

export default config;

