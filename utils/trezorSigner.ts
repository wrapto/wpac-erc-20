import TrezorConnect, { DEVICE_EVENT, TRANSPORT_EVENT } from "@trezor/connect"
import readlineSync from "readline-sync"
import {
	AbstractSigner,
	type BigNumberish,
	type BytesLike,
	type Provider,
	type Signer,
	TypedDataDomain,
	TransactionRequest,
	TypedDataField,
	resolveProperties,
	toBeHex,
} from "ethers"

const DEFAULT_PATH = "m/44'/60'/0'/0/0"

export interface TrezorSignerOptions {
	path?: string
}

export async function createTrezorSigner(provider: Provider, pathInput?: string): Promise<Signer> {
	const bipPath = pathInput?.trim().length ? pathInput.trim() : DEFAULT_PATH
	console.log("bipPath", bipPath)

	await TrezorConnect.init({
		lazyLoad: true,
		debug: false,
		manifest: {
			appUrl: "Wrapto",
			appName: "Wrapto",
			email: "Wrapto",
		},
	})

	// this event will be fired when bridge starts or stops or there is no bridge running
	TrezorConnect.on(TRANSPORT_EVENT, _event => {
		// eslint-disable-next-line
		// console.log(event);
	})

	// this event will be fired when device connects, disconnects or changes
	TrezorConnect.on(DEVICE_EVENT, _event => {
		// eslint-disable-next-line
		// console.log(event);
	})

	TrezorConnect.on("ui-request_pin", async () => {
		console.log("\nTrezor is requesting PIN entry.")
		console.log("Look at your Trezor device and enter the positions shown on screen.")
		console.log("\nPIN Matrix Layout:")
		console.log("  7    8    9")
		console.log("  4    5    6")
		console.log("  1    2    3")
		console.log("\nExample: If your device shows positions 7,3,9 enter: 739\n")

		const pin = readlineSync.question("Enter PIN positions: ")

		// Send PIN back to Trezor
		TrezorConnect.uiResponse({
			type: "ui-receive_pin",
			payload: pin,
		})
	})


	return new HardwareTrezorSigner(provider, bipPath)
}

class HardwareTrezorSigner extends AbstractSigner {
	private readonly path: string

	constructor(provider: Provider, path: string) {
		super(provider)
		this.path = path
	}
	override connect(_: Provider): HardwareTrezorSigner {
		return this
	}

	override async getAddress(): Promise<string> {
		const response = await TrezorConnect.ethereumGetAddress({
			path: this.path,
			showOnTrezor: false,
		})

		if (!response.success) {
			throw new Error(`Unable to read address from Trezor: ${response.payload.error}`)
		}

		return response.payload.address
	}

	override async signTransaction(tx: TransactionRequest): Promise<string> {
		console.log("===signing transaction...")

		const resolved = await resolveProperties(tx)
		const from = await this.getAddress()
		const toAddress = resolved.to ?? tx.to ?? ""

		const network = await this.provider?.getNetwork()
		const chainId = resolved.chainId ?? network?.chainId

		if (chainId == null) {
			throw new Error("Unable to determine chainId for transaction")
		}

		const gasLimit = resolved.gasLimit ?? tx.gasLimit
		if (gasLimit == null) {
			throw new Error("Missing gas limit for transaction")
		}

		const feeData = await this.provider?.getFeeData()
		const gasPrice = resolved.gasPrice ?? tx.gasPrice ?? feeData?.gasPrice
		if (gasPrice == null) {
			throw new Error("Missing gas price for transaction (legacy-only signer)")
		}

		const data: string = resolved.data ?? tx.data ?? "0x"
		if (data == null) {
			throw new Error("Missing data for transaction")
		}

		const nonce =
			resolved.nonce ??
			(this.provider ? await this.provider.getTransactionCount(from) : undefined)
		if (nonce == null) {
			throw new Error("Missing nonce for transaction")
		}

		const trezorTx = {
			to: toAddress as string,
			value: toHex(resolved.value ?? 0n),
			data: data,
			chainId: Number(chainId),
			nonce: toHex(nonce),
			gasLimit: toHex(gasLimit),
			gasPrice: toHex(gasPrice),
		}

		console.log("sign path", this.path)
		const response = await TrezorConnect.ethereumSignTransaction({
			path: this.path,
			transaction: trezorTx,
		})

		if (!response.success) {
			throw new Error(`Trezor failed to sign transaction: ${response.payload.error}`)
		}

		// console.log("========================")
		// console.log(response.payload.serializedTx)
		// console.log("========================")

		return response.payload.serializedTx
	}

	override async signMessage(_message: BytesLike | string): Promise<string> {
		console.log("signing message...")
		throw new Error("signing message not implemented")
	}

	override async signTypedData(
		_domain: TypedDataDomain,
		_types: Record<string, Array<TypedDataField>>,
		_value: Record<string, unknown>,
	): Promise<string> {
		console.log("signing typed data...")
		throw new Error("signing typed data not implemented")
	}
}

function toHex(value: BigNumberish): string {
	return toBeHex(value)
}
