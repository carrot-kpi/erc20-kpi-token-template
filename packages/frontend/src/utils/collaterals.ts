import { Amount, Token } from "@carrot-kpi/sdk";
import type { CollateralData } from "../creation-form/types";
import type { FinalizableOracle } from "../page/types";

export const getGuaranteedRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[]
) => {
    return collaterals.map(
        (collateral) =>
            new Amount(
                collateral.minimumPayout.currency,
                (collateral.minimumPayout.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw
            )
    );
};

export const getMaximumRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[]
) => {
    return collaterals.map(
        (collateral) =>
            new Amount(
                collateral.amount.currency,
                (collateral.amount.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw
            )
    );
};

const MULTIPLIER = 2n ** 64n;

export const getRedeemableRewards = (
    oracles: FinalizableOracle[],
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[],
    expired: boolean
): Amount<Token>[] => {
    if (kpiTokenBalance.isZero() || oracles.some((oracle) => !oracle.finalized))
        return collaterals.map(
            (collateral) => new Amount(collateral.amount.currency, 0n)
        );

    if (expired) {
        return collaterals.map((collateral) => {
            return new Amount(
                collateral.minimumPayout.currency,
                (collateral.minimumPayout.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw
            );
        });
    }

    // replicating the on-chain logic, calculate the remaining collaterals
    // after all the oracles have settled
    const totalWeight = oracles.reduce(
        (accumulator: bigint, oracle) => accumulator + oracle.weight,
        0n
    );
    const remainingCollateralsAfterResolutions = [...collaterals];
    for (const oracle of oracles) {
        const oracleFullRange = oracle.higherBound - oracle.lowerBound;
        const finalOracleProgress =
            oracle.finalResult >= oracle.higherBound
                ? oracleFullRange
                : oracle.finalResult - oracle.lowerBound;
        if (finalOracleProgress < oracleFullRange) {
            for (
                let i = 0;
                i < remainingCollateralsAfterResolutions.length;
                i++
            ) {
                const collateral = remainingCollateralsAfterResolutions[i];
                const numerator =
                    (collateral.amount.raw - collateral.minimumPayout.raw) *
                    oracle.weight *
                    (oracleFullRange - finalOracleProgress) *
                    MULTIPLIER;
                const denominator = oracleFullRange * totalWeight;
                const reimboursement = numerator / denominator / MULTIPLIER;
                remainingCollateralsAfterResolutions[i] = {
                    amount: new Amount(
                        collateral.amount.currency,
                        collateral.amount.raw - reimboursement
                    ),
                    minimumPayout: collateral.minimumPayout,
                };
            }
        }
    }

    // based on the remaining collateral, the initial supply, and the user's
    // holdings, calculate the redeemable rewards
    return remainingCollateralsAfterResolutions.map((collateral) => {
        return new Amount(
            collateral.amount.currency,
            (collateral.amount.raw * kpiTokenBalance.raw) /
                kpiTokenInitialSupply.raw
        );
    });
};
