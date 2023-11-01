import type { KPITokenRemoteCreationFormProps } from "@carrot-kpi/react";
import { Component as CreationForm } from "../../src/creation-form";
import type { State } from "../../src/creation-form/types";

export const Component = (props: KPITokenRemoteCreationFormProps<State>) => {
    return (
        <div id={__ROOT_ID__} className="w-full h-full">
            <CreationForm {...props} />
        </div>
    );
};
