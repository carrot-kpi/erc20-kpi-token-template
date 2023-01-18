import { Button } from "@carrot-kpi/ui";
import { ReactElement, useCallback } from "react";
import {
    usePrepareContractWrite,
    erc20ABI,
    useContractWrite,
    useToken,
    Address,
} from "wagmi";
import { CollateralData } from "../../types";
import { BigNumber } from "ethers";

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
    const { data, isLoading } = useToken({ address: collateral.address });
    const { config } = usePrepareContractWrite({
        address: collateral.address,
        abi: erc20ABI,
        functionName: "approve",
        // TODO: convert this to wei
        args: [spender, BigNumber.from(collateral.amount.value)],
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
