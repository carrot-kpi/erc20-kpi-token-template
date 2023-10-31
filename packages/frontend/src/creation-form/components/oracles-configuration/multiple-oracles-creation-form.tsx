import { Loader } from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import {
    type NamespacedTranslateFunction,
    type OracleInitializationBundleGetter,
    type OracleRemoteCreationFormProps,
} from "@carrot-kpi/react";
import { useCallback, useMemo } from "react";
import type { Oracle, State } from "../../types";
import { SingleOracleCreationForm } from "./single-oracle-creation-form";
import { OraclesAccordion } from "./oracles-accordion";

interface MultipleOraclesCreationFormProps
    extends Omit<
        OracleRemoteCreationFormProps<object>,
        "template" | "onChange" | "error" | "fallback" | "state"
    > {
    t: NamespacedTranslateFunction;
    onChange: (
        index: number,
        state: object,
        initializationBundleGetter?: OracleInitializationBundleGetter,
    ) => void;
    templates: Template[];
    state: State;
}

export const MultipleOraclesCreationForm = ({
    t,
    onChange,
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

    const handleChange = useCallback(
        (
            index: number,
            state: object,
            initializationBundleGetter?: OracleInitializationBundleGetter,
        ) => {
            onChange(index, state, initializationBundleGetter);
        },
        [onChange],
    );

    return oraclesWithTemplate.length === 0 ? (
        <div className="w-full flex justify-center">
            <Loader />
        </div>
    ) : oraclesWithTemplate.length === 1 ? (
        <SingleOracleCreationForm
            index={0}
            t={t}
            onChange={handleChange}
            state={oraclesWithTemplate[0].state}
            template={oraclesWithTemplate[0].template}
            {...rest}
        />
    ) : (
        <OraclesAccordion
            t={t}
            oraclesWithTemplate={oraclesWithTemplate}
            onChange={handleChange}
            {...rest}
        />
    );
};
