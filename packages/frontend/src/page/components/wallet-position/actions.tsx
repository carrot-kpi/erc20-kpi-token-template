import {
    type KPITokenPageProps,
    type NamespacedTranslateFunction,
    TxType,
} from "@carrot-kpi/react";
import {
    Amount,
    Token,
    KPI_TOKEN_ABI,
    ResolvedKPIToken,
    formatCurrencyAmount,
} from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { useCallback, useEffect, useState } from "react";
import {
    useAccount,
    useContractWrite,
    usePrepareContractWrite,
    type Address,
    usePublicClient,
    useNetwork,
} from "wagmi";
import { dateToUnixTimestamp } from "../../../utils/dates";
import { encodeAbiParameters, zeroAddress } from "viem";

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
    const { chain } = useNetwork();
    const publicClient = usePublicClient();

    const [loading, setLoading] = useState(false);
    const [redeemable, setRedeemable] = useState(false);
    const [burnable, setBurnable] = useState(false);
    const [text, setText] = useState("");

    const { config: redeemConfig } = usePrepareContractWrite({
        chainId: chain?.id,
        address: kpiToken.address as Address,
        abi: KPI_TOKEN_ABI,
        functionName: "redeem",
        args: address && [
            encodeAbiParameters(
                [{ type: "address", name: "redeemer" }],
                [address],
            ) as `0x${string}`,
        ],
        enabled: !!chain?.id && !!address && (redeemable || burnable),
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
                          amount: formatCurrencyAmount({
                              amount: kpiTokenBalance,
                              withSymbol: false,
                          }),
                          symbol: kpiTokenBalance.currency.symbol,
                      })
                    : t("position.status.expired.noBalance"),
            );
        } else {
            if (kpiToken.finalized) {
                if (kpiTokenBalance && kpiTokenBalance.gt(0)) {
                    if (burnable)
                        setText(
                            t(
                                "position.status.finalized.withBalance.burnable",
                                {
                                    amount: formatCurrencyAmount({
                                        amount: kpiTokenBalance,
                                        withSymbol: false,
                                    }),
                                    symbol: kpiTokenBalance.currency.symbol,
                                },
                            ),
                        );
                    else if (redeemable)
                        setText(
                            t(
                                "position.status.finalized.withBalance.redeemable",
                                {
                                    amount: formatCurrencyAmount({
                                        amount: kpiTokenBalance,
                                        withSymbol: false,
                                    }),
                                    symbol: kpiTokenBalance.currency.symbol,
                                },
                            ),
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
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx.hash,
            });
            onTx({
                type: TxType.KPI_TOKEN_REDEMPTION,
                from: receipt.from,
                hash: tx.hash,
                payload: {
                    address: kpiToken.address,
                },
                receipt: {
                    from: receipt.from,
                    transactionIndex: receipt.transactionIndex,
                    blockHash: receipt.blockHash,
                    transactionHash: receipt.transactionHash,
                    to: receipt.to || zeroAddress,
                    contractAddress: receipt.contractAddress || zeroAddress,
                    blockNumber: Number(receipt.blockNumber),
                    status: receipt.status === "success" ? 1 : 0,
                },
                timestamp: dateToUnixTimestamp(new Date()),
            });
        } catch (error) {
            console.error(`could not perform action`, error);
        } finally {
            setLoading(false);
        }
    }, [kpiToken.address, onTx, publicClient, writeAsync]);

    return (
        <div className="flex flex-col gap-4">
            <Typography>{text}</Typography>
            {(redeemable || burnable) && (
                <Button
                    size="small"
                    loading={loading}
                    disabled={!writeAsync}
                    onClick={handleClick}
                >
                    {redeemable && t("redeem")}
                    {burnable && t("burn")}
                </Button>
            )}
        </div>
    );
};
