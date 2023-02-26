import { Amount, Fetcher, KPIToken } from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useState } from "react";
import {
    NamespacedTranslateFunction,
    useWatchData,
    useWatchKPITokenOwner,
    OraclePage,
} from "@carrot-kpi/react";
import { i18n } from "i18next";
import { ReactComponent as ShareIcon } from "../assets/share.svg";
import { ReactComponent as ReportIcon } from "../assets/report.svg";

import "../global.css";
import { defaultAbiCoder } from "ethers/lib/utils.js";
import { CollateralData } from "../creation-form/types";
import { FinalizableOracle } from "./types";
import { BigNumber } from "ethers";
import { useProvider } from "wagmi";
import { Loader } from "../ui/loader";
import { CampaignCard } from "./components/campaign-card";
import { Account } from "./components/account";
import { ExpandableContent } from "../ui/expandable-content";

interface PageProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    kpiToken: KPIToken;
    data: string;
}

export const Component = ({ i18n, t, kpiToken }: PageProps): ReactElement => {
    const provider = useProvider();

    const { /* loading: loadingData, */ data } = useWatchData(kpiToken.address);
    const { /* loading: loadingOwner, */ owner } = useWatchKPITokenOwner(
        kpiToken.address
    );

    const [, /* unrecoverableError */ setUnrecoverableError] = useState(false);
    const [collaterals, setCollaterals] = useState<CollateralData[]>([]);
    const [, /* finalizableOracles */ setFinalizableOracles] = useState<
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

            const erc20Tokens = await Fetcher.fetchERC20Tokens({
                provider,
                addresses: rawCollaterals.map((collateral) => collateral.token),
            });

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

    // TODO: what to copy to the clipboard?
    const handleShare = useCallback(() => {
        navigator.clipboard.writeText("");
    }, []);

    return (
        <div className="overflow-x-hidden">
            <div className="bg-grid-dark dark:bg-grid-light bg-orange flex flex-col items-center gap-6 px-2 py-3 sm:px-9 sm:py-5 md:items-start md:px-36 md:py-24">
                <Typography
                    variant="h2"
                    className={{ root: "dark:text-black" }}
                >
                    {kpiToken.specification.title}
                </Typography>
                <div className="flex gap-6">
                    <Button
                        size="small"
                        iconPlacement="left"
                        icon={ShareIcon}
                        variant="primary"
                        onClick={handleShare}
                    >
                        {t("share")}
                    </Button>
                    <Button
                        size="small"
                        iconPlacement="left"
                        icon={ReportIcon}
                        variant="primary"
                        onClick={() => console.log("report")}
                    >
                        {t("report")}
                    </Button>
                </div>
                <CampaignCard
                    t={t}
                    specification={kpiToken.specification}
                    collaterals={collaterals}
                    kpiTokenData={{
                        address: kpiToken.address,
                        name,
                        symbol,
                        initialSupply,
                        expiration: kpiToken.expiration,
                        allOrNone,
                    }}
                    owner={owner}
                />
            </div>
            <div className="bg-white dark:bg-black">
                <div className="bg-grid-light dark:bg-grid-dark flex flex-col gap-7 md:gap-9 lg:gap-28 bg-white px-2 py-3 dark:bg-black sm:px-9 sm:py-6 md:px-36 md:py-24">
                    <div className="flex flex-col mt-7 sm:mt-0 gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("account.title")}
                        </Typography>
                        <Account
                            t={t}
                            kpiTokenData={{
                                address: kpiToken.address,
                                symbol,
                                initialSupply,
                            }}
                            collaterals={collaterals}
                        />
                    </div>
                    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("oracle.title")}
                        </Typography>
                        <ExpandableContent summary="Oracle template">
                            <div className="w-full max-w-6xl p-10 bg-white dark:bg-black">
                                <OraclePage
                                    i18n={i18n}
                                    fallback={<Loader />}
                                    oracle={kpiToken.oracles[0]}
                                />
                            </div>
                        </ExpandableContent>
                    </div>
                    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("widgets.title")}
                        </Typography>
                        {/*TODO: add campaign widgets*/}
                    </div>
                </div>
            </div>
        </div>
    );
};
