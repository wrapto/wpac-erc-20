import { ethers, upgrades, network } from "hardhat"
import { saveAddresses } from "../utils/file"
import { PROXY_ADDRESSES } from "../hardhat.config"
import { createTrezorSigner } from "../utils/trezorSigner"
import { Wallet } from "ethers"

async function main() {
	const networkName = network.name

	// Get proxy address from hardhat config
	const UPGRADEABLE_PROXY = PROXY_ADDRESSES[networkName]

	if (!UPGRADEABLE_PROXY || UPGRADEABLE_PROXY.trim() === "") {
		throw new Error(`Cannot find proxy address for network: ${networkName}. Please add it to PROXY_ADDRESSES in hardhat.config.ts`)
	}

	const provider = ethers.provider
	const useTrezor = process.env.TREZOR_BIP44_PATH !== undefined

	let deployer
	if (useTrezor) {
		console.log("Connecting to Trezor...")
		deployer = await createTrezorSigner(provider, process.env.TREZOR_BIP44_PATH ?? "")
	} else {
		console.log("Using default signer (software/private key)")
		if (process.env.PRIVATE_KEY) {
			deployer = new Wallet(process.env.PRIVATE_KEY, provider)
		} else {
			deployer = await provider.getSigner(0)
		}
	}

	console.log("Upgrading contracts with the account:", await deployer.getAddress())
	console.log("Network:", network.name)
	console.log("Proxy Address:", UPGRADEABLE_PROXY)

	const Factory = await ethers.getContractFactory("WrappedPACv2")

	const V2Contract = Factory.connect(deployer)
	await upgrades.forceImport(UPGRADEABLE_PROXY, V2Contract)

	// Verify current implementation
	const currentImplementation = await upgrades.erc1967.getImplementationAddress(UPGRADEABLE_PROXY)
	console.log("Current Implementation Address:", currentImplementation)

	console.log("Upgrading Contract...")

	// Force deploy new implementation if necessary
	const newImplementation = await upgrades.deployImplementation(V2Contract)
	console.log("New Implementation Deployed At:", newImplementation)

	if (currentImplementation === newImplementation) {
		throw new Error("New implementation matches the current implementation. No upgrade needed.")
	}

	const upgrade = await upgrades.upgradeProxy(UPGRADEABLE_PROXY, V2Contract);

	await upgrade.waitForDeployment()

	const addresses = {
		proxy: UPGRADEABLE_PROXY,
		admin: await upgrades.erc1967.getAdminAddress(await upgrade.getAddress()),
		implementation: await upgrades.erc1967.getImplementationAddress(await upgrade.getAddress()),
	}

	console.log("Successfully upgraded ✅")
	console.log("Proxy Address:", addresses.proxy)
	console.log("Implementation Address:", addresses.implementation)

	saveAddresses(addresses)
	console.log("Addresses saved to output/addresses.json")
}

main().then(() => {
	process.exit(0)
}).catch((error) => {
	console.error(error)
	process.exit(1)
})