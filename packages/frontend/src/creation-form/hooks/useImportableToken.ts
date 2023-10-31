import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { type Address, useBalance, useNetwork, useToken } from "wagmi";
import type { TokenInfoWithBalance } from "@carrot-kpi/ui";

export const useImportableToken = (
    debouncedQuery?: string,
    withBalances?: boolean,
    connectedAccountAddress?: string,
): {
    importableToken?: TokenInfoWithBalance | null;
    loadingBalance: boolean;
} => {
    const { chain } = useNetwork();

    const [importableToken, setImportableToken] =
        useState<TokenInfoWithBalance | null>(null);

    const {
        data: rawImportableToken,
        isLoading: loadingImportableToken,
        isFetching: fetchingImportableToken,
    } = useToken({
        address: debouncedQuery as Address,
        enabled: !!(debouncedQuery && isAddress(debouncedQuery)),
    });

    const {
        data: rawBalance,
        isLoading: loadingBalance,
        isFetching: fetchingBalance,
    } = useBalance({
        address: connectedAccountAddress as Address,
        token: rawImportableToken?.address,
        enabled: !!(
            withBalances &&
            connectedAccountAddress &&
            rawImportableToken
        ),
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
        if (
            !chain ||
            !rawImportableToken ||
            loadingImportableToken ||
            fetchingImportableToken
        )
            return;
        setImportableToken({
            address: rawImportableToken.address,
            name: rawImportableToken.name,
            decimals: rawImportableToken.decimals,
            symbol: rawImportableToken.symbol,
            chainId: chain.id,
        });
    }, [
        chain,
        fetchingImportableToken,
        loadingImportableToken,
        rawImportableToken,
    ]);

    // whenever the wagmi hook fetches the importable token balance,
    // update it
    useEffect(() => {
        if (!rawBalance || loadingBalance || fetchingBalance) return;
        setImportableToken((prevState) => {
            if (!prevState) return null;
            return { ...prevState, balance: rawBalance.value };
        });
    }, [fetchingBalance, loadingBalance, rawBalance]);

    return {
        importableToken,
        loadingBalance:
            loadingImportableToken ||
            fetchingImportableToken ||
            loadingBalance ||
            fetchingBalance,
    };
};
