import { type ReactElement, useCallback, useEffect, useState } from "react";
import type { State } from "../types";
import {
    type NamespacedTranslateFunction,
    type TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import { MarkdownInput, NextStepButton } from "@carrot-kpi/ui";
import { NoSpecialCharactersTextInput } from "./no-special-characters-text-input";
import {
    MAX_KPI_TOKEN_DESCRIPTION_CHARS,
    MAX_KPI_TOKEN_TITLE_CHARS,
} from "../constants";

interface GenericDataProps {
    t: NamespacedTranslateFunction;
    state: State;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: () => void;
}

const stripHtml = (value: string) => value.replace(/(<([^>]+)>)/gi, "");

export const GenericData = ({
    t,
    state,
    onStateChange,
    onNext,
}: GenericDataProps): ReactElement => {
    const [titleErrorText, setTitleErrorText] = useState("");
    const [descriptionErrorText, setDescriptionErrorText] = useState("");
    // const [tagsErrorText, setTagsErrorText] = useState("");
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(
            !state.title ||
                !state.description ||
                !state.title.trim() ||
                state.title.trim().length > MAX_KPI_TOKEN_TITLE_CHARS ||
                !stripHtml(state.description).trim() ||
                stripHtml(state.description).trim().length >
                    MAX_KPI_TOKEN_DESCRIPTION_CHARS,
            // !state.tags ||
            // state.tags.length === 0 ||
            // state.tags.length > MAX_KPI_TOKEN_TAGS_COUNT,
        );
    }, [state]);

    const handleTitleChange = useCallback(
        (value: string): void => {
            setTitleErrorText(
                !value
                    ? t("error.title.empty")
                    : value.trim().length > MAX_KPI_TOKEN_TITLE_CHARS
                      ? t("error.title.tooLong", {
                            chars: MAX_KPI_TOKEN_TITLE_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({ ...state, title: value }));
        },
        [onStateChange, t],
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const trimmedValue = stripHtml(value).trim();
            setDescriptionErrorText(
                !trimmedValue
                    ? t("error.description.empty")
                    : trimmedValue.length > MAX_KPI_TOKEN_DESCRIPTION_CHARS
                      ? t("error.description.tooLong", {
                            chars: MAX_KPI_TOKEN_DESCRIPTION_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({ ...state, description: value }));
        },
        [onStateChange, t],
    );

    // const handleTagsChange = useCallback(
    //     (value: string[]) => {
    //         if (value.some((tag) => tag.length > MAX_KPI_TOKEN_TAG_CHARS)) {
    //             setTagsErrorText(
    //                 t("error.tags.tooLong", {
    //                     chars: MAX_KPI_TOKEN_TAG_CHARS,
    //                 }),
    //             );
    //             return;
    //         }
    //         if (value.some((tag, i) => value.indexOf(tag) !== i)) {
    //             setTagsErrorText(t("error.tags.duplicated"));
    //             return;
    //         }
    //         setTagsErrorText(
    //             value.length === 0
    //                 ? t("error.tags.empty")
    //                 : value.length > MAX_KPI_TOKEN_TAGS_COUNT
    //                   ? t("error.tags.tooMany", {
    //                         count: MAX_KPI_TOKEN_TAGS_COUNT,
    //                     })
    //                   : "",
    //         );
    //         onStateChange((state) => ({ ...state, tags: value }));
    //     },
    //     [onStateChange, t],
    // );

    return (
        <div className="flex flex-col gap-6">
            <NoSpecialCharactersTextInput
                data-testid="generic-data-step-title-input"
                label={t("general.label.title")}
                placeholder={t("general.placeholder.title")}
                onChange={handleTitleChange}
                value={state.title}
                error={!!titleErrorText}
                errorText={titleErrorText}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <MarkdownInput
                data-testid="generic-data-step-description-input"
                label={t("general.label.description")}
                placeholder={t("general.placeholder.description")}
                onChange={handleDescriptionChange}
                error={!!descriptionErrorText}
                errorText={descriptionErrorText}
                value={state.description}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            {/* TODO: add the tags back once they need to be used */}
            {/* <TagsInput
                data-testid="generic-data-step-tags-input"
                label={t("general.label.tags")}
                placeholder={t("general.placeholder.tags")}
                onChange={handleTagsChange}
                value={state.tags}
                error={!!tagsErrorText}
                errorText={tagsErrorText}
                messages={{ add: t("add") }}
                className={{
                    root: "w-full",
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            /> */}
            <NextStepButton
                data-testid="generic-data-step-next-button"
                onClick={onNext}
                disabled={disabled}
                className={{ root: "w-44 rounded-3xl" }}
            >
                {t("next")}
            </NextStepButton>
        </div>
    );
};
