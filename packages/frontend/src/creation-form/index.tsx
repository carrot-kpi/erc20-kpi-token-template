import "../global.css";
import "@carrot-kpi/ui/styles.css";

import { Loader, MultiStepCards, StepCard, Stepper } from "@carrot-kpi/ui";
import {
    type KPITokenRemoteCreationFormProps,
    useOracleTemplates,
} from "@carrot-kpi/react";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import type { OracleWithInitializationBundleGetter, State } from "./types";
import { useAccount } from "wagmi";
import { Rewards } from "./components/rewards";
import { OraclesConfiguration } from "./components/oracles-configuration";
import { Deploy } from "./components/deploy";
import { Success } from "./components/success";
import { ConnectWallet } from "./components/connect-wallet";
import { GenericData } from "./components/generic-data";
import { OraclesPicker } from "./components/oracles-picker";

export const Component = ({
    template,
    i18n,
    t,
    state,
    onChange,
    onCreate,
    navigate,
    onTx,
}: KPITokenRemoteCreationFormProps<State>): ReactElement => {
    const { address: connectedAddress } = useAccount();
    const { loading, templates: oracleTemplates } = useOracleTemplates();

    const enableOraclePickStep = !loading && oracleTemplates.length > 1;

    const stepTitles = enableOraclePickStep
        ? [
              t("card.general.title"),
              t("card.rewards.title"),
              t("card.oracle.pick.title"),
              t("card.oracle.configuration.title"),
              t("card.deploy.title"),
          ]
        : [
              t("card.general.title"),
              t("card.rewards.title"),
              t("card.oracle.configuration.title"),
              t("card.deploy.title"),
          ];

    const [step, setStep] = useState(0);
    const [mostUpdatedStep, setMostUpdatedStep] = useState(0);

    const [
        oraclesWithInitializationBundleGetter,
        setOraclesWithInitializationBundleGetter,
    ] = useState<OracleWithInitializationBundleGetter[]>([]);

    const [createdKPITokenAddress, setCreatedKPITokenAddress] = useState("");

    // on wallet disconnect, reset EVERYTHING
    useEffect(() => {
        if (connectedAddress) return;
        setStep(0);
        setMostUpdatedStep(0);
        onChange({});
    }, [connectedAddress, onChange]);

    useEffect(() => {
        const bodyElement = window.document.getElementById("__app_body");
        if (!bodyElement) return;
        bodyElement.scrollIntoView();
    }, [step]);

    useEffect(() => {
        if (
            (!!state.oracles && state.oracles.length > 0) ||
            loading ||
            oracleTemplates?.length !== 1
        )
            return;
        onChange({
            ...state,
            oracles: [{ templateId: oracleTemplates[0].id, state: {} }],
        });
    }, [loading, onChange, oracleTemplates, state]);

    const handleStepClick = useCallback((clickedStep: number) => {
        setStep(clickedStep);
        setMostUpdatedStep(clickedStep);
    }, []);

    const getNextHandler = useCallback(
        (nextStepIndex: number) => () => {
            setStep(nextStepIndex);
            setMostUpdatedStep(nextStepIndex);
        },
        [],
    );

    const handleOraclesConfigurationNext = useCallback(
        (
            oraclesWithInitializationBundleGetter: OracleWithInitializationBundleGetter[],
        ) => {
            setOraclesWithInitializationBundleGetter(
                oraclesWithInitializationBundleGetter,
            );
            const nextStep = enableOraclePickStep ? 4 : 3;
            setStep(nextStep);
            setMostUpdatedStep(nextStep);
        },
        [enableOraclePickStep],
    );

    if (loading) {
        return (
            <div className="h-screen py-20 text-black flex justify-center">
                <Loader />
            </div>
        );
    }

    if (createdKPITokenAddress) {
        return (
            <Success
                t={t}
                navigate={navigate}
                kpiTokenAddress={createdKPITokenAddress}
            />
        );
    }

    return (
        <div className="relative h-full w-full bg-green scrollbar overflow-y-auto px-4 pt-10">
            <div className="absolute bg-grid-light top-0 left-0 w-full h-full" />
            <div className="h-full flex flex-col items-center justify-between">
                <div className="flex lg:hidden mb-8">
                    <Stepper
                        layout="horizontal"
                        stepTitles={stepTitles}
                        activeStep={step}
                        lastStepCompleted={mostUpdatedStep}
                        onClick={handleStepClick}
                        // FIXME: find a better way to avoid the !
                        className={{
                            stepLabel: "!hidden",
                        }}
                    />
                </div>
                <div className="absolute left-10 top-40 hidden lg:flex">
                    <Stepper
                        layout="vertical"
                        stepTitles={stepTitles}
                        activeStep={step}
                        lastStepCompleted={mostUpdatedStep}
                        onClick={handleStepClick}
                    />
                </div>
                <MultiStepCards
                    activeStep={step}
                    messages={{ step: t("step") }}
                    className={{ root: "h-full justify-between z-[1]" }}
                >
                    <StepCard
                        title={t("card.general.title")}
                        step={1}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        {!connectedAddress ? (
                            <ConnectWallet t={t} />
                        ) : (
                            <GenericData
                                t={t}
                                state={state}
                                onStateChange={onChange}
                                onNext={getNextHandler(1)}
                            />
                        )}
                    </StepCard>
                    <StepCard
                        title={t("card.rewards.title")}
                        step={2}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        <Rewards
                            t={t}
                            state={state}
                            onStateChange={onChange}
                            onNext={getNextHandler(2)}
                        />
                    </StepCard>
                    {enableOraclePickStep && (
                        <StepCard
                            title={t("card.oracle.pick.title")}
                            step={3}
                            className={{ root: "relative pb-10" }}
                            messages={{ step: t("step") }}
                        >
                            <OraclesPicker
                                t={t}
                                templates={oracleTemplates}
                                state={state}
                                onStateChange={onChange}
                                onNext={getNextHandler(3)}
                            />
                        </StepCard>
                    )}
                    <StepCard
                        title={t("card.oracle.configuration.title")}
                        step={enableOraclePickStep ? 4 : 3}
                        className={{ root: "relative pb-10", content: "px-0" }}
                        messages={{ step: t("step") }}
                    >
                        <OraclesConfiguration
                            t={t}
                            i18n={i18n}
                            templates={oracleTemplates}
                            state={state}
                            onStateChange={onChange}
                            onNext={handleOraclesConfigurationNext}
                            navigate={navigate}
                            onTx={onTx}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.deploy.title")}
                        step={enableOraclePickStep ? 5 : 4}
                        className={{ root: "relative" }}
                        messages={{ step: t("step") }}
                    >
                        <Deploy
                            t={t}
                            template={template}
                            oraclesWithInitializationBundleGetter={
                                oraclesWithInitializationBundleGetter
                            }
                            state={state}
                            onNext={setCreatedKPITokenAddress}
                            onCreate={onCreate}
                            onTx={onTx}
                        />
                    </StepCard>
                </MultiStepCards>
            </div>
        </div>
    );
};
