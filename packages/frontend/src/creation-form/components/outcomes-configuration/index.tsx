import { type ReactElement, useCallback, useEffect, useState } from "react";
import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Typography, NextStepButton } from "@carrot-kpi/ui";
import type {
    NumberFormatValue,
    OutcomeData,
    OutcomesConfigurationStepState,
} from "../../types";
import { SingleConfiguration } from "./single-configuration";
import { Template } from "@carrot-kpi/sdk";
import { OraclesAccordion } from "./oracles-accordion";
import { parseUnits } from "viem";

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
                        value.lowerBound.value,
                    );
                    const parsedHigherBoundAmount = parseFloat(
                        value.higherBound.value,
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
                }),
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
        [state, onStateChange],
    );

    const handleLowerBoundChange = useCallback(
        (id: number, value: NumberFormatValue) => {
            const previousData = state[id] || {};
            previousData.lowerBound = value;
            onStateChange({ ...state, [id]: previousData });
        },
        [state, onStateChange],
    );

    const handleHigherBoundChange = useCallback(
        (id: number, value: NumberFormatValue) => {
            const previousData = state[id] || {};
            previousData.higherBound = value;
            onStateChange({ ...state, [id]: previousData });
        },
        [state, onStateChange],
    );

    const handleNext = useCallback(() => {
        onNext(
            Object.values(state).map((value) => {
                return {
                    lowerBound: value.binary
                        ? 0n
                        : parseUnits(value.lowerBound.value as `${number}`, 18),
                    higherBound: value.binary
                        ? 1n
                        : parseUnits(
                              value.higherBound.value as `${number}`,
                              18,
                          ),
                };
            }),
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
                    automaticallyFilled={
                        state[templates[0].id]?.automaticallyFilled
                    }
                    binaryTogglable={state[templates[0].id]?.binaryTogglable}
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
