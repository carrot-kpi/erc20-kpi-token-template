import { Amount, Token } from "@carrot-kpi/sdk";
import { useEffect, useState } from "react";
import { erc20ABI, useContractReads } from "wagmi";
import type { Address } from "viem";
import type { CollateralData } from "../../creation-form/types";

export const useWatchKPITokenCollateralBalances = (
    kpiTokenAddress?: Address,
    collaterals?: CollateralData[],
) => {
    const [balances, setBalances] = useState<Amount<Token>[]>([]);

    const { data: rawBalances, isLoading: loading } = useContractReads({
        contracts:
            kpiTokenAddress &&
            collaterals &&
            collaterals.map((collateral) => {
                return {
                    address: collateral.amount.currency.address,
                    abi: erc20ABI,
                    functionName: "balanceOf",
                    args: [kpiTokenAddress],
                };
            }),
        watch: true,
        enabled: !!(collaterals && kpiTokenAddress),
    });

    useEffect(() => {
        if (
            !collaterals ||
            loading ||
            !rawBalances ||
            rawBalances.length !== collaterals?.length
        )
            return;
        setBalances(
            collaterals.map((collateral, i) => {
                return new Amount(
                    collateral.amount.currency,
                    rawBalances[i].result as bigint,
                );
            }),
        );
    }, [collaterals, loading, rawBalances]);

    return { loading, balances };
};
