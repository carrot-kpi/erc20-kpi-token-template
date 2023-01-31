import { Amount, Fetcher, KPIToken } from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { ReactElement, useEffect, useState } from "react";
import {
    NamespacedTranslateFunction,
    useWatchKPITokenData,
} from "@carrot-kpi/react";
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
import { defaultAbiCoder } from "ethers/lib/utils.js";
import { CollateralData } from "../creation-form/types";
import { FinalizableOracle } from "./types";
import { BigNumber } from "ethers";
import { useProvider } from "wagmi";

interface PageProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    kpiToken: KPIToken;
    data: string;
}

export const Component = ({ t, kpiToken }: PageProps): ReactElement => {
    const provider = useProvider();
    const { loading, data } = useWatchKPITokenData(kpiToken.address);

    const [unrecoverableError, setUnrecoverableError] = useState(false);
    const [collaterals, setCollaterals] = useState<CollateralData[]>([]);
    const [finalizableOracles, setFinalizableOracles] = useState<
        FinalizableOracle[]
    >([]);
    const [allOrNone, setAllOrNone] = useState(false);
    const [initialSupply, setInitialSupply] = useState<BigNumber | null>(null);
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            if (!data) return;
            const [
                rawCollaterals,
                rawFinalizableOracles,
                rawAllOrNone,
                rawInitialSupply,
                rawName,
                rawSymbol,
            ] = defaultAbiCoder.decode(
                [
                    "tuple(address token,uint256 amount,uint256 minimumPayout)[]",
                    "tuple(address addrezz,uint256 lowerBound,uint256 higherBound,uint256 finalResult,uint256 weight,bool finalized)[]",
                    "bool",
                    "uint256",
                    "string",
                    "string",
                ],
                data
            ) as [
                {
                    token: string;
                    amount: BigNumber;
                    minimumPayout: BigNumber;
                }[],
                FinalizableOracle[],
                boolean,
                BigNumber,
                string,
                string
            ];

            const erc20Tokens = await Fetcher.fetchERC20Tokens(
                provider,
                rawCollaterals.map((collateral) => collateral.token)
            );
            const transformedCollaterals = rawCollaterals.map(
                (rawCollateral) => {
                    const token = erc20Tokens[rawCollateral.token];
                    if (!token) return null;
                    return {
                        amount: new Amount(token, rawCollateral.amount),
                        minimumPayout: new Amount(
                            token,
                            rawCollateral.minimumPayout
                        ),
                    };
                }
            );
            if (transformedCollaterals.some((collateral) => !collateral)) {
                if (!cancelled) setUnrecoverableError(true);
                return;
            }
            if (!cancelled)
                setCollaterals(transformedCollaterals as CollateralData[]);
            if (!cancelled) setFinalizableOracles(rawFinalizableOracles);
            if (!cancelled) setAllOrNone(rawAllOrNone);
            if (!cancelled) setInitialSupply(rawInitialSupply);
            if (!cancelled) setName(rawName);
            if (!cancelled) setSymbol(rawSymbol);
        };
        void fetchData();
        return () => {
            cancelled = true;
        };
    }, [data, provider]);

    return (
        <div className="overflow-x-hidden">
            <div className="bg-grid-orange bg-orange flex flex-col items-center gap-6 px-2 py-3 sm:px-9 sm:py-5 md:items-start md:px-36 md:py-24">
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
                            <div className="flex justify-between">
                                <Typography variant="sm" uppercase>
                                    {t("overview.rewards.label")}
                                </Typography>
                                <div className="flex flex-col gap-2">
                                    {collaterals.map((collateral) => {
                                        const { address, symbol } =
                                            collateral.amount.currency;
                                        return (
                                            <div key={address}>
                                                <div className="mr-2 inline-block">
                                                    <Typography>
                                                        {collateral.amount.toString()}
                                                    </Typography>
                                                </div>
                                                <Typography>
                                                    {symbol}
                                                </Typography>
                                            </div>
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
            <div className="bg-grid-white m-5 flex flex-col gap-[124px] bg-white px-2 py-3 dark:bg-black sm:px-9 sm:py-5 md:px-36 md:py-24">
                <div className="flex flex-col gap-12">
                    <Typography variant="h2">{t("account.title")}</Typography>
                    <div className="flex h-96 w-full max-w-6xl items-center justify-center bg-gray-200">
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
