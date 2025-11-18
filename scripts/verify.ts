import { upgrades, network, run } from "hardhat"
import { PROXY_ADDRESSES } from "../hardhat.config"

async function main() {
	const networkName = network.name

	// Get proxy address from hardhat config
	const UPGRADEABLE_PROXY = PROXY_ADDRESSES[networkName]

	if (!UPGRADEABLE_PROXY || UPGRADEABLE_PROXY.trim() === "") {
		throw new Error(`Cannot find proxy address for network: ${networkName}. Please add it to PROXY_ADDRESSES in hardhat.config.ts`)
	}

	const solidityVersion = process.env.SOLIDITY_VERSION
	if (solidityVersion) {
		console.log(`Using Solidity version from environment: ${solidityVersion}`)
	}

	console.log("Verifying contracts on network:", networkName)
	console.log("Proxy Address:", UPGRADEABLE_PROXY)

	// Get the implementation address
	const implementationAddress = await upgrades.erc1967.getImplementationAddress(UPGRADEABLE_PROXY)
	console.log("Implementation Address:", implementationAddress)

	// Verify the implementation contract
	// For upgradeable contracts, we verify the implementation, not the proxy
	// The implementation contract has no constructor arguments since it's deployed via CREATE2
	console.log("\nVerifying implementation contract...")

	try {
		await run("verify:verify", {
			address: implementationAddress,
			force: true,
		})

		console.log("✅ Successfully verified implementation contract!")
		console.log(`View on explorer: ${getExplorerUrl(networkName, implementationAddress)}`)
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		if (errorMessage.includes("Already Verified")) {
			console.log("✅ Contract is already verified!")
		} else {
			console.error("❌ Verification failed:", errorMessage)
			throw error
		}
	}
}

function getExplorerUrl(networkName: string, address: string): string {
	const explorerUrls: Record<string, string> = {
		bsc_testnet: `https://testnet.bscscan.com/address/${address}`,
		polygon_amoy: `https://amoy.polygonscan.com/address/${address}`,
		base_sepolia: `https://sepolia.basescan.org/address/${address}`,
		ethereum_sepolia: `https://sepolia.etherscan.io/address/${address}`,
		polygon: `https://polygonscan.com/address/${address}`,
		bsc: `https://bscscan.com/address/${address}`,
		base: `https://basescan.com/address/${address}`,
		ethereum: `https://etherscan.io/address/${address}`,
	}

	return explorerUrls[networkName] || `https://explorer.example.com/address/${address}`
}


main().then(() => {
	process.exit(0)
}).catch((error) => {
	console.error(error)
	process.exit(1)
})