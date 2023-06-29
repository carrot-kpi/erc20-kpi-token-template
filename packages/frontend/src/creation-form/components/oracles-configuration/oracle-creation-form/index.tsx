import { ErrorFeedback, Loader } from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import { OracleCreationFormWrapper } from "../oracle-creation-form-wrapper";
import {
    type OracleCreationFormProps as ReactOracleCreationFormProps,
    type OracleInitializationBundleGetter,
    useResolvedTemplate,
} from "@carrot-kpi/react";
import type { OraclesConfigurationStepState } from "../../../types";

interface OracleCreationFormProps {
    i18n: ReactOracleCreationFormProps<unknown>["i18n"];
    navigate: ReactOracleCreationFormProps<unknown>["navigate"];
    onTx: ReactOracleCreationFormProps<unknown>["onTx"];
    kpiToken: ReactOracleCreationFormProps<unknown>["kpiToken"];
    onChange: (
        templateId: number,
        state: Partial<unknown>,
        initializationBundleGetter?: OracleInitializationBundleGetter
    ) => void;
    template: Template;
    data: OraclesConfigurationStepState;
}

export const OracleCreationForm = ({
    i18n,
    navigate,
    onTx,
    kpiToken,
    onChange,
    data,
    template,
}: OracleCreationFormProps) => {
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
                            title: "test",
                            description: "test",
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
