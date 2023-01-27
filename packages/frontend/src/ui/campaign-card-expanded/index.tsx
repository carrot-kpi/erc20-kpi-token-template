import { KpiToken } from "@carrot-kpi/sdk";
import { Chip, Typography } from "@carrot-kpi/ui";
import DOMPurify from "dompurify";
import { ReactElement, ReactNode } from "react";

interface CampaignCardExpandedProps {
    description: KpiToken["specification"]["description"];
    tags: KpiToken["specification"]["tags"];
    children: ReactNode[];
}

export const CampaignCardExpanded = ({
    description,
    tags,
    children,
}: CampaignCardExpandedProps): ReactElement => (
    <div className="rounded-xxl bg-white dark:bg-black w-full max-w-6xl border-black border">
        <div className="flex border-black border-b">
            <div className="p-3">
                <div className="rounded-full bg-blue h-6 w-6" />
            </div>
            <div className="p-3 border-black border-l">
                <Typography>DXDAO</Typography>
            </div>
        </div>
        <div className="flex flex-col gap-8 p-3 border-b border-black">
            <div
                className="prose prose-sm max-w-none prose-pre:scrollbar scrollbar overflow-y-auto max-h-[300px]"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(description),
                }}
            />
            <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                ))}
            </div>
        </div>
        <div className="flex">{children.map((child) => child)}</div>
    </div>
);
