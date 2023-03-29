import {
    Button,
    ERC20TokenPicker,
    NumberInput,
    TextInput,
    Typography,
    TokenInfoWithBalance,
    TokenListWithBalance,
    NextStepButton,
    Skeleton,
} from "@carrot-kpi/ui";
import { NamespacedTranslateFunction, useTokenLists } from "@carrot-kpi/react";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { utils } from "ethers";
import {
    CollateralData,
    CollateralsStepState,
    NumberFormatValue,
    TokenWithLogoURI,
} from "../../types";
import { Amount, Token, formatTokenAmount } from "@carrot-kpi/sdk";
import { Address, useAccount, useBalance, useNetwork } from "wagmi";
import { PROTOCOL_FEE_BPS, TOKEN_LIST_URLS } from "../../constants";
import { ReactComponent as ArrowDown } from "../../../assets/arrow-down.svg";
import { CollateralsTable } from "./table";
import { parseUnits } from "ethers/lib/utils.js";

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
    const { lists: tokenLists, loading } = useTokenLists(TOKEN_LIST_URLS);

    const [selectedTokenList, setSelectedTokenList] = useState<
        TokenListWithBalance | undefined
    >();
    const [disabled, setDisabled] = useState(true);

    // picker state
    const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
    const [addDisabled, setAddDisabled] = useState(true);
    const [protocolFeeAmount, setProtocolFeeAmount] = useState("");

    // fetch picked erc20 token balance
    const { data, isLoading } = useBalance({
        address: !!state.pickerToken ? address : undefined,
        token: !!state.pickerToken
            ? (state.pickerToken.address as Address)
            : undefined,
    });

    useEffect(() => {
        setDisabled(state.collaterals.length === 0);
    }, [state.collaterals]);

    useEffect(() => {
        if (!!selectedTokenList || tokenLists.length === 0) return;
        const defaultSelectedList = tokenLists[0];
        if (__DEV__) {
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
            const bnPickerAmount = utils.parseUnits(
                state.pickerAmount.value,
                state.pickerToken.decimals
            );
            if (data.value.lt(bnPickerAmount)) {
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
                    state.pickerToken?.address.toLowerCase()
            )
        );
    }, [
        data,
        state.collaterals,
        state.pickerAmount,
        state.pickerMinimumPayout,
        state.pickerToken,
    ]);

    useEffect(() => {
        if (
            !state.pickerToken ||
            !state.pickerAmount ||
            !state.pickerAmount.value
        )
            return;
        const parsedRawAmount = parseFloat(state.pickerAmount.value);
        if (isNaN(parsedRawAmount)) return;
        setProtocolFeeAmount(
            formatTokenAmount(
                new Amount(
                    state.pickerToken as unknown as Token,
                    parseUnits(
                        ((parsedRawAmount * PROTOCOL_FEE_BPS) / 10_000).toFixed(
                            state.pickerToken.decimals
                        ),
                        state.pickerToken.decimals
                    )
                )
            )
        );
    }, [state.pickerToken, state.pickerAmount]);

    const handleOpenERC20TokenPicker = useCallback((): void => {
        setTokenPickerOpen(true);
    }, []);

    const handleERC20TokenPickerDismiss = useCallback((): void => {
        setTokenPickerOpen(false);
    }, []);

    const handleSelectedTokenChange = useCallback(
        (newSelectedToken: TokenInfoWithBalance): void => {
            onStateChange({
                ...state,
                pickerToken: newSelectedToken,
            });
        },
        [onStateChange, state]
    );

    const handlePickerRawAmountChange = useCallback(
        (newPickerRawAmount: NumberFormatValue): void => {
            onStateChange({
                ...state,
                pickerAmount: newPickerRawAmount,
            });
        },
        [onStateChange, state]
    );

    const handlePickerRawMinimumAmountChange = useCallback(
        (newPickerRawMinimumPayout: NumberFormatValue): void => {
            onStateChange({
                ...state,
                pickerMinimumPayout: newPickerRawMinimumPayout,
            });
        },
        [onStateChange, state]
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
            state.pickerToken.address,
            state.pickerToken.decimals,
            state.pickerToken.symbol,
            state.pickerToken.name,
            state.pickerToken.logoURI
        );
        onStateChange({
            ...state,
            collaterals: [
                ...state.collaterals,
                {
                    amount: new Amount(
                        token,
                        utils.parseUnits(
                            state.pickerAmount.value,
                            token.decimals
                        )
                    ),
                    minimumPayout: new Amount(
                        token,
                        utils.parseUnits(
                            state.pickerMinimumPayout.value,
                            token.decimals
                        )
                    ),
                },
            ],
            pickerToken: undefined,
            pickerAmount: undefined,
            pickerMinimumPayout: undefined,
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
        [onStateChange, state]
    );

    const handleMaxClick = useCallback(() => {
        if (!data || !state.pickerToken) return;
        onStateChange({
            ...state,
            pickerAmount: {
                formattedValue: data.formatted,
                value: utils.formatUnits(
                    data.value.toString(),
                    state.pickerToken.decimals
                ),
            },
        });
    }, [data, onStateChange, state]);

    return (
        <>
            <ERC20TokenPicker
                open={tokenPickerOpen}
                onDismiss={handleERC20TokenPickerDismiss}
                selectedToken={state.pickerToken}
                onSelectedTokenChange={handleSelectedTokenChange}
                lists={tokenLists as TokenListWithBalance[]}
                loading={loading}
                selectedList={selectedTokenList}
                onSelectedListChange={setSelectedTokenList}
                chainId={chain?.id}
                withBalances
                accountAddress={address}
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
                                <div className="flex justify-between">
                                    <div
                                        onClick={handleOpenERC20TokenPicker}
                                        className="cursor-pointer"
                                    >
                                        <TextInput
                                            label=""
                                            autoComplete="off"
                                            placeholder={t(
                                                "label.collateral.picker.token.pick"
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
                                            input: "w-full border-none text-right",
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
                                <div className="flex justify-end">
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
                                                        "label.collateral.picker.balance.max"
                                                    )}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="sm">
                                                -
                                            </Typography>
                                        )}
                                    </div>
                                    {/* <Typography size="sm">$ 7,068.31</Typography> */}
                                </div>

                                <div className="h-px w-full bg-black" />

                                <div className="flex items-center justify-between">
                                    <Typography>
                                        {t(
                                            "label.collateral.picker.minimum.payout"
                                        )}
                                    </Typography>
                                    <NumberInput
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "border-none text-right w-full",
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

                                <div className="h-px w-full bg-black" />

                                <div className="flex items-center justify-between">
                                    <Typography>
                                        {t("label.collateral.picker.fee")}
                                    </Typography>
                                    <Typography>
                                        {PROTOCOL_FEE_BPS / 100}%{" "}
                                        {protocolFeeAmount &&
                                            state.pickerToken &&
                                            `(${protocolFeeAmount})`}
                                    </Typography>
                                </div>
                                {/* TODO: implement price fetching */}
                                {/* <div className="flex justify-end">
                                <Typography size="sm">$ 7,068.31</Typography>
                            </div> */}
                            </div>
                        </div>
                    </div>
                    <Button
                        size="small"
                        icon={ArrowDown}
                        onClick={handleCollateralAdd}
                        disabled={addDisabled}
                    >
                        {t("label.collateral.picker.apply")}
                    </Button>
                </div>
                <CollateralsTable
                    t={t}
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
