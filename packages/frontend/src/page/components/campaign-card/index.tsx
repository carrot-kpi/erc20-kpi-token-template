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
import { BigNumber } from "ethers";

// TODO:
// States to handle:

// - Awaiting finalization (show how many oracles are left to finalize)
// - Finalizable (oracles have reported their result but the KPI token needs to be finalized in order to access the collateral)
// - 2 cases after finalization:
//     - Something to redeem: show a redeem button alongside a prediction of how much people can redeem
//     - Nothing to redeem: show a burn KPI tokens button

interface CampaignCardProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    kpiToken: KPIToken;
    collaterals?: CollateralData[] | null;
    allOrNone?: boolean | null;
    initialSupply?: BigNumber | null;
    erc20Name?: string | null;
    erc20Symbol?: string | null;
    erc20Supply?: BigNumber | null;
}

export const CampaignCard = ({
    t,
    loading,
    kpiToken,
    collaterals,
    initialSupply,
    erc20Name,
    erc20Symbol,
    erc20Supply,
}: CampaignCardProps): ReactElement => {
    return (
        <Card className={{ root: "w-full max-w-6xl dark:border-gray-400" }}>
            <CardTitle>
                <Typography>{shortenAddress(kpiToken.owner)}</Typography>
            </CardTitle>
            <CardContent>
                <Markdown className={{ root: "p-4" }}>
                    {kpiToken.specification.description}
                </Markdown>
                <div className="p-4 flex flex-wrap gap-3">
                    {kpiToken.specification.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                    ))}
                </div>
                <div className="w-full h-36 md:h-auto flex flex-col md:flex-row border-t border-black">
                    <div className="py-3 px-4 flex items-center justify-between flex-1 border-b md:border-r md:border-b-0 border-black">
                        <Typography uppercase>
                            {t("overview.rewards.label")}
                        </Typography>
                        <div className="flex flex-col gap-2">
                            {loading || !collaterals ? (
                                <CollateralRow loading />
                            ) : (
                                collaterals.map((collateral) => {
                                    return (
                                        <CollateralRow
                                            key={
                                                collateral.amount.currency
                                                    .address
                                            }
                                            collateral={collateral}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-4 flex items-center justify-between flex-1 border-b md:border-r md:border-b-0 border-black">
                        <Typography uppercase>
                            {t("overview.minimumPayout.label")}
                        </Typography>
                        <div className="flex flex-col gap-2">
                            {loading || !collaterals ? (
                                <CollateralRow loading />
                            ) : (
                                collaterals.map((collateral) => {
                                    return (
                                        <CollateralRow
                                            key={
                                                collateral.amount.currency
                                                    .address
                                            }
                                            collateral={collateral}
                                            minimumPayout
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-4 flex items-center justify-between flex-1">
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
                </div>
                <div className="w-full h-36 md:h-auto flex flex-col md:flex-row border-t border-black">
                    <div className="h-12 px-4 flex items-center justify-between flex-1 border-b md:border-r md:border-b-0 border-black">
                        <Typography uppercase>
                            {t("overview.supply.initial.label")}
                        </Typography>
                        {loading || !initialSupply ? (
                            <Skeleton />
                        ) : (
                            <Typography uppercase>
                                {commify(formatUnits(initialSupply, 18))}
                            </Typography>
                        )}
                    </div>
                    <div className="h-12 px-4 flex items-center justify-between flex-1 border-b md:border-r md:border-b-0 border-black">
                        <Typography uppercase>
                            {t("overview.supply.current.label")}
                        </Typography>
                        {loading || !erc20Supply ? (
                            <Skeleton width="60px" />
                        ) : (
                            <Typography uppercase>
                                {commify(formatUnits(erc20Supply, 18))}
                            </Typography>
                        )}
                    </div>
                    <div className="h-12 px-4 flex items-center justify-between flex-1">
                        <Typography uppercase>
                            {t("overview.time.label")}
                        </Typography>
                        <div className="flex justify-between gap-2 items-center">
                            <Timer to={kpiToken.expiration} countdown />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
