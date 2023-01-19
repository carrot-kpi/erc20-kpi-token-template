import { Button } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useMemo } from "react";
import {
    usePrepareContractWrite,
    erc20ABI,
    useContractWrite,
    useToken,
    Address,
} from "wagmi";
import { CollateralData } from "../../types";

interface CollateralApprovalProps {
    disabled: boolean;
    collateral: CollateralData;
    spender: Address;
}

export const CollateralApproval = ({
    disabled,
    collateral,
    spender,
}: CollateralApprovalProps): ReactElement => {
    const collateralAddress = useMemo(() => {
        return collateral.amount.currency.address as Address;
    }, [collateral.amount.currency.address]);
    const { data, isLoading } = useToken({ address: collateralAddress });
    const { config } = usePrepareContractWrite({
        address: collateralAddress,
        abi: erc20ABI,
        functionName: "approve",
        // TODO: convert this to wei
        args: [spender, collateral.amount.raw],
    });
    const { write } = useContractWrite(config);

    const handleClick = useCallback(() => {
        if (write) write();
    }, [write]);

    return (
        <Button onClick={handleClick} disabled={disabled || isLoading || !data}>
            {isLoading || !data
                ? "Loading..."
                : `Approve ${collateral.amount.toString()} ${data.symbol}`}
        </Button>
    );
};
