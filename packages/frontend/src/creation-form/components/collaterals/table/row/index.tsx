import { useCallback, useRef, useState } from "react";
import { CollateralData } from "../../../../types";
import { ReactComponent as X } from "../../../../../assets/x.svg";
import { Popover, RemoteLogo, Typography } from "@carrot-kpi/ui";
import { getDefaultERC20TokenLogoURL } from "../../../../../utils/erc20";
import {
    NamespacedTranslateFunction,
    useIPFSGatewayURL,
} from "@carrot-kpi/react";
import { utils } from "ethers";
import { PROTOCOL_FEE_BPS } from "../../../../constants";

type CollateralRowProps = CollateralData & {
    t: NamespacedTranslateFunction;
    index: number;
    noEdit?: boolean;
    onRemove?: (index: number) => void;
};

export const CollateralRow = ({
    t,
    index,
    noEdit,
    onRemove,
    amount,
    minimumPayout,
}: CollateralRowProps) => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const ipfsGatewayURL = useIPFSGatewayURL();

    const [feeSplitPopoverOpen, setFeeSplitPopoverOpen] = useState(false);

    const handleRemove = useCallback(() => {
        if (!onRemove) return;
        onRemove(index);
    }, [index, onRemove]);

    const handleFeeSplitPopoverOpen = useCallback(() => {
        setFeeSplitPopoverOpen(true);
    }, []);

    const handleFeeSplitPopoverClose = useCallback(() => {
        setFeeSplitPopoverOpen(false);
    }, []);

    const token = amount.currency;
    const formattedAmount = utils.commify(amount.toFixed(4));
    const formattedAmountAfterFees = utils.commify(
        amount.sub(amount.mul(PROTOCOL_FEE_BPS).div(10_000)).toFixed(4)
    );
    return (
        <div key={token.address} className="grid grid-cols-3">
            <div className="flex gap-2 items-center">
                {!noEdit && (
                    <div
                        className="cursor-pointer"
                        onClick={handleRemove}
                        data-index={index}
                    >
                        <X className="stroke-gray-500 dark:stroke-gray-700 pointer-events-none" />
                    </div>
                )}
                <RemoteLogo
                    src={token.logoURI}
                    size="sm"
                    defaultSrc={getDefaultERC20TokenLogoURL(
                        token.chainId,
                        token.address
                    )}
                    defaultText={token.symbol}
                    ipfsGatewayURL={ipfsGatewayURL}
                />
                <Typography>{token.symbol}</Typography>
            </div>
            <Popover
                anchor={anchorRef.current}
                open={feeSplitPopoverOpen}
                className={{ root: "p-3 flex flex-col gap-2" }}
            >
                <div className="flex gap-3 justify-between">
                    <Typography variant="sm">
                        {t("label.collateral.picker.fee")}
                    </Typography>
                    <Typography variant="sm">
                        {PROTOCOL_FEE_BPS / 10_000}%
                    </Typography>
                </div>
                <div className="w-full h-[1px] bg-black dark:bg-white" />
                <div className="flex gap-3 justify-between">
                    <Typography variant="sm">
                        {t("label.collateral.table.amount")}
                    </Typography>
                    <Typography variant="sm">{formattedAmount}</Typography>
                </div>
                <div className="flex gap-3 justify-between">
                    <Typography variant="sm">
                        {t("label.collateral.table.amount.after.fees")}
                    </Typography>
                    <Typography variant="sm">
                        {formattedAmountAfterFees}
                    </Typography>
                </div>
            </Popover>
            <Typography
                ref={anchorRef}
                className={{ root: "text-center" }}
                onMouseEnter={handleFeeSplitPopoverOpen}
                onMouseLeave={handleFeeSplitPopoverClose}
            >
                {formattedAmountAfterFees}
            </Typography>
            <Typography className={{ root: "text-right" }}>
                {utils.commify(minimumPayout.toFixed(4))}
            </Typography>
        </div>
    );
};
