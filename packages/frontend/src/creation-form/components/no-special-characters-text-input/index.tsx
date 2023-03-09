import { TextInput, TextInputProps } from "@carrot-kpi/ui";
import { ChangeEvent, useCallback } from "react";
import { NO_SPECIAL_CHARACTERS_REGEX } from "../../constants";

export const NoSpecialCharactersTextInput = ({
    onChange,
    ...props
}: TextInputProps) => {
    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!event.target.value.match(NO_SPECIAL_CHARACTERS_REGEX)) return;
            if (onChange) onChange(event);
        },
        [onChange]
    );

    return <TextInput {...props} onChange={handleChange} />;
};
