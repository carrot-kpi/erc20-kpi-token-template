import { KPI_TOKEN_ABI } from "@carrot-kpi/sdk";
import { useEffect, useState } from "react";
import type { Hex } from "viem";
import { type Address, useContractReads } from "wagmi";
import { useWagmiPassiveHook } from "./useWagmiPassiveHook";

interface WatchKPITokenDataParams {
    kpiTokenAddress?: Address;
}

interface KPITokenData {
    finalized: boolean;
    data: Hex;
}

export function useWatchKPITokenData(
    params?: WatchKPITokenDataParams,
): KPITokenData | null {
    const [data, setData] = useState<KPITokenData | null>(null);

    const { data: readResults } = useWagmiPassiveHook({
        hook: useContractReads,
        params: {
            contracts: [
                {
                    address: params?.kpiTokenAddress as Address | undefined,
                    abi: KPI_TOKEN_ABI,
                    functionName: "data",
                },
                {
                    address: params?.kpiTokenAddress as Address | undefined,
                    abi: KPI_TOKEN_ABI,
                    functionName: "finalized",
                },
            ],
            enabled: !!params?.kpiTokenAddress,
            watch: true,
        },
    });

    useEffect(() => {
        if (!readResults || !params?.kpiTokenAddress) return;

        setData({
            data: readResults[0].result as Hex,
            finalized: readResults[1].result as boolean,
        });
    }, [params?.kpiTokenAddress, readResults]);

    return data;
}
