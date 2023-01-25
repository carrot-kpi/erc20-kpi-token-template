import { utils } from "ethers";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    Accordion,
    AccordionSummary,
    TextMono,
    AccordionDetails,
    NumberInput,
} from "@carrot-kpi/ui";
import { NumberFormatValue, OutcomeData } from "../../types";
import { Template } from "@carrot-kpi/sdk";
import { PreviousButton } from "../previous-button";
import { NextButton } from "../next-button";

type RawOutcomeDataMap = {
    [id: number]: {
        lowerBound: NumberFormatValue;
        higherBound: NumberFormatValue;
    };
};

interface OutcomesConfigurationProps {
    t: NamespacedTranslateFunction;
    templates: Template[];
    outcomesData: OutcomeData[];
    onPrevious: () => void;
    onNext: (data: OutcomeData[]) => void;
}

export const OutcomesConfiguration = ({
    t,
    templates,
    outcomesData,
    onPrevious,
    onNext,
}: OutcomesConfigurationProps): ReactElement => {
    const [data, setData] = useState<RawOutcomeDataMap>(
        outcomesData.reduce((accumulator: RawOutcomeDataMap, data, i) => {
            const lowerBoundValue = utils.formatUnits(
                data.lowerBound.toString(),
                18
            );
            const lowerBoundFormattedValue = !!lowerBoundValue
                ? utils.commify(lowerBoundValue)
                : "";

            const higherBoundValue = utils.formatUnits(
                data.higherBound.toString(),
                18
            );
            const higherBoundFormattedValue = !!higherBoundValue
                ? utils.commify(higherBoundValue)
                : "";
            accumulator[templates[i].id] = {
                lowerBound: {
                    value: lowerBoundValue,
                    formattedValue: lowerBoundFormattedValue,
                },
                higherBound: {
                    value: higherBoundValue,
                    formattedValue: higherBoundFormattedValue,
                },
            };
            return accumulator;
        }, {})
    );
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const dataValues = Object.values(data);
        setDisabled(
            dataValues.length !== templates.length ||
                dataValues.some((value) => {
                    if (!value.lowerBound || !value.higherBound) {
                        return true;
                    }
                    const parsedLowerBoundAmount = parseFloat(
                        value.lowerBound.value
                    );
                    const parsedHigherBoundAmount = parseFloat(
                        value.higherBound.value
                    );
                    return (
                        parsedLowerBoundAmount === 0 ||
                        parsedLowerBoundAmount === 0 ||
                        parsedLowerBoundAmount >= parsedHigherBoundAmount
                    );
                })
        );
    }, [data, templates.length]);

    const handleLowerBoundChange = useCallback(
        (id: number) => (value: NumberFormatValue) => {
            const previousData = data[id] || {};
            previousData.lowerBound = value;
            setData({ ...data, [id]: previousData });
        },
        [data]
    );

    const handleHigherBoundChange = useCallback(
        (id: number) => (value: NumberFormatValue) => {
            const previousData = data[id] || {};
            previousData.higherBound = value;
            setData({ ...data, [id]: previousData });
        },
        [data]
    );

    const handleNext = useCallback(() => {
        onNext(
            Object.values(data).map((value) => {
                return {
                    lowerBound: utils.parseUnits(value.lowerBound.value, 18),
                    higherBound: utils.parseUnits(value.higherBound.value, 18),
                };
            })
        );
    }, [data, onNext]);

    return (
        <div className="flex flex-col gap-6">
            {templates.length === 1 ? (
                <div className="flex flex-col gap-2">
                    <NumberInput
                        id="lower-bound"
                        label={t("label.lower.bound")}
                        placeholder={"1,000,000"}
                        onValueChange={handleLowerBoundChange(templates[0].id)}
                        value={
                            data[templates[0].id]?.lowerBound?.formattedValue
                        }
                        className={{ root: "w-full", input: "w-full" }}
                    />
                    <NumberInput
                        id="higher-bound"
                        label={t("label.higher.bound")}
                        placeholder={"1,000,000"}
                        onValueChange={handleHigherBoundChange(templates[0].id)}
                        value={
                            data[templates[0].id]?.higherBound?.formattedValue
                        }
                        className={{ root: "w-full", input: "w-full" }}
                    />
                </div>
            ) : (
                templates.map((template) => {
                    const { id } = template;

                    return (
                        <Accordion key={template.id}>
                            <AccordionSummary>
                                <TextMono>
                                    {template.specification.name}
                                </TextMono>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="flex flex-col gap-2">
                                    <NumberInput
                                        id="lower-bound"
                                        label={t("label.lower.bound")}
                                        placeholder={"1,000,000"}
                                        onValueChange={handleLowerBoundChange(
                                            id
                                        )}
                                        value={
                                            data[id]?.lowerBound?.formattedValue
                                        }
                                        className={{
                                            root: "w-full",
                                            input: "w-full",
                                        }}
                                    />
                                    <NumberInput
                                        id="higher-bound"
                                        label={t("label.higher.bound")}
                                        placeholder={"1,000,000"}
                                        onValueChange={handleHigherBoundChange(
                                            id
                                        )}
                                        value={
                                            data[id]?.higherBound
                                                ?.formattedValue
                                        }
                                        className={{
                                            root: "w-full",
                                            input: "w-full",
                                        }}
                                    />
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            )}
            <div className="flex justify-between">
                <PreviousButton t={t} onClick={onPrevious} />
                <NextButton t={t} onClick={handleNext} disabled={disabled} />
            </div>
        </div>
    );
};
