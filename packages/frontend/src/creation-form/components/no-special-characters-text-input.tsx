import { TextInput, type TextInputProps } from "@carrot-kpi/ui";
import { type ChangeEvent, type FocusEvent, useCallback } from "react";
import { NO_SPECIAL_CHARACTERS_REGEX } from "../constants";

interface NoSpecialCharactersTextInputProps
    extends Omit<TextInputProps, "onChange"> {
    onChange: (value: string) => void;
}

export const NoSpecialCharactersTextInput = ({
    onChange,
    ...props
}: NoSpecialCharactersTextInputProps) => {
    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (!onChange) return;
            const value = event.target.value;
            if (!value.match(NO_SPECIAL_CHARACTERS_REGEX)) return;
            onChange(value);
        },
        [onChange],
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            if (!onChange) return;
            onChange(event.target.value.trim());
        },
        [onChange],
    );

    return <TextInput {...props} onChange={handleChange} onBlur={handleBlur} />;
};
