import { KPIToken } from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { ReactElement, useEffect, useState } from "react";
import {
    NamespacedTranslateFunction,
    useWatchData,
    OraclePage,
} from "@carrot-kpi/react";
import { i18n } from "i18next";

import "../global.css";
import { CollateralData } from "../creation-form/types";
import { Address, useNetwork, useProvider, useToken } from "wagmi";
import { ReactComponent as External } from "../assets/external.svg";
import { Loader } from "../ui/loader";
import { CampaignCard } from "./components/campaign-card";
import { Account } from "./components/account";
import { ExpandableContent } from "../ui/expandable-content";
import { decodeKPITokenData } from "../utils/data-decoding";

interface PageProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    kpiToken: KPIToken;
    data: string;
}

export const Component = ({ i18n, t, kpiToken }: PageProps): ReactElement => {
    const provider = useProvider();
    const { chain } = useNetwork();

    const { loading: loadingERC20Data, data } = useWatchData(kpiToken.address);

    const { data: tokenData } = useToken({
        address: kpiToken.address as Address,
    });

    const [decodingKPITokenData, setDecodingKPITokenData] = useState(false);
    const [collaterals, setCollaterals] = useState<CollateralData[]>([]);
    const [allOrNone, setAllOrNone] = useState(false);
    const [openInExplorerHref, setOpenInExplorerHref] = useState("");

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            if (!data) return;
            if (!cancelled) setDecodingKPITokenData(true);
            let decoded;
            try {
                decoded = await decodeKPITokenData(provider, data);
            } catch (error) {
                console.warn("could not decode kpi token data", error);
            } finally {
                if (!cancelled) setDecodingKPITokenData(false);
            }
            if (!decoded) return;
            setCollaterals(decoded.collaterals);
            setAllOrNone(decoded.allOrNone);
        };
        void fetchData();
        return () => {
            cancelled = true;
        };
    }, [data, provider]);

    useEffect(() => {
        if (!chain || !chain.blockExplorers) return;
        setOpenInExplorerHref(
            `${chain.blockExplorers.default.url}/address/${kpiToken.address}`
        );
    }, [chain, kpiToken.address]);

    return (
        <div className="overflow-x-hidden">
            <div className="bg-grid-light bg-orange flex flex-col items-center gap-6 px-2 py-3 sm:px-9 sm:py-5 md:items-start md:px-36 md:py-24">
                <Typography
                    variant="h2"
                    className={{ root: "dark:text-black" }}
                >
                    {kpiToken.specification.title}
                </Typography>
                {/* TODO: enable when functionality is clear */}
                <div className="flex gap-6">
                    <Button
                        size="xsmall"
                        iconPlacement="right"
                        icon={External}
                        variant="primary"
                        href={openInExplorerHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("open.explorer")}
                    </Button>
                    {/* <Button
                        size="small"
                        iconPlacement="left"
                        icon={ReportIcon}
                        variant="primary"
                        onClick={() => console.log("report")}
                    >
                        {t("report")}
                    </Button> */}
                </div>
                <CampaignCard
                    t={t}
                    loading={decodingKPITokenData || loadingERC20Data}
                    kpiToken={kpiToken}
                    collaterals={collaterals}
                    allOrNone={allOrNone}
                    erc20Name={tokenData?.name}
                    erc20Symbol={tokenData?.symbol}
                    erc20TotalSupply={tokenData?.totalSupply.value}
                />
            </div>
            <div className="bg-white dark:bg-black">
                <div className="bg-grid-light dark:bg-grid-dark flex flex-col gap-7 md:gap-9 lg:gap-28 bg-white px-2 py-3 dark:bg-black sm:px-9 sm:py-6 md:px-36 md:py-24">
                    <div className="flex flex-col mt-7 sm:mt-0 gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("position.title")}
                        </Typography>
                        <Account
                            t={t}
                            loading={loadingERC20Data || decodingKPITokenData}
                            kpiToken={kpiToken}
                            erc20Symbol={tokenData?.symbol}
                        />
                    </div>
                    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("oracle.title", {
                                count: kpiToken.oracles.length,
                            })}
                        </Typography>
                        {kpiToken.oracles.length === 1 ? (
                            <div className="border border-black">
                                <OraclePage
                                    i18n={i18n}
                                    fallback={<Loader />}
                                    oracle={kpiToken.oracles[0]}
                                />
                            </div>
                        ) : (
                            kpiToken.oracles.map((oracle) => {
                                return (
                                    <ExpandableContent
                                        key={oracle.address}
                                        summary="Oracle template"
                                    >
                                        <div className="w-full max-w-6xl p-10 bg-white dark:bg-black">
                                            <OraclePage
                                                i18n={i18n}
                                                fallback={<Loader />}
                                                oracle={kpiToken.oracles[0]}
                                            />
                                        </div>
                                    </ExpandableContent>
                                );
                            })
                        )}
                    </div>
                    {/* TODO: implement widgets */}
                    {/* <div className="flex flex-col gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("widgets.title")}
                        </Typography>
                    </div> */}
                </div>
            </div>
        </div>
    );
};
