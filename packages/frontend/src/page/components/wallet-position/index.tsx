import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Amount, KPIToken, Token } from "@carrot-kpi/sdk";
import { Typography } from "@carrot-kpi/ui";
import { ReactElement, useEffect, useState } from "react";
import { Address, useAccount, useBalance } from "wagmi";
import { CollateralData } from "../../../creation-form/types";
import {
    getGuaranteedRewards,
    getMaximumRewards,
    getRedeemableRewards,
} from "../../../utils/collaterals";
import { useWatchKPITokenCollateralBalances } from "../../hooks/useWatchKPITokenCollateralBalances";
import { FinalizableOracle } from "../../types";
import { TokenAmount } from "../token-amount";
import { WalletActions } from "./actions";

interface WalletPositionProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    kpiToken: KPIToken;
    collaterals?: CollateralData[];
    oracles?: FinalizableOracle[];
    initialSupply?: Amount<Token> | null;
    erc20Symbol?: string;
    erc20Name?: string;
}

export const WalletPosition = ({
    t,
    loading,
    kpiToken,
    collaterals,
    oracles,
    initialSupply,
    erc20Symbol,
    erc20Name,
}: WalletPositionProps): ReactElement => {
    const { address: connectedAddress } = useAccount();
    const { data: rawKpiTokenBalance } = useBalance({
        address: connectedAddress,
        token: kpiToken.address as Address,
    });
    const {
        balances: kpiTokenCollateralBalances,
        loading: loadingKPITokenCollateralBalances,
    } = useWatchKPITokenCollateralBalances(kpiToken.address, collaterals);

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
            getRedeemableRewards(oracles, balance, initialSupply, collaterals)
        );
    }, [
        collaterals,
        erc20Name,
        erc20Symbol,
        initialSupply,
        kpiToken.address,
        kpiToken.chainId,
        oracles,
        rawKpiTokenBalance,
    ]);

    return !connectedAddress ? (
        <div className="flex p-6 h-60 items-center justify-center w-full max-w-6xl bg-gray-200 dark:bg-black">
            <Typography uppercase>{t("position.noWallet")}</Typography>
        </div>
    ) : (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col w-full max-w-6xl bg-white dark:bg-black border border-black dark:border-gray-400">
                <div className="w-full p-6 bg-gray-200 dark:bg-gray-700 border-b border-black dark:border-gray-400">
                    <Typography
                        weight="medium"
                        className={{
                            root: "text-ellipsis overflow-hidden ...",
                        }}
                    >
                        {connectedAddress}
                    </Typography>
                </div>
                <div className="w-full p-6 flex flex-col sm:flex-row justify-between gap-6 border-black border-b">
                    <div className="flex-col">
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
                    <div className="flex-col">
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
                    <div className="flex-col">
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
                <div className="w-full flex justify-between gap-4">
                    <div className="w-1/2 p-6 border-black border-r">
                        <Typography
                            variant="xs"
                            uppercase
                            className={{ root: "mb-2" }}
                        >
                            {t("position.balance.label")}
                        </Typography>
                        <TokenAmount amount={balance} loading={loading} />
                    </div>
                    <div className="w-1/2 p-6">
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
            </div>
            <WalletActions
                t={t}
                collaterals={collaterals}
                redeemableRewards={redeemableRewards}
                oracles={oracles}
            />
        </div>
    );
};
