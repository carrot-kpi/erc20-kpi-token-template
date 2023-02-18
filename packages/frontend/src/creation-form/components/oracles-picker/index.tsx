import {
    NamespacedTranslateFunction,
    useOracleTemplates,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Typography, NextStepButton } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Loader } from "../../../ui/loader";
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

    return (
        <div className="flex flex-col gap-6">
            {loading ? (
                <Loader />
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
                                    id={template.specification.cid}
                                    className="flex flex-col items-center gap-3 p-2"
                                >
                                    <OracleTemplate
                                        key={template.id}
                                        name={template.specification.name}
                                        description={
                                            template.specification.description
                                        }
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
                                                delete newPickedTemplates[
                                                    template.id
                                                ];
                                                setPickedTemplates(
                                                    newPickedTemplates
                                                );
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
                    <Typography weight="medium">
                        {t("oracles.picker.selected")}{" "}
                        {Object.keys(pickedTemplates).length}
                    </Typography>
                </>
            )}
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
