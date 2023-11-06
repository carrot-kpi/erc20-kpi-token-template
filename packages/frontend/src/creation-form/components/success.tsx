import { type ReactElement, useCallback } from "react";
import { Button, Typography } from "@carrot-kpi/ui";
import type {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
} from "@carrot-kpi/react";
import { ReactComponent as CarrotFlag } from "../../assets/carrot-flag.svg";

interface SuccessProps {
    t: NamespacedTranslateFunction;
    navigate: KPITokenCreationFormProps<object>["navigate"];
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
        <div className="w-full h-full flex justify-center">
            <div className="h-fit flex flex-col gap-6 items-center p-8 max-w-lg rounded-xl border border-black dark:border-white bg-white dark:bg-black mx-4 my-10">
                <CarrotFlag className="w-52 h-52" />
                <Typography className={{ root: "text-center" }}>
                    {t("success.text")}
                </Typography>
                <Button size="small" onClick={handleClick}>
                    {t("success.button.label")}
                </Button>
            </div>
        </div>
    );
};
