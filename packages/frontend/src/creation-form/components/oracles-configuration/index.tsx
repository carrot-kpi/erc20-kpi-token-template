import { ReactElement, useCallback, useEffect, useState } from "react";
import {
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
import { OracleData } from "../../types";
import { Template } from "@carrot-kpi/sdk";
import { Loader } from "../../../ui/loader";
import { OracleCreationFormWrapper } from "./oracle-creation-form-wrapper";

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
    onNext: (oraclesData: OracleData[]) => void;
}

export const OraclesConfiguration = ({
    t,
    i18n,
    templates,
    oraclesData,
    onNext,
}: OraclesConfigurationProps): ReactElement => {
    const [data, setData] = useState(
        oraclesData.reduce((accumulator: AugmentedOracleDataMap, data, i) => {
            accumulator[templates[i].id] = data;
            return accumulator;
        }, {})
    );
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        try {
            assertInitializationBundleGetterPresent(data);
            setDisabled(false);
        } catch (error) {
            setDisabled(true);
        }
    }, [data]);

    const handleChange = useCallback(
        (
            templateId: number,
            state: Partial<unknown>,
            initializationBundleGetter?: OracleInitializationBundleGetter
        ) => {
            setData((prevData) => {
                console.log({ initializationBundleGetter });
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
                onNext(
                    await Promise.all(
                        Object.values(data).map(async (item) => {
                            const initializationBundle =
                                await item.initializationBundleGetter();
                            return {
                                ...item,
                                initializationBundle,
                            };
                        })
                    )
                );
            } catch (error) {
                console.warn("could not get initialization data", error);
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
                    onChange={handleChange}
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
                                onChange={handleChange}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
