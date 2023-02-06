import { ReactElement, ReactNode } from "react";

interface InfoSectionProps {
    children: ReactNode[];
}

export const InfoSection = ({ children }: InfoSectionProps): ReactElement => {
    const headerChildren = children[0];
    const contentChildren = children[1];

    return (
        <div className="w-1/3 border-r border-black [&:last-of-type]:border-none">
            <div className="p-3 border-b border-black">{headerChildren}</div>
            <div className="flex flex-col gap-3 p-3">{contentChildren}</div>
        </div>
    );
};
