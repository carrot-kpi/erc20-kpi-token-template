import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { NumberInput, Switch, Typography } from "@carrot-kpi/ui";
import { cva } from "class-variance-authority";
import { NumberFormatValue } from "../../../types";

const boundsWrapperStyles = cva(["flex gap-4 opacity-100 transition-opacity"], {
    variants: {
        binary: {
            true: ["opacity-20", "pointer-events-none", "cursor-no-drop"],
        },
    },
});

interface SingleConfigurationProps {
    t: NamespacedTranslateFunction;
    binary?: boolean;
    onBinaryChange?: (value: boolean) => void;
    lowerBound?: NumberFormatValue;
    onLowerBoundChange: (value: NumberFormatValue) => void;
    higherBound?: NumberFormatValue;
    onHigherBoundChange: (value: NumberFormatValue) => void;
}

export const SingleConfiguration = ({
    t,
    binary,
    onBinaryChange,
    lowerBound,
    onLowerBoundChange,
    higherBound,
    onHigherBoundChange,
}: SingleConfigurationProps) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
                <Typography>{t("label.binary")}</Typography>
                <Switch checked={binary} onChange={onBinaryChange} />
            </div>
            <div className={boundsWrapperStyles({ binary })}>
                <NumberInput
                    id="lower-bound"
                    label={t("label.lower.bound")}
                    placeholder={"1,000,000"}
                    onValueChange={onLowerBoundChange}
                    value={lowerBound?.formattedValue}
                    className={{
                        root: "w-full",
                        input: "w-full",
                    }}
                />
                <NumberInput
                    id="higher-bound"
                    label={t("label.higher.bound")}
                    placeholder={"1,000,000"}
                    onValueChange={onHigherBoundChange}
                    value={higherBound?.formattedValue}
                    className={{
                        root: "w-full",
                        input: "w-full",
                    }}
                />
            </div>
        </div>
    );
};
