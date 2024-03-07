import { Amount, formatCurrencyAmount, Token } from "@carrot-kpi/sdk";
import { ERC20TokenLogo, Skeleton, Typography } from "@carrot-kpi/ui";
import { useAccount } from "wagmi";

export interface TokenAmountProps {
    loading?: boolean;
    amount?: Amount<Token> | null;
    withSymbol?: boolean;
}

export const TokenAmount = ({
    loading,
    amount,
    withSymbol,
}: TokenAmountProps) => {
    const { chain } = useAccount();

    return (
        <div className="flex items-center gap-2">
            {loading || !amount ? (
                <>
                    <Skeleton circular width="24px" />
                    <Skeleton width="60px" />
                </>
            ) : (
                <>
                    <ERC20TokenLogo
                        chainId={chain?.id || 1}
                        address={amount.currency.address}
                        symbol={amount.currency.symbol}
                        size="sm"
                    />
                    <Typography truncate>
                        {formatCurrencyAmount({ amount, withSymbol })}
                    </Typography>
                </>
            )}
        </div>
    );
};
