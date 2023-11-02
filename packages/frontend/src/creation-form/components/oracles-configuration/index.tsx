import { useCallback, useEffect, useState } from "react";
import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    type OracleInitializationBundleGetter,
    type TemplateComponentStateChangeCallback,
    type TemplateComponentStateUpdater,
} from "@carrot-kpi/react";
import { NextStepButton } from "@carrot-kpi/ui";
import type { i18n } from "i18next";
import type { OracleWithInitializationBundleGetter, State } from "../../types";
import { KPIToken, Template } from "@carrot-kpi/sdk";
import { MultipleOraclesCreationForm } from "./multiple-oracles-creation-form";

type MaybeOracleWithInitializationBundleGetter =
    OracleWithInitializationBundleGetter | null;

const areOraclesWithInitializationBundleGetterDefined = (
    oracles: MaybeOracleWithInitializationBundleGetter[],
) => oracles.every((oracle) => !!oracle);

interface OraclesConfigurationProps {
    t: NamespacedTranslateFunction;
    i18n: i18n;
    templates: Template[];
    state: State;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: (
        oraclesWithInitializationBundleGetter: OracleWithInitializationBundleGetter[],
    ) => void;
    navigate: KPITokenCreationFormProps<State>["navigate"];
    onTx: KPITokenCreationFormProps<State>["onTx"];
}

export const OraclesConfiguration = ({
    t,
    i18n,
    templates,
    state,
    onStateChange,
    onNext,
    navigate,
    onTx,
}: OraclesConfigurationProps) => {
    const [partialKPIToken, setPartialKPIToken] = useState<
        Partial<KPIToken> | undefined
    >();
    const [
        oraclesWithInitializationBundleGetter,
        setOraclesWithInitializationBundleGetter,
    ] = useState<MaybeOracleWithInitializationBundleGetter[]>(
        state.oracles ? state.oracles.map(() => null) : [],
    );
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (!state?.expiration) return;
        setPartialKPIToken({ expiration: state.expiration });
    }, [state.expiration]);

    useEffect(() => {
        setDisabled(
            !areOraclesWithInitializationBundleGetterDefined(
                oraclesWithInitializationBundleGetter,
            ),
        );
    }, [oraclesWithInitializationBundleGetter]);

    const handleStateChange = useCallback(
        (
            index: number,
            oracleStateOrUpdater:
                | object
                | TemplateComponentStateUpdater<object>,
        ) => {
            if (!state.oracles || !state.oracles[index]) {
                console.warn(
                    `no oracle present at given index ${index}, can't update state`,
                );
                return;
            }
            const newOracles = [...state.oracles];
            const oldOracle = newOracles[index];
            const newState =
                typeof oracleStateOrUpdater === "function"
                    ? oracleStateOrUpdater(oldOracle.state)
                    : oracleStateOrUpdater;
            const newOracle = { ...oldOracle, state: newState };
            newOracles[index] = newOracle;
            onStateChange((state) => ({ ...state, oracles: newOracles }));
        },
        [onStateChange, state.oracles],
    );

    const handleInitializationBundleGetterChange = useCallback(
        (
            index: number,
            initializationBundleGetter?: OracleInitializationBundleGetter,
        ) => {
            if (!state.oracles || !state.oracles[index]) {
                console.warn(
                    `no oracle present at given index ${index}, can't update state`,
                );
                return;
            }

            setOraclesWithInitializationBundleGetter((prevState) => {
                let newState;
                if (initializationBundleGetter) {
                    newState = [...prevState];
                    newState[index] = {
                        ...state.oracles![index],
                        getInitializationBundle: initializationBundleGetter,
                    };
                } else {
                    newState = prevState.map((oracle, i) =>
                        i === index ? null : oracle,
                    );
                }
                return newState;
            });
        },
        [state],
    );

    const handleNext = useCallback(() => {
        if (
            !areOraclesWithInitializationBundleGetterDefined(
                oraclesWithInitializationBundleGetter,
            )
        ) {
            console.warn(
                "not all oracles with initialization bundle getter are defined",
            );
            return;
        }
        onNext(
            oraclesWithInitializationBundleGetter as OracleWithInitializationBundleGetter[],
        );
    }, [onNext, oraclesWithInitializationBundleGetter]);

    if (!state.oracles) {
        console.warn("no oracles in state at oracles configuration step");
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <MultipleOraclesCreationForm
                t={t}
                i18n={i18n}
                navigate={navigate}
                onTx={onTx}
                kpiToken={partialKPIToken}
                onStateChange={handleStateChange}
                onInitializationBundleGetterChange={
                    handleInitializationBundleGetterChange
                }
                templates={templates}
                state={state}
            />
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
