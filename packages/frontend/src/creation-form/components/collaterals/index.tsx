import {
    Button,
    ERC20TokenPicker,
    NumberInput,
    TextInput,
    Typography,
    type TokenInfoWithBalance,
    type TokenListWithBalance,
    NextStepButton,
    Skeleton,
    ErrorText,
} from "@carrot-kpi/ui";
import {
    type NamespacedTranslateFunction,
    useTokenLists,
    useDevMode,
    useStagingMode,
} from "@carrot-kpi/react";
import {
    type ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    type CollateralData,
    type CollateralsStepState,
    type NumberFormatValue,
    TokenWithLogoURI,
} from "../../types";
import { Amount, ERC20_ABI, Service, getServiceURL } from "@carrot-kpi/sdk";
import {
    type Address,
    useAccount,
    useBalance,
    useContractReads,
    useNetwork,
} from "wagmi";
import {
    DEFAULT_NUMBER_FORMAT_VALUE,
    PROTOCOL_FEE_BPS,
    COINGECKO_LIST_URL,
} from "../../constants";
import { ReactComponent as ArrowDown } from "../../../assets/arrow-down.svg";
import { CollateralsTable } from "./table";
import { USDValue } from "./usd-value";
import { useImportableToken } from "./hooks/useImportableToken";
import {
    cacheTokenInfoWithBalance,
    cachedTokenInfoWithBalanceInChain,
    tokenInfoWithBalanceEquals,
} from "../../utils/cache";
import { formatUnits, parseUnits } from "viem";

interface CollateralProps {
    t: NamespacedTranslateFunction;
    state: CollateralsStepState;
    onStateChange: (state: CollateralsStepState) => void;
    onNext: (collaterals: CollateralData[]) => void;
}

export const Collaterals = ({
    t,
    state,
    onStateChange,
    onNext,
}: CollateralProps): ReactElement => {
    const { address } = useAccount();
    const { chain } = useNetwork();
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

    const [selectedTokenList, setSelectedTokenList] = useState<
        TokenListWithBalance | undefined
    >();
    const [disabled, setDisabled] = useState(true);

    // picker state
    const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
    const [addDisabled, setAddDisabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [collateralAmountErrorMessage, setCollateralAmountErrorMessage] =
        useState("");
    const [minimumPayoutErrorMessage, setMinimumPayoutErrorMessage] =
        useState("");

    // fetch picked erc20 token balance
    const { data, isLoading } = useBalance({
        address: !!state.pickerToken ? address : undefined,
        token: !!state.pickerToken
            ? (state.pickerToken.address as Address)
            : undefined,
    });

    const { importableToken, loadingBalance: loadingImportableTokenBalance } =
        useImportableToken(searchQuery, true, address);

    const selectedTokenListTokensInChain = useMemo(() => {
        if (!selectedTokenList || !chain) return [];
        return selectedTokenList.tokens.filter(
            (token) => token.chainId === chain.id,
        );
    }, [chain, selectedTokenList]);

    const {
        data: rawBalances,
        isLoading: loadingBalances,
        isFetching: fetchingBalances,
    } = useContractReads({
        contracts:
            address &&
            selectedTokenListTokensInChain.map((token) => {
                return {
                    abi: ERC20_ABI,
                    address: token.address as Address,
                    functionName: "balanceOf",
                    args: [address],
                };
            }),
        allowFailure: true,
        enabled: !!(
            chain?.id &&
            selectedTokenListTokensInChain.length > 0 &&
            address
        ),
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
                ...cachedTokenInfoWithBalanceInChain(chain),
            ],
        };
    }, [
        chain,
        importableToken,
        rawBalances,
        selectedTokenList,
        selectedTokenListTokensInChain,
    ]);

    useEffect(() => {
        setDisabled(state.collaterals.length === 0);
    }, [state.collaterals]);

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

    useEffect(() => {
        if (
            !state.pickerToken ||
            !state.pickerAmount ||
            !state.pickerAmount.value ||
            !state.pickerMinimumPayout ||
            !state.pickerMinimumPayout.value
        ) {
            setAddDisabled(true);
            return;
        }
        const parsedAmount = parseFloat(state.pickerAmount.value);
        if (data) {
            // check if the user has enough balance of the picked token
            const bnPickerAmount = parseUnits(
                state.pickerAmount.value as `${number}`,
                state.pickerToken.decimals,
            );
            if (data.value < bnPickerAmount) {
                setAddDisabled(true);
                return;
            }
        }
        const amountMinusFees =
            parsedAmount - (parsedAmount * PROTOCOL_FEE_BPS) / 10_000;
        const parsedMinimumAmount = parseFloat(state.pickerMinimumPayout.value);
        if (amountMinusFees === 0 || parsedMinimumAmount >= amountMinusFees) {
            setAddDisabled(true);
            return;
        }
        setAddDisabled(
            !!state.collaterals.find(
                (collateral) =>
                    collateral.amount.currency.address.toLowerCase() ===
                    state.pickerToken?.address.toLowerCase(),
            ),
        );
    }, [
        data,
        state.collaterals,
        state.pickerAmount,
        state.pickerMinimumPayout,
        state.pickerToken,
    ]);

    const handleOpenERC20TokenPicker = useCallback((): void => {
        setTokenPickerOpen(true);
    }, []);

    const handleERC20TokenPickerDismiss = useCallback((): void => {
        setTokenPickerOpen(false);
    }, []);

    const handleSelectedTokenChange = useCallback(
        (newSelectedToken: TokenInfoWithBalance): void => {
            if (tokenInfoWithBalanceEquals(importableToken, newSelectedToken)) {
                cacheTokenInfoWithBalance(newSelectedToken);
            }
            onStateChange({
                ...state,
                pickerToken: newSelectedToken,
                pickerAmount: DEFAULT_NUMBER_FORMAT_VALUE,
                pickerMinimumPayout: {
                    formattedValue: "0",
                    value: "0",
                },
            });
            setCollateralAmountErrorMessage("");
            setMinimumPayoutErrorMessage("");
        },
        [onStateChange, importableToken, state],
    );

    const handlePickerRawAmountChange = useCallback(
        (newPickerRawAmount: NumberFormatValue): void => {
            let errorMessage = "";

            if (!data) return;
            if (
                !newPickerRawAmount ||
                !newPickerRawAmount.value ||
                parseFloat(newPickerRawAmount.value) === 0
            )
                errorMessage = t("error.collaterals.empty");
            else if (
                data.value <
                parseUnits(
                    newPickerRawAmount.value as `${number}`,
                    data.decimals,
                )
            )
                errorMessage = t("error.collaterals.insufficient");

            if (
                !!minimumPayoutErrorMessage &&
                !!state.pickerMinimumPayout &&
                parseFloat(newPickerRawAmount.value) >
                    parseFloat(state.pickerMinimumPayout.value)
            )
                setMinimumPayoutErrorMessage("");
            else if (
                !minimumPayoutErrorMessage &&
                !!state.pickerMinimumPayout &&
                parseFloat(newPickerRawAmount.value) <
                    parseFloat(state.pickerMinimumPayout.value)
            )
                setMinimumPayoutErrorMessage(
                    t("error.collaterals.minimumPayoutTooHigh"),
                );

            setCollateralAmountErrorMessage(errorMessage);
            onStateChange({
                ...state,
                pickerAmount: newPickerRawAmount,
            });
        },
        [onStateChange, state, minimumPayoutErrorMessage, data, t],
    );

    const handlePickerRawMinimumAmountChange = useCallback(
        (newPickerRawMinimumPayout: NumberFormatValue): void => {
            let errorMessage = "";

            if (!state.pickerAmount) return;

            const parsedAmount = parseFloat(state.pickerAmount.value);
            const amountMinusFees =
                parsedAmount - (parsedAmount * PROTOCOL_FEE_BPS) / 10_000;
            const parsedMinimumAmount = parseFloat(
                newPickerRawMinimumPayout.value,
            );

            if (!newPickerRawMinimumPayout || !newPickerRawMinimumPayout.value)
                errorMessage = t("error.collaterals.minimumPayoutEmpty");
            else if (
                amountMinusFees === 0 ||
                parsedMinimumAmount >= amountMinusFees
            )
                errorMessage = t("error.collaterals.minimumPayoutTooHigh");

            setMinimumPayoutErrorMessage(errorMessage);
            onStateChange({
                ...state,
                pickerMinimumPayout: newPickerRawMinimumPayout,
            });
        },
        [onStateChange, state, t],
    );

    const handleCollateralAdd = useCallback((): void => {
        if (
            !chain ||
            !state.pickerToken ||
            !state.pickerAmount ||
            !state.pickerMinimumPayout
        )
            return;
        const token = new TokenWithLogoURI(
            chain.id,
            state.pickerToken.address as Address,
            state.pickerToken.decimals,
            state.pickerToken.symbol,
            state.pickerToken.name,
            state.pickerToken.logoURI,
        );
        onStateChange({
            ...state,
            collaterals: [
                ...state.collaterals,
                {
                    amount: new Amount(
                        token,
                        parseUnits(
                            state.pickerAmount.value as `${number}`,
                            token.decimals,
                        ),
                    ),
                    minimumPayout: new Amount(
                        token,
                        parseUnits(
                            state.pickerMinimumPayout.value as `${number}`,
                            token.decimals,
                        ),
                    ),
                },
            ],
            pickerToken: undefined,
            pickerAmount: DEFAULT_NUMBER_FORMAT_VALUE,
            pickerMinimumPayout: DEFAULT_NUMBER_FORMAT_VALUE,
        });
    }, [chain, onStateChange, state]);

    const handleNext = useCallback((): void => {
        onNext(state.collaterals);
    }, [state.collaterals, onNext]);

    const handleRemoveCollateral = useCallback(
        (index: number) => {
            onStateChange({
                ...state,
                collaterals: state.collaterals.filter((_, i) => i !== index),
            });
        },
        [onStateChange, state],
    );

    const handleMaxClick = useCallback(() => {
        if (!data || !state.pickerToken) return;
        handlePickerRawAmountChange({
            formattedValue: data.formatted,
            value: formatUnits(data.value, state.pickerToken.decimals),
        });
    }, [data, handlePickerRawAmountChange, state]);

    return (
        <>
            <ERC20TokenPicker
                open={tokenPickerOpen}
                onDismiss={handleERC20TokenPickerDismiss}
                selectedToken={state.pickerToken}
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
                chainId={chain?.id}
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
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <div className="rounded-xxl border border-black p-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div
                                        onClick={handleOpenERC20TokenPicker}
                                        className="cursor-pointer w-3/4"
                                    >
                                        <TextInput
                                            label=""
                                            autoComplete="off"
                                            placeholder={t(
                                                "label.collateral.picker.token.pick",
                                            )}
                                            className={{
                                                input: "w-full cursor-pointer",
                                            }}
                                            readOnly
                                            value={
                                                state.pickerToken?.symbol || ""
                                            }
                                        />
                                    </div>
                                    <NumberInput
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "w-full border-none text-right p-0",
                                        }}
                                        variant="xl"
                                        allowNegative={false}
                                        disabled={!!!state.pickerToken}
                                        value={
                                            state.pickerAmount?.formattedValue
                                        }
                                        onValueChange={
                                            handlePickerRawAmountChange
                                        }
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Typography variant="sm">
                                            {t("label.collateral.balance")}:{" "}
                                        </Typography>
                                        {isLoading ? (
                                            <Skeleton variant="sm" />
                                        ) : !!data ? (
                                            <>
                                                <Typography variant="sm">
                                                    {data.formatted}
                                                </Typography>
                                                <Typography
                                                    variant="sm"
                                                    className={{
                                                        root: "text-orange cursor-pointer",
                                                    }}
                                                    uppercase
                                                    onClick={handleMaxClick}
                                                >
                                                    {t(
                                                        "label.collateral.picker.balance.max",
                                                    )}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="sm">
                                                -
                                            </Typography>
                                        )}
                                    </div>
                                    <div className="flex justify-end h-5">
                                        <USDValue
                                            tokenAddress={
                                                state.pickerToken?.address
                                            }
                                            rawTokenAmount={state.pickerAmount}
                                        />
                                    </div>
                                </div>

                                <div className="h-px w-full bg-black" />

                                <div className="flex-col gap-2 pt-1.5">
                                    <div className="flex items-center justify-between">
                                        <Typography>
                                            {t(
                                                "label.collateral.picker.minimum.payout",
                                            )}
                                        </Typography>
                                        <NumberInput
                                            label=""
                                            placeholder="0.0"
                                            className={{
                                                input: "border-none text-right w-full p-0",
                                            }}
                                            variant="xl"
                                            disabled={!!!state.pickerToken}
                                            allowNegative={false}
                                            value={
                                                state.pickerMinimumPayout
                                                    ?.formattedValue
                                            }
                                            onValueChange={
                                                handlePickerRawMinimumAmountChange
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-end h-5">
                                        <USDValue
                                            tokenAddress={
                                                state.pickerToken?.address
                                            }
                                            rawTokenAmount={
                                                state.pickerMinimumPayout
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <Button
                            size="small"
                            icon={ArrowDown}
                            onClick={handleCollateralAdd}
                            disabled={addDisabled}
                            className={{ root: "w-full md:w-fit" }}
                        >
                            {t("label.collateral.picker.apply")}
                        </Button>
                        {(!!collateralAmountErrorMessage ||
                            !!minimumPayoutErrorMessage) && (
                            <div className="flex flex-col">
                                {collateralAmountErrorMessage && (
                                    <ErrorText>
                                        {collateralAmountErrorMessage}
                                    </ErrorText>
                                )}
                                {minimumPayoutErrorMessage && (
                                    <ErrorText>
                                        {minimumPayoutErrorMessage}
                                    </ErrorText>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <CollateralsTable
                    t={t}
                    noFees
                    collaterals={state.collaterals}
                    onRemove={handleRemoveCollateral}
                />
            </div>
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </>
    );
};
