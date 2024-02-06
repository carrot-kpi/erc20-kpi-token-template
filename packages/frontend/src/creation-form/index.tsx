import "../global.css";
import "@carrot-kpi/ui/styles.css";

import {
    Button,
    Loader,
    MultiStepCards,
    StepCard,
    Stepper,
} from "@carrot-kpi/ui";
import {
    type KPITokenRemoteCreationFormProps,
    useOracleTemplates,
    useKPITokenTemplateFeatureEnabledFor,
} from "@carrot-kpi/react";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { usePrevious } from "react-use";
import type { OracleWithInitializationBundleGetter, State } from "./types";
import { useAccount, useReadContract } from "wagmi";
import { Rewards } from "./components/rewards";
import { OraclesConfiguration } from "./components/oracles-configuration";
import { Deploy } from "./components/deploy";
import { Success } from "./components/success";
import { ConnectWallet } from "./components/connect-wallet";
import { GenericData } from "./components/generic-data";
import { OraclesPicker } from "./components/oracles-picker";
import erc20KpiToken from "../abis/erc20-kpi-token";
import { JIT_FUNDING_FEATURE_ID } from "./constants";
import { ReactComponent as ArrowDown } from "../assets/arrow-down.svg";
import { ReactComponent as CircleOk } from "../assets/circle-ok.svg";

export const Component = ({
    template,
    i18n,
    t,
    state,
    onStateChange,
    onCreate,
    navigate,
    onTx,
    onCreateDraft,
}: KPITokenRemoteCreationFormProps<State>): ReactElement => {
    const { address: connectedAddress } = useAccount();
    const previousAddress = usePrevious(connectedAddress);
    const { loading: loadingOracleTemplates, templates: oracleTemplates } =
        useOracleTemplates();
    const { data: protocolFeePpm, isPending: pendingProtocolFee } =
        useReadContract({
            address: template.address,
            abi: erc20KpiToken,
            functionName: "fee",
        });
    const {
        loading: jitFundingFeatureAllowanceLoading,
        enabled: jitFundingFeatureAllowed,
    } = useKPITokenTemplateFeatureEnabledFor({
        templateId: template.id,
        featureId: JIT_FUNDING_FEATURE_ID,
        account: connectedAddress,
    });

    const enableOraclePickStep =
        !loadingOracleTemplates && oracleTemplates.length > 1;

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
    const [draftSaved, setDraftSaved] = useState(false);

    const [
        oraclesWithInitializationBundleGetter,
        setOraclesWithInitializationBundleGetter,
    ] = useState<OracleWithInitializationBundleGetter[]>([]);

    const [createdKPITokenAddress, setCreatedKPITokenAddress] = useState("");

    // on wallet disconnect or address change, reset everything
    useEffect(() => {
        if (connectedAddress || previousAddress === connectedAddress) return;
        setStep(0);
        setMostUpdatedStep(0);
        onStateChange({});
    }, [connectedAddress, onStateChange, previousAddress]);

    useEffect(() => {
        const bodyElement = window.document.getElementById("__app_body");
        if (!bodyElement) return;
        bodyElement.scrollIntoView();
    }, [step]);

    useEffect(() => {
        if (
            (!!state.oracles && state.oracles.length > 0) ||
            loadingOracleTemplates ||
            jitFundingFeatureAllowanceLoading ||
            oracleTemplates?.length !== 1
        )
            return;
        onStateChange((state) => ({
            ...state,
            oracles: [{ templateId: oracleTemplates[0].id, state: {} }],
        }));
    }, [
        loadingOracleTemplates,
        jitFundingFeatureAllowanceLoading,
        onStateChange,
        oracleTemplates,
        state.oracles,
    ]);

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

    const handleDraftSave = useCallback(() => {
        onCreateDraft();
        setDraftSaved(true);
        setTimeout(() => {
            setDraftSaved(false);
        }, 600);
    }, [onCreateDraft]);

    if (
        loadingOracleTemplates ||
        pendingProtocolFee ||
        protocolFeePpm === undefined ||
        jitFundingFeatureAllowanceLoading
    ) {
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
                state={state}
                protocolFeePpm={protocolFeePpm}
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
                <div className="flex-col gap-14 absolute left-10 top-40 hidden lg:flex">
                    <Stepper
                        layout="vertical"
                        stepTitles={stepTitles}
                        activeStep={step}
                        lastStepCompleted={mostUpdatedStep}
                        onClick={handleStepClick}
                    />
                    <Button
                        size="small"
                        icon={draftSaved ? CircleOk : ArrowDown}
                        variant={draftSaved ? "secondary" : "primary"}
                        onClick={handleDraftSave}
                        className={{
                            icon: "stroke-current",
                        }}
                    >
                        {t("draft.create")}
                    </Button>
                </div>
                <MultiStepCards
                    activeStep={step}
                    messages={{ step: t("step") }}
                    className={{
                        root: "h-full min-h-[1000px] justify-between z-[1]",
                    }}
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
                                onStateChange={onStateChange}
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
                            jitFundingFeatureAllowed={jitFundingFeatureAllowed}
                            state={state}
                            protocolFeePpm={protocolFeePpm}
                            onStateChange={onStateChange}
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
                                onStateChange={onStateChange}
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
                            onStateChange={onStateChange}
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
                            protocolFeePpm={protocolFeePpm}
                            onStateChange={onStateChange}
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
