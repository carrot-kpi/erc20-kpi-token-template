import { type NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { type ReactElement, useCallback, useState } from "react";
import {
    usePrepareContractWrite,
    erc20ABI,
    useContractWrite,
    type Address,
    usePublicClient,
    useChainId,
} from "wagmi";
import { type TransactionReceipt } from "viem";
import type { Reward } from "../types";
import { getRewardAmountPlusFees } from "../../utils/rewards";

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

    const { config, isLoading: loadingApproveConfig } = usePrepareContractWrite(
        {
            chainId,
            address: reward.address,
            abi: erc20ABI,
            functionName: "approve",
            args: [
                spender,
                getRewardAmountPlusFees({
                    amount: BigInt(reward.amount),
                    protocolFeePpm,
                }),
            ],
            enabled: !!spender && !!reward.address,
        },
    );
    const { writeAsync: approveAsync, isLoading: signingTransaction } =
        useContractWrite(config);

    const handleClick = useCallback(() => {
        if (!approveAsync) return;
        let cancelled = false;
        const approve = async () => {
            setApproving(true);
            try {
                const tx = await approveAsync();
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx.hash,
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
    }, [approveAsync, onApprove, publicClient]);

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
                      symbol: reward.symbol,
                      currentIndex: index,
                      totalAmount,
                  })
                : t("label.rewards.approve", {
                      symbol: reward.symbol,
                      currentIndex: index,
                      totalAmount,
                  })}
        </Button>
    );
};
