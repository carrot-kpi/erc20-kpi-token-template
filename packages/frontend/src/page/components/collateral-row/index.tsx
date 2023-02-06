import { useCallback, useState } from "react";
import { Typography, ERC20TokenLogo, Popover } from "@carrot-kpi/ui";
import { CollateralData } from "../../../creation-form/types";
import { useNetwork } from "wagmi";

interface CollateralRowProps {
    collateral: CollateralData;
    display: keyof Pick<CollateralData, "amount" | "minimumPayout">;
}

export const CollateralRow = ({ collateral, display }: CollateralRowProps) => {
    const { chain } = useNetwork();
    const { address, symbol, name } = collateral[display].currency;
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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <ERC20TokenLogo
                    // TODO: update the UI lib to accept undefined
                    chainId={chain?.id || 1}
                    address={address}
                    size="sm"
                />
                <Typography
                    className={{
                        root: "inline-block",
                    }}
                >
                    {collateral[display].toString()}
                </Typography>
            </div>
            <Popover anchor={anchor} open={open} placement="bottom">
                <Typography className={{ root: "p-3" }}>
                    {name} ({symbol})
                </Typography>
            </Popover>
        </>
    );
};
