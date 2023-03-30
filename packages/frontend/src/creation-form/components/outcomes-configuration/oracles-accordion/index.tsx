import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Loader,
    Typography,
} from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import {
    NamespacedTranslateFunction,
    useResolvedTemplates,
} from "@carrot-kpi/react";
import {
    SingleConfiguration,
    SingleConfigurationProps,
} from "../single-configuration";
import { OutcomesConfigurationStepState } from "../../../types";

interface OraclesAccordionProps {
    t: NamespacedTranslateFunction;
    onBinaryChange: SingleConfigurationProps["onBinaryChange"];
    onLowerBoundChange: SingleConfigurationProps["onLowerBoundChange"];
    onHigherBoundChange: SingleConfigurationProps["onHigherBoundChange"];
    templates: Template[];
    data: OutcomesConfigurationStepState;
}

export const OraclesAccordion = ({
    t,
    onBinaryChange,
    onLowerBoundChange,
    onHigherBoundChange,
    data,
    templates,
}: OraclesAccordionProps) => {
    const { loading: resolvingTemplates, resolvedTemplates } =
        useResolvedTemplates(templates);

    return resolvingTemplates || !resolvedTemplates ? (
        <Loader />
    ) : (
        <>
            {resolvedTemplates.map((template) => {
                const { id } = template;

                return (
                    <Accordion key={template.id}>
                        <AccordionSummary>
                            <Typography>
                                {template.specification.name}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <SingleConfiguration
                                t={t}
                                templateId={template.id}
                                automaticallyFilled={
                                    data[id]?.automaticallyFilled
                                }
                                binary={data[id]?.binary}
                                onBinaryChange={onBinaryChange}
                                lowerBound={data[id]?.lowerBound}
                                onLowerBoundChange={onLowerBoundChange}
                                higherBound={data[id]?.higherBound}
                                onHigherBoundChange={onHigherBoundChange}
                            />
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </>
    );
};
