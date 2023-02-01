import { cva } from "class-variance-authority";
import { ReactElement, ReactNode } from "react";

const rootStyles = cva([
    "w-full",
    "border-r",
    "border-t",
    "border-black",
    "[&:last-of-type]:border-r-0",
]);

interface InfoSectionProps {
    children: ReactNode[];
    className?: { root?: string };
}

export const InfoSection = ({
    children,
    className,
}: InfoSectionProps): ReactElement => {
    const headerChildren = children[0];
    const contentChildren = children[1];

    return (
        <div className={rootStyles({ className: className?.root })}>
            <div className="p-3 border-b border-black">{headerChildren}</div>
            <div className="flex flex-col gap-3 p-3">{contentChildren}</div>
        </div>
    );
};
