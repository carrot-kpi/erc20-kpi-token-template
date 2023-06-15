import { Template } from "@carrot-kpi/sdk";
import type { CollateralData, OracleData, OutcomeData } from "../types";
import { encodeAbiParameters, type Hex } from "viem";

export const encodeKPITokenData = (
    collateralsData: CollateralData[],
    erc20Name: string,
    erc20Symbol: string,
    supply: bigint
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
            collateralsData.map((collateralData) => {
                return {
                    token: collateralData.amount.currency.address,
                    amount: collateralData.amount.raw,
                    minimumPayout: collateralData.minimumPayout.raw,
                };
            }),
            erc20Name,
            erc20Symbol,
            supply,
        ]
    );
};

export const encodeOraclesData = (
    templatesData: Template[],
    outcomesData: OutcomeData[],
    oraclesData: Required<OracleData>[]
): { data: Hex; totalValueRequired: bigint } => {
    let totalValueRequired = 0n;
    const oracleParams = templatesData.map(({ id: templateId }, index) => {
        const { lowerBound, higherBound } = outcomesData[index];
        const { initializationBundle } = oraclesData[index];
        totalValueRequired += initializationBundle.value;
        return {
            templateId: BigInt(templateId),
            lowerBound,
            higherBound,
            // TODO: dynamic weight
            weight: 1n,
            value: initializationBundle.value,
            data: initializationBundle.data,
        };
    });
    return {
        data: encodeAbiParameters(
            [
                {
                    type: "tuple[]",
                    components: [
                        { type: "uint256", name: "templateId" },
                        { type: "uint256", name: "lowerBound" },
                        { type: "uint256", name: "higherBound" },
                        { type: "uint256", name: "weight" },
                        { type: "uint256", name: "value" },
                        { type: "bytes", name: "data" },
                    ],
                    name: "oraclesData",
                },
                { type: "bool", name: "allOrNone" },
            ],
            [oracleParams, false]
        ),
        totalValueRequired,
    };
};
