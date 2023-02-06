import { ReactElement, ReactNode } from "react";

interface HeaderProps {
    children: ReactNode;
}

export const Header = ({ children }: HeaderProps): ReactElement => (
    <div>{children}</div>
);
