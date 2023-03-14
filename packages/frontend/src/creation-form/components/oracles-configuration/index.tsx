import { ReactElement, useCallback, useEffect, useState } from "react";
import {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import {
    Accordion,
    AccordionSummary,
    Typography,
    AccordionDetails,
    NextStepButton,
} from "@carrot-kpi/ui";
import { i18n } from "i18next";
import { OracleData, SpecificationData } from "../../types";
import { KPIToken, Template } from "@carrot-kpi/sdk";
import { Loader } from "../../../ui/loader";
import { OracleCreationFormWrapper } from "./oracle-creation-form-wrapper";
import { unixTimestamp } from "../../../utils/dates";

type AugmentedOracleData = OracleData & {
    initializationBundleGetter?: OracleInitializationBundleGetter;
};

type AugmentedOracleDataMap = {
    [id: number]: AugmentedOracleData;
};

type Assert = (
    data: AugmentedOracleDataMap
) => asserts data is { [id: number]: Required<AugmentedOracleData> };
const assertInitializationBundleGetterPresent: Assert = (
    data: AugmentedOracleDataMap
) => {
    if (Object.values(data).some((item) => !item.initializationBundleGetter))
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
                <OracleCreationFormWrapper
                    i18n={i18n}
                    fallback={<Loader />}
                    template={templates[0]}
                    state={data[templates[0].id]?.state || {}}
                    kpiToken={partialKPIToken}
                    onChange={handleChange}
                    navigate={navigate}
                    onTx={onTx}
                />
            ) : (
                templates.map((template) => (
                    <Accordion key={template.id}>
                        <AccordionSummary>
                            <Typography>
                                {template.specification.name}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <OracleCreationFormWrapper
                                i18n={i18n}
                                fallback={<Loader />}
                                template={template}
                                state={data[template.id]?.state || {}}
                                kpiToken={partialKPIToken}
                                onChange={handleChange}
                                navigate={navigate}
                                onTx={onTx}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))
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
