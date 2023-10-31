import {
    useDevMode,
    useStagingMode,
    useTokenLists,
    type NamespacedTranslateFunction,
} from "@carrot-kpi/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COINGECKO_LIST_URL } from "../../constants";
import { ERC20_ABI, Service, getServiceURL } from "@carrot-kpi/sdk";
import { useImportableToken } from "./hooks/useImportableToken";
import {
    ERC20TokenPicker,
    type TokenInfoWithBalance,
    type TokenListWithBalance,
} from "@carrot-kpi/ui";
import { useAccount, useChainId, useContractReads, type Address } from "wagmi";
import {
    cacheTokenInfoWithBalance,
    cachedTokenInfoWithBalanceInChain,
    tokenInfoWithBalanceEquals,
} from "../../utils/cache";

export interface ERC20TokenPickerProps {
    t: NamespacedTranslateFunction;
    open: boolean;
    onDismiss: () => void;
    token?: TokenInfoWithBalance | null;
    onChange: (newToken: TokenInfoWithBalance) => void;
}

export const RewardTokenPicker = ({
    t,
    open,
    onDismiss,
    token,
    onChange,
}: ERC20TokenPickerProps) => {
    const { address } = useAccount();
    const chainId = useChainId();

    // fetch token lists
    const devMode = useDevMode();
    const stagingMode = useStagingMode();
    const tokenListUrls = useMemo(() => {
        return [
            COINGECKO_LIST_URL,
            `${getServiceURL(
                Service.STATIC_CDN,
                !devMode && !stagingMode,
            )}/token-list.json`,
        ];
    }, [devMode, stagingMode]);
    const { lists: tokenLists, loading } = useTokenLists({
        urls: tokenListUrls,
    });

    // handle search queries and token imports
    const [searchQuery, setSearchQuery] = useState("");
    const { importableToken, loadingBalance: loadingImportableTokenBalance } =
        useImportableToken(searchQuery, true, address);

    // handle selected token list picking with token balances fetching
    // for tokens in the current chain
    const [selectedTokenList, setSelectedTokenList] = useState<
        TokenListWithBalance | undefined
    >();
    const selectedTokenListTokensInChain = useMemo(() => {
        if (!selectedTokenList || !chainId) return [];
        return selectedTokenList.tokens.filter(
            (token) => token.chainId === chainId,
        );
    }, [chainId, selectedTokenList]);
    const {
        data: rawBalances,
        isLoading: loadingBalances,
        isFetching: fetchingBalances,
    } = useContractReads({
        contracts: selectedTokenListTokensInChain.map((token) => {
            return (
                address && {
                    abi: ERC20_ABI,
                    address: token.address as Address,
                    functionName: "balanceOf",
                    args: [address],
                }
            );
        }),
        allowFailure: true,
        enabled: !!address,
    });
    const selectedTokenListWithBalances = useMemo(() => {
        if (importableToken) {
            return {
                ...selectedTokenList,
                tokens: [importableToken],
            } as TokenListWithBalance;
        }
        if (!selectedTokenList) return;
        if (
            !rawBalances ||
            rawBalances.length !== selectedTokenListTokensInChain.length
        )
            return selectedTokenList;
        const tokensInChainWithBalance = selectedTokenListTokensInChain.reduce(
            (accumulator: Record<string, TokenInfoWithBalance>, token, i) => {
                const rawBalance = rawBalances[i];
                accumulator[`${token.address.toLowerCase()}-${token.chainId}`] =
                    rawBalance.status !== "failure"
                        ? {
                              ...token,
                              balance: rawBalance.result as bigint,
                          }
                        : token;
                return accumulator;
            },
            {},
        );

        return {
            ...selectedTokenList,
            tokens: [
                ...selectedTokenList.tokens.map((token) => {
                    const tokenInChainWithBalance =
                        tokensInChainWithBalance[
                            `${token.address.toLowerCase()}-${token.chainId}`
                        ];
                    return tokenInChainWithBalance || token;
                }),
                ...cachedTokenInfoWithBalanceInChain(chainId),
            ],
        };
    }, [
        chainId,
        importableToken,
        rawBalances,
        selectedTokenList,
        selectedTokenListTokensInChain,
    ]);

    useEffect(() => {
        if (!!selectedTokenList || tokenLists.length === 0) return;
        const defaultSelectedList = tokenLists[0];
        // it's right that we don't use `devMode` here, we don't want
        // to include undefined globals when this snippet of code is
        // executed in dev mode in the context of another template
        // being tested. In short, the following branch should NEVER
        // be present in a prod bundle
        if (__PLAYGROUND__) {
            defaultSelectedList.tokens.push({
                chainId: CCT_CHAIN_ID,
                address: CCT_ERC20_1_ADDRESS,
                name: "Collateral test token 1",
                decimals: 18,
                symbol: "TST1",
            });
            defaultSelectedList.tokens.push({
                chainId: CCT_CHAIN_ID,
                address: CCT_ERC20_2_ADDRESS,
                name: "Collateral test token 2",
                decimals: 18,
                symbol: "TST2",
            });
        }
        setSelectedTokenList(defaultSelectedList as TokenListWithBalance);
    }, [selectedTokenList, tokenLists]);

    const handleSelectedTokenChange = useCallback(
        (newSelectedToken: TokenInfoWithBalance): void => {
            if (tokenInfoWithBalanceEquals(importableToken, newSelectedToken)) {
                cacheTokenInfoWithBalance(newSelectedToken);
            }
            onChange(newSelectedToken);
        },
        [onChange, importableToken],
    );

    return (
        <ERC20TokenPicker
            open={open}
            onDismiss={onDismiss}
            selectedToken={token}
            onSearchQueryChange={setSearchQuery}
            onSelectedTokenChange={handleSelectedTokenChange}
            lists={tokenLists as TokenListWithBalance[]}
            loading={
                loading ||
                loadingBalances ||
                fetchingBalances ||
                loadingImportableTokenBalance
            }
            selectedList={selectedTokenListWithBalances}
            onSelectedListChange={setSelectedTokenList}
            chainId={chainId}
            messages={{
                search: {
                    title: t("erc20.picker.search.title"),
                    inputPlaceholder: t("erc20.picker.search.placeholder"),
                    noTokens: t("erc20.picker.search.no.token"),
                    manageLists: t("erc20.picker.search.manage.lists"),
                },
                manageLists: {
                    title: t("erc20.picker.manage.lists.title"),
                    noLists: t("erc20.picker.manage.lists.no.lists"),
                },
            }}
        />
    );
};
