import { ChangeEvent, ReactElement, useCallback, useState } from "react";
import { SpecificationData } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { TextInput } from "../../../ui/text-input";
import { MarkdownInput } from "../../../ui/markdown-input";
import { Button } from "@carrot-kpi/ui";

interface CampaignDescriptionProps {
    t: NamespacedTranslateFunction;
    onNext: (specificationData: SpecificationData) => void;
}

export const CampaignDescription = ({
    t,
    onNext,
}: CampaignDescriptionProps): ReactElement => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setTitle(event.target.value);
    };

    const handleNext = useCallback(() => {
        onNext({ description, title, tags: [] });
    }, [onNext, description, title]);

    return (
        <div className="flex flex-col gap-6">
            <TextInput
                id="title"
                label={t("label.title")}
                placeholder={"Enter campaign title"}
                onChange={handleTitleChange}
                value={title}
            />
            <MarkdownInput
                id="description"
                label={t("label.description")}
                placeholder={"Enter campaign description"}
                onChange={setDescription}
                value={description}
            />
            <Button size="small" onClick={handleNext}>
                {t("next")}
            </Button>
        </div>
    );
};
