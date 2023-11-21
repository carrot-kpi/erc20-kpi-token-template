import type {
    NamespacedTranslateFunction,
    TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Typography, NextStepButton, Checkbox } from "@carrot-kpi/ui";
import {
    type ReactElement,
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
} from "react";
import { Loader } from "../../ui/loader";
import { OracleTemplate } from "../../ui/oracle-template";
import type { State } from "../types";

interface OraclesPickerProps {
    loading?: boolean;
    t: NamespacedTranslateFunction;
    templates: Template[];
    state: State;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: () => void;
}

export const OraclesPicker = ({
    t,
    loading,
    templates,
    state,
    onStateChange,
    onNext,
}: OraclesPickerProps): ReactElement => {
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(!state.oracles || state.oracles.length === 0);
    }, [state.oracles]);

    const handleChange = useCallback(
        (templateId: number) => (event: ChangeEvent<HTMLInputElement>) => {
            onStateChange((state) => {
                if (event.target.checked) {
                    return {
                        ...state,
                        oracles: [
                            ...(state.oracles || []),
                            { templateId, state: {} },
                        ],
                    };
                } else {
                    return {
                        ...state,
                        oracles: [
                            ...(state.oracles || []).filter(
                                (oracle) => oracle.templateId !== templateId,
                            ),
                        ],
                    };
                }
            });
        },
        [onStateChange],
    );

    const handleNext = useCallback(() => {
        onNext();
    }, [onNext]);

    return (
        <div className="flex flex-col gap-6">
            {loading ? (
                <div className="w-full flex justify-center">
                    <Loader />
                </div>
            ) : (
                <>
                    <Typography weight="medium">
                        {t("oracles.picker.label")}
                    </Typography>
                    <div className="flex gap-7 overflow-x-auto">
                        {templates.map((template) => {
                            const checked =
                                state.oracles &&
                                !!state.oracles.find(
                                    (oracle) =>
                                        oracle.templateId === template.id,
                                );

                            return (
                                <div
                                    key={template.id}
                                    className="flex flex-col items-center gap-3 p-2"
                                >
                                    <OracleTemplate
                                        t={t}
                                        key={template.id}
                                        template={template}
                                    />
                                    <Checkbox
                                        checked={!!checked}
                                        onChange={handleChange(template.id)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <Typography weight="medium">
                        {t("oracles.picker.selected")}{" "}
                        {Object.keys(state.oracles || []).length}
                    </Typography>
                </>
            )}
            <NextStepButton
                onClick={handleNext}
                disabled={disabled}
                className={{ root: "w-44 rounded-3xl" }}
            >
                {t("next")}
            </NextStepButton>
        </div>
    );
};
