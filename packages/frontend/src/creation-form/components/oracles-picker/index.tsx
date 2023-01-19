import {
    NamespacedTranslateFunction,
    useOracleTemplates,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Button, TextMono } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { OracleTemplate } from "../../../ui/oracle-template";

type TemplateMap = { [id: number]: Template };

interface OraclesPickerProps {
    t: NamespacedTranslateFunction;
    oracleTemplatesData: Template[];
    onNext: (oracleTemplates: Template[]) => void;
}

export const OraclesPicker = ({
    t,
    oracleTemplatesData,
    onNext,
}: OraclesPickerProps): ReactElement => {
    const { loading, templates } = useOracleTemplates();

    const [pickedTemplates, setPickedTemplates] = useState(
        oracleTemplatesData.reduce((accumulator: TemplateMap, template) => {
            accumulator[template.id] = template;
            return accumulator;
        }, {})
    );
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(Object.keys(pickedTemplates).length === 0);
    }, [pickedTemplates]);

    const handleNext = useCallback(() => {
        onNext(Object.values(pickedTemplates));
    }, [onNext, pickedTemplates]);

    if (loading) {
        // TODO: think about a standard loading component
        return <p>{t("loading")}...</p>;
    }
    return (
        <div className="flex flex-col gap-6">
            <TextMono size="md" weight="medium">
                {t("oracles.picker.label")}
            </TextMono>
            <div className="scrollbar flex gap-7 overflow-x-auto">
                {templates.map((template) => {
                    const checked = !!pickedTemplates[template.id];
                    return (
                        <div
                            key={template.id}
                            id={template.specification.cid}
                            className="flex flex-col items-center gap-3 p-2"
                        >
                            <OracleTemplate
                                key={template.id}
                                name={template.specification.name}
                                description={template.specification.description}
                                version={template.version}
                                address={template.address}
                            />
                            <input
                                className="h-6 w-6 cursor-pointer accent-black outline-none"
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                    if (checked) {
                                        const newPickedTemplates = {
                                            ...pickedTemplates,
                                        };
                                        delete newPickedTemplates[template.id];
                                        setPickedTemplates(newPickedTemplates);
                                    } else {
                                        setPickedTemplates({
                                            ...pickedTemplates,
                                            [template.id]: template,
                                        });
                                    }
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            <TextMono size="md" weight="medium">
                {t("oracles.picker.selected")}{" "}
                {Object.keys(pickedTemplates).length}
            </TextMono>
            <Button size="small" onClick={handleNext} disabled={disabled}>
                {t("next")}
            </Button>
        </div>
    );
};
