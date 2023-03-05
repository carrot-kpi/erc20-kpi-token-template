import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { KPIToken } from "@carrot-kpi/sdk";
import { Loader } from "@carrot-kpi/ui";
import { CollateralData } from "../../../../creation-form/types";
import { FinalizableOracle } from "../../../types";

interface WalletActionsProps {
    t: NamespacedTranslateFunction;
    kpiToken: KPIToken;
    collaterals?: CollateralData[];
    oracles?: FinalizableOracle[];
}

export const WalletActions = ({
    t,
    kpiToken,
    collaterals,
    oracles,
}: WalletActionsProps) => {
    if (!collaterals || !oracles)
        return (
            <div className="w-full p-6 flex justify-center">
                <Loader />
            </div>
        );
    if (!kpiToken.finalized) {
        const toBeFinalizedOracles = oracles.reduce(
            (amount: number, oracle) => {
                return !oracle.finalized ? amount + 1 : amount;
            },
            0
        );
        if (toBeFinalizedOracles > 0) return null;
        return (
            <div className="w-full p-6 flex justify-center">
                {t("position.actions.finalized")}
            </div>
        );
    }
    return null;
};
