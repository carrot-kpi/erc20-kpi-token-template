import { ReactElement, ReactNode } from "react";

interface ContentProps {
    children: ReactNode;
}

export const Content = ({ children }: ContentProps): ReactElement => (
    <div className="flex flex-col gap-3">{children}</div>
);
