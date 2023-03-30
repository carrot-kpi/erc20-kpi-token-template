import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { NumberInput, Switch, Typography } from "@carrot-kpi/ui";
import { cva } from "class-variance-authority";
import { useCallback } from "react";
import { NumberFormatValue } from "../../../types";

const boundsWrapperStyles = cva(["flex gap-4 opacity-100 transition-opacity"], {
    variants: {
        binary: {
            true: ["opacity-20", "pointer-events-none", "cursor-no-drop"],
        },
    },
});

export interface SingleConfigurationProps {
    t: NamespacedTranslateFunction;
    templateId: number;
    automaticallyFilled?: boolean;
    binary?: boolean;
    onBinaryChange?: (id: number, value: boolean) => void;
    lowerBound?: NumberFormatValue;
    onLowerBoundChange: (id: number, value: NumberFormatValue) => void;
    higherBound?: NumberFormatValue;
    onHigherBoundChange: (id: number, value: NumberFormatValue) => void;
}

export const SingleConfiguration = ({
    t,
    templateId,
    automaticallyFilled,
    binary,
    onBinaryChange,
    lowerBound,
    onLowerBoundChange,
    higherBound,
    onHigherBoundChange,
}: SingleConfigurationProps) => {
    const handleBinaryChange = useCallback(
        (value: boolean) => {
            if (onBinaryChange) onBinaryChange(templateId, value);
        },
        [onBinaryChange, templateId]
    );

    const handleLowerBoundChange = useCallback(
        (value: NumberFormatValue) => {
            if (onLowerBoundChange) onLowerBoundChange(templateId, value);
        },
        [onLowerBoundChange, templateId]
    );

    const handleHigherBoundChange = useCallback(
        (value: NumberFormatValue) => {
            if (onHigherBoundChange) onHigherBoundChange(templateId, value);
        },
        [onHigherBoundChange, templateId]
    );

    return (
        <div className="flex flex-col gap-4">
            {automaticallyFilled && (
                <div className="rounded-xl flex p-4 border border-orange bg-orange bg-opacity-20">
                    <Typography className={{ root: "text-orange" }}>
                        {t("warning.autofilled")}
                    </Typography>
                </div>
            )}
            <div className="flex justify-between items-center">
                <Typography>{t("label.binary")}</Typography>
                <Switch checked={binary} onChange={handleBinaryChange} />
            </div>
            <div className={boundsWrapperStyles({ binary })}>
                <NumberInput
                    label={t("label.lower.bound")}
                    placeholder={"1,000,000"}
                    allowNegative={false}
                    onValueChange={handleLowerBoundChange}
                    value={lowerBound?.formattedValue}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NumberInput
                    label={t("label.higher.bound")}
                    allowNegative={false}
                    placeholder={"1,000,000"}
                    onValueChange={handleHigherBoundChange}
                    value={higherBound?.formattedValue}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
            </div>
        </div>
    );
};
