import { useERC20TokenPrice } from "@carrot-kpi/react";
import { formatDecimals } from "@carrot-kpi/sdk";
import { Skeleton, Typography } from "@carrot-kpi/ui";
import type { NumberFormatValue } from "../../../types";

interface USDValueProps {
    tokenAddress?: string;
    rawTokenAmount?: NumberFormatValue;
}

export const USDValue = ({ tokenAddress, rawTokenAmount }: USDValueProps) => {
    const { loading, price } = useERC20TokenPrice(tokenAddress);

    if (loading) return <Skeleton variant="sm" width="60px" />;

    if (!price || !rawTokenAmount)
        return <Typography variant="sm">-</Typography>;

    const parsedAmount = parseFloat(rawTokenAmount.formattedValue);
    if (isNaN(parsedAmount)) return <Typography variant="sm">-</Typography>;

    return (
        <Typography variant="sm">
            ${formatDecimals((price * parsedAmount).toString())}
        </Typography>
    );
};
