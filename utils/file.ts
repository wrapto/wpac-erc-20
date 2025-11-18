import fs from "fs"
import path from "path"

export type Addresses = {
	proxy?: string
	latestVersion?: string
	admin?: string
}
const filePath = path.join(__dirname, "..", "output", "addresses.json")

export function loadAddresses(): Addresses {
	let output: Addresses = {}
	if (fs.existsSync(filePath)) {
		output = JSON.parse(fs.readFileSync(filePath, "utf8"))
	} else {
		const outputDir = path.dirname(filePath)
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}
		fs.writeFileSync(filePath, JSON.stringify(output, null, 2))
	}
	return output
}

export function saveAddresses(content: Addresses): void {
	const outputDir = path.dirname(filePath)
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}
	fs.writeFileSync(filePath, JSON.stringify(content, null, 2))
}
