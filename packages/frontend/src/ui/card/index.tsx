import { ResponsiveHeader, Typography } from "@carrot-kpi/ui";
import { ReactElement, ReactNode } from "react";

interface CardProps {
    title: string;
    step: string;
    children: ReactNode;
}

export const Card = ({ title, step, children }: CardProps): ReactElement => (
    <div className="flex h-full w-full max-w-xl flex-col gap-2 border border-black bg-white">
        <div className="flex flex-col gap-1 border-b border-black p-6">
            <Typography variant="sm" weight="medium">
                {step}
            </Typography>
            <ResponsiveHeader variant="h2">{title}</ResponsiveHeader>
        </div>
        <div className="p-6">{children}</div>
    </div>
);
