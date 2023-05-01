import { KPITokenRemoteCreationFormProps } from "@carrot-kpi/react";
import { Component as CreationForm } from "../../src/creation-form";

export const Component = (props: KPITokenRemoteCreationFormProps) => {
    return (
        <div id={ROOT_ID} className="w-full h-full">
            <CreationForm {...props} />
        </div>
    );
};
