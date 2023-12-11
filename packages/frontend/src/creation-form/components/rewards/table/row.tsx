import { useCallback, useRef, useState } from "react";
import type { Reward } from "../../../types";
import { ReactComponent as X } from "../../../../assets/x.svg";
import { Popover, RemoteLogo, Typography } from "@carrot-kpi/ui";
import { ReactComponent as Info } from "../../../../assets/info.svg";
import { getDefaultERC20TokenLogoURL } from "../../../../utils/erc20";
import {
    type NamespacedTranslateFunction,
    useIPFSGatewayURL,
} from "@carrot-kpi/react";
import { Amount, Token, formatCurrencyAmount } from "@carrot-kpi/sdk";
import { cva } from "class-variance-authority";
import { USDValue } from "../usd-value";
import { parseUnits } from "viem";

const rootStyles = cva(["h-10", "grid", "items-center"], {
    variants: {
        noMinimumPayout: {
            true: ["grid-cols-rewardsNoMinimumPayout"],
            false: ["grid-cols-rewards"],
        },
    },
});

const amountFieldStyles = cva(["flex", "gap-2", "items-center"], {
    variants: {
        noMinimumPayout: {
            true: ["justify-end"],
            false: ["justify-center"],
        },
    },
});

type RewardsRowProps = Reward & {
    t: NamespacedTranslateFunction;
    index: number;
    protocolFeePpm: bigint;
    noEdit?: boolean;
    noFees?: boolean;
    noUSDValue?: boolean;
    noMinimumPayout?: boolean;
    onRemove?: (index: number) => void;
};

export const RewardRow = ({
    t,
    index,
    protocolFeePpm,
    noEdit,
    noFees,
    noUSDValue,
    noMinimumPayout,
    onRemove,
    chainId,
    address,
    decimals,
    symbol,
    name,
    logoURI,
    amount,
    minimumPayout,
}: RewardsRowProps) => {
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
    const formattedAmountPlusFees = formatCurrencyAmount({
        amount: new Amount(
            rewardToken,
            bigIntAmount + (bigIntAmount * protocolFeePpm) / 1_000_000n,
        ),
        withSymbol: false,
    });

    return (
        <div className={rootStyles({ noMinimumPayout })}>
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
                placement="top"
                className={{ root: "p-3 flex flex-col gap-2" }}
            >
                <div className="flex gap-3 justify-between">
                    <Typography variant="sm">
                        {t("label.rewards.picker.fee", {
                            fee: `${Number(protocolFeePpm) / 10_000}%`,
                        })}
                    </Typography>
                </div>
                <div className="w-full h-[1px] bg-black dark:bg-white" />
                <div className="flex gap-3 justify-between">
                    <Typography variant="sm">
                        {t("label.rewards.table.amount")}
                    </Typography>
                    <Typography variant="sm">{formattedAmount}</Typography>
                </div>
                <div className="flex gap-3 justify-between">
                    <Typography variant="sm">
                        {t("label.rewards.table.amount.after.fees")}
                    </Typography>
                    <Typography variant="sm">
                        {formattedAmountPlusFees}
                    </Typography>
                </div>
            </Popover>
            <div
                onMouseEnter={!noFees ? handleFeeSplitPopoverOpen : undefined}
                onMouseLeave={!noFees ? handleFeeSplitPopoverClose : undefined}
                className={amountFieldStyles({ noMinimumPayout })}
            >
                {!noFees && <Info className="w-4 h-4" />}
                <Typography
                    ref={anchorRef}
                    className={{
                        root: "text-center",
                    }}
                >
                    {!noFees ? formattedAmountPlusFees : formattedAmount}
                </Typography>
                {!noUSDValue && (
                    <USDValue
                        amount={parseUnits(
                            !noFees ? formattedAmountPlusFees : formattedAmount,
                            decimals,
                        )}
                        token={{ address, chainId, decimals, name, symbol }}
                    />
                )}
            </div>
            {!noMinimumPayout && (
                <Typography className={{ root: "text-right" }}>
                    {formatCurrencyAmount({
                        amount: new Amount(rewardToken, BigInt(minimumPayout)),
                        withSymbol: false,
                    })}
                </Typography>
            )}
        </div>
    );
};
