import { Title, TextMono } from "@carrot-kpi/ui";
import { ReactElement, ReactNode } from "react";

interface CardProps {
    title: string;
    step: string;
    loading?: boolean;
    actions?: ReactNode;
    children: ReactNode;
}

export const Card = ({
    title,
    step,
    actions,
    children,
}: CardProps): ReactElement => (
    <div className="flex h-full w-full max-w-xl flex-col gap-2 border border-black bg-white">
        <div className="flex flex-col gap-1 border-b border-black p-6">
            <TextMono size="sm" className="font-medium">
                {step}
            </TextMono>
            <Title size="5xl" className="font-bold">
                {title}
            </Title>
        </div>
        <div className="flex h-full flex-col justify-between gap-6 scrollbar p-6 max-h-[600px] overflow-y-auto">
            {children}
            {actions}
        </div>
    </div>
);
