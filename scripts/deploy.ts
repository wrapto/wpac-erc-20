import { ethers, upgrades, network } from "hardhat"
import { saveAddresses } from "../utils/file"
import { createTrezorSigner } from "../utils/trezorSigner"
import { Wallet } from "ethers"


async function main() {
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

	console.log("Deploying contracts with the account:", await deployer.getAddress())
	console.log("Network:", network.name)

	const Factory = await ethers.getContractFactory("WrappedPACv2")

	const wpac = await upgrades.deployProxy(Factory.connect(deployer))
	await wpac.waitForDeployment()

	const addresses = {
		proxy: await wpac.getAddress(),
		admin: await upgrades.erc1967.getAdminAddress(await wpac.getAddress()),
		implementation: await upgrades.erc1967.getImplementationAddress(await wpac.getAddress()),
	}

	console.log("Successfully deployed ✅")
	console.log("Proxy Address:", addresses.proxy)
	console.log("Implementation Address:", addresses.implementation)

	saveAddresses(addresses)
	console.log(addresses)
}


main().then(() => {
	process.exit(0)
}).catch((error) => {
	console.error(error)
	process.exit(1)
})