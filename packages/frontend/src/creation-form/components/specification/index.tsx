import {
    ChangeEvent,
    ReactElement,
    useCallback,
    useEffect,
    useState,
} from "react";
import { SpecificationData } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { TextInput, MarkdownInput } from "@carrot-kpi/ui";
import { NextButton } from "../next-button";

const stripHtml = (value: string) => value.replace(/(<([^>]+)>)/gi, "");

interface SpecificationProps {
    t: NamespacedTranslateFunction;
    specificationData: SpecificationData | null;
    onNext: (specification: SpecificationData) => void;
}

export const Specification = ({
    t,
    specificationData,
    onNext,
}: SpecificationProps): ReactElement => {
    const [title, setTitle] = useState(specificationData?.title);
    const [titleErrorText, setTitleErrorText] = useState("");
    const [description, setDescription] = useState(
        specificationData?.description
    );
    const [descriptionErrorText, setDescriptionErrorText] = useState("");
    const [tags /* setTags */] = useState<string[]>([]);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(
            !title ||
                !description ||
                !title.trim() ||
                !stripHtml(description).trim()
        );
    }, [description, title]);

    const handleTitleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setTitle(event.target.value);
            setTitleErrorText(
                !event.target.value.trim() ? t("error.title") : ""
            );
        },
        [t]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            setDescription(value);
            setDescriptionErrorText(
                !stripHtml(value).trim() ? t("error.description") : ""
            );
        },
        [t]
    );

    const handleNext = useCallback(() => {
        if (!title || !description) return;
        onNext({
            title,
            description,
            tags,
        });
    }, [description, onNext, tags, title]);

    return (
        <div className="flex flex-col gap-6">
            <TextInput
                id="title"
                label={t("label.title")}
                placeholder={"Enter campaign title"}
                onChange={handleTitleChange}
                value={title}
                error={!!titleErrorText}
                helperText={titleErrorText}
                className="w-full"
            />
            <MarkdownInput
                id="description"
                label={t("label.description")}
                placeholder={"Enter campaign description"}
                onChange={handleDescriptionChange}
                error={!!descriptionErrorText}
                helperText={descriptionErrorText}
                value={description}
            />
            <div className="flex justify-end">
                <NextButton t={t} onClick={handleNext} disabled={disabled} />
            </div>
        </div>
    );
};
