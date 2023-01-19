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
    const [title, setTitle] = useState(specificationData?.title || "");
    const [description, setDescription] = useState(
        specificationData?.description || ""
    );
    const [tags /* setTags */] = useState<string[]>([]);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(
            !title.trim() || !description.replace(/(<([^>]+)>)/gi, "").trim()
        );
    }, [description, title]);

    const handleTitleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setTitle(event.target.value);
        },
        []
    );

    const handleDescriptionChange = useCallback((value: string) => {
        setDescription(value);
    }, []);

    const handleNext = useCallback(() => {
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
                className="w-full"
            />
            <MarkdownInput
                id="description"
                label={t("label.description")}
                placeholder={"Enter campaign description"}
                onChange={handleDescriptionChange}
                value={description}
            />
            <div className="flex justify-end">
                <NextButton t={t} onClick={handleNext} disabled={disabled} />
            </div>
        </div>
    );
};
