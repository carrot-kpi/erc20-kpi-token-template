import { Amount, Token } from "@carrot-kpi/sdk";
import { useEffect, useState } from "react";
import { erc20ABI, useContractReads } from "wagmi";
import type { Address } from "viem";
import type { RewardData } from "../types";
import { useWagmiPassiveHook } from "./useWagmiPassiveHook";

export const useWatchKPITokenRewardBalances = (
    kpiTokenAddress?: Address,
    rewards?: RewardData[],
) => {
    const [balances, setBalances] = useState<Amount<Token>[]>([]);

    const { data: rawBalances, isLoading: loading } = useWagmiPassiveHook({
        hook: useContractReads,
        params: {
            contracts:
                kpiTokenAddress &&
                rewards &&
                rewards.map((reward) => {
                    return {
                        address: reward.amount.currency.address,
                        abi: erc20ABI,
                        functionName: "balanceOf",
                        args: [kpiTokenAddress],
                    };
                }),
            enabled: !!(rewards && kpiTokenAddress),
            watch: true,
        },
    });

    useEffect(() => {
        if (
            !rewards ||
            loading ||
            !rawBalances ||
            rawBalances.length !== rewards?.length
        )
            return;
        setBalances(
            rewards.map((reward, i) => {
                return new Amount(
                    reward.amount.currency,
                    rawBalances[i].result as bigint,
                );
            }),
        );
    }, [rewards, loading, rawBalances]);

    return { loading, balances };
};
