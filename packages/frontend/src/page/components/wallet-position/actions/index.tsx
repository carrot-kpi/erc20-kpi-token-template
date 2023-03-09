import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Amount, Token } from "@carrot-kpi/sdk";
import { Button } from "@carrot-kpi/ui";
import { useEffect, useState } from "react";
import { CollateralData } from "../../../../creation-form/types";
import { FinalizableOracle } from "../../../types";

interface WalletActionsProps {
    t: NamespacedTranslateFunction;
    collaterals?: CollateralData[];
    redeemableRewards?: Amount<Token>[] | null;
    oracles?: FinalizableOracle[];
}

export const WalletActions = ({
    t,
    collaterals,
    redeemableRewards,
    oracles,
}: WalletActionsProps) => {
    const [loading, setLoading] = useState(false);
    const [redeemable, setRedeemable] = useState(false);

    useEffect(() => {
        if (!collaterals || !oracles || !redeemableRewards) {
            setLoading(true);
            return;
        } else setLoading(false);

        for (const redeemable of redeemableRewards) {
            if (!redeemable.isZero()) {
                setRedeemable(true);
                return;
            }
        }
        setRedeemable(false);
    }, [collaterals, oracles, redeemableRewards]);

    return (
        <Button loading={loading} disabled={!redeemable}>
            {t("redeem")}
        </Button>
    );
};
