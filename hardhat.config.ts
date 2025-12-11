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
const KAVA_TESTNET_RPC = process.env.KAVA_TESTNET_RPC;
const ETHEREUM_SEPOLIA_RPC = process.env.ETHEREUM_SEPOLIA_RPC;

// Mainnet RPC URLs
const POLYGON_MAINNET_RPC = process.env.POLYGON_MAINNET_RPC;
const BSC_MAINNET_RPC = process.env.BSC_MAINNET_RPC;
const BASE_MAINNET_RPC = process.env.BASE_MAINNET_RPC;
const KAVA_MAINNET_RPC = process.env.KAVA_MAINNET_RPC;
const ETHEREUM_MAINNET_RPC = process.env.ETHEREUM_MAINNET_RPC;

// Proxy addresses for each network (these don't change after deployment)
export const PROXY_ADDRESSES: Record<string, string> = {
	localhost: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",

	ethereum_sepolia: "0xa19cE2a5855bfef29EEE8781E3e6E55BCB039C91",
	polygon_amoy: "0x1F9EcDf71DDb39022728B53f5584621762e466be",
	bsc_testnet: "0xA9A2511Bb9cE4aCF4F02D679Af836a0fcC8c8AF7",
	base_sepolia: "0x1F9EcDf71DDb39022728B53f5584621762e466be",
	kava_testnet: "0xa19cE2a5855bfef29EEE8781E3e6E55BCB039C91",

	ethereum: "0x55a2f45C72656BC205B42F07416d5E1bE2c68745",
	polygon: "0x2f77E0afAEE06970Bf860B8267b5aFECFFF6F216",
	bsc: "0x10004a9A742ec135c686C9aCed00FA3C93D66866",
	base: "0x10004a9A742ec135c686C9aCed00FA3C93D66866",
	kava: "0xa19cE2a5855bfef29EEE8781E3e6E55BCB039C91",
};

let config: HardhatUserConfig;

config = {
	defaultNetwork: "hardhat",
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	networks: {
		hardhat: {
			allowUnlimitedContractSize: false,
		},
		// Testnet Networks
		...(ETHEREUM_SEPOLIA_RPC && {
			ethereum_sepolia: {
				url: ETHEREUM_SEPOLIA_RPC,
				accounts: account ? [account] : [],
			},
		}),
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
		...(KAVA_TESTNET_RPC && {
			kava_testnet: {
				url: KAVA_TESTNET_RPC,
				accounts: account ? [account] : [],
			},
		}),

		// Mainnet Networks
		...(ETHEREUM_MAINNET_RPC && {
			ethereum: {
				url: ETHEREUM_MAINNET_RPC,
				accounts: account ? [account] : [],
			},
		}),
		...(POLYGON_MAINNET_RPC && {
			polygon: {
				url: POLYGON_MAINNET_RPC,
				accounts: account ? [account] : [],
			},
		}),
		...(BSC_MAINNET_RPC && {
			bsc: {
				url: BSC_MAINNET_RPC,
				accounts: account ? [account] : [],
			},
		}),
		...(BASE_MAINNET_RPC && {
			base: {
				url: BASE_MAINNET_RPC,
				accounts: account ? [account] : [],
			},
		}),
		...(KAVA_MAINNET_RPC && {
			kava: {
				url: KAVA_MAINNET_RPC,
				accounts: account ? [account] : [],
			},
		}),
	},
	etherscan: {
		apiKey: etherscanApiKey!,
		// For Kava
		// apiKey: {
		// 	kava: "9MgwdOWmMs", //"api key is not required by the Kava explorer, but can't be empty",
		// },
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
			{
				network: 'kava',
				chainId: 2222,
				urls: {
					apiURL: 'https://api.verify.mintscan.io/evm/api/0x8ae',
					browserURL: 'https://kavascan.com',
				},
			},
		],
	},
	gasReporter: {
		currency: "USD",
		enabled: true,
		excludeContracts: []
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
		tests: "./test",
	},
};

export default config;

