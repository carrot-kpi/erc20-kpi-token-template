import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { KPIToken } from "@carrot-kpi/sdk";
import {
    Card,
    CardContent,
    CardTitle,
    Chip,
    Markdown,
    Skeleton,
    Timer,
    Typography,
} from "@carrot-kpi/ui";
import { commify, formatUnits } from "ethers/lib/utils.js";
import { ReactElement } from "react";
import { CollateralData } from "../../../creation-form/types";
import { shortenAddress } from "../../../utils/address";
import { CollateralRow } from "../collateral-row";
import { InfoSection } from "./info-section";
import { Content } from "./info-section/content";
import { Header } from "./info-section/header";
import { BigNumber } from "ethers";

interface CampaignCardProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    kpiToken: KPIToken;
    collaterals?: CollateralData[] | null;
    allOrNone?: boolean | null;
    erc20Name?: string | null;
    erc20Symbol?: string | null;
    erc20TotalSupply?: BigNumber | null;
}

export const CampaignCard = ({
    t,
    loading,
    kpiToken,
    collaterals,
    allOrNone,
    erc20Name,
    erc20Symbol,
    erc20TotalSupply,
}: CampaignCardProps): ReactElement => {
    return (
        <Card className={{ root: "w-full max-w-6xl dark:border-gray-400" }}>
            <CardTitle>
                <Typography>{shortenAddress(kpiToken.owner)}</Typography>
            </CardTitle>
            <CardContent>
                <Markdown
                    className={{
                        root: "p-4",
                    }}
                >
                    {kpiToken.specification.description}
                </Markdown>
                <div className="p-4 flex flex-wrap gap-3">
                    {kpiToken.specification.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row">
                    <InfoSection>
                        <Header>
                            <div className="flex items-center justify-between">
                                <Typography uppercase>
                                    {t("overview.rewards.label")}
                                </Typography>
                                <div className="flex flex-row gap-2">
                                    {loading || !collaterals ? (
                                        <CollateralRow loading />
                                    ) : (
                                        collaterals.map((collateral) => {
                                            return (
                                                <CollateralRow
                                                    key={
                                                        collateral.amount
                                                            .currency.address
                                                    }
                                                    collateral={collateral}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </Header>
                        <Content>
                            <div className="flex items-center justify-between">
                                <Typography uppercase>
                                    {t("overview.token.label")}
                                </Typography>
                                {loading || !erc20Name || !erc20Symbol ? (
                                    <Skeleton width="40px" />
                                ) : (
                                    <Typography>
                                        {erc20Name} ({erc20Symbol})
                                    </Typography>
                                )}
                            </div>
                        </Content>
                    </InfoSection>
                    <InfoSection className={{ root: "hidden lg:block" }}>
                        <Header>
                            <div className="flex items-center justify-between">
                                <Typography uppercase>
                                    {t("overview.minimumPayout.label")}
                                </Typography>
                                <div className="flex flex-row gap-2">
                                    {loading || !collaterals ? (
                                        <CollateralRow loading />
                                    ) : (
                                        collaterals.map((collateral) => {
                                            return (
                                                <CollateralRow
                                                    key={
                                                        collateral.amount
                                                            .currency.address
                                                    }
                                                    collateral={collateral}
                                                    minimumPayout
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </Header>
                        <Content>
                            <div className="flex items-center justify-between">
                                <Typography uppercase>
                                    {t("overview.supply.label")}
                                </Typography>
                                {loading || !erc20TotalSupply ? (
                                    <Skeleton />
                                ) : (
                                    <Typography uppercase>
                                        {commify(
                                            formatUnits(erc20TotalSupply, 18)
                                        )}
                                    </Typography>
                                )}
                            </div>
                        </Content>
                    </InfoSection>
                    <InfoSection>
                        <Header>
                            <div className="flex items-center justify-between">
                                <Typography uppercase>
                                    {t("overview.time.label")}
                                </Typography>
                                <div className="flex justify-between gap-2 items-center">
                                    <Timer
                                        to={kpiToken.expiration}
                                        countdown
                                        icon
                                    />
                                </div>
                            </div>
                        </Header>
                        <Content>
                            <div className="flex justify-between">
                                <Typography uppercase>
                                    {t("overview.condition.type.label")}
                                </Typography>
                                {loading ? (
                                    <Skeleton width="60px" />
                                ) : (
                                    <Typography uppercase>
                                        {allOrNone
                                            ? t(
                                                  "overview.condition.allOrNone.label"
                                              )
                                            : t(
                                                  "overview.condition.classic.label"
                                              )}
                                    </Typography>
                                )}
                            </div>
                        </Content>
                    </InfoSection>
                </div>
            </CardContent>
        </Card>
    );
};
