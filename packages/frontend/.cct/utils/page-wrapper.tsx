import { KPITokenRemotePageProps } from "@carrot-kpi/react";
import { Component as Page } from "../../src/page";

export const Component = (props: KPITokenRemotePageProps) => {
    return (
        <div id={ROOT_ID} className="w-full h-full">
            <Page {...props} />
        </div>
    );
};
