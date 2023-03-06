import { useCallback, useState } from "react";
import { Typography, ERC20TokenLogo, Popover, Skeleton } from "@carrot-kpi/ui";
import { CollateralData } from "../../../creation-form/types";
import { useNetwork } from "wagmi";

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
    const { chain } = useNetwork();
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
                {loading || !collateral ? (
                    <Skeleton circular width="20px" />
                ) : (
                    <ERC20TokenLogo
                        // TODO: update the UI lib to accept undefined
                        chainId={chain?.id || 1}
                        address={collateral.amount.currency.address}
                        size="sm"
                    />
                )}
                {loading || !collateral ? (
                    <Skeleton width="40px" />
                ) : (
                    <Typography
                        className={{
                            root: "inline-block",
                        }}
                    >
                        {(minimumPayout
                            ? collateral.minimumPayout
                            : collateral.amount
                        ).toFixed(4)}
                    </Typography>
                )}
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
