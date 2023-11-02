import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Loader,
    Typography,
} from "@carrot-kpi/ui";
import {
    type NamespacedTranslateFunction,
    type OracleCreationFormProps as ReactOracleCreationFormProps,
    type TemplateComponentStateUpdater,
} from "@carrot-kpi/react";
import { SingleOracleCreationForm } from "./single-oracle-creation-form";
import {
    useResolvedTemplates,
    type OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import { useMemo } from "react";
import type {
    OracleWithResolvedTemplate,
    OracleWithTemplate,
} from "../../types";

interface OraclesAccordionProps
    extends Omit<
        ReactOracleCreationFormProps<object>,
        | "template"
        | "onStateChange"
        | "onInitializationBundleGetterChange"
        | "onSuggestedExpirationTimestampChange"
        | "error"
        | "fallback"
        | "state"
    > {
    t: NamespacedTranslateFunction;
    oraclesWithTemplate: OracleWithTemplate[];
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
}

export const OraclesAccordion = ({
    t,
    oraclesWithTemplate,
    onStateChange,
    onInitializationBundleGetterChange,
    onSuggestedExpirationTimestampChange,
    ...rest
}: OraclesAccordionProps) => {
    const templates = useMemo(() => {
        return oraclesWithTemplate.map((oracle) => oracle.template);
    }, [oraclesWithTemplate]);
    const { loading: resolvingTemplates, resolvedTemplates } =
        useResolvedTemplates({ templates });

    const oraclesWithResolvedTemplates = useMemo(() => {
        if (resolvingTemplates || !resolvedTemplates) return null;
        const result: OracleWithResolvedTemplate[] = [];
        for (const oracle of oraclesWithTemplate) {
            const template = resolvedTemplates.find(
                (template) => template.id === oracle.templateId,
            );
            if (!template) {
                console.warn(
                    `could not find template with id ${oracle.templateId}`,
                );
                return null;
            }
            result.push({ ...oracle, resolvedTemplate: template });
        }
        return result;
    }, [oraclesWithTemplate, resolvedTemplates, resolvingTemplates]);

    return !oraclesWithResolvedTemplates ? (
        <div className="w-full flex justify-center">
            <Loader />
        </div>
    ) : (
        oraclesWithResolvedTemplates.map((oracle, i) => (
            <Accordion key={i}>
                <AccordionSummary>
                    <Typography>
                        {oracle.resolvedTemplate.specification.name}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <SingleOracleCreationForm
                        index={i}
                        t={t}
                        template={oracle.template}
                        state={oracle.state}
                        onStateChange={onStateChange}
                        onInitializationBundleGetterChange={
                            onInitializationBundleGetterChange
                        }
                        onSuggestedExpirationTimestampChange={
                            onSuggestedExpirationTimestampChange
                        }
                        {...rest}
                    />
                </AccordionDetails>
            </Accordion>
        ))
    );
};
