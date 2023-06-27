import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ResolvedKPIToken } from "@carrot-kpi/sdk";
import { Timer, Typography } from "@carrot-kpi/ui";

interface TimeLeftProps {
    t: NamespacedTranslateFunction;
    kpiToken: ResolvedKPIToken;
}

export const TimeLeft = ({ t, kpiToken }: TimeLeftProps) => {
    if (kpiToken.finalized)
        return (
            <Typography uppercase className={{ root: "text-green" }}>
                {t("overview.finalized")}
            </Typography>
        );
    if (kpiToken.expired)
        return (
            <Typography uppercase className={{ root: "text-red" }}>
                {t("overview.expired")}
            </Typography>
        );
    return <Timer to={kpiToken.expiration} countdown />;
};
