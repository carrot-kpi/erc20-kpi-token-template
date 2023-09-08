import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { NumberInput, Switch, Typography, WarningBox } from "@carrot-kpi/ui";
import { cva } from "class-variance-authority";
import { useCallback } from "react";
import type { NumberFormatValue } from "../../../types";

const boundsWrapperStyles = cva(
    ["flex", "flex-col", "gap-4", "opacity-100", "transition-opacity", "p-4"],
    {
        variants: {
            binary: {
                true: ["opacity-20", "pointer-events-none", "cursor-no-drop"],
            },
        },
    },
);

export interface SingleConfigurationProps {
    t: NamespacedTranslateFunction;
    templateId: number;
    automaticallyFilled?: boolean;
    binaryTogglable?: boolean;
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
    binaryTogglable,
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
        [onBinaryChange, templateId],
    );

    const handleLowerBoundChange = useCallback(
        (value: NumberFormatValue) => {
            if (onLowerBoundChange) onLowerBoundChange(templateId, value);
        },
        [onLowerBoundChange, templateId],
    );

    const handleHigherBoundChange = useCallback(
        (value: NumberFormatValue) => {
            if (onHigherBoundChange) onHigherBoundChange(templateId, value);
        },
        [onHigherBoundChange, templateId],
    );

    return (
        <div className="flex flex-col gap-4">
            {automaticallyFilled && (
                <WarningBox
                    icon
                    messages={{ title: t("warning.autofilled.title") }}
                    className={{ root: "border-x-0" }}
                >
                    <Typography>{t("warning.autofilled")}</Typography>
                </WarningBox>
            )}
            {binaryTogglable && (
                <>
                    <div className="flex justify-between items-center p-4">
                        <Typography>{t("label.binary")}</Typography>
                        <Switch
                            checked={binary}
                            onChange={handleBinaryChange}
                        />
                    </div>
                    <div className="px-4">
                        <div className="h-[1px] bg-black dark:bg-white" />
                    </div>
                </>
            )}
            <div className={boundsWrapperStyles({ binary })}>
                <Typography>{t("label.numeric")}</Typography>
                <div className="flex gap-4">
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
        </div>
    );
};
