import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Amount, KPIToken, Token } from "@carrot-kpi/sdk";
import { Skeleton, Typography } from "@carrot-kpi/ui";
import { commify } from "ethers/lib/utils.js";
import { ReactElement, useEffect, useState } from "react";
import { Address, useAccount, useBalance } from "wagmi";
import { CollateralData } from "../../../creation-form/types";
import { FinalizableOracle } from "../../types";
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
    const { isConnected, address } = useAccount();
    const { data: rawKpiTokenBalance } = useBalance({
        address,
        token: kpiToken.address as Address,
    });

    const [balance, setBalance] = useState<Amount<Token> | null>(null);
    const [guaranteedRewards, setGuaranteedRewards] = useState<
        Amount<Token>[] | null
    >(null);
    const [maximumRewards, setMaximumRewards] = useState<
        Amount<Token>[] | null
    >(null);

    useEffect(() => {
        if (!rawKpiTokenBalance || !initialSupply) return;
        const balance = new Amount(
            initialSupply.currency,
            rawKpiTokenBalance.value
        );
        setBalance(balance);
        if (!collaterals || !initialSupply) return;
        if (collaterals.length === 0) {
            setGuaranteedRewards(null);
            return;
        }
        const { maximum, guaranteed } = collaterals.reduce(
            (
                accumulator: {
                    guaranteed: Amount<Token>[];
                    maximum: Amount<Token>[];
                },
                collateral
            ) => {
                accumulator.maximum.push(
                    new Amount(
                        collateral.amount.currency,
                        collateral.amount.raw
                            .mul(balance.raw)
                            .div(initialSupply.raw)
                    )
                );
                if (collateral.minimumPayout.isZero()) return accumulator;
                accumulator.guaranteed.push(
                    new Amount(
                        collateral.minimumPayout.currency,
                        collateral.minimumPayout.raw
                            .mul(balance.raw)
                            .div(initialSupply.raw)
                    )
                );
                return accumulator;
            },
            { guaranteed: [], maximum: [] }
        );
        setMaximumRewards(maximum);
        setGuaranteedRewards(guaranteed);
    }, [
        collaterals,
        erc20Name,
        erc20Symbol,
        initialSupply,
        kpiToken.address,
        kpiToken.chainId,
        rawKpiTokenBalance,
    ]);

    return (
        <div className="flex flex-col w-full max-w-6xl bg-white dark:bg-black border border-black dark:border-gray-400">
            {!isConnected ? (
                <div className="p-6">
                    <Typography variant="2xl" uppercase>
                        WALLET NOT CONNECTED
                    </Typography>
                </div>
            ) : (
                <>
                    <div className="w-full p-6 bg-gray-300 dark:bg-gray-700 border-b border-black dark:border-gray-400">
                        <Typography
                            weight="medium"
                            className={{
                                root: "text-ellipsis overflow-hidden ...",
                            }}
                        >
                            {address}
                        </Typography>
                    </div>
                    <div className="w-full p-6 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("position.balance.label")}
                            </Typography>
                            {loading || !balance ? (
                                <Skeleton width="60px" />
                            ) : (
                                <Typography weight="medium">
                                    {`${commify(balance.toFixed(4))}
                                    ${balance.currency.symbol}`}
                                </Typography>
                            )}
                        </div>
                        <div className="flex-col">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("position.rewards.guaranteed.label")}
                            </Typography>
                            {loading || !guaranteedRewards ? (
                                <Skeleton width="60px" />
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {guaranteedRewards.map((reward) => {
                                        return (
                                            <Typography
                                                key={reward.currency.address}
                                                weight="medium"
                                            >
                                                {commify(reward.toFixed(4))}
                                                {reward.currency.symbol}
                                            </Typography>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="flex-col">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("position.rewards.maximum.label")}
                            </Typography>
                            {loading || !maximumRewards ? (
                                <Skeleton width="60px" />
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {maximumRewards.map((reward) => {
                                        return (
                                            <Typography
                                                key={reward.currency.address}
                                                weight="medium"
                                            >
                                                {commify(reward.toFixed(4))}
                                                {reward.currency.symbol}
                                            </Typography>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <WalletActions
                        t={t}
                        kpiToken={kpiToken}
                        collaterals={collaterals}
                        oracles={oracles}
                    />
                </>
            )}
        </div>
    );
};
