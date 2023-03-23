import { Amount, formatTokenAmount, Token } from "@carrot-kpi/sdk";
import { ERC20TokenLogo, Skeleton, Typography } from "@carrot-kpi/ui";
import { useNetwork } from "wagmi";

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
    const { chain } = useNetwork();

    return (
        <div className="flex items-center gap-2">
            {loading || !amount ? (
                <>
                    <Skeleton circular width="20px" />
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
                    <Typography>
                        {formatTokenAmount(amount, withSymbol)}
                    </Typography>
                </>
            )}
        </div>
    );
};
