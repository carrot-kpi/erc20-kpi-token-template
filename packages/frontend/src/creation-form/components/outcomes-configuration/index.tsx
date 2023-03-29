import { BigNumber, utils } from "ethers";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Typography, NextStepButton } from "@carrot-kpi/ui";
import {
    NumberFormatValue,
    OutcomeData,
    OutcomesConfigurationStepState,
} from "../../types";
import { SingleConfiguration } from "./single-configuration";
import { Template } from "@carrot-kpi/sdk";
import { OraclesAccordion } from "./oracles-accordion";

interface OutcomesConfigurationProps {
    t: NamespacedTranslateFunction;
    templates: Template[];
    state: OutcomesConfigurationStepState;
    onStateChange: (state: OutcomesConfigurationStepState) => void;
    onNext: (data: OutcomeData[]) => void;
}

export const OutcomesConfiguration = ({
    t,
    templates,
    state,
    onStateChange,
    onNext,
}: OutcomesConfigurationProps): ReactElement => {
    // const [data, setData] = useState<RawOutcomeDataMap>(
    //     outcomesData.reduce((accumulator: RawOutcomeDataMap, data, i) => {
    //         const binary =
    //             data.lowerBound.eq(BigNumber.from(0)) &&
    //             data.higherBound.eq(BigNumber.from(1));

    //         const lowerBoundValue = binary
    //             ? "0"
    //             : utils.formatUnits(data.lowerBound.toString(), 18);
    //         const lowerBoundFormattedValue =
    //             binary || !lowerBoundValue
    //                 ? ""
    //                 : utils.commify(lowerBoundValue);

    //         const higherBoundValue = binary
    //             ? "0"
    //             : utils.formatUnits(data.higherBound.toString(), 18);
    //         const higherBoundFormattedValue =
    //             binary || !higherBoundValue
    //                 ? ""
    //                 : utils.commify(higherBoundValue);
    //         accumulator[templates[i].id] = {
    //             binary,
    //             lowerBound: {
    //                 value: lowerBoundValue,
    //                 formattedValue: lowerBoundFormattedValue,
    //             },
    //             higherBound: {
    //                 value: higherBoundValue,
    //                 formattedValue: higherBoundFormattedValue,
    //             },
    //         };
    //         return accumulator;
    //     }, {})
    // );
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const dataValues = Object.values(state);
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
    }, [state, templates.length]);

    const handleBinaryChange = useCallback(
        (id: number, value: boolean) => {
            const previousData = state[id] || {};
            previousData.binary = value;
            previousData.lowerBound = {
                formattedValue: "",
                value: value ? "0" : "",
            };
            previousData.higherBound = {
                formattedValue: "",
                value: value ? "1" : "",
            };
            onStateChange({ ...state, [id]: previousData });
        },
        [state, onStateChange]
    );

    const handleLowerBoundChange = useCallback(
        (id: number, value: NumberFormatValue) => {
            const previousData = state[id] || {};
            previousData.lowerBound = value;
            onStateChange({ ...state, [id]: previousData });
        },
        [state, onStateChange]
    );

    const handleHigherBoundChange = useCallback(
        (id: number, value: NumberFormatValue) => {
            const previousData = state[id] || {};
            previousData.higherBound = value;
            onStateChange({ ...state, [id]: previousData });
        },
        [state, onStateChange]
    );

    const handleNext = useCallback(() => {
        onNext(
            Object.values(state).map((value) => {
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
    }, [state, onNext]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <Typography variant="sm">
                    {t("card.outcome.configuration.description.1")}
                </Typography>
                <Typography variant="sm">
                    {t("card.outcome.configuration.description.2")}
                </Typography>
                <Typography variant="sm">
                    {t("card.outcome.configuration.description.3")}
                </Typography>
            </div>
            {templates.length === 1 ? (
                <SingleConfiguration
                    t={t}
                    templateId={templates[0].id}
                    binary={state[templates[0].id]?.binary}
                    onBinaryChange={handleBinaryChange}
                    lowerBound={state[templates[0].id]?.lowerBound}
                    onLowerBoundChange={handleLowerBoundChange}
                    higherBound={state[templates[0].id]?.higherBound}
                    onHigherBoundChange={handleHigherBoundChange}
                />
            ) : (
                <OraclesAccordion
                    t={t}
                    onBinaryChange={handleBinaryChange}
                    onLowerBoundChange={handleLowerBoundChange}
                    onHigherBoundChange={handleHigherBoundChange}
                    templates={templates}
                    data={state}
                />
            )}
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
