import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useMemo, useState } from "react";
import {
    usePrepareContractWrite,
    erc20ABI,
    useContractWrite,
    Address,
} from "wagmi";
import { CollateralData } from "../../types";

interface CollateralApprovalProps {
    t: NamespacedTranslateFunction;
    toApprove: CollateralData[];
    spender: Address;
    onApproved: () => void;
}

export const CollateralApproval = ({
    t,
    toApprove,
    spender,
    onApproved,
}: CollateralApprovalProps): ReactElement => {
    const [approving, setApproving] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const approvingCollateral = useMemo(() => {
        return toApprove.length > 0 ? toApprove[currentIndex] : undefined;
    }, [currentIndex, toApprove]);

    const { config } = usePrepareContractWrite({
        address: approvingCollateral?.amount.currency.address,
        abi: erc20ABI,
        functionName: "approve",
        args: approvingCollateral && [spender, approvingCollateral.amount.raw],
    });
    const { writeAsync: approveAsync } = useContractWrite(config);

    const handleClick = useCallback(() => {
        if (!approveAsync) return;
        let cancelled = false;
        const approve = async () => {
            if (!cancelled) setApproving(true);
            try {
                const tx = await approveAsync();
                await tx.wait();
                if (cancelled) return;
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
    }, [approveAsync, currentIndex, onApproved, toApprove.length]);

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
            disabled={!approvingCollateral}
            loading={approving}
        >
            {message}
        </Button>
    );
};
