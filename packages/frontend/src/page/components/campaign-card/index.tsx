import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { KPIToken } from "@carrot-kpi/sdk";
import {
    Card,
    CardContent,
    CardTitle,
    Chip,
    Markdown,
    Typography,
} from "@carrot-kpi/ui";
import { commify, formatUnits } from "ethers/lib/utils.js";
import { ReactElement } from "react";
import sanitizeHtml from "sanitize-html";
import { CollateralData } from "../../../creation-form/types";
import { shortenAddress } from "../../../utils/address";
import { formatCountDownString, formatDate } from "../../../utils/dates";
import { KpiTokenData } from "../../types";
import { CollateralRow } from "../collateral-row";
import { InfoSection } from "./info-section";
import { Content } from "./info-section/content";
import { Header } from "./info-section/header";
import { ReactComponent as ClockSvg } from "../../../assets/clock.svg";

interface CampaignCardProps {
    t: NamespacedTranslateFunction;
    specification: KPIToken["specification"];
    collaterals: CollateralData[];
    kpiTokenData: KpiTokenData;
    owner: string;
}

export const CampaignCard = ({
    t,
    specification,
    collaterals,
    kpiTokenData,
    owner,
}: CampaignCardProps): ReactElement => (
    <Card className={{ root: "w-full max-w-6xl" }}>
        <CardTitle>{specification.title}</CardTitle>
        <CardContent>
            <Markdown
                className={{
                    root: "p-3 max-h-[300px] max-w-none overflow-y-auto",
                }}
            >
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(specification.description),
                    }}
                />
            </Markdown>
            <div className="p-3 flex flex-wrap gap-3">
                {specification.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row">
                <InfoSection>
                    <Header>
                        <div className="flex items-center justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.rewards.label")}
                            </Typography>
                            <div className="flex flex-row gap-2">
                                {collaterals.map((collateral) => {
                                    return (
                                        <CollateralRow
                                            key={
                                                collateral.amount.currency
                                                    .address
                                            }
                                            collateral={collateral}
                                            display={"amount"}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </Header>
                    <Content>
                        <div className="flex justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.contract.label")}
                            </Typography>
                            <Typography variant="sm">
                                {shortenAddress(kpiTokenData.address)}
                            </Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.owner.label")}
                            </Typography>
                            <Typography variant="sm">
                                {shortenAddress(owner)}
                            </Typography>
                        </div>
                    </Content>
                </InfoSection>
                <InfoSection className={{ root: "hidden lg:block" }}>
                    <Header>
                        <div className="flex items-center justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.minimumPayout.label")}
                            </Typography>
                            <div className="flex flex-row gap-2">
                                {collaterals.map((collateral) => {
                                    return (
                                        <CollateralRow
                                            key={
                                                collateral.amount.currency
                                                    .address
                                            }
                                            collateral={collateral}
                                            display={"minimumPayout"}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </Header>
                    <Content>
                        <div className="flex items-center justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.token.label")}
                            </Typography>
                            <Typography variant="sm">
                                {kpiTokenData.name} ({kpiTokenData.symbol})
                            </Typography>
                        </div>
                        <div className="flex items-center justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.supply.label")}
                            </Typography>
                            <Typography variant="sm" uppercase>
                                {kpiTokenData.initialSupply
                                    ? commify(
                                          formatUnits(
                                              kpiTokenData.initialSupply,
                                              18
                                          )
                                      )
                                    : "Loading..."}
                            </Typography>
                        </div>
                    </Content>
                </InfoSection>
                <InfoSection>
                    <Header>
                        <div className="flex items-center justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.time.label")}
                            </Typography>
                            <div className="flex justify-between gap-2 items-center">
                                <ClockSvg className="stroke-black dark:stroke-white" />
                                <Typography variant="sm">
                                    {formatCountDownString(
                                        new Date(
                                            kpiTokenData.expiration
                                        ).getTime() - new Date().getTime()
                                    )}
                                </Typography>
                            </div>
                        </div>
                    </Header>
                    <Content>
                        <div className="flex justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.expiration.label")}
                            </Typography>
                            <Typography variant="sm">
                                {formatDate(new Date(kpiTokenData.expiration))}
                            </Typography>
                        </div>
                        <div className="flex justify-between">
                            <Typography variant="sm" uppercase>
                                {t("overview.condition.type.label")}
                            </Typography>
                            <Typography variant="sm" uppercase>
                                {kpiTokenData.allOrNone
                                    ? t("overview.condition.allOrNone.label")
                                    : t("overview.condition.classic.label")}
                            </Typography>
                        </div>
                    </Content>
                </InfoSection>
            </div>
        </CardContent>
    </Card>
);
