import { Amount, Fetcher } from "@carrot-kpi/sdk";
import { type PublicClient } from "wagmi";
import type { RewardData } from "../page/types";
import { type Hex, decodeAbiParameters, type Address } from "viem";
import type { FinalizableOracle } from "../page/types";

interface DecodedData {
    rewards: RewardData[];
    finalizableOracles: FinalizableOracle[];
    allOrNone: boolean;
    jitFunding: boolean;
    initialSupply: bigint;
}

export const decodeKPITokenData = async (
    publicClient: PublicClient,
    data: Hex,
): Promise<DecodedData | null> => {
    const [
        rawRewards,
        finalizableOracles,
        allOrNone,
        jitFunding,
        initialSupply,
    ] = decodeAbiParameters(
        [
            {
                type: "tuple[]",
                name: "rewards",
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
            { type: "bool", name: "jitFunding" },
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
        boolean,
        bigint,
    ];

    const erc20Tokens = await Fetcher.fetchERC20Tokens({
        publicClient,
        addresses: rawRewards.map((reward) => reward.token),
    });

    const rewards = rawRewards.map((rawReward) => {
        const token = erc20Tokens[rawReward.token];
        if (!token) return null;
        return {
            amount: new Amount(token, rawReward.amount),
            minimumPayout: new Amount(token, rawReward.minimumPayout),
        };
    });

    return rewards.some((reward) => !reward)
        ? null
        : {
              rewards: rewards.slice() as RewardData[],
              allOrNone,
              jitFunding,
              finalizableOracles: finalizableOracles as FinalizableOracle[],
              initialSupply,
          };
};
