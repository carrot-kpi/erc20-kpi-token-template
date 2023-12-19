import { KPI_TOKEN_ABI } from "@carrot-kpi/sdk";
import { useEffect, useState } from "react";
import { type Address, useContractReads } from "wagmi";

interface WatchKPITokenDataParams {
    kpiTokenAddress?: Address;
}

interface KPITokenData {
    finalized: boolean;
    data: Address;
}

export function useWatchKPITokenData(
    params?: WatchKPITokenDataParams,
): KPITokenData | null {
    const [data, setData] = useState<KPITokenData | null>(null);

    const { data: readResults } = useContractReads({
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
    });

    useEffect(() => {
        if (!readResults || !params?.kpiTokenAddress) return;

        setData({
            data: readResults[0].result as Address,
            finalized: readResults[1].result as boolean,
        });
    }, [params?.kpiTokenAddress, readResults]);

    return data;
}
