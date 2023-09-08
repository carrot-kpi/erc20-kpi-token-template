import {
    TxType,
    type KPITokenPageProps,
    type NamespacedTranslateFunction,
} from "@carrot-kpi/react";
import {
    type Amount,
    type ResolvedKPIToken,
    type Token,
} from "@carrot-kpi/sdk";
import { Button, Select, Typography, type SelectOption } from "@carrot-kpi/ui";
import type {
    CollateralData,
    OptionForCollateral,
} from "../../../../creation-form/types";
import ERC20_KPI_TOKEN_ABI from "../../../../abis/erc20-kpi-token";
import { type Address, zeroAddress, formatUnits } from "viem";
import {
    usePrepareContractWrite,
    useContractWrite,
    useAccount,
    useNetwork,
    usePublicClient,
} from "wagmi";
import { useCallback, useMemo, useState } from "react";
import { getRecoverableRewards } from "../../../../utils/collaterals";
import { unixTimestamp } from "../../../../utils/dates";
import { TokenAmount } from "../../token-amount";

interface RecoverCollateralProps {
    t: NamespacedTranslateFunction;
    onTx: KPITokenPageProps["onTx"];
    kpiToken: ResolvedKPIToken;
    collaterals?: CollateralData[];
    kpiTokenBalance?: Amount<Token> | null;
    kpiTokenCollateralBalances?: Amount<Token>[];
    redeemableRewards?: Amount<Token>[] | null;
}

export const RecoverCollateral = ({
    t,
    onTx,
    kpiToken,
    collaterals,
    kpiTokenCollateralBalances,
}: RecoverCollateralProps) => {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const publicClient = usePublicClient();

    const [loadingRecover, setLoadingRecover] = useState(false);
    const [collateralToRecover, setCollateralToRecover] =
        useState<SelectOption<Address> | null>(null);

    const { config: recoverConfig } = usePrepareContractWrite({
        chainId: chain?.id,
        address: kpiToken.address as Address,
        abi: ERC20_KPI_TOKEN_ABI,
        functionName: "recoverERC20",
        args:
            !!address && !!collateralToRecover
                ? [collateralToRecover.value, address]
                : undefined,
        enabled: !!chain?.id && !!address && !!collateralToRecover,
    });
    const { writeAsync: recoverAsync } = useContractWrite(recoverConfig);

    const collateralOptions: OptionForCollateral[] = useMemo(() => {
        if (!collaterals || !kpiTokenCollateralBalances) return [];
        return getRecoverableRewards(
            collaterals,
            kpiTokenCollateralBalances,
            kpiToken.expired,
        ).map((collateral) => ({
            label: `${formatUnits(collateral.raw, 18)} ${
                collateral.currency.symbol
            }`,
            amount: collateral,
            value: collateral.currency.address,
        }));
    }, [collaterals, kpiTokenCollateralBalances, kpiToken.expired]);

    const handleCollateralRecoverClick = useCallback(async () => {
        if (!recoverAsync || !address || !collateralToRecover) return;
        setLoadingRecover(true);
        try {
            const tx = await recoverAsync();
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx.hash,
            });
            onTx({
                type: TxType.KPI_TOKEN_COLLATERAL_RECOVER,
                from: receipt.from,
                hash: tx.hash,
                payload: {
                    receiver: address,
                    token: collateralToRecover?.value,
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
            setCollateralToRecover(null);
        } catch (error) {
            console.error(
                `could not recover collateral ${collateralToRecover}`,
                error,
            );
        } finally {
            setLoadingRecover(false);
        }
    }, [address, collateralToRecover, onTx, publicClient, recoverAsync]);

    return (
        (kpiToken.expired || kpiToken.finalized) &&
        collateralOptions.length > 0 && (
            <div className="flex flex-col gap-4 p-6 border-black dark:border-white border-t">
                <Typography>{t("collaterals.recover")}</Typography>
                <div className="flex flex-col gap-4">
                    <Select
                        label={t("collaterals.label")}
                        placeholder={t("collaterals.recover.label")}
                        options={collateralOptions}
                        messages={{ noResults: "" }}
                        onChange={setCollateralToRecover}
                        value={collateralToRecover}
                        renderOption={(value) => (
                            <TokenAmount
                                amount={(value as OptionForCollateral).amount}
                            />
                        )}
                    />
                    <Button
                        size="small"
                        loading={loadingRecover}
                        disabled={!recoverAsync}
                        onClick={handleCollateralRecoverClick}
                    >
                        {t("recover")}
                    </Button>
                </div>
            </div>
        )
    );
};
