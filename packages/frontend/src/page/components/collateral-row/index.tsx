import { useCallback, useState } from "react";
import { Typography, ERC20TokenLogo, Popover } from "@carrot-kpi/ui";
import { CollateralData } from "../../../creation-form/types";
import { useNetwork } from "wagmi";

export const CollateralRow = (collateral: CollateralData) => {
    const { chain } = useNetwork();
    const { address, symbol, name } = collateral.amount.currency;
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
                    chainId={chain?.id}
                    address={address}
                    size="sm"
                />
                <Typography
                    className={{
                        root: "inline-block",
                    }}
                >
                    {collateral.amount.toString()}{" "}
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
