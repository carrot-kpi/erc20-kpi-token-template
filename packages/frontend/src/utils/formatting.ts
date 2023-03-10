import { Amount, Token } from "@carrot-kpi/sdk";
import { commify, formatUnits } from "ethers/lib/utils.js";

export const formatTokenAmount = (amount: Amount<Token>, withSymbol = true) => {
    let baseAmount = commify(formatUnits(amount.raw, amount.currency.decimals));
    if (withSymbol) baseAmount = baseAmount + ` ${amount.currency.symbol}`;
    return baseAmount;
};
