import { useERC20TokenPrice } from "@carrot-kpi/react";
import { formatDecimals } from "@carrot-kpi/sdk";
import {
    Skeleton,
    Typography,
    type TokenInfoWithBalance,
} from "@carrot-kpi/ui";
import { formatUnits } from "viem";

interface USDValueProps {
    token?: TokenInfoWithBalance | null;
    amount?: bigint | null;
}

export const USDValue = ({ token, amount }: USDValueProps) => {
    const { loading, price } = useERC20TokenPrice({
        tokenAddress: token?.address,
    });

    if (loading) return <Skeleton variant="sm" width="60px" />;

    if (!token || !price || !amount)
        return <Typography variant="sm">-</Typography>;

    const parsedAmount = parseFloat(formatUnits(amount, token.decimals));
    if (isNaN(parsedAmount)) return <Typography variant="sm">-</Typography>;

    return (
        <Typography variant="sm">
            $
            {formatDecimals({
                number: (price * parsedAmount).toString(),
                decimalsAmount: 2,
            })}
        </Typography>
    );
};
