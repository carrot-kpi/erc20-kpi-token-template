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
import type { CollateralData } from "../../../creation-form/types";
import {
    getGuaranteedRewards,
    getMaximumRewards,
    getRedeemableRewards,
} from "../../../utils/collaterals";
import { useWatchKPITokenCollateralBalances } from "../../hooks/useWatchKPITokenCollateralBalances";
import type { FinalizableOracle } from "../../types";
import { TokenAmount } from "../token-amount";
import { WalletActions } from "./actions";
import { RecoverCollateral } from "./recover-collateral";

interface WalletPositionProps {
    t: NamespacedTranslateFunction;
    onTx: KPITokenPageProps["onTx"];
    loading?: boolean;
    kpiToken: ResolvedKPIToken;
    collaterals?: CollateralData[];
    oracles?: FinalizableOracle[];
    initialSupply?: Amount<Token> | null;
    erc20Symbol?: string;
    erc20Name?: string;
}

export const WalletPosition = ({
    t,
    onTx,
    loading,
    kpiToken,
    collaterals,
    oracles,
    initialSupply,
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
        balances: kpiTokenCollateralBalances,
        loading: loadingKPITokenCollateralBalances,
    } = useWatchKPITokenCollateralBalances(kpiToken.address, collaterals);

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
        if (!rawKpiTokenBalance || !initialSupply || !oracles) return;
        const balance = new Amount(
            initialSupply.currency,
            rawKpiTokenBalance.value
        );
        setBalance(balance);
        if (!collaterals || !initialSupply) return;
        if (collaterals.length === 0) {
            setGuaranteedRewards(null);
            setMaximumRewards(null);
            return;
        }
        setMaximumRewards(
            getMaximumRewards(balance, initialSupply, collaterals)
        );
        setGuaranteedRewards(
            getGuaranteedRewards(balance, initialSupply, collaterals)
        );
        setRedeemableRewards(
            getRedeemableRewards(
                oracles,
                balance,
                initialSupply,
                collaterals,
                kpiToken.expired
            )
        );
    }, [
        collaterals,
        erc20Name,
        erc20Symbol,
        initialSupply,
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
        <div className="flex p-6 h-60 items-center justify-center w-full max-w-7xl bg-gray-200 dark:bg-black border border-black dark:border-gray-400">
            <Typography uppercase>{t("position.noWallet")}</Typography>
        </div>
    ) : (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col w-full max-w-7xl bg-white dark:bg-black border border-black dark:border-gray-400">
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
                <div className="w-full flex flex-col md:flex-row justify-between">
                    <div className="w-full md:w-1/3 p-6 flex-col border-b border-black md:border-r">
                        <Typography
                            variant="xs"
                            uppercase
                            className={{ root: "mb-2" }}
                        >
                            {t("position.rewards.guaranteed.label")}
                        </Typography>
                        <div className="flex flex-col gap-2">
                            {loading || !guaranteedRewards ? (
                                new Array(collaterals?.length || 1)
                                    .fill(null)
                                    .map((_, index) => (
                                        <TokenAmount key={index} loading />
                                    ))
                            ) : (
                                <div className="flex items-center gap-2">
                                    {guaranteedRewards.map((reward) => {
                                        return (
                                            <TokenAmount
                                                key={reward.currency.address}
                                                amount={reward}
                                            />
                                        );
                                    })}
                                </div>
                            )}
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
                        <div className="flex flex-col gap-2">
                            {loading || !maximumRewards ? (
                                new Array(collaterals?.length || 1)
                                    .fill(null)
                                    .map((_, index) => (
                                        <TokenAmount key={index} loading />
                                    ))
                            ) : (
                                <div className="flex items-center gap-2">
                                    {maximumRewards.map((reward) => {
                                        return (
                                            <TokenAmount
                                                key={reward.currency.address}
                                                amount={reward}
                                            />
                                        );
                                    })}
                                </div>
                            )}
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
                        {loading ||
                        !kpiTokenCollateralBalances ||
                        loadingKPITokenCollateralBalances ? (
                            new Array(collaterals?.length || 1)
                                .fill(null)
                                .map((_, index) => (
                                    <TokenAmount key={index} loading />
                                ))
                        ) : (
                            <div className="flex items-center gap-2">
                                {kpiTokenCollateralBalances.map((reward) => {
                                    return (
                                        <TokenAmount
                                            key={reward.currency.address}
                                            amount={reward}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex flex-col md:flex-row justify-between border-black border-b">
                    <div className="w-full md:w-1/2 p-6 flex-col border-b border-black md:border-b-0 md:border-r">
                        <Typography
                            variant="xs"
                            uppercase
                            className={{ root: "mb-2" }}
                        >
                            {t("position.balance.label")}
                        </Typography>
                        <TokenAmount amount={balance} loading={loading} />
                    </div>
                    <div className="w-full md:w-1/2 p-6 flex-col">
                        <Typography
                            variant="xs"
                            uppercase
                            className={{ root: "mb-2" }}
                        >
                            {t("position.rewards.claimable.label")}
                        </Typography>
                        {loading || !redeemableRewards ? (
                            new Array(collaterals?.length || 1)
                                .fill(null)
                                .map((_, index) => (
                                    <TokenAmount key={index} loading />
                                ))
                        ) : (
                            <div className="flex items-center gap-2">
                                {redeemableRewards.map((reward) => {
                                    return (
                                        <TokenAmount
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
                    <RecoverCollateral
                        t={t}
                        onTx={onTx}
                        kpiToken={kpiToken}
                        collaterals={collaterals}
                        kpiTokenCollateralBalances={kpiTokenCollateralBalances}
                    />
                )}
            </div>
        </div>
    );
};
