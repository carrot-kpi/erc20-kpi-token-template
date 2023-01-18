import {
    NamespacedTranslateFunction,
    useOracleTemplates,
} from "@carrot-kpi/react";
import { TextMono } from "@carrot-kpi/ui";
import { BigNumber } from "ethers";
import { ReactElement, useEffect, useMemo } from "react";
import { Loader } from "../../../ui/loader";
import { OracleTemplate } from "../../../ui/oracle-template";
import { CreationData, OracleData } from "../../types";

interface OraclesPickerProps {
    t: NamespacedTranslateFunction;
    oracles: OracleData[];
    onFieldChange: (
        field: keyof Pick<CreationData, "oracles">,
        oraclesData: OracleData[]
    ) => void;
    handlePick: (oracleId: number) => void;
}

export const OraclesPicker = ({
    t,
    oracles,
    onFieldChange,
    handlePick,
}: OraclesPickerProps): ReactElement => {
    const { loading, templates } = useOracleTemplates();

    useEffect(() => {
        // initialize the oracles data
        if (oracles.length === 0) {
            onFieldChange(
                "oracles",
                templates.map((template) => ({
                    isPicked: false,
                    template,
                    initializationData: "",
                    value: BigNumber.from("0"),
                    lowerBound: BigNumber.from("0"),
                    higherBound: BigNumber.from("0"),
                    weight: BigNumber.from("0"),
                }))
            );
        }
    }, [oracles, templates, onFieldChange]);

    const pickedTemplatesCount = useMemo(
        () => oracles.filter((oracle) => oracle.isPicked).length,
        [oracles]
    );

    if (loading) {
        // TODO: think about a standard loading component
        return <Loader />;
    }

    return (
        <div className="flex flex-col gap-6">
            <TextMono size="md" weight="medium">
                {t("oracles.picker.label")}
            </TextMono>
            <div className="scrollbar flex gap-7 overflow-x-auto">
                {oracles.map(({ isPicked, template }) => {
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
        </div>
    );
};
