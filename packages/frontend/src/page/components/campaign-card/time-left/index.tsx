import { ResolvedKPIToken } from "@carrot-kpi/sdk";
import { Timer, Typography } from "@carrot-kpi/ui";

interface TimeLeftProps {
    kpiToken: ResolvedKPIToken;
}

export const TimeLeft = ({ kpiToken }: TimeLeftProps) => {
    if (kpiToken.finalized)
        return (
            <Typography uppercase className={{ root: "text-green" }}>
                {"test"}
            </Typography>
        );
    if (kpiToken.expired)
        return (
            <Typography uppercase className={{ root: "text-red" }}>
                {"test"}
            </Typography>
        );
    return <Timer to={kpiToken.expiration} countdown />;
};
