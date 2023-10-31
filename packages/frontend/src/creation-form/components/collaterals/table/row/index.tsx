import { useCallback, useRef, useState } from "react";
import type { Reward } from "../../../../types";
import { ReactComponent as X } from "../../../../../assets/x.svg";
import { Popover, RemoteLogo, Typography } from "@carrot-kpi/ui";
import { getDefaultERC20TokenLogoURL } from "../../../../../utils/erc20";
import {
    type NamespacedTranslateFunction,
    useIPFSGatewayURL,
} from "@carrot-kpi/react";
import { PROTOCOL_FEE_BPS } from "../../../../constants";
import { Amount, Token, formatCurrencyAmount } from "@carrot-kpi/sdk";

type CollateralRowProps = Reward & {
    t: NamespacedTranslateFunction;
    index: number;
    noEdit?: boolean;
    onRemove?: (index: number) => void;
};

export const RewardRow = ({
    t,
    index,
    noEdit,
    onRemove,
    chainId,
    address,
    decimals,
    symbol,
    name,
    logoURI,
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

    const rewardToken = new Token(chainId, address, decimals, symbol, name);
    const bigIntAmount = BigInt(amount);
    const parsedAmount = new Amount(rewardToken, bigIntAmount);
    const formattedAmount = formatCurrencyAmount({
        amount: parsedAmount,
        withSymbol: false,
    });
    const formattedAmountAfterFees = formatCurrencyAmount({
        amount: new Amount(
            rewardToken,
            bigIntAmount - (bigIntAmount * PROTOCOL_FEE_BPS) / 10_000n,
        ),
        withSymbol: false,
    });

    return (
        <div className="h-10 grid grid-cols-rewards items-center">
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
                    src={logoURI}
                    defaultSrc={getDefaultERC20TokenLogoURL(chainId, address)}
                    defaultText={symbol}
                    ipfsGatewayURL={ipfsGatewayURL}
                />
                <Typography>{symbol}</Typography>
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
                        {Number(PROTOCOL_FEE_BPS) / 100}%
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
            <div
                onMouseEnter={handleFeeSplitPopoverOpen}
                onMouseLeave={handleFeeSplitPopoverClose}
            >
                <Typography ref={anchorRef} className={{ root: "text-center" }}>
                    {formattedAmountAfterFees}
                </Typography>
            </div>
            <Typography className={{ root: "text-right" }}>
                {formatCurrencyAmount({
                    amount: new Amount(rewardToken, BigInt(minimumPayout)),
                    withSymbol: false,
                })}
            </Typography>
        </div>
    );
};
