import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    ErrorFeedback,
    Loader,
    Typography,
} from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import { OracleCreationFormWrapper } from "../oracle-creation-form-wrapper";
import {
    NamespacedTranslateFunction,
    OracleCreationFormProps,
    OracleInitializationBundleGetter,
    useResolvedTemplates,
} from "@carrot-kpi/react";
import { AugmentedOracleDataMap } from "..";

interface OraclesAccordionProps {
    t: NamespacedTranslateFunction;
    i18n: OracleCreationFormProps<unknown>["i18n"];
    navigate: OracleCreationFormProps<unknown>["navigate"];
    onTx: OracleCreationFormProps<unknown>["onTx"];
    kpiToken: OracleCreationFormProps<unknown>["kpiToken"];
    onChange: (
        templateId: number,
        state: Partial<unknown>,
        initializationBundleGetter?: OracleInitializationBundleGetter
    ) => void;
    templates: Template[];
    data: AugmentedOracleDataMap;
}

export const OraclesAccordion = ({
    t,
    i18n,
    navigate,
    onTx,
    kpiToken,
    onChange,
    data,
    templates,
}: OraclesAccordionProps) => {
    const { loading: resolvingTemplates, resolvedTemplates } =
        useResolvedTemplates(templates);

    return resolvingTemplates || !resolvedTemplates ? (
        <Loader />
    ) : (
        <>
            {resolvedTemplates.map((resolvedTemplate) => (
                <Accordion key={resolvedTemplate.id}>
                    <AccordionSummary>
                        <Typography>
                            {resolvedTemplate.specification.name}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <OracleCreationFormWrapper
                            i18n={i18n}
                            fallback={<Loader />}
                            error={
                                <div className="flex justify-center">
                                    <ErrorFeedback
                                        messages={{
                                            title: t(
                                                "error.initializing.creation.title"
                                            ),
                                            description: t(
                                                "error.initializing.creation.description"
                                            ),
                                        }}
                                    />
                                </div>
                            }
                            template={resolvedTemplate}
                            state={data[resolvedTemplate.id]?.state || {}}
                            kpiToken={kpiToken}
                            onChange={onChange}
                            navigate={navigate}
                            onTx={onTx}
                        />
                    </AccordionDetails>
                </Accordion>
            ))}
        </>
    );
};
