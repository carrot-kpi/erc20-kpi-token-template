import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    TxType,
} from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { type ReactElement, useCallback, useMemo, useState } from "react";
import {
    usePrepareContractWrite,
    erc20ABI,
    useContractWrite,
    type Address,
    usePublicClient,
    useNetwork,
} from "wagmi";
import { zeroAddress } from "viem";
import { unixTimestamp } from "../../../utils/dates";
import type { CollateralData } from "../../types";

interface ApproveCollateralsButtonProps {
    t: NamespacedTranslateFunction;
    toApprove: CollateralData[];
    spender: Address;
    onApproved: () => void;
    onTx: KPITokenCreationFormProps["onTx"];
}

export const ApproveCollateralsButton = ({
    t,
    toApprove,
    spender,
    onApproved,
    onTx,
}: ApproveCollateralsButtonProps): ReactElement => {
    const publicClient = usePublicClient();
    const { chain } = useNetwork();

    const [approving, setApproving] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const approvingCollateral = useMemo(() => {
        return toApprove.length > 0 ? toApprove[currentIndex] : undefined;
    }, [currentIndex, toApprove]);

    const { config } = usePrepareContractWrite({
        chainId: chain?.id,
        address: approvingCollateral?.amount.currency.address,
        abi: erc20ABI,
        functionName: "approve",
        args: approvingCollateral
            ? [spender, approvingCollateral.amount.raw]
            : undefined,
        enabled: !!chain?.id && !!approvingCollateral,
    });
    const { writeAsync: approveAsync } = useContractWrite(config);

    const handleClick = useCallback(() => {
        if (!approveAsync || !approvingCollateral) return;
        let cancelled = false;
        const approve = async () => {
            if (!cancelled) setApproving(true);
            try {
                const tx = await approveAsync();
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx.hash,
                });
                if (cancelled) return;
                onTx({
                    type: TxType.ERC20_APPROVAL,
                    from: receipt.from,
                    hash: tx.hash,
                    payload: {
                        amount: approvingCollateral.amount.raw,
                        spender,
                        token: approvingCollateral.amount.currency.address,
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
                    timestamp: unixTimestamp(new Date()),
                });
                if (currentIndex < toApprove.length - 1)
                    setCurrentIndex(currentIndex + 1);
                else onApproved();
            } finally {
                if (!cancelled) setApproving(false);
            }
        };
        void approve();
        return () => {
            cancelled = true;
        };
    }, [
        approveAsync,
        approvingCollateral,
        currentIndex,
        onApproved,
        onTx,
        publicClient,
        spender,
        toApprove.length,
    ]);

    let message;
    if (!approvingCollateral) message = t("label.collateral.approve.done");
    else if (approving)
        message = t("label.collateral.approving", {
            symbol: approvingCollateral.amount.currency.symbol,
            currentIndex: currentIndex + 1,
            totalAmount: toApprove.length,
        });
    else
        message = t("label.collateral.approve", {
            symbol: approvingCollateral.amount.currency.symbol,
            currentIndex: currentIndex + 1,
            totalAmount: toApprove.length,
        });

    return (
        <Button
            onClick={handleClick}
            disabled={!approvingCollateral || !approveAsync}
            loading={approving}
        >
            {message}
        </Button>
    );
};
