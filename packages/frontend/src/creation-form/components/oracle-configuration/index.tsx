import { BigNumber } from "ethers";
import { ChangeEvent, ReactElement, useCallback } from "react";
import { CreationForm, NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    Button,
    NumberInput,
    Accordion,
    AccordionSummary,
    TextMono,
    AccordionDetails,
} from "@carrot-kpi/ui";
import { i18n } from "i18next";
import { OracleData } from "../../types";

interface OracleConfigurationProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    oracles: OracleData[];
    onFieldChange: (
        field: "higherBound" | "lowerBound",
        value: BigNumber,
        oracleTemplateId: number
    ) => void;
    onOracleConfiguration: (
        initializationData: string,
        value: BigNumber,
        oracleTemplateId: number
    ) => void;
    onNext: () => void;
}

export const OracleConfiguration = ({
    i18n,
    t,
    oracles,
    onFieldChange,
    onOracleConfiguration,
    onNext,
}: OracleConfigurationProps): ReactElement => {
    const handleLowerBoundChange = useCallback(
        (oracleTemplateId: number) =>
            (event: ChangeEvent<HTMLInputElement>) => {
                onFieldChange(
                    "lowerBound",
                    BigNumber.from(event.target.value),
                    oracleTemplateId
                );
            },
        [onFieldChange]
    );

    const handleHigherBoundChange = useCallback(
        (oracleTemplateId: number) =>
            (event: ChangeEvent<HTMLInputElement>) => {
                onFieldChange(
                    "higherBound",
                    BigNumber.from(event.target.value),
                    oracleTemplateId
                );
            },
        [onFieldChange]
    );

    const handleOracleConfigurationDone = useCallback(() => {
        (oracleTemplateId: number) =>
            (initializationData: string, value: BigNumber) => {
                onOracleConfiguration(
                    initializationData,
                    value,
                    oracleTemplateId
                );
            };
    }, [onOracleConfiguration]);

    return (
        <div className="flex flex-col gap-6">
            {oracles.map((oracle) => (
                <Accordion key={oracle.template.id}>
                    <AccordionSummary>
                        <TextMono>
                            {oracle.template.specification.name}
                        </TextMono>
                    </AccordionSummary>
                    <AccordionDetails>
                        <>
                            <CreationForm
                                i18n={i18n}
                                fallback={<>Loading...</>}
                                template={oracle.template}
                                // TODO: what should the onDone function do with the values data and value?
                                onDone={handleOracleConfigurationDone}
                            />
                            <NumberInput
                                id="lower-bound"
                                label={t("label.lower.bound")}
                                placeholder="0"
                                onChange={handleLowerBoundChange(
                                    oracle.template.id
                                )}
                                value={oracle.lowerBound.toString()}
                            />
                            <NumberInput
                                id="higher-bound"
                                label={t("label.higher.bound")}
                                placeholder="0"
                                onChange={handleHigherBoundChange(
                                    oracle.template.id
                                )}
                                value={oracle.higherBound.toString()}
                            />
                        </>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Button size="small" onClick={onNext}>
                {t("next")}
            </Button>
        </div>
    );
};
