import {
    ChangeEvent,
    ReactElement,
    useCallback,
    useEffect,
    useState,
} from "react";
import { SpecificationData } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button, TextInput, MarkdownInput } from "@carrot-kpi/ui";

interface SpecificationProps {
    t: NamespacedTranslateFunction;
    onNext: (specification: SpecificationData) => void;
}

export const Specification = ({
    t,
    onNext,
}: SpecificationProps): ReactElement => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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
            <Button size="small" onClick={handleNext} disabled={disabled}>
                {t("next")}
            </Button>
        </div>
    );
};
