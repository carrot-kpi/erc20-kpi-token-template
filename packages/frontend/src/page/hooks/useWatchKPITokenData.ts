import { useWagmiPassiveHook } from "@carrot-kpi/react";
import { KPI_TOKEN_ABI } from "@carrot-kpi/sdk";
import { useEffect, useState } from "react";
import type { Address, Hex } from "viem";
import { useReadContracts } from "wagmi";

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
        hook: useReadContracts,
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
            query: {
                enabled: !!params?.kpiTokenAddress,
            },
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
