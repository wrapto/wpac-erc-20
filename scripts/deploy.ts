import { ethers, upgrades } from "hardhat"
import { saveAddresses } from "../utils/file"

async function main() {
	const [deployer] = await ethers.getSigners()
	console.log("Deploying contracts with the account:", deployer.address)

	const Factory = await ethers.getContractFactory("WrappedPAC")
	const wpac = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
	await wpac.waitForDeployment()

	const addresses = {
		proxy: await wpac.getAddress(),
		admin: await upgrades.erc1967.getAdminAddress(await wpac.getAddress()),
		implementation: await upgrades.erc1967.getImplementationAddress(await wpac.getAddress()),
	}
	saveAddresses(addresses)
	console.log(addresses)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
