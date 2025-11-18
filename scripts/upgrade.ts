import { ethers, upgrades } from "hardhat"
import { loadAddresses, saveAddresses } from "../utils/file"

const UPGRADEABLE_PROXY = loadAddresses().proxy

async function main() {
	if (!UPGRADEABLE_PROXY) throw new Error("Cannot load UPGRADEABLE_PROXY!")

	const V2Contract = await ethers.getContractFactory("WrappedPAC")

	// Perform the upgrade
	const upgrade = await upgrades.upgradeProxy(UPGRADEABLE_PROXY, V2Contract)
	await upgrade.waitForDeployment()

	console.log("Successfully upgraded ✅")
	console.log("Proxy Address:", await upgrade.getAddress())
	console.log("Implementation Address:", await upgrades.erc1967.getImplementationAddress(await upgrade.getAddress()))


	const addresses = {
		proxy: UPGRADEABLE_PROXY,
		admin: await upgrades.erc1967.getAdminAddress(await upgrade.getAddress()),
		implementation: await upgrades.erc1967.getImplementationAddress(await upgrade.getAddress()),
	}

	saveAddresses(addresses)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
