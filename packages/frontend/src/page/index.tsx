import { KpiToken } from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { ReactElement } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { i18n } from "i18next";
import { ReactComponent as ShareIcon } from "../assets/share.svg";
import { ReactComponent as ReportIcon } from "../assets/report.svg";

import "../global.css";
import { CampaignCardExpanded } from "../ui/campaign-card-expanded";
import { shortenAddress } from "../utils/address";
import { InfoSection } from "../ui/campaign-card-expanded/info-section";
import { Header } from "../ui/campaign-card-expanded/info-section/header";
import { Content } from "../ui/campaign-card-expanded/info-section/content";
import { formatDate } from "../utils/dates";

interface PageProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    kpiToken: KpiToken;
}

export const Component = ({ i18n, t, kpiToken }: PageProps): ReactElement => {
    return (
        <div className="overflow-x-hidden">
            <div className="bg-grid-orange bg-orange items-center md:items-start px-2 py-3 sm:px-9 sm:py-5 md:px-36 md:py-24 flex flex-col gap-6">
                <Typography variant="h2">
                    {kpiToken.specification.title}
                </Typography>
                <div className="flex gap-6">
                    <Button
                        variant="secondary"
                        size="small"
                        icon={ShareIcon}
                        className={{
                            icon: "stroke-black",
                            root: "[&>svg]:hover:stroke-white",
                        }}
                        onClick={() => console.log("share")}
                    >
                        {t("share")}
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        icon={ReportIcon}
                        className={{
                            icon: "stroke-black",
                            root: "[&>svg]:hover:stroke-white",
                        }}
                        onClick={() => console.log("report")}
                    >
                        {t("report")}
                    </Button>
                </div>
                <CampaignCardExpanded
                    description={kpiToken.specification.description}
                    tags={kpiToken.specification.tags}
                >
                    <InfoSection>
                        <Header>
                            <Typography variant="sm" uppercase>
                                {t("overview.rewards.label")}
                            </Typography>
                        </Header>
                        <Content>
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.contract.label")}
                                </Typography>
                                <Typography variant="sm">
                                    {shortenAddress(kpiToken.address)}
                                </Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.creator.label")}
                                </Typography>
                                <Typography variant="sm">{"..."}</Typography>
                            </div>
                        </Content>
                    </InfoSection>
                    <InfoSection>
                        <Header>
                            <Typography variant="sm" uppercase>
                                {t("overview.time.label")}
                            </Typography>
                        </Header>
                        <Content>
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.token.label")}
                                </Typography>
                                <Typography variant="sm" uppercase>
                                    {"..."}
                                </Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.supply.label")}
                                </Typography>
                                <Typography variant="sm" uppercase>
                                    {"..."}
                                </Typography>
                            </div>
                        </Content>
                    </InfoSection>
                    <InfoSection>
                        <Header>
                            <Typography variant="sm" uppercase>
                                {t("overview.participants.label")}
                            </Typography>
                        </Header>
                        <Content>
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.resolution.label")}
                                </Typography>
                                <Typography variant="sm">
                                    {formatDate(new Date(kpiToken.expiration))}
                                </Typography>
                            </div>
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.reward.label")}
                                </Typography>
                                <Typography variant="sm" uppercase>
                                    {"..."}
                                </Typography>
                            </div>
                        </Content>
                    </InfoSection>
                </CampaignCardExpanded>
            </div>
            <div className="flex flex-col gap-[124px] bg-white bg-grid-white dark:bg-black m-5 px-2 py-3 sm:px-9 sm:py-5 md:px-36 md:py-24">
                <div className="flex flex-col gap-12">
                    <Typography variant="h2">{t("account.title")}</Typography>
                    <div className="flex items-center justify-center h-96 w-full max-w-6xl bg-gray-200">
                        <Button onClick={() => console.log("connect")}>
                            {t("account.connect")}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-12">
                    <Typography variant="h2">{t("oracle.title")}</Typography>
                    {/*TODO: add oracle view component*/}
                    {/* <Campaign
                        i18n={i18n}
                        fallback={<Loader />}
                        address={kpiToken.oracles[0].address}
                        customBaseUrl="http://localhost:9002/"
                    /> */}
                </div>
                <div className="flex flex-col gap-12">
                    <Typography variant="h2">{t("widgets.title")}</Typography>
                    {/*TODO: add campaign widgets*/}
                </div>
            </div>
        </div>
    );
};
