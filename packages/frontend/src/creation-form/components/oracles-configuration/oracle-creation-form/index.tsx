import { ErrorFeedback, Loader } from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import { OracleCreationFormWrapper } from "../oracle-creation-form-wrapper";
import {
    NamespacedTranslateFunction,
    OracleCreationFormProps,
    OracleInitializationBundleGetter,
    useResolvedTemplate,
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
    template: Template;
    data: AugmentedOracleDataMap;
}

export const OracleCreationForm = ({
    t,
    i18n,
    navigate,
    onTx,
    kpiToken,
    onChange,
    data,
    template,
}: OraclesAccordionProps) => {
    const { resolvedTemplate } = useResolvedTemplate(template);

    return (
        <OracleCreationFormWrapper
            i18n={i18n}
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
                                "error.initializing.creation.description"
                            ),
                        }}
                    />
                </div>
            }
            template={resolvedTemplate || undefined}
            state={
                resolvedTemplate ? data[resolvedTemplate.id]?.state || {} : {}
            }
            kpiToken={kpiToken}
            onChange={onChange}
            navigate={navigate}
            onTx={onTx}
        />
    );
};