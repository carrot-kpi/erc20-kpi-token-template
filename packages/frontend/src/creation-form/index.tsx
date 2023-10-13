import "../global.css";
import "@carrot-kpi/ui/styles.css";

import { Loader, MultiStepCards, StepCard, Stepper } from "@carrot-kpi/ui";
import {
    type KPITokenRemoteCreationFormProps,
    useOracleTemplates,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { OraclesPicker } from "./components/oracles-picker";
import type {
    CollateralData,
    CollateralsStepState,
    GenericDataStepState,
    OracleData,
    OraclesConfigurationStepState,
    SpecificationData,
    TokenData as TokenDataType,
} from "./types";
import { useAccount } from "wagmi";
import { GenericData } from "./components/generic-data";
import { Collaterals } from "./components/collaterals";
import { OraclesConfiguration } from "./components/oracles-configuration";
import { Deploy } from "./components/deploy";
import { Success } from "./components/success";
import { ConnectWallet } from "./components/connect-wallet";

// TODO: when we have more than one oracle template, implement state
// and state change features for the oracle picker state too
export const Component = ({
    i18n,
    t,
    template,
    onCreate,
    navigate,
    onTx,
}: KPITokenRemoteCreationFormProps): ReactElement => {
    const { address: connectedAddress } = useAccount();
    const { loading, templates: oracleTemplates } = useOracleTemplates();

    const enableOraclePickStep = !loading && oracleTemplates.length > 1;
    const stepTitles = enableOraclePickStep
        ? [
              t("card.general.title"),
              t("card.collateral.title"),
              t("card.oracle.pick.title"),
              t("card.oracle.configuration.title"),
              t("card.deploy.title"),
              t("card.success.title"),
          ]
        : [
              t("card.general.title"),
              t("card.collateral.title"),
              t("card.oracle.configuration.title"),
              t("card.deploy.title"),
              t("card.success.title"),
          ];

    const [step, setStep] = useState(0);
    const [mostUpdatedStep, setMostUpdatedStep] = useState(0);

    const [genericDataStepState, setGenericDataStepState] =
        useState<GenericDataStepState>({});
    const [specificationData, setSpecificationData] =
        useState<SpecificationData | null>(null);
    const [specificationCID, setSpecificationCID] = useState("");
    const [tokenData, setTokenData] = useState<TokenDataType | null>(null);

    const [collateralsStepState, setCollateralsStepState] =
        useState<CollateralsStepState>({
            collaterals: [],
        });
    const [collateralsData, setCollateralsData] = useState<CollateralData[]>(
        [],
    );

    const [oracleTemplatesData, setOracleTemplatesData] = useState<Template[]>(
        [],
    );

    const [oraclesConfigurationStepState, setOraclesConfigurationStepState] =
        useState<OraclesConfigurationStepState>({});
    const [oraclesData, setOraclesData] = useState<Required<OracleData>[]>([]);

    const [createdKPITokenAddress, setCreatedKPITokenAddress] = useState("");

    // on wallet disconnect, reset EVERYTHING
    useEffect(() => {
        if (connectedAddress) return;
        setStep(0);
        setMostUpdatedStep(0);
        setSpecificationData(null);
        setCollateralsData([]);
        setTokenData(null);
        setOracleTemplatesData([]);
        setOraclesData([]);
        setCreatedKPITokenAddress("");
    }, [connectedAddress]);

    useEffect(() => {
        if (oracleTemplates.length === 1 && oracleTemplatesData.length === 0)
            setOracleTemplatesData([oracleTemplates[0]]);
    }, [oracleTemplates, oracleTemplatesData.length]);

    const handleStepClick = useCallback((clickedStep: number) => {
        setStep(clickedStep);
        setMostUpdatedStep(clickedStep);
    }, []);

    const handleGenericDataNext = useCallback(
        (
            specificationData: SpecificationData,
            specificationCID: string,
            tokenData: TokenDataType,
        ) => {
            setSpecificationData(specificationData);
            setSpecificationCID(specificationCID);
            setTokenData(tokenData);
            setStep(1);
            setMostUpdatedStep(1);
        },
        [],
    );

    const handleCollateralsNext = useCallback(
        (collaterals: CollateralData[]) => {
            setCollateralsData(collaterals);
            setStep(2);
            setMostUpdatedStep(2);
        },
        [],
    );

    const handleOraclesPickerNext = useCallback((templates: Template[]) => {
        setOracleTemplatesData(templates);
        setStep(3);
        setMostUpdatedStep(3);
    }, []);

    const handleOraclesConfigurationNext = useCallback(
        (oracleData: Required<OracleData>[]) => {
            setOraclesData(oracleData);
            const nextStep = enableOraclePickStep ? 4 : 3;
            setStep(nextStep);
            setMostUpdatedStep(nextStep);
        },
        [enableOraclePickStep],
    );

    const handleDeployNext = useCallback(
        (address: string) => {
            setCreatedKPITokenAddress(address);
            const nextStep = enableOraclePickStep ? 6 : 5;
            setStep(nextStep);
            setMostUpdatedStep(nextStep);
        },
        [enableOraclePickStep],
    );

    if (loading) {
        return (
            <div className="py-10 text-black flex justify-center">
                <Loader />
            </div>
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
                                state={genericDataStepState}
                                onStateChange={setGenericDataStepState}
                                onNext={handleGenericDataNext}
                            />
                        )}
                    </StepCard>
                    <StepCard
                        title={t("card.collateral.title")}
                        step={2}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        <Collaterals
                            t={t}
                            state={collateralsStepState}
                            onStateChange={setCollateralsStepState}
                            onNext={handleCollateralsNext}
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
                                loading={loading}
                                templates={oracleTemplates}
                                oracleTemplatesData={oracleTemplatesData}
                                onNext={handleOraclesPickerNext}
                            />
                        </StepCard>
                    )}
                    <StepCard
                        title={t("card.oracle.configuration.title")}
                        step={enableOraclePickStep ? 4 : 3}
                        className={{ root: "relative pb-10", content: "px-0" }}
                        messages={{ step: t("step") }}
                    >
                        {!connectedAddress ? (
                            <ConnectWallet t={t} />
                        ) : (
                            <OraclesConfiguration
                                t={t}
                                i18n={i18n}
                                specificationData={specificationData}
                                templates={oracleTemplatesData}
                                state={oraclesConfigurationStepState}
                                onStateChange={setOraclesConfigurationStepState}
                                onNext={handleOraclesConfigurationNext}
                                navigate={navigate}
                                onTx={onTx}
                            />
                        )}
                    </StepCard>
                    {!!specificationData && !!tokenData && (
                        <StepCard
                            title={t("card.deploy.title")}
                            step={enableOraclePickStep ? 5 : 4}
                            className={{ root: "relative" }}
                            messages={{ step: t("step") }}
                        >
                            {!connectedAddress ? (
                                <ConnectWallet t={t} />
                            ) : (
                                <Deploy
                                    t={t}
                                    templateId={template.id}
                                    specificationCID={specificationCID}
                                    expiration={specificationData.expiration}
                                    tokenData={tokenData}
                                    collateralsData={collateralsData}
                                    oracleTemplatesData={oracleTemplatesData}
                                    oraclesData={oraclesData}
                                    onNext={handleDeployNext}
                                    onCreate={onCreate}
                                    onTx={onTx}
                                />
                            )}
                        </StepCard>
                    )}
                    <StepCard
                        title={t("card.success.title")}
                        step={enableOraclePickStep ? 6 : 5}
                        messages={{ step: t("step") }}
                    >
                        <Success
                            t={t}
                            navigate={navigate}
                            kpiTokenAddress={createdKPITokenAddress}
                        />
                    </StepCard>
                </MultiStepCards>
            </div>
        </div>
    );
};
