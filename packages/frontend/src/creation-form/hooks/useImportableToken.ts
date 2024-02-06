import { useEffect, useState } from "react";
import { isAddress, type Address, erc20Abi } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import type { TokenInfoWithBalance } from "@carrot-kpi/ui";

export const useImportableToken = (
    debouncedQuery?: string,
    withBalances?: boolean,
    connectedAccountAddress?: string,
): {
    importableToken?: TokenInfoWithBalance | null;
    loadingBalance: boolean;
} => {
    const { chain } = useAccount();

    const [importableToken, setImportableToken] =
        useState<TokenInfoWithBalance | null>(null);

    const { data: rawImportableToken, isLoading: loadingImportableToken } =
        useReadContracts({
            contracts: [
                {
                    address: debouncedQuery as Address,
                    abi: erc20Abi,
                    functionName: "name",
                },
                {
                    address: debouncedQuery as Address,
                    abi: erc20Abi,
                    functionName: "decimals",
                },
                {
                    address: debouncedQuery as Address,
                    abi: erc20Abi,
                    functionName: "symbol",
                },
            ],
            allowFailure: false,
            query: { enabled: !!(debouncedQuery && isAddress(debouncedQuery)) },
        });

    const { data: rawBalance, isLoading: pendingBalance } = useBalance({
        address: connectedAccountAddress as Address,
        token: debouncedQuery as Address,
        query: {
            enabled: !!(
                withBalances &&
                connectedAccountAddress &&
                rawImportableToken
            ),
        },
    });

    // whenever the query is not an address anymore and the importable
    // token is there in the state, erase it
    useEffect(() => {
        if ((!debouncedQuery || !isAddress(debouncedQuery)) && importableToken)
            setImportableToken(null);
    }, [debouncedQuery, importableToken]);

    // whenever the wagmi hook fetches an importable token, set it in
    // the internal state
    useEffect(() => {
        if (!chain || !rawImportableToken || loadingImportableToken) return;
        setImportableToken({
            address: debouncedQuery as Address,
            name: rawImportableToken[0],
            decimals: rawImportableToken[1],
            symbol: rawImportableToken[2],
            chainId: chain.id,
        });
    }, [chain, debouncedQuery, loadingImportableToken, rawImportableToken]);

    // whenever the wagmi hook fetches the importable token balance,
    // update it
    useEffect(() => {
        if (!rawBalance || pendingBalance) return;
        setImportableToken((prevState) => {
            if (!prevState) return null;
            return { ...prevState, balance: rawBalance.value };
        });
    }, [pendingBalance, rawBalance]);

    return {
        importableToken,
        loadingBalance: loadingImportableToken || pendingBalance,
    };
};
