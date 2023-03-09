import { Amount, Token } from "@carrot-kpi/sdk";
import { BigNumber } from "ethers";
import { CollateralData } from "../creation-form/types";
import { FinalizableOracle } from "../page/types";

export const getGuaranteedRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[]
) => {
    return collaterals.map(
        (collateral) =>
            new Amount(
                collateral.minimumPayout.currency,
                collateral.minimumPayout.raw
                    .mul(kpiTokenBalance.raw)
                    .div(kpiTokenInitialSupply.raw)
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
                collateral.amount.raw
                    .mul(kpiTokenBalance.raw)
                    .div(kpiTokenInitialSupply.raw)
            )
    );
};

const MULTIPLIER = BigNumber.from(2).pow(64);

export const getRedeemableRewards = (
    oracles: FinalizableOracle[],
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[]
): Amount<Token>[] => {
    if (kpiTokenBalance.isZero() || oracles.some((oracle) => !oracle.finalized))
        return collaterals.map(
            (collateral) =>
                new Amount(collateral.amount.currency, BigNumber.from(0))
        );

    // replicating the on-chain logic, calculate the remaining collaterals
    // after all the oracles have settled
    const totalWeight = oracles.reduce(
        (accumulator: BigNumber, oracle) => accumulator.add(oracle.weight),
        BigNumber.from(0)
    );
    const remainingCollateralsAfterResolutions = [...collaterals];
    for (const oracle of oracles) {
        const oracleFullRange = oracle.higherBound.sub(oracle.lowerBound);
        const finalOracleProgress = oracle.finalResult.gte(oracle.higherBound)
            ? oracleFullRange
            : oracle.finalResult.sub(oracle.lowerBound);
        if (finalOracleProgress < oracleFullRange) {
            for (
                let i = 0;
                i < remainingCollateralsAfterResolutions.length;
                i++
            ) {
                const collateral = remainingCollateralsAfterResolutions[i];
                const numerator = collateral.amount.raw
                    .sub(collateral.minimumPayout.raw)
                    .mul(oracle.weight)
                    .mul(oracleFullRange.sub(finalOracleProgress))
                    .mul(MULTIPLIER);
                const denominator = oracleFullRange.mul(totalWeight);
                const reimboursement = numerator
                    .div(denominator)
                    .div(MULTIPLIER);
                remainingCollateralsAfterResolutions[i] = {
                    amount: new Amount(
                        collateral.amount.currency,
                        collateral.amount.raw.sub(reimboursement)
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
            collateral.amount.raw
                .mul(kpiTokenBalance.raw)
                .div(kpiTokenInitialSupply.raw)
        );
    });
};
