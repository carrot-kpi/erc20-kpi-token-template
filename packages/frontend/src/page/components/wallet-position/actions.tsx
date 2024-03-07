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
    useWriteContract,
    useSimulateContract,
    usePublicClient,
} from "wagmi";
import { dateToUnixTimestamp } from "../../../utils/dates";
import { encodeAbiParameters, zeroAddress, type Address } from "viem";

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
    const { address, chain } = useAccount();
    const publicClient = usePublicClient();

    const [loading, setLoading] = useState(false);
    const [redeemable, setRedeemable] = useState(false);
    const [burnable, setBurnable] = useState(false);
    const [text, setText] = useState("");

    const { data: simulatedRedeem, isLoading: simulatingRedeem } =
        useSimulateContract({
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
            query: {
                enabled: !!chain?.id && !!address && (redeemable || burnable),
            },
        });
    const { writeContractAsync, isPending: signingTransaction } =
        useWriteContract();

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
        if (!writeContractAsync || !publicClient || !simulatedRedeem?.request)
            return;
        setLoading(true);
        try {
            const tx = await writeContractAsync(simulatedRedeem.request);
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx,
            });
            onTx({
                type: TxType.KPI_TOKEN_REDEMPTION,
                from: receipt.from,
                hash: tx,
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
    }, [
        kpiToken.address,
        onTx,
        publicClient,
        simulatedRedeem?.request,
        writeContractAsync,
    ]);

    const redeeming = loading || simulatingRedeem || signingTransaction;

    return (
        <div className="flex flex-col gap-4">
            <Typography data-testid="wallet-position-actions-burn-redeem-text">
                {text}
            </Typography>
            {(redeemable || burnable) && (
                <Button
                    data-testid="wallet-position-actions-burn-redeem-button"
                    size="small"
                    loading={redeeming}
                    disabled={!simulatedRedeem?.request}
                    onClick={handleClick}
                >
                    {redeemable && t("redeem")}
                    {burnable && t("burn")}
                </Button>
            )}
        </div>
    );
};
