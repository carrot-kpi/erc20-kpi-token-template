import { type ReactElement, useCallback } from "react";
import { Button, Typography } from "@carrot-kpi/ui";
import type { KPITokenCreationFormProps } from "@carrot-kpi/react";

interface SuccessProps {
    navigate: KPITokenCreationFormProps["navigate"];
    kpiTokenAddress: string;
}

export const Success = ({
    navigate,
    kpiTokenAddress,
}: SuccessProps): ReactElement => {
    const handleClick = useCallback(() => {
        navigate(`/campaigns/${kpiTokenAddress}`);
    }, [kpiTokenAddress, navigate]);

    return (
        <div className="flex flex-col items-center gap-6">
            <Typography className={{ root: "text-center" }}>
                {"test"}
            </Typography>
            <Button size="small" onClick={handleClick}>
                {"test"}
            </Button>
        </div>
    );
};
