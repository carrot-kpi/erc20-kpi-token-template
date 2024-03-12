import { type ReactElement, useCallback } from "react";
import { Button, Markdown, Typography } from "@carrot-kpi/ui";
import type {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
} from "@carrot-kpi/react";
import { ReactComponent as CarrotFlag } from "../../assets/carrot-flag.svg";
import { ReactComponent as XLogo } from "../../assets/x-logo.svg";
import { ReactComponent as TelegramLogo } from "../../assets/telegram-logo.svg";
import type { State } from "../types";
import { RewardsTable } from "./rewards/table";
import { getCampaignLink } from "../utils/campaign";
import { ClipboardCopy } from "../../ui/clipboard-copy";
import { SHARE_INTENT_BASE_URL } from "../constants";

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
        <div className="w-full h-full min-h-[1000px] flex flex-col gap-8 items-center">
            <div className="w-full h-fit flex flex-col gap-8 items-center">
                <CarrotFlag className="w-52 h-52" />
                <Typography
                    uppercase
                    weight="medium"
                    className={{ root: "text-center" }}
                >
                    {t("success.text")}
                </Typography>
            </div>
            <div className="w-full h-fit flex flex-col gap-3 items-center py-4 px-8 max-w-lg rounded-xl border border-black dark:border-white bg-white dark:bg-black">
                <div className="flex flex-col gap-3 justify-center w-full">
                    <Typography variant="h3">
                        {t("success.campaign.title")}
                    </Typography>
                    <div className="w-full h-[1px] border-dotted border-b border-black" />
                    <div className="flex flex-col max-h-64 gap-2 overflow-y-auto cui-scrollbar">
                        <Typography weight="medium" uppercase>
                            {state.title}
                        </Typography>
                        <Markdown className={{ root: "prose-sm" }}>
                            {state.description}
                        </Markdown>
                    </div>
                    <div className="w-full h-[1px] border-dotted border-b border-black" />
                    <RewardsTable
                        t={t}
                        rewards={state.rewards}
                        protocolFeePpm={protocolFeePpm}
                        noEdit
                        noFees
                        noBorder
                    />
                </div>
            </div>
            <div className="w-full h-fit flex flex-col gap-3 items-center py-4 px-8 max-w-lg rounded-xl border border-black dark:border-white bg-white dark:bg-black">
                <div className="flex flex-col gap-3 justify-center w-full">
                    <Typography variant="h3">
                        {t("success.campaign.share.title")}
                    </Typography>
                    <div className="w-full h-[1px] border-dotted border-b border-black" />
                    <div className="flex flex-col gap-2">
                        <Typography variant="sm">
                            {t("success.campaign.share.url")}
                        </Typography>
                        <div className="flex gap-2">
                            <Typography weight="medium" uppercase truncate>
                                {`carrot.eth/${state.title?.replace(/\s+/g, "")}`}
                            </Typography>
                            <ClipboardCopy
                                text={getCampaignLink(kpiTokenAddress)}
                            />
                        </div>
                    </div>
                    <div className="w-full h-[1px] border-dotted border-b border-black" />
                    <div className="flex flex-col gap-2">
                        <Typography variant="sm">
                            {t("success.summary.share.label")}
                        </Typography>
                        <div className="flex gap-1 justify-center">
                            <a
                                href={SHARE_INTENT_BASE_URL["x"](
                                    kpiTokenAddress,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <XLogo height={39} width={39} />
                            </a>
                            <a
                                href={SHARE_INTENT_BASE_URL["telegram"](
                                    kpiTokenAddress,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <TelegramLogo height={39} width={39} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-lg">
                <Button
                    data-testid="successs-step-go-to-campaign-button"
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
