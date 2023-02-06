import { KPIToken } from "@carrot-kpi/sdk";
import { Chip, Typography } from "@carrot-kpi/ui";
import sanitizeHtml from "sanitize-html";
import { ReactElement, ReactNode } from "react";

interface CampaignCardExpandedProps {
    description: KPIToken["specification"]["description"];
    tags: KPIToken["specification"]["tags"];
    children: ReactNode[];
}

export const CampaignCardExpanded = ({
    description,
    tags,
    children,
}: CampaignCardExpandedProps): ReactElement => (
    <div className="rounded-xxl w-full max-w-6xl border border-black bg-white dark:bg-black">
        <div className="flex border-b border-black">
            <div className="p-3">
                <div className="bg-blue h-6 w-6 rounded-full" />
            </div>
            <div className="border-l border-black p-3">
                <Typography>DXDAO</Typography>
            </div>
        </div>
        <div className="flex flex-col gap-8 border-b border-black p-3">
            <div
                className="prose prose-sm prose-pre:scrollbar scrollbar max-h-[300px] max-w-none overflow-y-auto"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(description),
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
