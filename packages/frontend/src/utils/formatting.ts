import { Amount, Token } from "@carrot-kpi/sdk";
import { commify } from "ethers/lib/utils.js";

export const formatTokenAmount = (amount: Amount<Token>, withSymbol = true) => {
    let baseAmount = commify(amount.toString());
    if (withSymbol) baseAmount = baseAmount + ` ${amount.currency.symbol}`;
    return baseAmount;
};
