import { BigNumber } from "ethers";
import { ChangeEvent, ReactElement, useCallback } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    NumberInput,
    Accordion,
    AccordionSummary,
    TextMono,
    AccordionDetails,
} from "@carrot-kpi/ui";
import { OracleData } from "../../types";

interface BoundsConfigurationProps {
    t: NamespacedTranslateFunction;
    oracles: OracleData[];
    onFieldChange: (
        field: keyof Pick<OracleData, "higherBound" | "lowerBound">,
        value: BigNumber,
        oracleTemplateId: number
    ) => void;
}

export const BoundsConfiguration = ({
    t,
    oracles,
    onFieldChange,
}: BoundsConfigurationProps): ReactElement => {
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

    return (
        <div className="flex flex-col gap-6">
            {oracles.length === 1 ? (
                <div className="flex flex-col gap-6">
                    <NumberInput
                        id="lower-bound"
                        label={t("label.lower.bound")}
                        placeholder="0"
                        onChange={handleLowerBoundChange(
                            oracles[0].template.id
                        )}
                        value={oracles[0].lowerBound.toString()}
                        className="w-full"
                    />
                    <NumberInput
                        id="higher-bound"
                        label={t("label.higher.bound")}
                        placeholder="0"
                        onChange={handleHigherBoundChange(
                            oracles[0].template.id
                        )}
                        value={oracles[0].higherBound.toString()}
                        className="w-full"
                    />
                </div>
            ) : (
                oracles.map((oracle) => (
                    <Accordion key={oracle.template.id}>
                        <AccordionSummary>
                            <TextMono>
                                {oracle.template.specification.name}
                            </TextMono>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="flex flex-col gap-6">
                                <NumberInput
                                    id="lower-bound"
                                    label={t("label.lower.bound")}
                                    placeholder="0"
                                    onChange={handleLowerBoundChange(
                                        oracle.template.id
                                    )}
                                    value={oracle.lowerBound.toString()}
                                    className="w-full"
                                />
                                <NumberInput
                                    id="higher-bound"
                                    label={t("label.higher.bound")}
                                    placeholder="0"
                                    onChange={handleHigherBoundChange(
                                        oracle.template.id
                                    )}
                                    value={oracle.higherBound.toString()}
                                    className="w-full"
                                />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </div>
    );
};
