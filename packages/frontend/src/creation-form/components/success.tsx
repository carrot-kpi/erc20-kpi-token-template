import { type ReactElement, useCallback } from "react";
import { Button, Markdown, Timer, Typography } from "@carrot-kpi/ui";
import type {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
} from "@carrot-kpi/react";
import { ReactComponent as CarrotFlag } from "../../assets/carrot-flag.svg";
import type { State } from "../types";
import { RewardsTable } from "./rewards/table";

interface SuccessProps {
    t: NamespacedTranslateFunction;
    navigate: KPITokenCreationFormProps<object>["navigate"];
    state: State;
    protocolFeePpm: bigint;
    kpiTokenAddress: string;
}

export const Success = ({
    t,
    navigate,
    state,
    protocolFeePpm,
    kpiTokenAddress,
}: SuccessProps): ReactElement => {
    const handleClick = useCallback(() => {
        navigate(`/campaigns/${kpiTokenAddress}`);
    }, [kpiTokenAddress, navigate]);

    return (
        <div className="w-full h-full min-h-[1000px] flex justify-center">
            <div className="h-fit flex flex-col gap-3 items-center p-8 max-w-lg rounded-xl border border-black dark:border-white bg-white dark:bg-black mx-4 my-10">
                <CarrotFlag className="w-52 h-52" />
                <Typography className={{ root: "text-center" }}>
                    {t("success.text")}
                </Typography>
                <div className="w-full h-[1px] bg-black dark:bg-white" />
                <div className="flex flex-col gap-3 justify-center w-full">
                    <Typography
                        variant="h2"
                        className={{ root: "text-center" }}
                    >
                        {state.title}
                    </Typography>
                    <div className="rounded-xxl border border-black px-4 py-2 dark:border-white max-h-[500px] overflow-y-auto cui-scrollbar">
                        <Markdown
                            className={{ root: "prose-sm max-h-[500px]" }}
                        >
                            {state.description}
                        </Markdown>
                    </div>
                    <div className="rounded-xxl border border-black px-4 py-2 dark:border-white">
                        <RewardsTable
                            t={t}
                            rewards={state.rewards}
                            protocolFeePpm={protocolFeePpm}
                            noEdit
                            noFees
                            noMinimumPayout
                            noBorder
                        />
                    </div>
                    {!!state.expiration && (
                        <div className="rounded-xxl border border-black px-4 py-2 dark:border-white">
                            <div className="flex gap-1 justify-between">
                                <Typography>
                                    {t("success.summary.time.label")}
                                </Typography>
                                <Timer to={state.expiration} countdown />
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    size="small"
                    onClick={handleClick}
                    className={{ root: "w-full" }}
                >
                    {t("success.button.label")}
                </Button>
            </div>
        </div>
    );
};
