import { useCallback, useState } from "react";
import { Typography, Popover } from "@carrot-kpi/ui";
import type { RewardData } from "../../types";
import { TokenAmount } from "../token-amount";

interface RewardsRowProps {
    loading?: boolean;
    reward?: RewardData;
    minimumPayout?: boolean;
}

export const RewardsRow = ({
    loading,
    reward,
    minimumPayout,
}: RewardsRowProps) => {
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

    const handleMouseEnter = useCallback(() => {
        setOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <div
                className="flex cursor-pointer gap-2"
                ref={setAnchor}
                onMouseEnter={reward && handleMouseEnter}
                onMouseLeave={reward && handleMouseLeave}
            >
                <TokenAmount
                    loading={loading || !reward}
                    amount={
                        minimumPayout ? reward?.minimumPayout : reward?.amount
                    }
                />
            </div>
            {reward && (
                <Popover anchor={anchor} open={open} placement="bottom">
                    <Typography className={{ root: "p-3" }}>
                        {reward.amount.currency.name} (
                        {reward.amount.currency.symbol})
                    </Typography>
                </Popover>
            )}
        </>
    );
};
