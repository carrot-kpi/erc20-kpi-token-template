import { KpiToken } from "@carrot-kpi/sdk";
import { ReactElement } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";

import "../global.css";
import { i18n } from "i18next";

interface PageProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    kpiToken: KpiToken;
}

export const Component = ({ t, kpiToken }: PageProps): ReactElement => {
    return (
        <>
            {t("main")}
            <br />
            Address: {kpiToken.address}
            Title: {kpiToken.specification.title}
            Description: {kpiToken.specification.description}
            Tags: {kpiToken.specification.tags.join(", ")}
        </>
    );
};
