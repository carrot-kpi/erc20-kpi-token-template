import "../global.css";

import { MultiStepCards, StepCard } from "@carrot-kpi/ui";
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
import { SquareStepsList } from "../ui/square-steps-list";

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

    const handlePrevious = useCallback(() => {
        if (step === 0) return;
        setStep(step - 1);
    }, [step]);

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
        <div className="relative bg-grid-dark dark:bg-grid-light scrollbar bg-green overflow-y-auto px-2">
            <div className="flex flex-col items-center justify-between pt-10">
                <div className="absolute left-20 top-40 hidden lg:flex">
                    <SquareStepsList
                        layout="vertical"
                        stepTitles={stepTitles}
                        activeStep={step}
                        mostUpdatedStep={mostUpdatedStep}
                        onClick={handleStepClick}
                    />
                </div>
                <div className="flex lg:hidden mb-16">
                    <SquareStepsList
                        layout="horizontal"
                        stepTitles={stepTitles}
                        activeStep={step}
                        mostUpdatedStep={mostUpdatedStep}
                        onClick={handleStepClick}
                    />
                </div>
                <MultiStepCards activeStep={step}>
                    <StepCard title={t("card.general.title")} step={1}>
                        <GenericData
                            t={t}
                            specificationData={specificationData}
                            tokenData={tokenData}
                            onNext={handleGenericDataNext}
                        />
                    </StepCard>
                    <StepCard title={t("card.collateral.title")} step={2}>
                        <Collaterals
                            t={t}
                            collaterals={collateralsData}
                            onPrevious={handlePrevious}
                            onNext={handleCollateralsNext}
                        />
                    </StepCard>
                    <StepCard title={t("card.oracle.pick.title")} step={3}>
                        <OraclesPicker
                            t={t}
                            oracleTemplatesData={oracleTemplatesData}
                            onPrevious={handlePrevious}
                            onNext={handleOraclesPickerNext}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.oracle.configuration.title")}
                        step={4}
                    >
                        <OraclesConfiguration
                            t={t}
                            i18n={i18n}
                            oraclesData={oraclesData}
                            templates={oracleTemplatesData}
                            onPrevious={handlePrevious}
                            onNext={handleOraclesConfigurationNext}
                        />
                    </StepCard>
                    <StepCard
                        title={t("card.outcome.configuration.title")}
                        step={5}
                    >
                        <OutcomesConfiguration
                            t={t}
                            outcomesData={outcomesData}
                            templates={oracleTemplatesData}
                            onPrevious={handlePrevious}
                            onNext={handleOutcomesConfigurationNext}
                        />
                    </StepCard>
                    {!!specificationData && !!tokenData && (
                        <StepCard title={t("card.deploy.title")} step={6}>
                            <Deploy
                                t={t}
                                targetAddress={creationProxyAddress}
                                specificationData={specificationData}
                                tokenData={tokenData}
                                collateralsData={collateralsData}
                                oracleTemplatesData={oracleTemplatesData}
                                outcomesData={outcomesData}
                                oraclesData={oraclesData}
                                onPrevious={handlePrevious}
                                onNext={handleDeployNext}
                            />
                        </StepCard>
                    )}
                </MultiStepCards>
            </div>
        </div>
    );
};
