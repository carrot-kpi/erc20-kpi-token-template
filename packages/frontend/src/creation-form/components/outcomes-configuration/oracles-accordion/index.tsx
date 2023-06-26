import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Loader,
    Typography,
} from "@carrot-kpi/ui";
import { Template } from "@carrot-kpi/sdk";
import { useResolvedTemplates } from "@carrot-kpi/react";
import {
    SingleConfiguration,
    type SingleConfigurationProps,
} from "../single-configuration";
import type { OutcomesConfigurationStepState } from "../../../types";

interface OraclesAccordionProps {
    onBinaryChange: SingleConfigurationProps["onBinaryChange"];
    onLowerBoundChange: SingleConfigurationProps["onLowerBoundChange"];
    onHigherBoundChange: SingleConfigurationProps["onHigherBoundChange"];
    templates: Template[];
    data: OutcomesConfigurationStepState;
}

export const OraclesAccordion = ({
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
