import { type NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { type ReactElement, useCallback } from "react";
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

interface ApproveRewardProps {
    t: NamespacedTranslateFunction;
    reward: Reward;
    index: number;
    totalAmount: number;
    spender: Address;
    onApprove: (receipt: TransactionReceipt) => void;
}

export const ApproveReward = ({
    t,
    reward,
    index,
    totalAmount,
    spender,
    onApprove,
}: ApproveRewardProps): ReactElement => {
    const publicClient = usePublicClient();
    const chainId = useChainId();

    const { config, isLoading: loadingApproveConfig } = usePrepareContractWrite(
        {
            chainId,
            address: reward.address,
            abi: erc20ABI,
            functionName: "approve",
            args: [spender, BigInt(reward.amount)],
        },
    );
    const { writeAsync: approveAsync, isLoading: approving } =
        useContractWrite(config);

    const handleClick = useCallback(() => {
        if (!approveAsync) return;
        let cancelled = false;
        const approve = async () => {
            const tx = await approveAsync();
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx.hash,
            });
            if (!cancelled) onApprove(receipt);
        };
        void approve();
        return () => {
            cancelled = true;
        };
    }, [approveAsync, onApprove, publicClient]);

    return (
        <Button
            onClick={handleClick}
            disabled={!approveAsync}
            loading={loadingApproveConfig || approving}
        >
            {approving
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
