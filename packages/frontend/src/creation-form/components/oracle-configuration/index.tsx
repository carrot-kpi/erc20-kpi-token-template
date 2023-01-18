import { BigNumber } from "ethers";
import { ReactElement, useCallback } from "react";
import { CreationForm, NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    Button,
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
    onOracleConfiguration,
    onNext,
}: OracleConfigurationProps): ReactElement => {
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
            {oracles.length === 1 ? (
                <CreationForm
                    i18n={i18n}
                    fallback={<>Loading...</>}
                    template={oracles[0].template}
                    // TODO: what should the onDone function do with the values data and value?
                    onDone={handleOracleConfigurationDone}
                />
            ) : (
                oracles.map((oracle) => (
                    <Accordion key={oracle.template.id}>
                        <AccordionSummary>
                            <TextMono>
                                {oracle.template.specification.name}
                            </TextMono>
                        </AccordionSummary>
                        <AccordionDetails>
                            <CreationForm
                                i18n={i18n}
                                fallback={<>Loading...</>}
                                template={oracle.template}
                                // TODO: what should the onDone function do with the values data and value?
                                onDone={handleOracleConfigurationDone}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            <Button size="small" onClick={onNext}>
                {t("next")}
            </Button>
        </div>
    );
};
