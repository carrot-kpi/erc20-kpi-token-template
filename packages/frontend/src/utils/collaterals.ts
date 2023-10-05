import { Amount, Token } from "@carrot-kpi/sdk";
import type { CollateralData } from "../creation-form/types";
import type { FinalizableOracle } from "../page/types";

export const getGuaranteedRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[],
) => {
    console.log("getGuaranteedRewards", {
        kpiTokenInitialSupply: kpiTokenInitialSupply.raw,
    });
    return collaterals.map(
        (collateral) =>
            new Amount(
                collateral.minimumPayout.currency,
                (collateral.minimumPayout.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw,
            ),
    );
};

export const getMaximumRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[],
) => {
    console.log("getMaximumRewards", {
        kpiTokenInitialSupply: kpiTokenInitialSupply.raw,
    });
    return collaterals.map(
        (collateral) =>
            new Amount(
                collateral.amount.currency,
                (collateral.amount.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw,
            ),
    );
};

const MULTIPLIER = 2n ** 64n;

export const getRedeemableRewards = (
    oracles: FinalizableOracle[],
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    collaterals: CollateralData[],
    expired: boolean,
): Amount<Token>[] => {
    if (kpiTokenBalance.isZero() || oracles.some((oracle) => !oracle.finalized))
        return collaterals.map(
            (collateral) => new Amount(collateral.amount.currency, 0n),
        );

    if (expired) {
        console.log("getRedeemableRewards (expired)", {
            kpiTokenInitialSupply: kpiTokenInitialSupply.raw,
        });
        return collaterals.map((collateral) => {
            return new Amount(
                collateral.minimumPayout.currency,
                (collateral.minimumPayout.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw,
            );
        });
    }

    // replicating the on-chain logic, calculate the remaining collaterals
    // after all the oracles have settled
    const totalWeight = oracles.reduce(
        (accumulator: bigint, oracle) => accumulator + oracle.weight,
        0n,
    );
    console.log("getRedeemableRewards totalWeight", {
        totalWeight,
        oracles,
    });
    const remainingCollateralsAfterResolutions = [...collaterals];
    for (const oracle of oracles) {
        if (oracle.finalResult < 1_000_000) {
            for (
                let i = 0;
                i < remainingCollateralsAfterResolutions.length;
                i++
            ) {
                const collateral = remainingCollateralsAfterResolutions[i];
                const numerator =
                    (collateral.amount.raw - collateral.minimumPayout.raw) *
                    oracle.weight *
                    (1_000_000n - oracle.finalResult) *
                    MULTIPLIER;
                const denominator = 1_000_000n * totalWeight;
                console.log("getRedeemableRewards denominator", {
                    denominator,
                });
                const reimboursement = numerator / denominator / MULTIPLIER;
                remainingCollateralsAfterResolutions[i] = {
                    amount: new Amount(
                        collateral.amount.currency,
                        collateral.amount.raw - reimboursement,
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
                kpiTokenInitialSupply.raw,
        );
    });
};

export const getRecoverableRewards = (
    collaterals: CollateralData[],
    kpiTokenCollateralBalances: Amount<Token>[],
    expired: boolean,
): Amount<Token>[] => {
    return kpiTokenCollateralBalances
        .map((balance) => {
            const neededAmount = collaterals.find(
                (collateral) => collateral.amount.currency === balance.currency,
            );
            if (!neededAmount) return new Amount(balance.currency, 0n);

            let recoverableAmount: Amount<Token>;
            if (expired)
                recoverableAmount = new Amount(
                    balance.currency,
                    balance.raw - neededAmount.minimumPayout.raw,
                );
            else
                recoverableAmount = new Amount(
                    balance.currency,
                    balance.raw - neededAmount.amount.raw,
                );

            return recoverableAmount;
        })
        .filter((balance) => balance.gt(0));
};
