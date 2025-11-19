import { ethers, network } from "hardhat"
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
	const wpac = await Factory.connect(deployer).deploy()
	await wpac.waitForDeployment()

	const address = await wpac.getAddress()

	console.log("Successfully deployed ✅")
	console.log("Contract Address:", address)

	saveAddresses({ implementation: address })
	console.log({ contract: address })
}


main().then(() => {
	process.exit(0)
}).catch((error) => {
	console.error(error)
	process.exit(1)
})