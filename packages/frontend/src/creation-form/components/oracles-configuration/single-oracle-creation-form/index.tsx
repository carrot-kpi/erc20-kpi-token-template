import { ErrorFeedback, Loader } from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import {
    type NamespacedTranslateFunction,
    type OracleCreationFormProps as ReactOracleCreationFormProps,
    type OracleInitializationBundleGetter,
    useResolvedTemplate,
    OracleCreationForm,
} from "@carrot-kpi/react";
import { useCallback } from "react";

interface SingleOracleCreationFormProps
    extends Omit<
        ReactOracleCreationFormProps<object>,
        "template" | "onChange" | "error" | "fallback"
    > {
    onChange: (
        templateId: number,
        state: object,
        initializationBundleGetter?: OracleInitializationBundleGetter,
    ) => void;
    template: Template;
    state: object;
    index: number;
    t: NamespacedTranslateFunction;
}

export const SingleOracleCreationForm = ({
    onChange,
    template,
    state,
    t,
    index,
    ...rest
}: SingleOracleCreationFormProps) => {
    const { resolvedTemplate } = useResolvedTemplate({ template });

    const handleChange = useCallback(
        (
            state: object,
            initializationBundleGetter?: OracleInitializationBundleGetter,
        ) => {
            onChange(index, state, initializationBundleGetter);
        },
        [onChange, index],
    );

    return (
        <OracleCreationForm
            fallback={
                <div className="w-full flex justify-center">
                    <Loader />
                </div>
            }
            error={
                <div className="flex justify-center">
                    <ErrorFeedback
                        messages={{
                            title: t("error.initializing.creation.title"),
                            description: t(
                                "error.initializing.creation.description",
                            ),
                        }}
                    />
                </div>
            }
            template={resolvedTemplate || undefined}
            state={state}
            onChange={handleChange}
            {...rest}
        />
    );
};
