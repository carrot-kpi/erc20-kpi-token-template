import { useCallback, useState } from "react";
import { Typography, Popover } from "@carrot-kpi/ui";
import type { CollateralData } from "../../../creation-form/types";
import { TokenAmount } from "../token-amount";

interface CollateralRowProps {
    loading?: boolean;
    collateral?: CollateralData;
    minimumPayout?: boolean;
}

export const CollateralRow = ({
    loading,
    collateral,
    minimumPayout,
}: CollateralRowProps) => {
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

    const handleMouseEnter = useCallback(() => {
        setOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <div
                className="flex cursor-pointer gap-2"
                ref={setAnchor}
                onMouseEnter={collateral && handleMouseEnter}
                onMouseLeave={collateral && handleMouseLeave}
            >
                <TokenAmount
                    loading={loading || !collateral}
                    amount={
                        minimumPayout
                            ? collateral?.minimumPayout
                            : collateral?.amount
                    }
                />
            </div>
            {collateral && (
                <Popover anchor={anchor} open={open} placement="bottom">
                    <Typography className={{ root: "p-3" }}>
                        {collateral.amount.currency.name} (
                        {collateral.amount.currency.symbol})
                    </Typography>
                </Popover>
            )}
        </>
    );
};
