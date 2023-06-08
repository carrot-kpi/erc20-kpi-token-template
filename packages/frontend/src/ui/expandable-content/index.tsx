import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@carrot-kpi/ui";
import { type ReactElement, type ReactNode, useMemo, useState } from "react";
import { ReactComponent as Plus } from "../../assets/plus.svg";
import { ReactComponent as Minus } from "../../assets/minus.svg";

export interface ExpandableContentProps {
    summary: ReactNode;
    children: ReactNode;
}

export const ExpandableContent = ({
    summary,
    children,
}: ExpandableContentProps): ReactElement => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const icon = useMemo(
        () =>
            expanded ? (
                <Minus className="stroke-black dark:stroke-white" />
            ) : (
                <Plus className="stroke-black dark:stroke-white" />
            ),
        [expanded]
    );

    const handleExpandClick = () => {
        setExpanded((expanded) => !expanded);
    };

    return (
        <Accordion
            className={{ root: "rounded-none border-x dark:border-x-gray-400" }}
            expanded={expanded}
            onChange={handleExpandClick}
        >
            <AccordionSummary
                className={{
                    root: "bg-white dark:bg-black border-y dark:border-y-gray-400 rounded-none p-6",
                }}
                expandIcon={icon}
            >
                <div className="flex flex-col gap-6 md:gap-6">
                    <Typography>{summary}</Typography>
                </div>
            </AccordionSummary>
            <AccordionDetails
                className={{
                    root: "p-0 border-b border-b-black dark:border-b-gray-400",
                }}
            >
                {children}
            </AccordionDetails>
        </Accordion>
    );
};
