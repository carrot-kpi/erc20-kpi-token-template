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
import type { RewardData } from "../../types";
import ERC20_KPI_TOKEN_ABI from "../../../abis/erc20-kpi-token";
import { type Address, zeroAddress, formatUnits } from "viem";
import {
    usePrepareContractWrite,
    useContractWrite,
    useAccount,
    useNetwork,
    usePublicClient,
} from "wagmi";
import { useCallback, useMemo, useState } from "react";
import { getRecoverableRewards } from "../../../utils/rewards";
import { dateToUnixTimestamp } from "../../../utils/dates";
import { TokenAmount } from "../token-amount";

interface RewardOption extends SelectOption<Address> {
    amount: Amount<Token>;
}

interface RecoverRewardProps {
    t: NamespacedTranslateFunction;
    onTx: KPITokenPageProps["onTx"];
    kpiToken: ResolvedKPIToken;
    loadingRewards?: boolean;
    rewards?: RewardData[];
    kpiTokenBalance?: Amount<Token> | null;
    kpiTokenRewardBalances?: Amount<Token>[];
    redeemableRewards?: Amount<Token>[] | null;
}

export const RecoverReward = ({
    t,
    onTx,
    kpiToken,
    loadingRewards,
    rewards,
    kpiTokenRewardBalances,
}: RecoverRewardProps) => {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const publicClient = usePublicClient();

    const [loadingRecover, setLoadingRecover] = useState(false);
    const [rewardToRecover, setRewardToRecover] =
        useState<SelectOption<Address> | null>(null);

    const { config: recoverConfig, isLoading: loadingRecoverConfig } =
        usePrepareContractWrite({
            chainId: chain?.id,
            address: kpiToken.address as Address,
            abi: ERC20_KPI_TOKEN_ABI,
            functionName: "recoverERC20",
            args:
                !!address && !!rewardToRecover
                    ? [rewardToRecover.value, address]
                    : undefined,
            enabled: !!chain?.id && !!address && !!rewardToRecover,
        });
    const { writeAsync: recoverAsync, isLoading: signingTransaction } =
        useContractWrite(recoverConfig);

    const rewardOptions: RewardOption[] = useMemo(() => {
        if (!rewards || !kpiTokenRewardBalances) return [];
        return getRecoverableRewards(
            rewards,
            kpiTokenRewardBalances,
            kpiToken.expired,
        ).map((reward) => ({
            label: `${formatUnits(reward.raw, reward.currency.decimals)} ${
                reward.currency.symbol
            }`,
            amount: reward,
            value: reward.currency.address,
        }));
    }, [rewards, kpiTokenRewardBalances, kpiToken.expired]);

    const handleRewardRecoverClick = useCallback(async () => {
        if (!recoverAsync || !address || !rewardToRecover) return;
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
                    token: rewardToRecover?.value,
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
            setRewardToRecover(null);
        } catch (error) {
            console.error(`could not recover reward ${rewardToRecover}`, error);
        } finally {
            setLoadingRecover(false);
        }
    }, [address, rewardToRecover, onTx, publicClient, recoverAsync]);

    const recovering =
        loadingRewards ||
        loadingRecover ||
        loadingRecoverConfig ||
        signingTransaction;

    return (
        (kpiToken.expired || kpiToken.finalized) &&
        rewardOptions.length > 0 && (
            <div className="flex flex-col gap-4 p-6 border-black dark:border-white border-t">
                <Typography>{t("rewards.recover")}</Typography>
                <div className="flex flex-col gap-4">
                    <Select
                        data-testid="wallet-position-recover-reward-select"
                        label={t("rewards.label")}
                        placeholder={t("rewards.recover.label")}
                        options={rewardOptions}
                        loading={recovering}
                        disabled={recovering}
                        messages={{ noResults: "" }}
                        onChange={setRewardToRecover}
                        value={rewardToRecover}
                        renderOption={(value) => (
                            <TokenAmount
                                amount={(value as RewardOption).amount}
                            />
                        )}
                        className={{
                            root: "w-96",
                            input: "w-96",
                            inputWrapper: "w-96",
                        }}
                    />
                    <Button
                        data-testid="wallet-position-recover-reward-button"
                        size="small"
                        loading={recovering}
                        disabled={!recoverAsync}
                        onClick={handleRewardRecoverClick}
                    >
                        {t("recover")}
                    </Button>
                </div>
            </div>
        )
    );
};
