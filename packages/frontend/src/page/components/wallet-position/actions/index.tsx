import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Amount, Token, KPI_TOKEN_ABI, KPIToken } from "@carrot-kpi/sdk";
import { Button } from "@carrot-kpi/ui";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { defaultAbiCoder } from "@ethersproject/abi";

interface WalletActionsProps {
    t: NamespacedTranslateFunction;
    kpiToken: KPIToken;
    redeemableRewards?: Amount<Token>[] | null;
}

export const WalletActions = ({
    t,
    kpiToken,
    redeemableRewards,
}: WalletActionsProps) => {
    const { address } = useAccount();

    const [loading, setLoading] = useState(false);
    const [redeemable, setRedeemable] = useState(false);

    const { config: redeemConfig } = usePrepareContractWrite({
        address: kpiToken.address,
        abi: KPI_TOKEN_ABI,
        functionName: "redeem",
        args: [defaultAbiCoder.encode(["address"], [address]) as `0x${string}`],
        enabled: !!address && kpiToken.finalized,
    });
    const { writeAsync } = useContractWrite(redeemConfig);

    useEffect(() => {
        if (!redeemableRewards) return;

        for (const redeemable of redeemableRewards) {
            if (!redeemable.isZero()) {
                setRedeemable(true);
                return;
            }
        }
        setRedeemable(false);
    }, [redeemableRewards]);

    const handleClick = useCallback(async () => {
        if (!writeAsync) return;
        setLoading(true);
        try {
            await writeAsync();
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [writeAsync]);

    return (
        <Button loading={loading} disabled={!redeemable} onClick={handleClick}>
            {t("redeem")}
        </Button>
    );
};
