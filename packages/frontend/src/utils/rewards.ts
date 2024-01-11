import { Amount, Token } from "@carrot-kpi/sdk";
import type { RewardData } from "../page/types";
import type { FinalizableOracle } from "../page/types";

interface GetRewardAmountPlusFeesArgs {
    amount: bigint;
    protocolFeePpm: bigint;
}

export const getRewardAmountPlusFees = ({
    amount,
    protocolFeePpm,
}: GetRewardAmountPlusFeesArgs) => {
    return amount + (amount * protocolFeePpm) / 1_000_000n;
};

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
    if (kpiTokenSupply.isZero())
        return rewards.map(
            (reward) => new Amount(reward.amount.currency, reward.amount.raw),
        );
    return rewards.map(
        (reward) =>
            new Amount(
                reward.amount.currency,
                (reward.amount.raw * kpiTokenBalance.raw) / kpiTokenSupply.raw,
            ),
    );
};

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

    return rewards.map((reward) => {
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
    jitFunding: boolean,
): Amount<Token>[] => {
    return kpiTokenRewardBalances
        .map((balance) => {
            if (jitFunding) return balance;

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
