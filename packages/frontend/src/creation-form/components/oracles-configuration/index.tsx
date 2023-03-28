import { ReactElement, useCallback, useEffect, useState } from "react";
import {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import { NextStepButton } from "@carrot-kpi/ui";
import { i18n } from "i18next";
import { OracleData, SpecificationData } from "../../types";
import { KPIToken, Template } from "@carrot-kpi/sdk";
import { unixTimestamp } from "../../../utils/dates";
import { OraclesAccordion } from "./oracles-accordion";
import { OracleCreationForm } from "./oracle-creation-form";

type AugmentedOracleData = OracleData & {
    initializationBundleGetter?: OracleInitializationBundleGetter;
};

export type AugmentedOracleDataMap = {
    [id: number]: AugmentedOracleData;
};

type Assert = (
    data: AugmentedOracleDataMap
) => asserts data is { [id: number]: Required<AugmentedOracleData> };
const assertInitializationBundleGetterPresent: Assert = (
    data: AugmentedOracleDataMap
) => {
    const dataValues = Object.values(data);
    if (
        dataValues.length === 0 ||
        dataValues.some((item) => !item.initializationBundleGetter)
    )
        throw new Error();
};

interface OraclesConfigurationProps {
    t: NamespacedTranslateFunction;
    i18n: i18n;
    templates: Template[];
    oraclesData: OracleData[];
    specificationData?: SpecificationData | null;
    onNext: (oraclesData: OracleData[]) => void;
    navigate: KPITokenCreationFormProps["navigate"];
    onTx: KPITokenCreationFormProps["onTx"];
}

export const OraclesConfiguration = ({
    t,
    i18n,
    templates,
    oraclesData,
    specificationData,
    onNext,
    navigate,
    onTx,
}: OraclesConfigurationProps): ReactElement => {
    const [data, setData] = useState(
        oraclesData.reduce((accumulator: AugmentedOracleDataMap, data, i) => {
            accumulator[templates[i].id] = data;
            return accumulator;
        }, {})
    );
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [partialKPIToken, setPartialKPIToken] = useState<
        Partial<KPIToken> | undefined
    >();

    useEffect(() => {
        try {
            assertInitializationBundleGetterPresent(data);
            setDisabled(false);
        } catch (error) {
            setDisabled(true);
        }
    }, [data]);

    useEffect(() => {
        if (!specificationData?.expiration) return;
        setPartialKPIToken({
            expiration: unixTimestamp(specificationData.expiration),
        });
    }, [specificationData?.expiration]);

    const handleChange = useCallback(
        (
            templateId: number,
            state: Partial<unknown>,
            initializationBundleGetter?: OracleInitializationBundleGetter
        ) => {
            setData((prevData) => {
                return {
                    ...prevData,
                    [templateId]: {
                        ...prevData[templateId],
                        state,
                        initializationBundleGetter,
                    },
                };
            });
        },
        []
    );

    const handleNext = useCallback(() => {
        const perform = async () => {
            try {
                assertInitializationBundleGetterPresent(data);
                setLoading(true);
                const oracles = await Promise.all(
                    Object.values(data).map(async (item) => {
                        const initializationBundle =
                            await item.initializationBundleGetter();
                        return {
                            ...item,
                            initializationBundle,
                        };
                    })
                );
                onNext(oracles);
            } catch (error) {
                console.warn("could not get initialization data", error);
            } finally {
                setLoading(false);
            }
        };
        void perform();
    }, [data, onNext]);

    return (
        <div className="flex flex-col gap-6">
            {templates.length === 1 ? (
                <OracleCreationForm
                    t={t}
                    i18n={i18n}
                    navigate={navigate}
                    onTx={onTx}
                    kpiToken={partialKPIToken}
                    onChange={handleChange}
                    template={templates[0]}
                    data={data}
                />
            ) : (
                <OraclesAccordion
                    t={t}
                    i18n={i18n}
                    navigate={navigate}
                    onTx={onTx}
                    kpiToken={partialKPIToken}
                    onChange={handleChange}
                    templates={templates}
                    data={data}
                />
            )}
            <NextStepButton
                onClick={handleNext}
                disabled={disabled}
                loading={loading}
            >
                {t("next")}
            </NextStepButton>
        </div>
    );
};
