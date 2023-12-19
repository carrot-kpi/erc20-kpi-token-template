import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ResolvedKPIToken } from "@carrot-kpi/sdk";
import { Chip, Timer } from "@carrot-kpi/ui";

interface TimeLeftProps {
    t: NamespacedTranslateFunction;
    kpiToken: ResolvedKPIToken;
}

export const TimeLeft = ({ t, kpiToken }: TimeLeftProps) => {
    if (kpiToken.finalized)
        return (
            <Chip className={{ root: "bg-green bg-opacity-80 uppercase" }}>
                {t("overview.finalized")}
            </Chip>
        );
    if (kpiToken.expired)
        return (
            <Chip className={{ root: "bg-red bg-opacity-80 uppercase" }}>
                {t("overview.expired")}
            </Chip>
        );
    return <Timer to={kpiToken.expiration} countdown />;
};
