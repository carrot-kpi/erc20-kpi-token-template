import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ResolvedKPIToken } from "@carrot-kpi/sdk";
import {
    Card,
    CardContent,
    Chip,
    Markdown,
    Skeleton,
    Typography,
} from "@carrot-kpi/ui";
import type { ReactElement } from "react";
import type { CollateralData } from "../../../creation-form/types";
import { shortenAddress } from "../../../utils/address";
import { CollateralRow } from "../collateral-row";
import { TimeLeft } from "./time-left";
import { type Address, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { formatUnits } from "viem";

interface CampaignCardProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    kpiToken: ResolvedKPIToken;
    collaterals?: CollateralData[] | null;
    allOrNone?: boolean | null;
    initialSupply?: bigint | null;
    erc20Name?: string | null;
    erc20Symbol?: string | null;
    erc20Supply?: bigint | null;
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
    const { data: ensName, isLoading: resolvingENSName } = useEnsName({
        address: kpiToken.owner as Address,
        chainId: mainnet.id,
    });

    return (
        <Card className={{ root: "w-full max-w-6xl dark:border-gray-400" }}>
            <CardContent>
                <div className="flex flex-col gap-1 border-b border-black w-full py-3 px-4">
                    <Typography uppercase variant="xs">
                        {t("overview.owner.label")}
                    </Typography>
                    {resolvingENSName ? (
                        <Skeleton width="100px" />
                    ) : (
                        <Typography truncate>
                            {ensName || shortenAddress(kpiToken.owner)}
                        </Typography>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full py-3 px-4">
                    <Typography uppercase variant="xs">
                        {t("overview.description.label")}
                    </Typography>
                    <Markdown>{kpiToken.specification.description}</Markdown>
                </div>
                <div className="p-4 flex flex-wrap gap-3">
                    {kpiToken.specification.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                    ))}
                </div>
                <div className="w-full h-36 md:h-auto flex flex-col md:flex-row border-t border-black">
                    <div className="py-3 px-4 flex items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
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
                    <div className="py-3 px-4 flex items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
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
                    <div className="py-3 px-4 flex items-center justify-between w-full md:w-1/3 gap-8">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.token.label")}
                        </Typography>
                        {loading || !erc20Name || !erc20Symbol ? (
                            <Skeleton width="40px" />
                        ) : (
                            <Typography truncate>
                                {erc20Name} ({erc20Symbol})
                            </Typography>
                        )}
                    </div>
                </div>
                <div className="w-full h-36 md:h-auto flex flex-col md:flex-row border-t border-black">
                    <div className="h-12 px-4 flex items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.supply.initial.label")}
                        </Typography>
                        {loading || !initialSupply ? (
                            <Skeleton />
                        ) : (
                            <Typography uppercase truncate>
                                {/* FIXME: reintroduce commify to make number easier to read */}
                                {formatUnits(initialSupply, 18)}
                            </Typography>
                        )}
                    </div>
                    <div className="h-12 px-4 flex items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.supply.current.label")}
                        </Typography>
                        {loading || !erc20Supply ? (
                            <Skeleton width="60px" />
                        ) : (
                            <Typography uppercase truncate>
                                {/* FIXME: reintroduce commify to make number easier to read */}
                                {formatUnits(erc20Supply, 18)}
                            </Typography>
                        )}
                    </div>
                    <div className="h-12 px-4 flex items-center justify-between w-full md:w-1/3 gap-8">
                        <Typography uppercase>
                            {t("overview.time.label")}
                        </Typography>
                        <TimeLeft t={t} kpiToken={kpiToken} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
