import { BigNumber, utils } from "ethers";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    Accordion,
    AccordionSummary,
    Typography,
    AccordionDetails,
    NextStepButton,
} from "@carrot-kpi/ui";
import { NumberFormatValue, OutcomeData } from "../../types";
import { Template } from "@carrot-kpi/sdk";
import { SingleConfiguration } from "./single-configuration";

type RawOutcomeDataMap = {
    [id: number]: {
        binary: boolean;
        lowerBound: NumberFormatValue;
        higherBound: NumberFormatValue;
    };
};

interface OutcomesConfigurationProps {
    t: NamespacedTranslateFunction;
    templates: Template[];
    outcomesData: OutcomeData[];
    onNext: (data: OutcomeData[]) => void;
}

export const OutcomesConfiguration = ({
    t,
    templates,
    outcomesData,
    onNext,
}: OutcomesConfigurationProps): ReactElement => {
    const [data, setData] = useState<RawOutcomeDataMap>(
        outcomesData.reduce((accumulator: RawOutcomeDataMap, data, i) => {
            const binary =
                data.lowerBound.eq(BigNumber.from(0)) &&
                data.higherBound.eq(BigNumber.from(1));

            const lowerBoundValue = binary
                ? "0"
                : utils.formatUnits(data.lowerBound.toString(), 18);
            const lowerBoundFormattedValue =
                binary || !lowerBoundValue
                    ? ""
                    : utils.commify(lowerBoundValue);

            const higherBoundValue = binary
                ? "0"
                : utils.formatUnits(data.higherBound.toString(), 18);
            const higherBoundFormattedValue =
                binary || !higherBoundValue
                    ? ""
                    : utils.commify(higherBoundValue);
            accumulator[templates[i].id] = {
                binary,
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
                    if (
                        isNaN(parsedLowerBoundAmount) ||
                        isNaN(parsedHigherBoundAmount)
                    )
                        return true;
                    return value.binary
                        ? parsedLowerBoundAmount !== 0 ||
                              parsedHigherBoundAmount !== 1
                        : parsedHigherBoundAmount === 0 ||
                              parsedLowerBoundAmount >= parsedHigherBoundAmount;
                })
        );
    }, [data, templates.length]);

    const handleBinaryChange = useCallback(
        (id: number) => (value: boolean) => {
            const previousData = data[id] || {};
            previousData.binary = value;
            previousData.lowerBound = {
                formattedValue: "",
                value: value ? "0" : "",
            };
            previousData.higherBound = {
                formattedValue: "",
                value: value ? "1" : "",
            };
            setData({ ...data, [id]: previousData });
        },
        [data]
    );

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
                    lowerBound: value.binary
                        ? BigNumber.from(0)
                        : utils.parseUnits(value.lowerBound.value, 18),
                    higherBound: value.binary
                        ? BigNumber.from(1)
                        : utils.parseUnits(value.higherBound.value, 18),
                };
            })
        );
    }, [data, onNext]);

    return (
        <div className="flex flex-col gap-6">
            {templates.length === 1 ? (
                <SingleConfiguration
                    t={t}
                    binary={data[templates[0].id]?.binary}
                    onBinaryChange={handleBinaryChange(templates[0].id)}
                    lowerBound={data[templates[0].id]?.lowerBound}
                    onLowerBoundChange={handleLowerBoundChange(templates[0].id)}
                    higherBound={data[templates[0].id]?.higherBound}
                    onHigherBoundChange={handleHigherBoundChange(
                        templates[0].id
                    )}
                />
            ) : (
                templates.map((template) => {
                    const { id } = template;

                    return (
                        <Accordion key={template.id}>
                            <AccordionSummary>
                                <Typography>
                                    {template.specification.name}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SingleConfiguration
                                    t={t}
                                    binary={data[id]?.binary}
                                    onBinaryChange={handleBinaryChange(id)}
                                    lowerBound={data[id]?.lowerBound}
                                    onLowerBoundChange={handleLowerBoundChange(
                                        id
                                    )}
                                    higherBound={data[id]?.higherBound}
                                    onHigherBoundChange={handleHigherBoundChange(
                                        id
                                    )}
                                />
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            )}
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
