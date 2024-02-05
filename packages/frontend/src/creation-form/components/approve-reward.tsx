import { type NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { type ReactElement, useCallback, useState } from "react";
import {
    useWriteContract,
    usePublicClient,
    useChainId,
    useSimulateContract,
} from "wagmi";
import { erc20Abi, type Address, type TransactionReceipt } from "viem";
import type { Reward } from "../types";
import { getRewardAmountPlusFees } from "../../utils/rewards";
import { Amount, Token, formatCurrencyAmount } from "@carrot-kpi/sdk";

interface ApproveRewardProps {
    t: NamespacedTranslateFunction;
    reward: Reward;
    protocolFeePpm: bigint;
    index: number;
    totalAmount: number;
    spender: Address;
    onApprove: (receipt: TransactionReceipt) => void;
}

export const ApproveReward = ({
    t,
    reward,
    protocolFeePpm,
    index,
    totalAmount,
    spender,
    onApprove,
}: ApproveRewardProps): ReactElement => {
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const [approving, setApproving] = useState(false);

    const rewardPlusFees = new Amount(
        new Token(
            reward.chainId,
            reward.address,
            reward.decimals,
            reward.symbol,
            reward.name,
        ),
        getRewardAmountPlusFees({
            amount: BigInt(reward.amount),
            protocolFeePpm,
        }),
    );

    const { data, isLoading: loadingApproveConfig } = useSimulateContract({
        chainId,
        address: reward.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, rewardPlusFees.raw],
        query: {
            enabled: !!spender && !!reward.address,
        },
    });
    const { writeContractAsync: approveAsync, isPending: signingTransaction } =
        useWriteContract();

    const handleClick = useCallback(() => {
        if (!approveAsync || !publicClient) return;
        let cancelled = false;
        const approve = async () => {
            setApproving(true);
            try {
                const tx = await approveAsync(data!.request);
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx,
                });
                if (!cancelled) onApprove(receipt);
            } catch (error) {
                console.warn("could not approve reward", error);
            } finally {
                setApproving(false);
            }
        };
        void approve();
        return () => {
            cancelled = true;
        };
    }, [approveAsync, data, onApprove, publicClient]);

    const formattedRewardWithFees = formatCurrencyAmount({
        amount: rewardPlusFees,
        withSymbol: false,
    });
    return (
        <Button
            data-testid={`approve-reward-${reward.address}`}
            size="small"
            onClick={handleClick}
            disabled={!approveAsync}
            loading={loadingApproveConfig || signingTransaction || approving}
            className={{ root: "w-full" }}
        >
            {signingTransaction || approving
                ? t("label.rewards.approving", {
                      amount: formattedRewardWithFees,
                      symbol: reward.symbol,
                      currentIndex: index,
                      totalAmount,
                  })
                : t("label.rewards.approve", {
                      amount: formattedRewardWithFees,
                      symbol: reward.symbol,
                      currentIndex: index,
                      totalAmount,
                  })}
        </Button>
    );
};
