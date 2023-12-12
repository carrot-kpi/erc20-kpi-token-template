import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    TxType,
} from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { type ReactElement, useCallback, useState, useEffect } from "react";
import { type Address, useContractReads, useAccount, erc20ABI } from "wagmi";
import { zeroAddress, type TransactionReceipt } from "viem";
import type { Reward } from "../types";
import { ApproveReward } from "./approve-reward";
import { dateToUnixTimestamp } from "../../utils/dates";

interface ApproveRewardsProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    rewards?: Reward[];
    protocolFeePpm: bigint;
    spender?: Address;
    onApprove: () => void;
    onTx: KPITokenCreationFormProps<object>["onTx"];
}

export const ApproveRewards = ({
    t,
    loading,
    rewards,
    protocolFeePpm,
    spender,
    onApprove,
    onTx,
}: ApproveRewardsProps): ReactElement => {
    const { address: connectedAddress } = useAccount();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [toApprove, setToApprove] = useState<Reward[]>(rewards || []);
    const [allApproved, setAllApproved] = useState(false);
    const currentlyApprovingReward: Reward | undefined =
        toApprove[currentIndex];

    const { data: allowances, isLoading: loadingAllowances } = useContractReads(
        {
            contracts:
                connectedAddress &&
                spender &&
                rewards?.map((reward) => {
                    return {
                        address: reward.address,
                        abi: erc20ABI,
                        functionName: "allowance",
                        args: [connectedAddress, spender],
                    };
                }),
            enabled: !!connectedAddress && !!rewards && !!spender,
        },
    );

    useEffect(() => {
        if (!allowances || !rewards || allowances.length !== rewards.length)
            return;
        const newToApprove = [];
        for (let i = 0; i < rewards.length; i++) {
            const reward = rewards[i];
            if (
                allowances[i]?.result === null ||
                allowances[i]?.result === undefined
            )
                return;
            if ((allowances[i].result as bigint) >= BigInt(reward.amount))
                continue;
            newToApprove.push(reward);
        }
        if (newToApprove.length === 0) {
            setAllApproved(true);
            return;
        }
        setToApprove(newToApprove);
    }, [allowances, rewards]);

    const handleApprove = useCallback(
        (receipt: TransactionReceipt) => {
            if (!spender) {
                console.warn(
                    "spender is undefined while handling approval: inconsistent state",
                );
                return;
            }
            onTx({
                type: TxType.ERC20_APPROVAL,
                from: receipt.from,
                hash: receipt.transactionHash,
                payload: {
                    amount: BigInt(currentlyApprovingReward.amount),
                    spender,
                    token: currentlyApprovingReward.address,
                },
                receipt: {
                    from: receipt.from,
                    transactionIndex: receipt.transactionIndex,
                    blockHash: receipt.blockHash,
                    transactionHash: receipt.transactionHash,
                    to: receipt.to || zeroAddress,
                    contractAddress: receipt.contractAddress || zeroAddress,
                    blockNumber: Number(receipt.blockNumber),
                    status: receipt.status === "success" ? 1 : 0,
                },
                timestamp: dateToUnixTimestamp(new Date()),
            });

            const updatedIndex = currentIndex + 1;
            if (!toApprove[updatedIndex]) {
                onApprove();
                setAllApproved(true);
            } else setCurrentIndex(updatedIndex);
        },
        [
            currentIndex,
            currentlyApprovingReward?.address,
            currentlyApprovingReward?.amount,
            onApprove,
            onTx,
            spender,
            toApprove,
        ],
    );

    return loadingAllowances ||
        !currentlyApprovingReward ||
        loading ||
        !spender ? (
        <Button size="small" loading className={{ root: "w-full" }}>
            {t("label.rewards.approve.loading")}
        </Button>
    ) : allApproved ? (
        <Button size="small" disabled className={{ root: "w-full" }}>
            {t("label.rewards.approve.done")}
        </Button>
    ) : (
        <ApproveReward
            t={t}
            reward={currentlyApprovingReward}
            protocolFeePpm={protocolFeePpm}
            index={currentIndex + 1}
            totalAmount={rewards?.length || 0}
            spender={spender}
            onApprove={handleApprove}
        />
    );
};
