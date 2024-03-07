import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Typography } from "@carrot-kpi/ui";
import { cva } from "class-variance-authority";
import type { Reward } from "../../../types";
import { RewardRow } from "./row";

const containerStyles = cva(
    ["flex", "max-h-48", "flex-col", "gap-1", "overflow-y-auto"],
    {
        variants: {
            noBorder: {
                false: [
                    "rounded-xxl",
                    "border",
                    "border-black",
                    "px-4",
                    "py-2",
                ],
            },
        },
    },
);

const headerStyles = cva(["grid"], {
    variants: {
        noMinimumPayout: {
            true: ["grid-cols-rewardsNoMinimumPayout"],
            false: ["grid-cols-rewards"],
        },
    },
});

interface RewardsTableProps {
    t: NamespacedTranslateFunction;
    protocolFeePpm: bigint;
    onRemove?: (index: number) => void;
    rewards?: Reward[];
    noEdit?: boolean;
    noFees?: boolean;
    noUSDValue?: boolean;
    noMinimumPayout?: boolean;
    noBorder?: boolean;
}

export const RewardsTable = ({
    t,
    protocolFeePpm,
    noEdit,
    noFees,
    noUSDValue = false,
    noMinimumPayout = false,
    noBorder = false,
    onRemove,
    rewards,
}: RewardsTableProps) => {
    return (
        <div className="flex flex-col gap-2">
            <div className={headerStyles({ noMinimumPayout })}>
                <Typography weight="medium" variant="sm">
                    {t("label.rewards.table.reward")}
                </Typography>
                <Typography
                    weight="medium"
                    className={{
                        root: noMinimumPayout ? "text-right" : "text-center",
                    }}
                    variant="sm"
                >
                    {t("label.rewards.table.amount")}
                </Typography>
                {!noMinimumPayout && (
                    <Typography
                        weight="medium"
                        className={{ root: "text-right" }}
                        variant="sm"
                    >
                        {t("label.rewards.table.minimum.payout")}
                    </Typography>
                )}
            </div>
            <div className={containerStyles({ noBorder })}>
                {!rewards || rewards.length === 0 ? (
                    <Typography
                        variant="sm"
                        className={{
                            root: "h-10 flex justify-center items-center",
                        }}
                        weight="medium"
                    >
                        {t("label.rewards.table.empty")}
                    </Typography>
                ) : (
                    rewards.map((reward, index) => {
                        return (
                            <RewardRow
                                t={t}
                                protocolFeePpm={protocolFeePpm}
                                noEdit={noEdit}
                                noFees={noFees}
                                noUSDValue={noUSDValue}
                                noMinimumPayout={noMinimumPayout}
                                key={reward.address}
                                index={index}
                                onRemove={onRemove}
                                {...reward}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
