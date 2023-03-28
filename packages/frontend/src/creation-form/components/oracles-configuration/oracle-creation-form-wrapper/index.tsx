// this wrapper component is useful to avoid using a curried callback to update the oracle
// data on the oracle's creation form change. The curried function would look something
// like this:
//
// ```
// const getChangeHandler = (id: number) => (state, initializationBundleGetter) => { ... }
// ```
//
// The problem with this is that the change handler ref changes every time the component renders,
// and this might end up causing an infinite rerendering loop.

import {
    OracleCreationForm,
    OracleCreationFormProps,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import { useCallback } from "react";

// as the component acts as a wrapper, the props given are the exact same as
// the ones in the original component, except onChange. Here onchange is
// enriched, as we also pass the template id alongside the oracle creation
// form state and initialization data bundle getter function
type OracleCreationFormWrapperProps<T> = Omit<
    OracleCreationFormProps<T>,
    "onChange"
> & {
    onChange: (
        templateId: number,
        state: Partial<T>,
        initializationBundleGetter?: OracleInitializationBundleGetter
    ) => void;
};

export function OracleCreationFormWrapper<T>({
    template,
    onChange,
    ...rest
}: OracleCreationFormWrapperProps<T>) {
    const handleChange = useCallback(
        (
            state: Partial<T>,
            initializationBundleGetter?: OracleInitializationBundleGetter
        ) => {
            if (!template) return;
            onChange(template.id, state, initializationBundleGetter);
        },
        [onChange, template]
    );

    return (
        <OracleCreationForm
            template={template}
            onChange={handleChange}
            {...rest}
        />
    );
}
