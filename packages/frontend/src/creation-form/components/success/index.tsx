import { ReactElement, useCallback } from "react";
import { Button, Typography } from "@carrot-kpi/ui";
import {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
} from "@carrot-kpi/react";

interface SuccessProps {
    t: NamespacedTranslateFunction;
    navigate: KPITokenCreationFormProps["navigate"];
    kpiTokenAddress: string;
}

export const Success = ({
    t,
    navigate,
    kpiTokenAddress,
}: SuccessProps): ReactElement => {
    const handleClick = useCallback(() => {
        navigate(`/campaigns/${kpiTokenAddress}`);
    }, [kpiTokenAddress, navigate]);

    return (
        <div className="flex flex-col items-center gap-6">
            <Typography>{t("success.text")}</Typography>
            <Button size="small" onClick={handleClick}>
                {t("success.button.label")}
            </Button>
        </div>
    );
};
