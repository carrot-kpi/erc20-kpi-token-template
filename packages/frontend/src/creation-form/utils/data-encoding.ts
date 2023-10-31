import type { OracleWithInitializationBundle, Reward } from "../types";
import { encodeAbiParameters, type Hex } from "viem";

export const encodeKPITokenData = (
    rewards: Reward[],
    tokenName: string,
    tokenSymbol: string,
    tokenSupply: bigint,
) => {
    return encodeAbiParameters(
        [
            {
                type: "tuple[]",
                components: [
                    { type: "address", name: "token" },
                    { type: "uint256", name: "amount" },
                    { type: "uint256", name: "minimumPayout" },
                ],
                name: "collaterals",
            },
            { type: "string", name: "erc20Name" },
            { type: "string", name: "erc20Symbol" },
            { type: "uint256", name: "supply" },
        ],
        [
            rewards.map((reward) => {
                return {
                    token: reward.address,
                    amount: BigInt(reward.amount),
                    minimumPayout: BigInt(reward.minimumPayout),
                };
            }),
            tokenName,
            tokenSymbol,
            tokenSupply,
        ],
    );
};

export const encodeOracleInitializationData = (
    oracles: OracleWithInitializationBundle[],
): { data: Hex; totalValueRequired: bigint } => {
    let totalValueRequired = 0n;
    const params = oracles.map((oracle) => {
        totalValueRequired += oracle.initializationBundle.value;
        return {
            templateId: BigInt(oracle.templateId),
            // TODO: dynamic weight
            weight: 1n,
            value: oracle.initializationBundle.value,
            data: oracle.initializationBundle.data,
        };
    });
    return {
        data: encodeAbiParameters(
            [
                {
                    type: "tuple[]",
                    components: [
                        { type: "uint256", name: "templateId" },
                        { type: "uint256", name: "weight" },
                        { type: "uint256", name: "value" },
                        { type: "bytes", name: "data" },
                    ],
                    name: "oraclesData",
                },
                { type: "bool", name: "allOrNone" },
            ],
            [params, false],
        ),
        totalValueRequired,
    };
};
