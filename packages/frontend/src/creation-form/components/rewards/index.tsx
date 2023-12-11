import {
    Button,
    NumberInput,
    TextInput,
    Typography,
    NextStepButton,
    Skeleton,
    ErrorText,
    type TokenInfoWithBalance,
    type NumberFormatValues,
    Switch,
} from "@carrot-kpi/ui";
import {
    type NamespacedTranslateFunction,
    type TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { type State } from "../../types";
import { Amount, formatCurrencyAmount } from "@carrot-kpi/sdk";
import { type Address, useAccount, useBalance, useChainId } from "wagmi";
import { ReactComponent as ArrowDown } from "../../../assets/arrow-down.svg";
import { USDValue } from "./usd-value";
import { formatUnits, parseUnits } from "viem";
import { RewardTokenPicker } from "./picker";
import { RewardsTable } from "./table";
import { NoSpecialCharactersTextInput } from "../no-special-characters-text-input";
import {
    MAX_KPI_TOKEN_NAME_CHARS,
    MAX_KPI_TOKEN_SYMBOL_CHARS,
} from "../../constants";

interface RewardsProps {
    t: NamespacedTranslateFunction;
    state: State;
    protocolFeePpm: bigint;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: () => void;
}

export const Rewards = ({
    t,
    state,
    protocolFeePpm,
    onStateChange,
    onNext,
}: RewardsProps): ReactElement => {
    const { address } = useAccount();
    const chainId = useChainId();

    const [disabled, setDisabled] = useState(true);

    const [rewardToken, setRewardToken] = useState<TokenInfoWithBalance | null>(
        null,
    );
    const [rewardAmount, setRewardAmount] = useState<bigint | null>(null);
    const [rewardMinimumPayout, setRewardMinimumPayout] = useState<
        bigint | null
    >(null);

    const [rewardTokenPickerOpen, setRewardTokenPickerOpen] = useState(false);
    const [addDisabled, setAddDisabled] = useState(true);
    const [amountErrorMessage, setAmountErrorMessage] = useState("");
    const [minimumPayoutErrorMessage, setMinimumPayoutErrorMessage] =
        useState("");
    const [protocolFeeAmount, setProtocolFeeAmount] = useState("");
    const [tokenNameErrorText, setTokenNameErrorText] = useState("");
    const [tokenSymbolErrorText, setTokenSymbolErrorText] = useState("");
    const [tokenSupplyErrorText, setTokenSupplyErrorText] = useState("");
    const [minimumPayoutEnabled, setMinimumPayoutEnabled] = useState(false);

    // fetch picked erc20 token balance
    const { data: rewardTokenBalance, isLoading: loadingRewardTokenBalance } =
        useBalance({
            address: !!rewardToken ? address : undefined,
            token: !!rewardToken ? (rewardToken.address as Address) : undefined,
        });

    useEffect(() => {
        setDisabled(
            state.rewards?.length === 0 ||
                !state.rewards ||
                !state.tokenName ||
                !state.tokenSymbol ||
                !state.tokenName.trim() ||
                state.tokenName.trim().length > MAX_KPI_TOKEN_NAME_CHARS ||
                !state.tokenSymbol.trim() ||
                state.tokenSymbol.trim().length > MAX_KPI_TOKEN_SYMBOL_CHARS ||
                !state.tokenSupply ||
                !state.tokenSupply ||
                parseFloat(state.tokenSupply) === 0,
        );
    }, [state]);

    useEffect(() => {
        if (!rewardToken || !rewardAmount) {
            setAddDisabled(true);
            return;
        }
        if (rewardMinimumPayout && rewardMinimumPayout >= rewardAmount) {
            setAddDisabled(true);
            return;
        }

        const rewardAmountPlusFees =
            rewardAmount + (rewardAmount * protocolFeePpm) / 1_000_000n;
        // check if the user has enough balance of the picked token
        if (
            rewardTokenBalance &&
            rewardTokenBalance.value < rewardAmountPlusFees
        ) {
            setAddDisabled(true);
            return;
        }

        setAddDisabled(
            !!state.rewards &&
                !!state.rewards.find(
                    (reward) =>
                        reward.address.toLowerCase() ===
                        rewardToken.address.toLowerCase(),
                ),
        );
    }, [
        rewardAmount,
        rewardMinimumPayout,
        rewardToken,
        rewardTokenBalance,
        protocolFeePpm,
        state.rewards,
    ]);

    useEffect(() => {
        if (!rewardToken || !rewardAmount) return;
        setProtocolFeeAmount(
            formatCurrencyAmount({
                amount: new Amount(
                    rewardToken,
                    (rewardAmount * protocolFeePpm) / 1_000_000n,
                ),
            }),
        );
    }, [rewardAmount, rewardToken, protocolFeePpm]);

    const handleOpenRewardTokenPicker = useCallback((): void => {
        setRewardTokenPickerOpen(true);
    }, []);

    const handleRewardTokenPickerDismiss = useCallback((): void => {
        setRewardTokenPickerOpen(false);
    }, []);

    const handleRewardPick = useCallback((token: TokenInfoWithBalance) => {
        setRewardToken(null);
        setRewardAmount(null);
        setRewardMinimumPayout(null);
        setRewardToken(token);
    }, []);

    const handleRewardAmountChange = useCallback(
        (rawNewAmount: NumberFormatValues): void => {
            if (!rewardToken || !rewardTokenBalance) return;
            const newAmount = parseUnits(
                rawNewAmount.value,
                rewardToken.decimals,
            );
            const newAmountPlusFees =
                newAmount + (newAmount * protocolFeePpm) / 1_000_000n;

            let errorMessage = "";
            if (!newAmount) errorMessage = t("error.rewards.empty");
            else if (rewardTokenBalance.value < newAmountPlusFees)
                errorMessage = t("error.rewards.insufficient", {
                    amountPlusFees: formatCurrencyAmount({
                        amount: new Amount(rewardToken, newAmountPlusFees),
                        withSymbol: false,
                    }),
                    symbol: rewardToken.symbol,
                });
            setAmountErrorMessage(errorMessage);

            if (rewardMinimumPayout !== null && rewardMinimumPayout > 0) {
                setMinimumPayoutErrorMessage(
                    newAmount > rewardMinimumPayout
                        ? ""
                        : "error.rewards.minimumPayoutTooHigh",
                );
            }

            setRewardAmount(newAmount);
        },
        [
            protocolFeePpm,
            rewardMinimumPayout,
            rewardToken,
            rewardTokenBalance,
            t,
        ],
    );

    const handleRewardMinimumPayoutChange = useCallback(
        (rawNewMinimumPayout: NumberFormatValues): void => {
            if (!rewardToken || !rewardAmount) return;

            const newMinimumPayout = parseUnits(
                rawNewMinimumPayout.value,
                rewardToken.decimals,
            );
            const amountMinusFees =
                rewardAmount - (rewardAmount * protocolFeePpm) / 1_000_000n;

            let errorMessage = "";
            if (newMinimumPayout === null)
                errorMessage = t("error.rewards.minimumPayoutEmpty");
            else if (!amountMinusFees || newMinimumPayout >= amountMinusFees)
                errorMessage = t("error.rewards.minimumPayoutTooHigh");
            setMinimumPayoutErrorMessage(errorMessage);

            setRewardMinimumPayout(newMinimumPayout);
        },
        [rewardAmount, rewardToken, protocolFeePpm, t],
    );

    const handleRewardAdd = useCallback((): void => {
        if (!chainId || !rewardToken || !rewardAmount) return;
        onStateChange((state) => ({
            ...state,
            rewards: [
                ...(state.rewards || []),
                {
                    chainId,
                    address: rewardToken.address as Address,
                    decimals: rewardToken.decimals,
                    symbol: rewardToken.symbol,
                    name: rewardToken.name,
                    logoURI: rewardToken.logoURI,
                    amount: rewardAmount.toString(),
                    minimumPayout: !rewardMinimumPayout
                        ? "0"
                        : rewardMinimumPayout.toString(),
                },
            ],
        }));
        setRewardAmount(null);
        setRewardMinimumPayout(null);
        setRewardToken(null);
        setMinimumPayoutEnabled(false);
    }, [
        chainId,
        onStateChange,
        rewardAmount,
        rewardMinimumPayout,
        rewardToken,
    ]);

    const handleRemoveReward = useCallback(
        (index: number) => {
            if (!state.rewards) return;
            onStateChange((state) => ({
                ...state,
                rewards: state.rewards?.filter((_, i) => i !== index),
            }));
        },
        [onStateChange, state.rewards],
    );

    const handleMaxClick = useCallback(() => {
        if (!rewardTokenBalance || !rewardToken) return;
        const stringValue = formatUnits(
            rewardTokenBalance.value,
            rewardToken.decimals,
        );
        handleRewardAmountChange({
            floatValue: parseFloat(stringValue),
            formattedValue: rewardTokenBalance.formatted,
            value: stringValue,
        });
    }, [rewardTokenBalance, rewardToken, handleRewardAmountChange]);

    const handleTokenNameChange = useCallback(
        (value: string) => {
            setTokenNameErrorText(
                !value
                    ? t("error.erc20.name.empty")
                    : value.trim().length > MAX_KPI_TOKEN_NAME_CHARS
                      ? t("error.erc20.name.tooLong", {
                            chars: MAX_KPI_TOKEN_NAME_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({
                ...state,
                tokenName: value,
            }));
        },
        [onStateChange, t],
    );

    const handleTokenSymbolChange = useCallback(
        (value: string) => {
            setTokenSymbolErrorText(
                !value
                    ? t("error.erc20.symbol.empty")
                    : value.trim().length > MAX_KPI_TOKEN_SYMBOL_CHARS
                      ? t("error.erc20.symbol.tooLong", {
                            chars: MAX_KPI_TOKEN_SYMBOL_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({
                ...state,
                tokenSymbol: value,
            }));
        },
        [onStateChange, t],
    );

    const handleTokenSupplyChange = useCallback(
        (value: NumberFormatValues) => {
            setTokenSupplyErrorText(
                !value || !value.value || parseUnits(value.value, 18) === 0n
                    ? t("error.erc20.supply.zero")
                    : "",
            );
            onStateChange((state) => ({
                ...state,
                tokenSupply: parseUnits(value.value, 18).toString(),
            }));
        },
        [onStateChange, t],
    );

    const handleMinimumPayoutToggle = useCallback((value: boolean) => {
        setMinimumPayoutEnabled(value);
        setRewardMinimumPayout(null);
    }, []);

    return (
        <>
            <div className="flex flex-col md:flex-row w-full gap-4 mb-4">
                <NoSpecialCharactersTextInput
                    data-testid="rewards-step-token-name-input"
                    label={t("general.label.token.name")}
                    placeholder={"Example"}
                    onChange={handleTokenNameChange}
                    value={state.tokenName}
                    error={!!tokenNameErrorText}
                    errorText={tokenNameErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NoSpecialCharactersTextInput
                    data-testid="rewards-step-token-symbol-input"
                    label={t("general.label.token.symbol")}
                    placeholder={"XMPL"}
                    onChange={handleTokenSymbolChange}
                    value={state.tokenSymbol}
                    error={!!tokenSymbolErrorText}
                    errorText={tokenSymbolErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NumberInput
                    data-testid="rewards-step-token-supply-input"
                    allowNegative={false}
                    label={t("general.label.token.supply")}
                    placeholder={"1,000,000"}
                    onValueChange={handleTokenSupplyChange}
                    value={
                        state.tokenSupply
                            ? formatUnits(BigInt(state.tokenSupply), 18)
                            : null
                    }
                    error={!!tokenSupplyErrorText}
                    errorText={tokenSupplyErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
            </div>
            <div data-testid="rewards-picker-modal-container">
                <RewardTokenPicker
                    t={t}
                    open={rewardTokenPickerOpen}
                    onDismiss={handleRewardTokenPickerDismiss}
                    token={rewardToken}
                    onChange={handleRewardPick}
                />
            </div>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <div className="rounded-xxl border border-black p-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div
                                        data-testid="rewards-step-open-rewards-picker-button"
                                        onClick={handleOpenRewardTokenPicker}
                                        className="cursor-pointer w-4/5"
                                    >
                                        <TextInput
                                            label=""
                                            autoComplete="off"
                                            placeholder={t(
                                                "label.rewards.picker.token.pick",
                                            )}
                                            className={{
                                                input: "w-full cursor-pointer",
                                            }}
                                            readOnly
                                            value={rewardToken?.symbol || ""}
                                        />
                                    </div>
                                    <NumberInput
                                        data-testid="rewards-step-reward-amount-input"
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "w-full border-none text-right p-0",
                                        }}
                                        variant="xl"
                                        allowNegative={false}
                                        disabled={!!!rewardToken}
                                        value={
                                            rewardToken && rewardAmount !== null
                                                ? formatUnits(
                                                      rewardAmount,
                                                      rewardToken.decimals,
                                                  )
                                                : ""
                                        }
                                        onValueChange={handleRewardAmountChange}
                                    />
                                </div>
                                <div className="flex justify-between items-center h-5">
                                    {rewardToken && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                {loadingRewardTokenBalance ||
                                                !rewardTokenBalance ? (
                                                    <Skeleton variant="sm" />
                                                ) : (
                                                    <>
                                                        <Typography variant="sm">
                                                            {t(
                                                                "label.rewards.balance",
                                                            )}
                                                            :{" "}
                                                        </Typography>
                                                        <Typography variant="sm">
                                                            {formatUnits(
                                                                rewardTokenBalance.value,
                                                                rewardTokenBalance.decimals,
                                                            )}
                                                        </Typography>
                                                        <Typography
                                                            variant="sm"
                                                            className={{
                                                                root: "text-orange cursor-pointer",
                                                            }}
                                                            uppercase
                                                            onClick={
                                                                handleMaxClick
                                                            }
                                                        >
                                                            {t(
                                                                "label.rewards.picker.balance.max",
                                                            )}
                                                        </Typography>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex justify-end h-5">
                                                <USDValue
                                                    token={rewardToken}
                                                    amount={rewardAmount}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center justify-between h-8">
                                    <div className="flex gap-3 items-center">
                                        <Typography variant="sm">
                                            {t(
                                                "label.rewards.picker.minimum.payout.toggle",
                                            )}
                                        </Typography>
                                        <Switch
                                            data-testid="rewards-step-minimum-payout-switch"
                                            onChange={handleMinimumPayoutToggle}
                                            checked={minimumPayoutEnabled}
                                        />
                                    </div>
                                    {minimumPayoutEnabled && (
                                        <>
                                            <div className="flex-col gap-2 pt-1.5">
                                                <div className="flex items-center justify-between">
                                                    <NumberInput
                                                        data-testid="rewards-step-reward-minimum-payout-input"
                                                        label=""
                                                        placeholder="0.0"
                                                        className={{
                                                            input: "border-none text-right w-full p-0",
                                                        }}
                                                        variant="base"
                                                        disabled={
                                                            !!!rewardToken
                                                        }
                                                        allowNegative={false}
                                                        value={
                                                            rewardToken &&
                                                            rewardMinimumPayout !==
                                                                null
                                                                ? formatUnits(
                                                                      rewardMinimumPayout,
                                                                      rewardToken.decimals,
                                                                  )
                                                                : ""
                                                        }
                                                        onValueChange={
                                                            handleRewardMinimumPayoutChange
                                                        }
                                                    />
                                                </div>
                                                <div className="flex justify-end h-5">
                                                    <USDValue
                                                        token={rewardToken}
                                                        amount={
                                                            rewardMinimumPayout
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <Typography variant="sm">
                            {t("label.rewards.picker.fee", {
                                fee: `${Number(protocolFeePpm) / 10_000}% ${
                                    protocolFeeAmount && rewardToken
                                        ? `(${protocolFeeAmount})`
                                        : ""
                                }`,
                            })}
                        </Typography>
                    </div>
                    <div className="flex flex-col gap-3 items-start">
                        <Button
                            data-testid="rewards-step-add-reward-button"
                            size="small"
                            icon={ArrowDown}
                            onClick={handleRewardAdd}
                            disabled={addDisabled}
                            className={{ root: "w-full" }}
                        >
                            {t("label.rewards.picker.apply")}
                        </Button>
                        {(!!amountErrorMessage ||
                            !!minimumPayoutErrorMessage) && (
                            <div className="flex flex-col">
                                {amountErrorMessage && (
                                    <ErrorText>{amountErrorMessage}</ErrorText>
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
                <RewardsTable
                    t={t}
                    rewards={state.rewards}
                    noUSDValue
                    noFees
                    protocolFeePpm={protocolFeePpm}
                    onRemove={handleRemoveReward}
                />
            </div>
            <NextStepButton
                data-testid="rewards-step-next-button"
                onClick={onNext}
                disabled={disabled}
                className={{ root: "w-44 rounded-3xl" }}
            >
                {t("next")}
            </NextStepButton>
        </>
    );
};
