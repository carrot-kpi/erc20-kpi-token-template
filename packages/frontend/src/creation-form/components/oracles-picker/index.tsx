import {
    NamespacedTranslateFunction,
    useOracleTemplates,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Button, TextMono } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { OracleTemplate } from "../../../ui/oracle-template";

interface OraclesPickerProps {
    t: NamespacedTranslateFunction;
    onNext: (pickedTemplates: Template[]) => void;
}

interface PickableOracleTemplate {
    isPicked: boolean;
    template: Template;
}

export const OraclesPicker = ({
    t,
    onNext,
}: OraclesPickerProps): ReactElement => {
    const { loading, templates } = useOracleTemplates();
    const [oracleTemplates, setOracleTemplates] = useState<
        PickableOracleTemplate[]
    >([]);

    useEffect(() => {
        setOracleTemplates(
            templates.map((template) => ({
                isPicked: false,
                template,
            }))
        );
    }, [templates]);

    const pickedTemplatesCount = useMemo(
        () => oracleTemplates.filter((oracle) => oracle.isPicked).length,
        [oracleTemplates]
    );

    const handleNext = useCallback(() => {
        onNext(
            oracleTemplates
                .filter((oracle) => oracle.isPicked)
                .map((oracle) => oracle.template)
        );
    }, [oracleTemplates, onNext]);

    const handlePick = (id: number) => {
        setOracleTemplates((previousState) => {
            const nextOracleTemplates = [...previousState];

            const pickedOracle = nextOracleTemplates.find(
                (oracle) => oracle.template.id === id
            );

            if (!pickedOracle) {
                return nextOracleTemplates;
            }

            pickedOracle.isPicked = !pickedOracle.isPicked;

            return nextOracleTemplates;
        });
    };

    if (loading) {
        return <>{t("loading")}...</>;
    }

    return (
        <div className="flex flex-col gap-6">
            <TextMono size="md" weight="medium">
                {t("oracles.picker.label")}
            </TextMono>
            <div className="overflow-x-auto flex gap-7 scrollbar">
                {oracleTemplates.map(({ isPicked, template }) => {
                    return (
                        <div
                            key={template.id}
                            className="flex flex-col gap-3 items-center p-2"
                        >
                            <OracleTemplate
                                key={template.id}
                                name={template.specification.name}
                                description={template.specification.description}
                                version={template.version}
                                address={template.address}
                            />
                            <input
                                className="h-6 w-6 accent-black cursor-pointer outline-none"
                                type="checkbox"
                                checked={isPicked}
                                onChange={() => {
                                    handlePick(template.id);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            <TextMono size="md" weight="medium">
                {t("oracles.picker.selected")} {pickedTemplatesCount}
            </TextMono>
            <Button size="small" onClick={handleNext}>
                {t("next")}
            </Button>
        </div>
    );
};
