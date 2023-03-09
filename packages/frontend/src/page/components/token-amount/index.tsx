import { Amount, Token } from "@carrot-kpi/sdk";
import { ERC20TokenLogo, Skeleton, Typography } from "@carrot-kpi/ui";
import { useNetwork } from "wagmi";
import { formatTokenAmount } from "../../../utils/formatting";

export interface TokenAmountProps {
    loading?: boolean;
    amount?: Amount<Token> | null;
}

export const TokenAmount = ({ loading, amount }: TokenAmountProps) => {
    const { chain } = useNetwork();

    return (
        <div className="flex items-center gap-2">
            {loading || !amount ? (
                <>
                    <Skeleton circular width="60px" />
                    <Skeleton width="60px" />
                </>
            ) : (
                <>
                    <ERC20TokenLogo
                        chainId={chain?.id || 1}
                        address={amount.currency.address}
                        size="sm"
                    />
                    <Typography>{formatTokenAmount(amount)}</Typography>
                </>
            )}
        </div>
    );
};
