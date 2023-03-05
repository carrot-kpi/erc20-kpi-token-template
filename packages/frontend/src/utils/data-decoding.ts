import { Amount, Fetcher } from "@carrot-kpi/sdk";
import { Provider } from "@wagmi/core";
import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils.js";
import { CollateralData } from "../creation-form/types";

interface FinalizableOracle {
    address: string;
    lowerBound: BigNumber;
    higherBound: BigNumber;
    finalResult: BigNumber;
    weight: BigNumber;
    finalized: boolean;
}

interface OnChainFinalizableOracle extends Omit<FinalizableOracle, "address"> {
    addrezz: string;
}

interface OnChainCollateral {
    token: string;
    amount: BigNumber;
    minimumPayout: BigNumber;
}

interface DecodedData {
    collaterals: CollateralData[];
    finalizableOracles: FinalizableOracle[];
    allOrNone: boolean;
    initialSupply: BigNumber;
}

export const decodeKPITokenData = async (
    provider: Provider,
    data: string
): Promise<DecodedData | null> => {
    const [rawCollaterals, finalizableOracles, allOrNone, initialSupply] =
        defaultAbiCoder.decode(
            [
                "tuple(address token,uint256 amount,uint256 minimumPayout)[]",
                "tuple(address addrezz,uint256 lowerBound,uint256 higherBound,uint256 finalResult,uint256 weight,bool finalized)[]",
                "bool",
                "uint256",
            ],
            data
        ) as [
            OnChainCollateral[],
            OnChainFinalizableOracle[],
            boolean,
            BigNumber
        ];

    const erc20Tokens = await Fetcher.fetchERC20Tokens({
        provider,
        addresses: rawCollaterals.map((collateral) => collateral.token),
    });

    const collaterals = rawCollaterals.map((rawCollateral) => {
        const token = erc20Tokens[rawCollateral.token];
        if (!token) return null;
        return {
            amount: new Amount(token, rawCollateral.amount),
            minimumPayout: new Amount(token, rawCollateral.minimumPayout),
        };
    });

    return collaterals.some((collateral) => !collateral)
        ? null
        : {
              collaterals: collaterals as CollateralData[],
              allOrNone,
              finalizableOracles: finalizableOracles.map((oracle) => {
                  return { ...oracle, address: oracle.addrezz };
              }),
              initialSupply,
          };
};
