import {
    type Dispatch,
    type ReactElement,
    type SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import type {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import { NextStepButton } from "@carrot-kpi/ui";
import type { i18n } from "i18next";
import type {
    OracleConfigurationState,
    OracleData,
    OraclesConfigurationStepState,
    SpecificationData,
} from "../../types";
import { KPIToken, Template } from "@carrot-kpi/sdk";
import { unixTimestamp } from "../../../utils/dates";
import { OraclesAccordion } from "./oracles-accordion";
import { OracleCreationForm } from "./oracle-creation-form";

type Assert = (
    data: OraclesConfigurationStepState,
) => asserts data is { [id: number]: Required<OracleConfigurationState> };
const assertInitializationBundleGetterPresent: Assert = (
    data: OraclesConfigurationStepState,
) => {
    const dataValues = Object.values(data);
    if (
        dataValues.length === 0 ||
        dataValues.some((item) => !item.initializationBundleGetter)
    )
        throw new Error();
};

interface OraclesConfigurationProps {
    t: NamespacedTranslateFunction;
    i18n: i18n;
    templates: Template[];
    specificationData?: SpecificationData | null;
    state: OraclesConfigurationStepState;
    onStateChange: Dispatch<SetStateAction<OraclesConfigurationStepState>>;
    onNext: (oraclesData: Required<OracleData>[]) => void;
    navigate: KPITokenCreationFormProps["navigate"];
    onTx: KPITokenCreationFormProps["onTx"];
}

export const OraclesConfiguration = ({
    t,
    i18n,
    templates,
    specificationData,
    state,
    onStateChange,
    onNext,
    navigate,
    onTx,
}: OraclesConfigurationProps): ReactElement => {
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [partialKPIToken, setPartialKPIToken] = useState<
        Partial<KPIToken> | undefined
    >();

    useEffect(() => {
        try {
            assertInitializationBundleGetterPresent(state);
            setDisabled(false);
        } catch (error) {
            setDisabled(true);
        }
    }, [state]);

    useEffect(() => {
        if (!specificationData?.expiration) return;
        setPartialKPIToken({
            expiration: unixTimestamp(specificationData.expiration),
        });
    }, [specificationData?.expiration]);

    const handleChange = useCallback(
        (
            templateId: number,
            oracleState: Partial<unknown>,
            initializationBundleGetter?: OracleInitializationBundleGetter,
        ) => {
            onStateChange((prevState) => ({
                ...prevState,
                [templateId]: {
                    state: oracleState,
                    initializationBundleGetter,
                },
            }));
        },
        [onStateChange],
    );

    const handleNext = useCallback(() => {
        const perform = async () => {
            try {
                assertInitializationBundleGetterPresent(state);
                setLoading(true);
                const oracles = await Promise.all(
                    Object.values(state).map(async (item) => {
                        const initializationBundle =
                            await item.initializationBundleGetter();
                        const oracleData: Required<OracleData> = {
                            state: item.state,
                            initializationBundle,
                        };
                        return oracleData;
                    }),
                );
                onNext(oracles);
            } catch (error) {
                console.warn("could not get initialization data", error);
            } finally {
                setLoading(false);
            }
        };
        void perform();
    }, [state, onNext]);

    return (
        <div className="flex flex-col gap-6">
            {templates.length === 1 ? (
                <OracleCreationForm
                    t={t}
                    i18n={i18n}
                    navigate={navigate}
                    onTx={onTx}
                    kpiToken={partialKPIToken}
                    onChange={handleChange}
                    template={templates[0]}
                    data={state}
                />
            ) : (
                <OraclesAccordion
                    t={t}
                    i18n={i18n}
                    navigate={navigate}
                    onTx={onTx}
                    kpiToken={partialKPIToken}
                    onChange={handleChange}
                    templates={templates}
                    data={state}
                />
            )}
            <NextStepButton
                onClick={handleNext}
                disabled={disabled}
                loading={loading}
            >
                {t("next")}
            </NextStepButton>
        </div>
    );
};
