import { Amount, Fetcher } from "@carrot-kpi/sdk";
import { Provider } from "@wagmi/core";
import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils.js";
import { CollateralData } from "../creation-form/types";
import { FinalizableOracle } from "../page/types";

interface DecodedData {
    collaterals: CollateralData[];
    allOrNone: boolean;
}

export const decodeKPITokenData = async (
    provider: Provider,
    data: string
): Promise<DecodedData | null> => {
    // FIXME: handle finalizable oracles

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [rawCollaterals, _, allOrNone] = defaultAbiCoder.decode(
        [
            "tuple(address token,uint256 amount,uint256 minimumPayout)[]",
            "tuple(address addrezz,uint256 lowerBound,uint256 higherBound,uint256 finalResult,uint256 weight,bool finalized)[]",
            "bool",
        ],
        data
    ) as [
        {
            token: string;
            amount: BigNumber;
            minimumPayout: BigNumber;
        }[],
        FinalizableOracle[],
        boolean
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
          };
};
