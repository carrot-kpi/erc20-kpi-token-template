import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    TxType,
} from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { type ReactElement, useCallback, useState, useEffect } from "react";
import { type Address, useContractReads, useAccount } from "wagmi";
import { zeroAddress, type TransactionReceipt } from "viem";
import type { Reward } from "../types";
import { ERC20_ABI } from "@carrot-kpi/sdk";
import { ApproveReward } from "./approve-button";
import { dateToUnixTimestamp } from "../../utils/dates";

interface ApproveRewardsProps {
    t: NamespacedTranslateFunction;
    rewards?: Reward[];
    owner?: Address;
    spender: Address;
    onApprove: () => void;
    onTx: KPITokenCreationFormProps<object>["onTx"];
}

export const ApproveRewards = ({
    t,
    rewards,
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
                rewards?.map((reward) => {
                    return {
                        address: reward.address,
                        abi: ERC20_ABI,
                        functionName: "allowance",
                        args: [connectedAddress, spender],
                    };
                }),
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
        setToApprove(newToApprove);
    }, [allowances, rewards]);

    const handleApprove = useCallback(
        (receipt: TransactionReceipt) => {
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

    return loadingAllowances || !currentlyApprovingReward ? (
        <Button loading />
    ) : allApproved ? (
        <Button disabled>{t("label.rewards.approve.done")}</Button>
    ) : (
        <ApproveReward
            t={t}
            reward={currentlyApprovingReward}
            spender={spender}
            onApprove={handleApprove}
        />
    );
};
