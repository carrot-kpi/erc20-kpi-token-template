import { Amount, Token } from "@carrot-kpi/sdk";
import { commify, formatUnits } from "ethers/lib/utils.js";

export const formatTokenAmount = (
    amount: Amount<Token>,
    withSymbol = true,
    nonZeroDecimalsAmount = 4
) => {
    let rawBaseAmount = formatDecimals(
        commify(formatUnits(amount.raw, amount.currency.decimals)),
        nonZeroDecimalsAmount
    );
    if (withSymbol)
        rawBaseAmount = rawBaseAmount + ` ${amount.currency.symbol}`;
    return rawBaseAmount;
};

const formatDecimals = (rawBaseAmount: string, decimalsAmount = 4) => {
    const decimalIndex = rawBaseAmount.indexOf(".");
    if (decimalIndex === -1) return rawBaseAmount;
    let i = decimalIndex + 1;
    while (i < rawBaseAmount.length) {
        if (rawBaseAmount[i] !== "0") {
            i += decimalsAmount;
            break;
        }
        i++;
    }
    return rawBaseAmount.substring(0, i);
};
