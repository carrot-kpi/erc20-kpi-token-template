import { BigNumber } from "ethers";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { CreationForm, NamespacedTranslateFunction } from "@carrot-kpi/react";
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

type OracleDataMap = { [id: number]: OracleData };

interface OraclesConfigurationProps {
    t: NamespacedTranslateFunction;
    i18n: i18n;
    templates: Template[];
    oraclesData: OracleData[];
    onNext: (data: OracleData[]) => void;
}

export const OraclesConfiguration = ({
    t,
    i18n,
    templates,
    oraclesData,
    onNext,
}: OraclesConfigurationProps): ReactElement => {
    const [data, setData] = useState(
        oraclesData.reduce((accumulator: OracleDataMap, data, i) => {
            accumulator[templates[i].id] = data;
            return accumulator;
        }, {})
    );
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(Object.keys(data).length !== templates.length);
    }, [data, templates.length]);

    const handleDone = useCallback(
        (id: number) => (initializationData: string, value: BigNumber) => {
            setData({ ...data, [id]: { data: initializationData, value } });
        },
        [data]
    );

    const handleNext = useCallback(() => {
        onNext(Object.values(data));
    }, [data, onNext]);

    return (
        <div className="flex flex-col gap-6">
            {templates.length === 1 ? (
                <CreationForm
                    i18n={i18n}
                    fallback={<Loader />}
                    template={templates[0]}
                    onDone={handleDone(templates[0].id)}
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
                            <CreationForm
                                i18n={i18n}
                                fallback={<Loader />}
                                template={template}
                                onDone={handleDone(template.id)}
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
