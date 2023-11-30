import type {
    KPITokenPageProps,
    NamespacedTranslateFunction,
} from "@carrot-kpi/react";
import {
    Amount,
    KPI_TOKEN_ABI,
    ResolvedKPIToken,
    Token,
} from "@carrot-kpi/sdk";
import { Skeleton, Typography } from "@carrot-kpi/ui";
import { type ReactElement, useEffect, useState } from "react";
import {
    type Address,
    useAccount,
    useBalance,
    useEnsName,
    useContractRead,
    useNetwork,
} from "wagmi";
import { mainnet } from "wagmi/chains";
import type { RewardData } from "../../types";
import {
    getGuaranteedRewards,
    getMaximumRewards,
    getRedeemableRewards,
} from "../../../utils/rewards";
import { useWatchKPITokenRewardBalances } from "../../hooks/useWatchKPITokenRewardBalances";
import type { FinalizableOracle } from "../../types";
import { TokenAmount } from "../token-amount";
import { WalletActions } from "./actions";
import { RecoverReward } from "./recover-reward";

interface WalletPositionProps {
    t: NamespacedTranslateFunction;
    onTx: KPITokenPageProps["onTx"];
    loading?: boolean;
    kpiToken: ResolvedKPIToken;
    rewards?: RewardData[];
    oracles?: FinalizableOracle[];
    initialSupply?: Amount<Token> | null;
    currentSupply?: Amount<Token> | null;
    erc20Symbol?: string;
    erc20Name?: string;
}

export const WalletPosition = ({
    t,
    onTx,
    loading,
    kpiToken,
    rewards,
    oracles,
    initialSupply,
    currentSupply,
    erc20Symbol,
    erc20Name,
}: WalletPositionProps): ReactElement => {
    const { address: connectedAddress } = useAccount();
    const { chain } = useNetwork();
    const { data: ensName, isLoading: loadingENSName } = useEnsName({
        address: connectedAddress as Address,
        chainId: mainnet.id,
    });
    const { data: rawKpiTokenBalance } = useBalance({
        address: connectedAddress,
        token: kpiToken.address as Address,
        watch: true,
    });
    const {
        balances: kpiTokenRewardBalances,
        loading: loadingKPITokenRewardBalances,
    } = useWatchKPITokenRewardBalances(kpiToken.address, rewards);

    const { data: kpiTokenOwner } = useContractRead({
        chainId: chain?.id,
        address: kpiToken.address as Address,
        abi: KPI_TOKEN_ABI,
        functionName: "owner",
        enabled: !!chain?.id && !!connectedAddress,
    });

    const [balance, setBalance] = useState<Amount<Token> | null>(null);
    const [guaranteedRewards, setGuaranteedRewards] = useState<
        Amount<Token>[] | null
    >(null);
    const [maximumRewards, setMaximumRewards] = useState<
        Amount<Token>[] | null
    >(null);
    const [redeemableRewards, setRedeemableRewards] = useState<
        Amount<Token>[] | null
    >(null);

    useEffect(() => {
        if (
            !rawKpiTokenBalance ||
            !initialSupply ||
            !currentSupply ||
            !oracles ||
            oracles.length === 0
        )
            return;
        const balance = new Amount(
            initialSupply.currency,
            rawKpiTokenBalance.value,
        );
        setBalance(balance);
        if (!rewards || !initialSupply) return;
        if (rewards.length === 0) {
            setGuaranteedRewards(null);
            setMaximumRewards(null);
            return;
        }
        setMaximumRewards(getMaximumRewards(balance, currentSupply, rewards));
        setGuaranteedRewards(
            getGuaranteedRewards(balance, initialSupply, rewards),
        );
        setRedeemableRewards(
            getRedeemableRewards(
                oracles,
                balance,
                initialSupply,
                currentSupply,
                rewards,
                kpiToken.expired,
            ),
        );
    }, [
        rewards,
        erc20Name,
        erc20Symbol,
        initialSupply,
        currentSupply,
        kpiToken.address,
        kpiToken.chainId,
        kpiToken.expired,
        oracles,
        rawKpiTokenBalance,
    ]);

    const owner =
        !!kpiTokenOwner &&
        !!connectedAddress &&
        kpiTokenOwner === connectedAddress;

    return !connectedAddress ? (
        <div className="flex p-6 h-60 items-center justify-center w-full max-w-screen-2xl bg-gray-200 dark:bg-black border border-black dark:border-gray-400">
            <Typography uppercase>{t("position.noWallet")}</Typography>
        </div>
    ) : (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col w-full max-w-screen-2xl bg-white dark:bg-black border border-black dark:border-gray-400">
                <div className="w-full p-6 bg-gray-200 dark:bg-gray-700 border-b border-black dark:border-gray-400">
                    {loadingENSName ? (
                        <Skeleton width="120px" />
                    ) : (
                        <Typography
                            truncate
                            weight="medium"
                            className={{
                                root: "text-ellipsis overflow-hidden ...",
                            }}
                        >
                            {ensName || connectedAddress}
                        </Typography>
                    )}
                </div>
                {!kpiToken.finalized && (
                    <div className="w-full flex flex-col md:flex-row justify-between">
                        <div className="w-full md:w-1/3 p-6 flex-col border-b border-black md:border-r">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("position.rewards.guaranteed.label")}
                            </Typography>
                            <div
                                data-testid="wallet-position-guaranteed-rewards"
                                className="flex flex-col gap-2"
                            >
                                {loading || !guaranteedRewards
                                    ? new Array(rewards?.length || 1)
                                          .fill(null)
                                          .map((_, index) => (
                                              <TokenAmount
                                                  key={index}
                                                  loading
                                              />
                                          ))
                                    : guaranteedRewards.map((reward) => {
                                          return (
                                              <TokenAmount
                                                  data-testid={`wallet-position-guaranteed-reward-${reward.currency.address}`}
                                                  key={reward.currency.address}
                                                  amount={reward}
                                              />
                                          );
                                      })}
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 p-6 flex-col border-b border-black md:border-r">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("position.rewards.maximum.label")}
                            </Typography>
                            <div
                                data-testid="wallet-position-maximum-rewards"
                                className="flex flex-col gap-2"
                            >
                                {loading || !maximumRewards
                                    ? new Array(rewards?.length || 1)
                                          .fill(null)
                                          .map((_, index) => (
                                              <TokenAmount
                                                  key={index}
                                                  loading
                                              />
                                          ))
                                    : maximumRewards.map((reward) => {
                                          return (
                                              <TokenAmount
                                                  data-testid={`wallet-position-maximum-rewards-${reward.currency.address}`}
                                                  key={reward.currency.address}
                                                  amount={reward}
                                              />
                                          );
                                      })}
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 p-6 flex-col border-black border-b">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("position.rewards.remaining.label")}
                            </Typography>
                            <div
                                data-testid="wallet-position-remaining-rewards"
                                className="flex flex-col gap-2"
                            >
                                {loading ||
                                !kpiTokenRewardBalances ||
                                loadingKPITokenRewardBalances ||
                                kpiTokenRewardBalances.length === 0
                                    ? new Array(rewards?.length || 1)
                                          .fill(null)
                                          .map((_, index) => (
                                              <TokenAmount
                                                  key={index}
                                                  loading
                                              />
                                          ))
                                    : kpiTokenRewardBalances.map((reward) => {
                                          return (
                                              <TokenAmount
                                                  data-testid={`wallet-position-remaining-rewards-${reward.currency.address}`}
                                                  key={reward.currency.address}
                                                  amount={reward}
                                              />
                                          );
                                      })}
                            </div>
                        </div>
                    </div>
                )}
                <div className="w-full flex flex-col md:flex-row justify-between border-black border-b">
                    <div className="w-full md:w-1/2 p-6 flex-col border-b border-black md:border-b-0 md:border-r">
                        <Typography
                            variant="xs"
                            uppercase
                            className={{ root: "mb-2" }}
                        >
                            {t("position.balance.label")}
                        </Typography>
                        <TokenAmount
                            data-testid="wallet-position-balance"
                            amount={balance}
                            loading={loading}
                        />
                    </div>
                    <div
                        data-testid="wallet-position-claimables"
                        className="w-full md:w-1/2 p-6 flex-col"
                    >
                        <Typography
                            variant="xs"
                            uppercase
                            className={{ root: "mb-2" }}
                        >
                            {t("position.rewards.claimable.label")}
                        </Typography>
                        {loading || !redeemableRewards ? (
                            new Array(rewards?.length || 1)
                                .fill(null)
                                .map((_, index) => (
                                    <TokenAmount key={index} loading />
                                ))
                        ) : (
                            <div className="flex items-center gap-2">
                                {redeemableRewards.map((reward) => {
                                    return (
                                        <TokenAmount
                                            data-testid={`wallet-position-claimable-${reward.currency.address}`}
                                            key={reward.currency.address}
                                            amount={reward}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full p-6">
                    <WalletActions
                        t={t}
                        onTx={onTx}
                        kpiToken={kpiToken}
                        kpiTokenBalance={balance}
                        redeemableRewards={redeemableRewards}
                    />
                </div>
                {owner && (
                    <RecoverReward
                        t={t}
                        onTx={onTx}
                        kpiToken={kpiToken}
                        loadingRewards={
                            loading || loadingKPITokenRewardBalances
                        }
                        rewards={rewards}
                        kpiTokenRewardBalances={kpiTokenRewardBalances}
                    />
                )}
            </div>
        </div>
    );
};
