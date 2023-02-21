import { cva } from "class-variance-authority";
import { ReactElement, ReactNode } from "react";

const rootStyles = cva([
    "border-r-0",
    "w-full",
    "sm:border-r",
    "border-t",
    "border-black",
    "dark:border-gray-400",
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
            <div className="p-4 border-b border-black dark:border-gray-400">
                {headerChildren}
            </div>
            <div className="flex flex-col gap-3 p-4">{contentChildren}</div>
        </div>
    );
};
