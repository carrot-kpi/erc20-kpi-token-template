import { BigNumber } from "ethers";
import { ReactElement, useCallback } from "react";
import { CreationForm } from "@carrot-kpi/react";
import {
    Accordion,
    AccordionSummary,
    TextMono,
    AccordionDetails,
} from "@carrot-kpi/ui";
import { i18n } from "i18next";
import { OracleData } from "../../types";
import { Loader } from "../../../ui/loader";

interface OracleConfigurationProps {
    i18n: i18n;
    oracles: OracleData[];
    onOracleConfiguration: (
        initializationData: string,
        value: BigNumber,
        oracleTemplateId: number
    ) => void;
}

export const OracleConfiguration = ({
    i18n,
    oracles,
    onOracleConfiguration,
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
                    fallback={<Loader />}
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
                                fallback={<Loader />}
                                template={oracle.template}
                                // TODO: what should the onDone function do with the values data and value?
                                onDone={handleOracleConfigurationDone}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </div>
    );
};
