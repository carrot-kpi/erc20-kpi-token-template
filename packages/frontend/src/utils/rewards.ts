import { Amount, Token } from "@carrot-kpi/sdk";
import type { RewardData } from "../page/types";
import type { FinalizableOracle } from "../page/types";

export const getGuaranteedRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    rewards: RewardData[],
) => {
    return rewards.map(
        (reward) =>
            new Amount(
                reward.minimumPayout.currency,
                (reward.minimumPayout.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw,
            ),
    );
};

export const getMaximumRewards = (
    kpiTokenBalance: Amount<Token>,
    kpiTokenSupply: Amount<Token>,
    rewards: RewardData[],
) => {
    return rewards.map(
        (reward) =>
            new Amount(
                reward.amount.currency,
                (reward.amount.raw * kpiTokenBalance.raw) / kpiTokenSupply.raw,
            ),
    );
};

const MULTIPLIER = 2n ** 64n;

export const getRedeemableRewards = (
    oracles: FinalizableOracle[],
    kpiTokenBalance: Amount<Token>,
    kpiTokenInitialSupply: Amount<Token>,
    kpiTokenCurrentSupply: Amount<Token>,
    rewards: RewardData[],
    expired: boolean,
): Amount<Token>[] => {
    if (kpiTokenBalance.isZero() || oracles.some((oracle) => !oracle.finalized))
        return rewards.map((reward) => new Amount(reward.amount.currency, 0n));

    if (expired) {
        return rewards.map((reward) => {
            return new Amount(
                reward.minimumPayout.currency,
                (reward.minimumPayout.raw * kpiTokenBalance.raw) /
                    kpiTokenInitialSupply.raw,
            );
        });
    }

    // replicating the on-chain logic, calculate the remaining rewards
    // after all the oracles have settled
    const totalWeight = oracles.reduce(
        (accumulator: bigint, oracle) => accumulator + oracle.weight,
        0n,
    );
    const remainingRewardsAfterResolutions = [...rewards];
    for (const oracle of oracles) {
        if (oracle.finalResult < 1_000_000) {
            for (let i = 0; i < remainingRewardsAfterResolutions.length; i++) {
                const reward = remainingRewardsAfterResolutions[i];
                const numerator =
                    (reward.amount.raw - reward.minimumPayout.raw) *
                    oracle.weight *
                    (1_000_000n - oracle.finalResult) *
                    MULTIPLIER;
                const denominator = 1_000_000n * totalWeight;
                const reimboursement = numerator / denominator / MULTIPLIER;
                remainingRewardsAfterResolutions[i] = {
                    amount: new Amount(
                        reward.amount.currency,
                        reward.amount.raw - reimboursement,
                    ),
                    minimumPayout: reward.minimumPayout,
                };
            }
        }
    }

    // based on the remaining reward, the initial supply, and the user's
    // holdings, calculate the redeemable rewards
    return remainingRewardsAfterResolutions.map((reward) => {
        return new Amount(
            reward.amount.currency,
            (reward.amount.raw * kpiTokenBalance.raw) /
                kpiTokenCurrentSupply.raw,
        );
    });
};

export const getRecoverableRewards = (
    rewards: RewardData[],
    kpiTokenRewardBalances: Amount<Token>[],
    expired: boolean,
): Amount<Token>[] => {
    return kpiTokenRewardBalances
        .map((balance) => {
            const neededAmount = rewards.find(
                (reward) => reward.amount.currency === balance.currency,
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
