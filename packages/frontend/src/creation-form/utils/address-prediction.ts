import { utils } from "ethers";

export const predictKPITokenAddress = (
    creator: string,
    description: string,
    expiration: number,
    initializationData: string,
    oraclesInitializationData: string
) => {
    return utils.getCreate2Address(
        creator,
        utils.solidityKeccak256(
            ["address", "uint256", "string", "uint256", "bytes", "bytes"],
            [
                creator,
                description,
                expiration,
                initializationData,
                oraclesInitializationData,
            ]
        ),
        __INIT_CODE_HASH__
    );
};
