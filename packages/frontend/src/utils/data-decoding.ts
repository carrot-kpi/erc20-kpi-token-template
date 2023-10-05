import { Amount, Fetcher } from "@carrot-kpi/sdk";
import { type PublicClient } from "wagmi";
import type { CollateralData } from "../creation-form/types";
import { type Hex, decodeAbiParameters, type Address } from "viem";
import type { FinalizableOracle } from "../page/types";

interface DecodedData {
    collaterals: CollateralData[];
    finalizableOracles: FinalizableOracle[];
    allOrNone: boolean;
    initialSupply: bigint;
}

export const decodeKPITokenData = async (
    publicClient: PublicClient,
    data: Hex,
): Promise<DecodedData | null> => {
    const [rawCollaterals, finalizableOracles, allOrNone, initialSupply] =
        decodeAbiParameters(
            [
                {
                    type: "tuple[]",
                    name: "collaterals",
                    components: [
                        { type: "address", name: "token" },
                        { type: "uint256", name: "amount" },
                        { type: "uint256", name: "minimumPayout" },
                    ],
                },
                {
                    type: "tuple[]",
                    name: "finalizableOracles",
                    components: [
                        { type: "address", name: "addrezz" },
                        { type: "uint256", name: "weight" },
                        { type: "uint256", name: "finalResult" },
                        { type: "bool", name: "finalized" },
                    ],
                },
                { type: "bool", name: "allOrNone" },
                { type: "uint256", name: "initialSupply" },
            ],
            data,
        ) as [
            readonly {
                token: Address;
                amount: bigint;
                minimumPayout: bigint;
            }[],
            readonly {
                addrezz: Address;
                finalResult: bigint;
                weight: bigint;
                finalized: boolean;
            }[],
            boolean,
            bigint,
        ];

    const erc20Tokens = await Fetcher.fetchERC20Tokens({
        publicClient,
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
              collaterals: collaterals.slice() as CollateralData[],
              allOrNone,
              finalizableOracles: finalizableOracles as FinalizableOracle[],
              initialSupply,
          };
};
