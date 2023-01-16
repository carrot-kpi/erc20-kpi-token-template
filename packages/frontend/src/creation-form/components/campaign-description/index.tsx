import { ChangeEvent, ReactElement } from "react";
import { SpecificationData } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button, TextInput, MarkdownInput } from "@carrot-kpi/ui";

interface CampaignDescriptionProps {
    t: NamespacedTranslateFunction;
    specification: SpecificationData;
    onFieldChange: (field: keyof SpecificationData, value: string) => void;
    onNext: () => void;
}

export const CampaignDescription = ({
    t,
    specification,
    onFieldChange,
    onNext,
}: CampaignDescriptionProps): ReactElement => {
    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onFieldChange("title", event.target.value);
    };

    const handleDescriptionChange = (value: string) => {
        onFieldChange("description", value);
    };

    return (
        <div className="flex flex-col gap-6">
            <TextInput
                id="title"
                label={t("label.title")}
                placeholder={"Enter campaign title"}
                onChange={handleTitleChange}
                value={specification.title}
                className="w-full"
            />
            <MarkdownInput
                id="description"
                label={t("label.description")}
                placeholder={"Enter campaign description"}
                onChange={handleDescriptionChange}
                value={specification.description}
            />
            <Button size="small" onClick={onNext}>
                {t("next")}
            </Button>
        </div>
    );
};
