import { type KPITokenPageProps, TxType } from "@carrot-kpi/react";
import {
    Amount,
    Token,
    KPI_TOKEN_ABI,
    ResolvedKPIToken,
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
import { unixTimestamp } from "../../../../utils/dates";
import { encodeAbiParameters, zeroAddress } from "viem";

interface WalletActionsProps {
    onTx: KPITokenPageProps["onTx"];
    kpiToken: ResolvedKPIToken;
    kpiTokenBalance?: Amount<Token> | null;
    redeemableRewards?: Amount<Token>[] | null;
}

export const WalletActions = ({
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
                [address]
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
            setText(kpiTokenBalance && kpiTokenBalance.gt(0) ? "test" : "test");
        } else {
            if (kpiToken.finalized) {
                if (kpiTokenBalance && kpiTokenBalance.gt(0)) {
                    if (burnable) setText("test");
                    else if (redeemable) setText("test");
                } else setText("test");
            } else setText("test");
        }
    }, [
        burnable,
        kpiToken.expired,
        kpiToken.finalized,
        kpiTokenBalance,
        redeemable,
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
                timestamp: unixTimestamp(new Date()),
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
                    disabled={
                        !redeemableRewards ||
                        redeemableRewards.length === 0 ||
                        redeemableRewards.every((reward) => reward.isZero()) ||
                        !writeAsync
                    }
                    onClick={handleClick}
                >
                    {redeemable && "test"}
                    {burnable && "test"}
                </Button>
            )}
        </div>
    );
};
