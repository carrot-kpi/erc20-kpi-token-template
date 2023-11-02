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
} from "@carrot-kpi/ui";
import {
    type NamespacedTranslateFunction,
    type TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { type State } from "../../types";
import { Amount, formatCurrencyAmount } from "@carrot-kpi/sdk";
import { type Address, useAccount, useBalance, useChainId } from "wagmi";
import { PROTOCOL_FEE_BPS } from "../../constants";
import { ReactComponent as ArrowDown } from "../../../assets/arrow-down.svg";
import { USDValue } from "./usd-value";
import { formatUnits, parseUnits } from "viem";
import { RewardTokenPicker } from "./picker";
import { RewardsTable } from "./table";

interface RewardsProps {
    t: NamespacedTranslateFunction;
    state: State;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: () => void;
}

export const Rewards = ({
    t,
    state,
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

    // fetch picked erc20 token balance
    const { data: rewardTokenBalance, isLoading: loadingRewardTokenBalance } =
        useBalance({
            address: !!rewardToken ? address : undefined,
            token: !!rewardToken ? (rewardToken.address as Address) : undefined,
        });

    useEffect(() => {
        setDisabled(state.rewards?.length === 0);
    }, [state.rewards]);

    useEffect(() => {
        if (!rewardToken || !rewardAmount) {
            setAddDisabled(true);
            return;
        }
        // check if the user has enough balance of the picked token
        if (rewardTokenBalance && rewardTokenBalance.value < rewardAmount) {
            setAddDisabled(true);
            return;
        }
        const amountMinusFees =
            rewardAmount - (rewardAmount * PROTOCOL_FEE_BPS) / 10_000n;
        if (
            !amountMinusFees ||
            (rewardMinimumPayout !== null &&
                rewardMinimumPayout >= amountMinusFees)
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
        state.rewards,
    ]);

    useEffect(() => {
        if (!rewardToken || !rewardAmount) return;
        setProtocolFeeAmount(
            formatCurrencyAmount({
                amount: new Amount(
                    rewardToken,
                    (rewardAmount * PROTOCOL_FEE_BPS) / 10_000n,
                ),
            }),
        );
    }, [rewardAmount, rewardToken]);

    const handleOpenRewardTokenPicker = useCallback((): void => {
        setRewardTokenPickerOpen(true);
    }, []);

    const handleRewardTokenPickerDismiss = useCallback((): void => {
        setRewardTokenPickerOpen(false);
    }, []);

    const handleRewardAmountChange = useCallback(
        (rawNewAmount: NumberFormatValues): void => {
            if (!rewardToken || !rewardTokenBalance) return;
            const newAmount = parseUnits(
                rawNewAmount.value,
                rewardToken.decimals,
            );

            let errorMessage = "";
            if (!newAmount) errorMessage = t("error.rewards.empty");
            else if (rewardTokenBalance.value < newAmount)
                errorMessage = t("error.rewards.insufficient");
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
        [rewardMinimumPayout, rewardToken, rewardTokenBalance, t],
    );

    const handleRewardMinimumPayoutChange = useCallback(
        (rawNewMinimumPayout: NumberFormatValues): void => {
            if (!rewardToken || !rewardAmount) return;

            const newMinimumPayout = parseUnits(
                rawNewMinimumPayout.value,
                rewardToken.decimals,
            );
            const amountMinusFees =
                rewardAmount - (rewardAmount * PROTOCOL_FEE_BPS) / 10_000n;

            let errorMessage = "";
            if (newMinimumPayout === null)
                errorMessage = t("error.rewards.minimumPayoutEmpty");
            else if (!amountMinusFees || newMinimumPayout >= amountMinusFees)
                errorMessage = t("error.rewards.minimumPayoutTooHigh");
            setMinimumPayoutErrorMessage(errorMessage);

            setRewardMinimumPayout(newMinimumPayout);
        },
        [rewardAmount, rewardToken, t],
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

    return (
        <>
            <RewardTokenPicker
                t={t}
                open={rewardTokenPickerOpen}
                onDismiss={handleRewardTokenPickerDismiss}
                token={rewardToken}
                onChange={setRewardToken}
            />
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <div className="rounded-xxl border border-black p-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div
                                        onClick={handleOpenRewardTokenPicker}
                                        className="cursor-pointer w-3/4"
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
                                                : null
                                        }
                                        onValueChange={handleRewardAmountChange}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Typography variant="sm">
                                            {t("label.rewards.balance")}:{" "}
                                        </Typography>
                                        {loadingRewardTokenBalance ? (
                                            <Skeleton variant="sm" />
                                        ) : !!rewardTokenBalance ? (
                                            <>
                                                <Typography variant="sm">
                                                    {
                                                        rewardTokenBalance.formatted
                                                    }
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
                                                        "label.rewards.picker.balance.max",
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
                                            token={rewardToken}
                                            amount={rewardAmount}
                                        />
                                    </div>
                                </div>
                                <div className="h-px w-full bg-black" />
                                <div className="flex-col gap-2 pt-1.5">
                                    <div className="flex items-center justify-between">
                                        <Typography>
                                            {t(
                                                "label.rewards.picker.minimum.payout",
                                            )}
                                        </Typography>
                                        <NumberInput
                                            label=""
                                            placeholder="0.0"
                                            className={{
                                                input: "border-none text-right w-full p-0",
                                            }}
                                            variant="xl"
                                            disabled={!!!rewardToken}
                                            allowNegative={false}
                                            value={
                                                rewardToken &&
                                                rewardMinimumPayout !== null
                                                    ? formatUnits(
                                                          rewardMinimumPayout,
                                                          rewardToken.decimals,
                                                      )
                                                    : null
                                            }
                                            onValueChange={
                                                handleRewardMinimumPayoutChange
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-end h-5">
                                        <USDValue
                                            token={rewardToken}
                                            amount={rewardMinimumPayout}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Typography variant="sm">
                                        {t("label.rewards.picker.fee")}
                                    </Typography>
                                    <Typography
                                        variant="sm"
                                        className={{ root: "text-right" }}
                                    >
                                        {Number(PROTOCOL_FEE_BPS) / 100}%{" "}
                                        {protocolFeeAmount &&
                                            rewardToken &&
                                            `(${protocolFeeAmount})`}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <Button
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
                    onRemove={handleRemoveReward}
                />
            </div>
            <NextStepButton onClick={onNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </>
    );
};
