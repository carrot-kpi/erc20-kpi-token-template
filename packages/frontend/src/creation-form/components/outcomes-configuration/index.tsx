import { utils } from "ethers";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    Button,
    Accordion,
    AccordionSummary,
    TextMono,
    AccordionDetails,
    NumberInput,
} from "@carrot-kpi/ui";
import { NumberFormatValue, OutcomeData } from "../../types";
import { Template } from "@carrot-kpi/sdk";

type RawOutcomeDataMap = {
    [id: number]: {
        lowerBound: NumberFormatValue;
        higherBound: NumberFormatValue;
    };
};

interface OutcomesConfigurationProps {
    t: NamespacedTranslateFunction;
    templates: Template[];
    onNext: (data: OutcomeData[]) => void;
}

export const OutcomesConfiguration = ({
    t,
    templates,
    onNext,
}: OutcomesConfigurationProps): ReactElement => {
    const [data, setData] = useState<RawOutcomeDataMap>({});
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const dataValues = Object.values(data);
        setDisabled(
            dataValues.length !== templates.length ||
                dataValues.some((value) => {
                    return (
                        !value.lowerBound ||
                        !value.lowerBound.floatValue ||
                        !value.higherBound ||
                        !value.higherBound.floatValue ||
                        value.lowerBound.floatValue >=
                            value.higherBound.floatValue
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
                    lowerBound: utils.parseUnits(value.lowerBound.value),
                    higherBound: utils.parseUnits(value.higherBound.value),
                };
            })
        );
    }, [data, onNext]);

    return (
        <div className="flex flex-col gap-6">
            {templates.map((template) => {
                const { id } = template;
                return (
                    <Accordion key={template.id}>
                        <AccordionSummary>
                            <TextMono>{template.specification.name}</TextMono>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="flex flex-col gap-2">
                                <NumberInput
                                    id="lower-bound"
                                    label={t("label.lower.bound")}
                                    placeholder={"1,000,000"}
                                    onValueChange={handleLowerBoundChange(id)}
                                    value={data[id]?.lowerBound?.formattedValue}
                                    className="w-full"
                                />
                                <NumberInput
                                    id="higher-bound"
                                    label={t("label.higher.bound")}
                                    placeholder={"1,000,000"}
                                    onValueChange={handleHigherBoundChange(id)}
                                    value={
                                        data[id]?.higherBound?.formattedValue
                                    }
                                    className="w-full"
                                />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
            <Button size="small" onClick={handleNext} disabled={disabled}>
                {t("next")}
            </Button>
        </div>
    );
};
