import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Typography, NextStepButton, Checkbox } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Loader } from "../../../ui/loader";
import { OracleTemplate } from "../../../ui/oracle-template";

type TemplatesMap = { [id: number]: Template };

interface OraclesPickerProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    templates: Template[];
    oracleTemplatesData: Template[];
    onNext: (oracleTemplates: Template[]) => void;
}

export const OraclesPicker = ({
    t,
    loading,
    templates,
    oracleTemplatesData,
    onNext,
}: OraclesPickerProps): ReactElement => {
    const [pickedTemplates, setPickedTemplates] = useState(
        oracleTemplatesData.reduce((accumulator: TemplatesMap, template) => {
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

    return (
        <div className="flex flex-col gap-6">
            {loading ? (
                <div className="w-full flex justify-center">
                    <Loader />
                </div>
            ) : (
                <>
                    <Typography weight="medium">
                        {t("oracles.picker.label")}
                    </Typography>
                    <div className="flex gap-7 overflow-x-auto">
                        {templates.map((template) => {
                            const checked = !!pickedTemplates[template.id];
                            return (
                                <div
                                    key={template.id}
                                    className="flex flex-col items-center gap-3 p-2"
                                >
                                    <OracleTemplate
                                        t={t}
                                        key={template.id}
                                        template={template}
                                    />
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => {
                                            // TODO: support multiple choices when it will be a thing
                                            if (checked) {
                                                // const newPickedTemplates = {
                                                //     ...pickedTemplates,
                                                // };
                                                // delete newPickedTemplates[
                                                //     template.id
                                                // ];
                                                setPickedTemplates({});
                                            } else {
                                                setPickedTemplates({
                                                    [template.id]: template,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    {/* TODO: make this a thing when multiple oracles will be properly supported */}
                    {/* <Typography weight="medium">
                        {t("oracles.picker.selected")}{" "}
                        {Object.keys(pickedTemplates).length}
                    </Typography> */}
                </>
            )}
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
