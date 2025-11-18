export function decimal(num: number): bigint {
	return BigInt(BigInt(num) * BigInt(1e9))
}
