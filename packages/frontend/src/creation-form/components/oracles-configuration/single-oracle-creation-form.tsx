import { ErrorFeedback, Loader } from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import {
    type NamespacedTranslateFunction,
    type OracleCreationFormProps as ReactOracleCreationFormProps,
    type OracleInitializationBundleGetter,
    useResolvedTemplate,
    OracleCreationForm,
    type TemplateComponentStateUpdater,
} from "@carrot-kpi/react";
import { useCallback } from "react";

interface SingleOracleCreationFormProps
    extends Omit<
        ReactOracleCreationFormProps<object>,
        | "template"
        | "onStateChange"
        | "onInitializationBundleGetterChange"
        | "onSuggestedExpirationTimestampChange"
        | "error"
        | "fallback"
    > {
    onStateChange: (
        index: number,
        stateOrUpdater: object | TemplateComponentStateUpdater<object>,
    ) => void;
    onInitializationBundleGetterChange: (
        index: number,
        initializationBundleGetter?: OracleInitializationBundleGetter,
    ) => void;
    onSuggestedExpirationTimestampChange: (
        index: number,
        timestamp?: number,
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
    onSuggestedExpirationTimestampChange,
    t,
    index,
    ...rest
}: SingleOracleCreationFormProps) => {
    const { resolvedTemplate } = useResolvedTemplate({ template });

    const handleStateChange = useCallback(
        (stateOrUpdater: object | TemplateComponentStateUpdater<object>) => {
            onStateChange(index, stateOrUpdater);
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

    const handleSuggestedExpirationTimestampChange = useCallback(
        (timestamp?: number) => {
            onSuggestedExpirationTimestampChange(index, timestamp);
        },
        [onSuggestedExpirationTimestampChange, index],
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
            onSuggestedExpirationTimestampChange={
                handleSuggestedExpirationTimestampChange
            }
            {...rest}
        />
    );
};
