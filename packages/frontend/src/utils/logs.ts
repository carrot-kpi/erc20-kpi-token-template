import { decodeAbiParameters, getEventSelector } from "viem";
import type { Address, TransactionReceipt } from "viem";

const CREATE_TOKEN_EVENT_HASH = getEventSelector("CreateToken(address)");

export const getKPITokenAddressFromReceipt = (
    receipt: TransactionReceipt
): Address | null => {
    for (const log of receipt.logs) {
        const [hash] = log.topics;
        if (hash === CREATE_TOKEN_EVENT_HASH)
            return decodeAbiParameters([{ type: "address" }], log.data)[0];
    }
    return null;
};
