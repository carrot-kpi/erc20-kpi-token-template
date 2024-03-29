import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    Amount,
    ResolvedKPIToken,
    Token,
    formatCurrencyAmount,
} from "@carrot-kpi/sdk";
import {
    Card,
    CardContent,
    Chip,
    Markdown,
    Skeleton,
    Typography,
} from "@carrot-kpi/ui";
import type { ReactElement } from "react";
import type { RewardData } from "../../types";
import { shortenAddress } from "../../../utils/address";
import { RewardsRow } from "../rewards-row";
import { TimeLeft } from "./time-left";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

interface CampaignCardProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    kpiToken: ResolvedKPIToken;
    rewards?: RewardData[] | null;
    allOrNone?: boolean | null;
    initialSupply?: Amount<Token> | null;
    currentSupply?: Amount<Token> | null;
}

export const CampaignCard = ({
    t,
    loading,
    kpiToken,
    rewards,
    initialSupply,
    currentSupply,
}: CampaignCardProps): ReactElement => {
    const { data: ensName, isLoading: loadingENSName } = useEnsName({
        address: kpiToken.owner,
        chainId: mainnet.id,
    });

    return (
        <Card
            className={{ root: "w-full max-w-screen-2xl dark:border-gray-400" }}
        >
            <CardContent>
                <div className="flex flex-col gap-1 border-b border-black w-full py-3 px-4">
                    <Typography uppercase variant="xs">
                        {t("overview.owner.label")}
                    </Typography>
                    {loadingENSName ? (
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
                    <Markdown data-testid="campaign-card-description-text">
                        {kpiToken.specification.description}
                    </Markdown>
                </div>
                <div className="p-4 flex flex-wrap gap-3">
                    {kpiToken.specification.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                    ))}
                </div>
                <div className="w-full md:h-auto flex flex-col md:flex-row border-t border-black">
                    <div className="py-3 px-4 flex md:flex-col lg:flex-row items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.rewards.label")}
                        </Typography>
                        <div
                            data-testid="campaign-card-rewards"
                            className="flex flex-col gap-2"
                        >
                            {loading || !rewards ? (
                                <RewardsRow loading />
                            ) : (
                                rewards.map((reward) => {
                                    return (
                                        <RewardsRow
                                            data-testid={`campaign-card-reward-${reward.amount.currency.address}`}
                                            key={reward.amount.currency.address}
                                            reward={reward}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-4 flex md:flex-col lg:flex-row items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.minimumPayout.label")}
                        </Typography>
                        <div
                            data-testid="campaign-card-minimum-payouts"
                            className="flex flex-col gap-2"
                        >
                            {loading || !rewards ? (
                                <RewardsRow loading />
                            ) : (
                                rewards.map((reward) => {
                                    return (
                                        <RewardsRow
                                            data-testid={`campaign-card-minimum-payout-${reward.amount.currency.address}`}
                                            key={reward.amount.currency.address}
                                            reward={reward}
                                            minimumPayout
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <div className="py-3 px-4 flex md:flex-col lg:flex-row items-center justify-between w-full md:w-1/3 gap-8">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.token.label")}
                        </Typography>
                        {loading || !initialSupply ? (
                            <Skeleton width="40px" />
                        ) : (
                            <Typography
                                data-testid="campaign-card-kpi-token-text"
                                truncate
                            >
                                {initialSupply.currency.name} (
                                {initialSupply.currency.symbol})
                            </Typography>
                        )}
                    </div>
                </div>
                <div className="w-full md:h-auto flex flex-col md:flex-row border-t border-black">
                    <div className="py-3 px-4 flex md:flex-col lg:flex-row items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.supply.initial.label")}
                        </Typography>
                        {loading || !initialSupply ? (
                            <Skeleton />
                        ) : (
                            <Typography
                                data-testid={
                                    "campaign-card-kpi-token-initial-supply-text"
                                }
                                uppercase
                                truncate
                            >
                                {formatCurrencyAmount({
                                    amount: initialSupply,
                                })}
                            </Typography>
                        )}
                    </div>
                    <div className="py-3 px-4 flex md:flex-col lg:flex-row items-center justify-between w-full md:w-1/3 gap-8 border-b md:border-r md:border-b-0 border-black">
                        <Typography
                            uppercase
                            className={{ root: "whitespace-nowrap flex-1" }}
                        >
                            {t("overview.supply.current.label")}
                        </Typography>
                        {loading || !currentSupply ? (
                            <Skeleton width="60px" />
                        ) : (
                            <Typography
                                data-testid={
                                    "campaign-card-kpi-token-current-supply-text"
                                }
                                uppercase
                                truncate
                            >
                                {formatCurrencyAmount({
                                    amount: currentSupply,
                                })}
                            </Typography>
                        )}
                    </div>
                    <div className="py-3 px-4 flex md:flex-col lg:flex-row items-center justify-between w-full md:w-1/3 gap-8">
                        <Typography uppercase>
                            {t("overview.time.label")}
                        </Typography>
                        <div data-testid="campaign-card-time-left">
                            <TimeLeft t={t} kpiToken={kpiToken} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
