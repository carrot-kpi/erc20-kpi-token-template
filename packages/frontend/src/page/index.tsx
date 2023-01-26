import { KpiToken } from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { ReactElement } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { i18n } from "i18next";
import { ReactComponent as ShareIcon } from "../assets/share.svg";
import { ReactComponent as ReportIcon } from "../assets/report.svg";

import "../global.css";
import { OverviewCard } from "./components/overview-card";

interface PageProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    kpiToken: KpiToken;
}

export const Component = ({ t, kpiToken }: PageProps): ReactElement => {
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
                <OverviewCard t={t} kpiToken={kpiToken} />
            </div>
            <div className="bg-white bg-grid-white dark:bg-black m-5 px-2 py-3 sm:px-9 sm:py-5 md:px-36 md:py-24">
                <Typography variant="h2">{t("account.title")}</Typography>
            </div>
        </div>
    );
};
