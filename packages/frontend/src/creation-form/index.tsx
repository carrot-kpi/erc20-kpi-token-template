import "../global.css";

import { MultiStepCards, StepCard, Stepper } from "@carrot-kpi/ui";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ChainId, Template } from "@carrot-kpi/sdk";
import { BigNumber, constants } from "ethers";
import { ReactElement, useCallback, useMemo, useState } from "react";
import { OraclesPicker } from "./components/oracles-picker";
import {
    CollateralData,
    OracleData,
    OutcomeData,
    SpecificationData,
    TokenData as TokenDataType,
} from "./types";
import { Address, useNetwork } from "wagmi";
import { GenericData } from "./components/generic-data";
import { Collaterals } from "./components/collaterals";
import { i18n } from "i18next";
import { OraclesConfiguration } from "./components/oracles-configuration";
import { OutcomesConfiguration } from "./components/outcomes-configuration";
import { Deploy } from "./components/deploy";

const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
    [ChainId.GOERLI]: "0x66ad026c2dAF2A7CbF265f7E1804712bb250F549",
    [ChainId.SEPOLIA]: "0x4300d4C410f87c7c1824Cbc2eF67431030106604",
};

interface CreationFormProps {
    i18n: i18n;
    t: NamespacedTranslateFunction;
    onDone: (to: Address, data: string, value: BigNumber) => void;
}

// TODO: add a check that displays an error message if the creation
// proxy address is 0 for more than x time
export const Component = ({
    i18n,
    t,
    onDone,
}: CreationFormProps): ReactElement => {
    const { chain } = useNetwork();
    const creationProxyAddress = useMemo(() => {
        if (__DEV__) return CCT_CREATION_PROXY_ADDRESS;
        return chain && chain.id in ChainId
            ? CREATION_PROXY_ADDRESS[chain.id as ChainId]
            : constants.AddressZero;
    }, [chain]);
    const stepTitles = useMemo(
        () => [
            t("card.general.title"),
            t("card.collateral.title"),
            t("card.oracle.pick.title"),
            t("card.oracle.configuration.title"),
            t("card.outcome.configuration.title"),
            t("card.deploy.title"),
        ],
        [t]
    );

    const [step, setStep] = useState(0);
    const [mostUpdatedStep, setMostUpdatedStep] = useState(0);
    const [specificationData, setSpecificationData] =
        useState<SpecificationData | null>(null);
    const [collateralsData, setCollateralsData] = useState<CollateralData[]>(
        []
    );
    const [tokenData, setTokenData] = useState<TokenDataType | null>(null);
    const [oracleTemplatesData, setOracleTemplatesData] = useState<Template[]>(
        []
    );
    const [oraclesData, setOraclesData] = useState<OracleData[]>([]);
    const [outcomesData, setOutcomesData] = useState<OutcomeData[]>([]);

    const handleStepClick = useCallback((clickedStep: number) => {
        setStep(clickedStep);
    }, []);

    const handleGenericDataNext = useCallback(
        (specificationData: SpecificationData, tokenData: TokenDataType) => {
            setSpecificationData(specificationData);
            setTokenData(tokenData);
            setStep(1);
            if (mostUpdatedStep < 1) setMostUpdatedStep(1);
        },
        [mostUpdatedStep]
    );

    const handleCollateralsNext = useCallback(
        (collaterals: CollateralData[]) => {
            setCollateralsData(collaterals);
            setStep(2);
            if (mostUpdatedStep < 2) setMostUpdatedStep(2);
        },
        [mostUpdatedStep]
    );

    const handleOraclesPickerNext = useCallback(
        (templates: Template[]) => {
            setOracleTemplatesData(templates);
            setStep(3);
            if (mostUpdatedStep < 3) setMostUpdatedStep(3);
        },
        [mostUpdatedStep]
    );

    const handleOraclesConfigurationNext = useCallback(
        (oracleData: OracleData[]) => {
            setOraclesData(oracleData);
            setStep(4);
            if (mostUpdatedStep < 4) setMostUpdatedStep(4);
        },
        [mostUpdatedStep]
    );

    const handleOutcomesConfigurationNext = useCallback(
        (outcomesData: OutcomeData[]) => {
            setOutcomesData(outcomesData);
            setStep(5);
            if (mostUpdatedStep < 5) setMostUpdatedStep(5);
        },
        [mostUpdatedStep]
    );

    const handleDeployNext = useCallback(
        (data: string, value: BigNumber) => {
            onDone(creationProxyAddress, data, value);
            console.log("done");
        },
        [creationProxyAddress, onDone]
    );

    return (
        <div className="relative h-full w-full bg-green scrollbar overflow-y-auto px-4">
            <div className="h-full flex flex-col items-center justify-between pt-10">
                <div className="flex lg:hidden mb-8">
                    <Stepper
                        layout="horizontal"
                        stepTitles={stepTitles}
                        activeStep={step}
                        lastStepCompleted={mostUpdatedStep}
                        onClick={handleStepClick}
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
                <div className="absolute top-48 md:top-28 bg-grid-light w-[95%] md:w-[65%] h-[75%] md:h-[80%]" />
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
                        <GenericData
                            t={t}
                            specificationData={specificationData}
                            tokenData={tokenData}
                            onNext={handleGenericDataNext}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.collateral.title")}
                        step={2}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        <Collaterals
                            t={t}
                            collaterals={collateralsData}
                            onNext={handleCollateralsNext}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.oracle.pick.title")}
                        step={3}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        <OraclesPicker
                            t={t}
                            oracleTemplatesData={oracleTemplatesData}
                            onNext={handleOraclesPickerNext}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.oracle.configuration.title")}
                        step={4}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        <OraclesConfiguration
                            t={t}
                            i18n={i18n}
                            oraclesData={oraclesData}
                            templates={oracleTemplatesData}
                            onNext={handleOraclesConfigurationNext}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.outcome.configuration.title")}
                        step={5}
                        className={{ root: "relative pb-10" }}
                        messages={{ step: t("step") }}
                    >
                        <OutcomesConfiguration
                            t={t}
                            outcomesData={outcomesData}
                            templates={oracleTemplatesData}
                            onNext={handleOutcomesConfigurationNext}
                        />
                    </StepCard>
                    {!!specificationData && !!tokenData && (
                        <StepCard
                            title={t("card.deploy.title")}
                            step={6}
                            className={{ root: "relative pb-10" }}
                            messages={{ step: t("step") }}
                        >
                            <Deploy
                                t={t}
                                targetAddress={creationProxyAddress}
                                specificationData={specificationData}
                                tokenData={tokenData}
                                collateralsData={collateralsData}
                                oracleTemplatesData={oracleTemplatesData}
                                outcomesData={outcomesData}
                                oraclesData={oraclesData}
                                onNext={handleDeployNext}
                            />
                        </StepCard>
                    )}
                </MultiStepCards>
            </div>
        </div>
    );
};
