import {
    KPITokenPageProps,
    NamespacedTranslateFunction,
    TxType,
} from "@carrot-kpi/react";
import {
    Amount,
    Token,
    KPI_TOKEN_ABI,
    ResolvedKPIToken,
    formatTokenAmount,
} from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { defaultAbiCoder } from "@ethersproject/abi";
import { unixTimestamp } from "../../../../utils/dates";

interface WalletActionsProps {
    t: NamespacedTranslateFunction;
    onTx: KPITokenPageProps["onTx"];
    kpiToken: ResolvedKPIToken;
    kpiTokenBalance?: Amount<Token> | null;
    redeemableRewards?: Amount<Token>[] | null;
}

export const WalletActions = ({
    t,
    onTx,
    kpiToken,
    kpiTokenBalance,
    redeemableRewards,
}: WalletActionsProps) => {
    const { address } = useAccount();

    const [loading, setLoading] = useState(false);
    const [redeemable, setRedeemable] = useState(false);
    const [burnable, setBurnable] = useState(false);
    const [text, setText] = useState("");

    const { config: redeemConfig } = usePrepareContractWrite({
        address: kpiToken.address,
        abi: KPI_TOKEN_ABI,
        functionName: "redeem",
        args: [defaultAbiCoder.encode(["address"], [address]) as `0x${string}`],
        enabled: !!address && (redeemable || burnable),
    });
    const { writeAsync } = useContractWrite(redeemConfig);

    useEffect(() => {
        const hasSomeRedeemableReward =
            !!redeemableRewards &&
            redeemableRewards.length > 0 &&
            redeemableRewards.some((reward) => reward.isPositive());
        setRedeemable(hasSomeRedeemableReward);

        if (
            kpiToken.expired &&
            !hasSomeRedeemableReward &&
            kpiTokenBalance?.gt(0)
        ) {
            setBurnable(true);
        }
    }, [kpiToken.expired, kpiTokenBalance, redeemableRewards]);

    useEffect(() => {
        if (kpiToken.expired) {
            setText(
                kpiTokenBalance && kpiTokenBalance.gt(0)
                    ? t("position.status.expired.withBalance", {
                          amount: formatTokenAmount(kpiTokenBalance, false),
                          symbol: kpiTokenBalance.currency.symbol,
                      })
                    : t("position.status.expired.noBalance")
            );
        } else {
            if (kpiToken.finalized) {
                if (kpiTokenBalance && kpiTokenBalance.gt(0)) {
                    if (burnable)
                        setText(
                            t(
                                "position.status.finalized.withBalance.burnable",
                                {
                                    amount: formatTokenAmount(
                                        kpiTokenBalance,
                                        false
                                    ),
                                    symbol: kpiTokenBalance.currency.symbol,
                                }
                            )
                        );
                    else if (redeemable)
                        setText(
                            t(
                                "position.status.finalized.withBalance.redeemable",
                                {
                                    amount: formatTokenAmount(
                                        kpiTokenBalance,
                                        false
                                    ),
                                    symbol: kpiTokenBalance.currency.symbol,
                                }
                            )
                        );
                } else setText(t("position.status.finalized.noBalance"));
            } else setText(t("position.status.notFinalized"));
        }
    }, [
        burnable,
        kpiToken.expired,
        kpiToken.finalized,
        kpiTokenBalance,
        redeemable,
        t,
    ]);

    const handleClick = useCallback(async () => {
        if (!writeAsync) return;
        setLoading(true);
        try {
            const tx = await writeAsync();
            const receipt = await tx.wait();
            onTx({
                type: TxType.KPI_TOKEN_REDEMPTION,
                from: receipt.from,
                hash: tx.hash,
                payload: {
                    address: kpiToken.address,
                },
                receipt,
                timestamp: unixTimestamp(new Date()),
            });
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [kpiToken.address, onTx, writeAsync]);

    return (
        <div className="flex flex-col gap-4">
            <Typography>{text}</Typography>
            {(redeemable || burnable) && (
                <Button
                    loading={loading}
                    disabled={
                        !redeemableRewards ||
                        redeemableRewards.length === 0 ||
                        redeemableRewards.every((reward) => reward.isZero()) ||
                        !writeAsync
                    }
                    onClick={handleClick}
                >
                    {redeemable && t("redeem")}
                    {burnable && t("burn")}
                </Button>
            )}
        </div>
    );
};
