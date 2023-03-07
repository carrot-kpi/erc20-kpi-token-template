import { providers, utils } from "ethers";

const CREATE_TOKEN_EVENT_HASH = utils.keccak256(
    utils.toUtf8Bytes("CreateToken(address)")
);

export const getKPITokenAddressFromReceipt = (
    receipt: providers.TransactionReceipt
): string | null => {
    for (const log of receipt.logs) {
        const [hash] = log.topics;
        if (hash === CREATE_TOKEN_EVENT_HASH)
            return utils.defaultAbiCoder.decode(["address"], log.data)[0];
    }
    return null;
};
