import { Loader } from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import {
    type NamespacedTranslateFunction,
    type OracleInitializationBundleGetter,
    type OracleRemoteCreationFormProps,
    type TemplateComponentStateUpdater,
} from "@carrot-kpi/react";
import { useMemo } from "react";
import type { Oracle, State } from "../../types";
import { SingleOracleCreationForm } from "./single-oracle-creation-form";
import { OraclesAccordion } from "./oracles-accordion";

interface MultipleOraclesCreationFormProps
    extends Omit<
        OracleRemoteCreationFormProps<object>,
        | "template"
        | "onStateChange"
        | "onInitializationBundleGetterChange"
        | "onSuggestedExpirationTimestampChange"
        | "error"
        | "fallback"
        | "state"
    > {
    t: NamespacedTranslateFunction;
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
        suggestedExpirationTimestamp?: number,
    ) => void;
    templates: Template[];
    state: State;
}

export const MultipleOraclesCreationForm = ({
    t,
    onStateChange,
    onInitializationBundleGetterChange,
    onSuggestedExpirationTimestampChange,
    templates,
    state,
    ...rest
}: MultipleOraclesCreationFormProps) => {
    const oraclesWithTemplate = useMemo(() => {
        if (
            templates.length === 0 ||
            !state.oracles ||
            state.oracles.length === 0
        )
            return [];

        const result: (Oracle & { template: Template })[] = [];
        for (const oracle of state.oracles) {
            const template = templates.find(
                (template) => template.id === oracle.templateId,
            );
            if (!template) {
                console.warn(
                    `couldn't find template with id ${oracle.templateId} in templates list while constructing oracles with template list`,
                );
                return [];
            }
            result.push({ ...oracle, template });
        }

        return result;
    }, [state?.oracles, templates]);

    return oraclesWithTemplate.length === 0 ? (
        <div className="w-full flex justify-center">
            <Loader />
        </div>
    ) : oraclesWithTemplate.length === 1 ? (
        <SingleOracleCreationForm
            index={0}
            t={t}
            state={oraclesWithTemplate[0].state}
            onStateChange={onStateChange}
            onInitializationBundleGetterChange={
                onInitializationBundleGetterChange
            }
            onSuggestedExpirationTimestampChange={
                onSuggestedExpirationTimestampChange
            }
            template={oraclesWithTemplate[0].template}
            {...rest}
        />
    ) : (
        <OraclesAccordion
            t={t}
            oraclesWithTemplate={oraclesWithTemplate}
            onStateChange={onStateChange}
            onInitializationBundleGetterChange={
                onInitializationBundleGetterChange
            }
            onSuggestedExpirationTimestampChange={
                onSuggestedExpirationTimestampChange
            }
            {...rest}
        />
    );
};
