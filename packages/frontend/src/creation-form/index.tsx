import "../global.css";

import { TextMono } from "@carrot-kpi/ui";
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
import { Card } from "../ui/card";
import { Specification } from "./components/specification";
import { Collaterals } from "./components/collaterals";
import { NextStepPreview } from "./components/next-step-preview";
import { cva } from "class-variance-authority";
import { i18n } from "i18next";
import square from "../assets/square.svg";
import { TokenData } from "./components/token-data";
import { OraclesConfiguration } from "./components/oracles-configuration";
import { OutcomesConfiguration } from "./components/outcomes-configuration";
import { Deploy } from "./components/deploy";

const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
    [ChainId.GOERLI]: constants.AddressZero,
    [ChainId.SEPOLIA]: "0x4300d4C410f87c7c1824Cbc2eF67431030106604",
};

const stepsListItemContainerStyles = cva(["flex", "items-center", "gap-4"], {
    variants: {
        clickable: {
            true: ["hover:underline cursor-pointer"],
        },
    },
});

const stepsListSquareStyles = cva(["relative", "h-3", "w-3"], {
    variants: {
        active: {
            true: ["bg-orange", "z-10"],
            false: ["bg-black"],
        },
    },
});

const stepsListLineStyles = cva(
    [
        "absolute",
        "left-1.5",
        "bottom-3",
        "h-12",
        "w-[1px]",
        "-translate-x-[0.5px]",
        "transform",
    ],
    {
        variants: {
            active: {
                true: ["bg-orange"],
                false: ["bg-black"],
            },
        },
    }
);

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
            t("card.specification.title"),
            t("card.collateral.title"),
            t("card.token.title"),
            t("card.oracle.pick.title"),
            t("card.oracle.configuration.title"),
            t("card.outcome.configuration.title"),
            t("card.deploy.title"),
        ],
        [t]
    );

    const [step, setStep] = useState(0);
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

    const handleStepClick = useCallback(
        (clickedStep: number) => () => {
            console.log(clickedStep);
            setStep(clickedStep);
        },
        []
    );

    const handlePrevious = useCallback(() => {
        if (step === 0) return;
        setStep(step - 1);
    }, [step]);

    const handleSpecificationNext = useCallback(
        (specificationData: SpecificationData) => {
            setSpecificationData(specificationData);
            setStep(1);
        },
        []
    );

    const handleCollateralsNext = useCallback(
        (collaterals: CollateralData[]) => {
            setCollateralsData(collaterals);
            setStep(2);
        },
        []
    );

    const handleTokenDataNext = useCallback((tokenData: TokenDataType) => {
        setTokenData(tokenData);
        setStep(3);
    }, []);

    const handleOraclesPickerNext = useCallback((templates: Template[]) => {
        setOracleTemplatesData(templates);
        setStep(4);
    }, []);

    const handleOraclesConfigurationNext = useCallback(
        (oracleData: OracleData[]) => {
            setOraclesData(oracleData);
            setStep(5);
        },
        []
    );

    const handleOutcomesConfigurationNext = useCallback(
        (outcomesData: OutcomeData[]) => {
            setOutcomesData(outcomesData);
            setStep(6);
        },
        []
    );

    const handleDeployNext = useCallback(
        (data: string, value: BigNumber) => {
            onDone(creationProxyAddress, data, value);
            console.log("done");
        },
        [creationProxyAddress, onDone]
    );

    return (
        <div className="bg-green flex h-full flex-col items-center justify-between gap-24 overflow-y-hidden pt-10">
            <div className="fixed top-1/2 left-1/2 h-[65%] w-[90%] -translate-x-1/2 -translate-y-1/2 transform md:w-[50%]">
                <div
                    style={{ background: `url(${square}) center` }}
                    className="bg-square h-full w-full text-black dark:text-white"
                />
            </div>
            <div className="square-list absolute left-20 top-1/3 z-10 hidden flex-col gap-8 lg:flex">
                {stepTitles.map((title, index) => {
                    const currentStep = index === step;
                    const active = index <= step;
                    const onClick =
                        index < step ? handleStepClick(index) : undefined;
                    return (
                        <div
                            key={index}
                            className={stepsListItemContainerStyles({
                                clickable: index < step,
                            })}
                            onClick={onClick}
                        >
                            <div className={stepsListSquareStyles({ active })}>
                                {index > 0 && (
                                    <div
                                        className={stepsListLineStyles({
                                            active,
                                        })}
                                    />
                                )}
                            </div>
                            <TextMono
                                weight={currentStep ? "medium" : undefined}
                            >
                                {title}
                            </TextMono>
                        </div>
                    );
                })}
            </div>
            <div className="z-10 w-full max-w-xl">
                <Card
                    step={t("card.step.label", { number: step + 1 })}
                    title={stepTitles[step]}
                >
                    {step === 0 && (
                        <Specification
                            t={t}
                            specificationData={specificationData}
                            onNext={handleSpecificationNext}
                        />
                    )}
                    {step === 1 && (
                        <Collaterals
                            t={t}
                            collaterals={collateralsData}
                            onPrevious={handlePrevious}
                            onNext={handleCollateralsNext}
                        />
                    )}
                    {step === 2 && (
                        <TokenData
                            t={t}
                            tokenData={tokenData}
                            onPrevious={handlePrevious}
                            onNext={handleTokenDataNext}
                        />
                    )}
                    {step === 3 && (
                        <OraclesPicker
                            t={t}
                            oracleTemplatesData={oracleTemplatesData}
                            onPrevious={handlePrevious}
                            onNext={handleOraclesPickerNext}
                        />
                    )}
                    {step === 4 && (
                        <OraclesConfiguration
                            t={t}
                            i18n={i18n}
                            oraclesData={oraclesData}
                            templates={oracleTemplatesData}
                            onPrevious={handlePrevious}
                            onNext={handleOraclesConfigurationNext}
                        />
                    )}
                    {step === 5 && (
                        <OutcomesConfiguration
                            t={t}
                            outcomesData={outcomesData}
                            templates={oracleTemplatesData}
                            onPrevious={handlePrevious}
                            onNext={handleOutcomesConfigurationNext}
                        />
                    )}
                    {step === 6 && !!specificationData && !!tokenData && (
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
                    )}
                </Card>
            </div>
            <div className="z-10 min-h-fit w-full max-w-xl">
                {!!stepTitles[step + 1] && (
                    <NextStepPreview
                        step={t("card.step.label", { number: step + 2 })}
                        title={stepTitles[step + 1]}
                    />
                )}
                {!!stepTitles[step + 2] && (
                    <NextStepPreview
                        step={t("card.step.label", { number: step + 3 })}
                        title={stepTitles[step + 2]}
                    />
                )}
            </div>
        </div>
    );
};
