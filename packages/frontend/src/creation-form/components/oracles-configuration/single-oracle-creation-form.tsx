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
        | "template"
        | "onStateChange"
        | "onInitializationBundleGetterChange"
        | "error"
        | "fallback"
    > {
    onStateChange: (index: number, state: object) => void;
    onInitializationBundleGetterChange: (
        templateId: number,
        initializationBundleGetter?: OracleInitializationBundleGetter,
    ) => void;
    template: Template;
    state: object;
    index: number;
    t: NamespacedTranslateFunction;
}

export const SingleOracleCreationForm = ({
    template,
    state,
    onStateChange,
    onInitializationBundleGetterChange,
    t,
    index,
    ...rest
}: SingleOracleCreationFormProps) => {
    const { resolvedTemplate } = useResolvedTemplate({ template });

    const handleStateChange = useCallback(
        (state: object) => {
            onStateChange(index, state);
        },
        [onStateChange, index],
    );

    const handleInitializationBundleGetterChange = useCallback(
        (initializationBundleGetter?: OracleInitializationBundleGetter) => {
            onInitializationBundleGetterChange(
                index,
                initializationBundleGetter,
            );
        },
        [onInitializationBundleGetterChange, index],
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
            onStateChange={handleStateChange}
            onInitializationBundleGetterChange={
                handleInitializationBundleGetterChange
            }
            {...rest}
        />
    );
};
