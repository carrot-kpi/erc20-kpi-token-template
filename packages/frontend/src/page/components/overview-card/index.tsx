import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { KpiToken } from "@carrot-kpi/sdk";
import { Chip, Typography } from "@carrot-kpi/ui";
import DOMPurify from "dompurify";
import { ReactElement } from "react";
import { shortenAddress } from "../../../utils/address";

interface OverviewCardProps {
    t: NamespacedTranslateFunction;
    kpiToken: KpiToken;
}

export const OverviewCard = ({
    t,
    kpiToken,
}: OverviewCardProps): ReactElement => (
    <div className="rounded-xxl bg-white dark:bg-black w-full max-w-6xl border-black border">
        <div className="flex border-black border-b">
            <div className="p-3">
                <div className="rounded-full bg-blue h-6 w-6" />
            </div>
            <div className="p-3 border-black border-l">
                <Typography>DXDAO</Typography>
            </div>
        </div>
        <div className="flex flex-col gap-8 p-3 border-b border-black">
            <div
                className="prose prose-sm max-w-none scrollbar overflow-y-auto max-h-[300px]"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                        kpiToken.specification.description
                    ),
                }}
            />
            <div className="flex flex-wrap gap-3">
                {kpiToken.specification.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                ))}
            </div>
        </div>
        <div className="flex">
            <div className="w-1/3 border-r border-black">
                <div className="p-3 border-b border-black">
                    <Typography variant="sm" uppercase>
                        {t("overview.rewards.label")}
                    </Typography>
                </div>
                <div className="flex flex-col gap-3 p-3">
                    <div className="flex justify-between">
                        <Typography variant="sm" uppercase>
                            {t("overview.creator.label")}
                        </Typography>
                        {/* TODO: get creator address */}
                        <Typography>0x2f...abcb</Typography>
                    </div>
                    <div className="flex justify-between">
                        <Typography variant="sm" uppercase>
                            {t("overview.contract.label")}
                        </Typography>
                        <Typography variant="sm">
                            {shortenAddress(kpiToken.address)}
                        </Typography>
                    </div>
                </div>
            </div>
            <div className="w-1/3 border-r border-black">
                <div className="p-3 border-b border-black">
                    <Typography variant="sm" uppercase>
                        {t("overview.time.label")}
                    </Typography>
                </div>
                <div className="flex flex-col gap-3 p-3">
                    <div className="flex justify-between">
                        <Typography variant="sm" uppercase>
                            {t("overview.token.label")}
                        </Typography>
                        {/* TODO: get carrot token */}
                        <Typography uppercase>gSWAPRTVL-0929</Typography>
                    </div>
                    <div className="flex justify-between">
                        <Typography variant="sm" uppercase>
                            {t("overview.supply.label")}
                        </Typography>
                        {/* TODO: get total supply */}
                        <Typography variant="sm" uppercase>
                            999
                        </Typography>
                    </div>
                </div>
            </div>
            <div className="w-1/3">
                <div className="p-3 border-b border-black">
                    <Typography variant="sm" uppercase>
                        {t("overview.participants.label")}
                    </Typography>
                </div>
                <div className="flex flex-col gap-3 p-3">
                    <div className="flex justify-between">
                        <Typography variant="sm" uppercase>
                            {t("overview.resolution.label")}
                        </Typography>
                        {/* TODO: get carrot token */}
                        <Typography>29/09/2022 2:00 PM UTC</Typography>
                    </div>
                    <div className="flex justify-between">
                        <Typography variant="sm" uppercase>
                            {t("overview.reward.label")}
                        </Typography>
                        {/* TODO: get total supply */}
                        <Typography variant="sm" uppercase>
                            ALL OR NONE
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
