import "../global.css";

import { TextMono } from "@carrot-kpi/ui";
import {
    NamespacedTranslateFunction,
    useDecentralizedStorageUploader,
} from "@carrot-kpi/react";
import { ChainId } from "@carrot-kpi/sdk";
import { BigNumber, constants, utils } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { ReactElement, useCallback, useMemo, useState } from "react";
import { OracleConfiguration } from "./components/oracle-configuration";
import { OraclesPicker } from "./components/oracles-picker";
import { OnchainPreparations } from "./components/onchain-preparations";
import {
    CollateralData,
    CreationData,
    ERC20Data,
    OracleData,
    SpecificationData,
} from "./types";
import CREATION_PROXY_ABI from "../abis/creation-proxy.json";
import { Address, useNetwork } from "wagmi";
import { Card } from "../ui/card";
import { CampaignDescription } from "./components/campaign-description";
import { Collateral } from "./components/collateral";
import { ERC20 } from "./components/erc-20";
import { NextStepPreview } from "./components/next-step-preview";
import { cva } from "class-variance-authority";
import { i18n } from "i18next";
import square from "../assets/square.svg";
import { BoundsConfiguration } from "./components/bounds-configuration";

const CREATION_PROXY_INTERFACE = new utils.Interface(CREATION_PROXY_ABI);

const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
    [ChainId.GOERLI]: constants.AddressZero,
    [ChainId.SEPOLIA]: "0x4300d4C410f87c7c1824Cbc2eF67431030106604",
};

const stepsListSquareStyles = cva(["relative", "h-3", "w-3"], {
    variants: {
        active: {
            true: ["bg-orange", "z-10"],
            false: ["bg-black"],
        },
    },
});

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
    const uploadToDecentralizeStorage = useDecentralizedStorageUploader(
        __DEV__ ? "playground" : "ipfs"
    );
    const creationProxyAddress = useMemo(() => {
        if (__DEV__) return CCT_CREATION_PROXY_ADDRESS;
        return chain && chain.id in ChainId
            ? CREATION_PROXY_ADDRESS[chain.id as ChainId]
            : constants.AddressZero;
    }, [chain]);

    const [data, setData] = useState<CreationData>({
        step: 0,
        specification: {
            title: "",
            description: "",
            tags: [],
        },
        erc20: {
            name: "",
            symbol: "",
            supply: BigNumber.from("0"),
        },
        collaterals: [],
        oracles: [],
    });
    const [specificationCid, setSpecificationCid] = useState("");

    const handleNext = useCallback(() => {
        setData((prevState) => ({ ...prevState, step: prevState.step + 1 }));
    }, []);

    const handleCampaignSpecificationChange = useCallback(
        (field: keyof SpecificationData, value: string) => {
            setData((prevState) => ({
                ...prevState,
                specification: {
                    ...prevState.specification,
                    [field]: value,
                },
            }));
        },
        []
    );

    const handleCollateralDataChange = useCallback(
        (
            field: keyof Pick<CreationData, "collaterals">,
            collateralData: CollateralData
        ) => {
            setData((prevState) => {
                const nextCollateralData = [...prevState.collaterals];
                const collateralToUpdate = nextCollateralData.find(
                    (nextCollateral) =>
                        collateralData.address.toLowerCase() ===
                        nextCollateral.address.toLowerCase()
                );

                if (!collateralToUpdate) {
                    return {
                        ...prevState,
                        [field]: [...prevState.collaterals, collateralData],
                    };
                }

                collateralToUpdate.amount = collateralData.amount;
                collateralToUpdate.minimumPayout = collateralData.minimumPayout;

                return { ...prevState, [field]: nextCollateralData };
            });
        },
        []
    );

    const handleERC20DataChange = useCallback(
        (field: keyof ERC20Data, value: string) => {
            setData((prevState) => ({
                ...prevState,
                erc20: {
                    ...prevState.erc20,
                    [field]: value,
                },
            }));
        },
        []
    );

    const handleOracleChange = useCallback(
        (
            field: keyof Pick<CreationData, "oracles">,
            oraclesData: OracleData[]
        ) => {
            setData((prevState) => ({
                ...prevState,
                [field]: oraclesData,
            }));
        },
        []
    );

    const handleOraclePick = useCallback((oracleTemplateId: number) => {
        setData((prevState) => {
            const nextOracleTemplates = [...prevState.oracles];

            const pickedOracle = nextOracleTemplates.find(
                (oracle) => oracle.template.id === oracleTemplateId
            );

            if (!pickedOracle) {
                return prevState;
            }

            pickedOracle.isPicked = !pickedOracle.isPicked;

            return { ...prevState, oracles: nextOracleTemplates };
        });
    }, []);

    const handleOracleConfigurationChange = useCallback(
        (
            field: keyof Pick<OracleData, "higherBound" | "lowerBound">,
            value: BigNumber,
            oracleTemplateId: number
        ) => {
            setData((prevState) => {
                const nextOracleTemplatesConfiguration = [...prevState.oracles];

                const configuredOracleTemplate =
                    nextOracleTemplatesConfiguration.find(
                        (oracle) => oracle.template.id === oracleTemplateId
                    );

                if (!configuredOracleTemplate) {
                    return prevState;
                }

                configuredOracleTemplate[field] = value;

                return {
                    ...prevState,
                    oracles: nextOracleTemplatesConfiguration,
                };
            });
        },
        []
    );

    const handleOracleConfigurationSubmit = useCallback(() => {
        uploadToDecentralizeStorage(JSON.stringify(data.specification))
            .then(setSpecificationCid)
            .catch(console.error);
    }, [data.specification, uploadToDecentralizeStorage]);

    const handleCreate = useCallback(() => {
        onDone(
            creationProxyAddress,
            CREATION_PROXY_INTERFACE.encodeFunctionData("createERC20KPIToken", [
                specificationCid,
                BigNumber.from(Math.floor(Date.now() + 86_400_000)),
                data.collaterals.map((rawCollateral) => ({
                    token: rawCollateral.address,
                    amount: BigNumber.from(rawCollateral.amount),
                    minimumPayout: BigNumber.from(rawCollateral.minimumPayout),
                })),
                data.erc20.name,
                data.erc20.symbol,
                data.erc20.supply,
                defaultAbiCoder.encode(
                    [
                        "tuple(uint256 templateId,uint256 lowerBound,uint256 higherBound,uint256 weight,uint256 value,bytes data)[]",
                        "bool",
                    ],
                    [
                        data.oracles.map((oracle) => {
                            return {
                                templateId: oracle.template.id,
                                lowerBound: oracle.lowerBound,
                                higherBound: oracle.higherBound,
                                weight: oracle.weight,
                                value: oracle.value,
                                data: oracle.initializationData,
                            };
                        }),
                        false,
                    ]
                ) as `0x${string}`,
            ]),
            BigNumber.from("0")
        );
    }, [
        creationProxyAddress,
        data.collaterals,
        data.erc20.name,
        data.erc20.supply,
        data.erc20.symbol,
        data.oracles,
        onDone,
        specificationCid,
    ]);

    const steps = [
        {
            title: t("card.campaing.title"),
            content: (
                <CampaignDescription
                    t={t}
                    specification={data.specification}
                    onFieldChange={handleCampaignSpecificationChange}
                    onNext={handleNext}
                />
            ),
        },
        {
            title: t("card.collateral.title"),
            content: (
                <Collateral
                    t={t}
                    collaterals={data.collaterals}
                    onFieldChange={handleCollateralDataChange}
                    onNext={handleNext}
                />
            ),
        },
        {
            title: t("card.token.title"),
            content: (
                <ERC20
                    t={t}
                    erc20={data.erc20}
                    onFieldChange={handleERC20DataChange}
                    onNext={handleNext}
                />
            ),
        },
        {
            title: t("card.oracle.title"),
            content: (
                <OraclesPicker
                    t={t}
                    oracles={data.oracles}
                    handlePick={handleOraclePick}
                    onFieldChange={handleOracleChange}
                    onNext={handleNext}
                />
            ),
        },
        {
            title: t("card.oracle.configuration.title"),
            content: (
                <OracleConfiguration
                    t={t}
                    i18n={i18n}
                    oracles={data.oracles}
                    onOracleConfiguration={handleOracleConfigurationSubmit}
                    onNext={handleNext}
                />
            ),
        },
        {
            title: t("card.oracle.bound.title"),
            content: (
                <BoundsConfiguration
                    t={t}
                    oracles={data.oracles}
                    onFieldChange={handleOracleConfigurationChange}
                    onNext={handleNext}
                />
            ),
        },
        {
            title: t("card.deploy.title"),
            content: (
                <OnchainPreparations
                    collaterals={data.collaterals}
                    creationProxyAddress={creationProxyAddress}
                    onCreate={handleCreate}
                />
            ),
        },
    ];

    return (
        <div className="bg-green flex h-full flex-col items-center justify-between gap-24 overflow-y-hidden pt-10">
            <div className="fixed top-1/2 left-1/2 h-[65%] w-[90%] -translate-x-1/2 -translate-y-1/2 transform md:w-[50%]">
                <div
                    style={{ background: `url(${square}) center` }}
                    className="bg-square h-full w-full text-black dark:text-white"
                />
            </div>
            <div className="square-list absolute left-20 top-1/3 z-10 hidden flex-col gap-8 lg:flex">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div
                            className={stepsListSquareStyles({
                                active: index === data.step,
                            })}
                        >
                            {index > 0 && (
                                <div className="absolute left-1.5 bottom-3 h-12 w-[1px] -translate-x-[0.5px] transform bg-black" />
                            )}
                        </div>
                        <TextMono>{step.title}</TextMono>
                    </div>
                ))}
            </div>
            <div className="z-10 w-full max-w-xl">
                <Card
                    step={t("card.step.label", { number: data.step + 1 })}
                    title={steps[data.step].title}
                >
                    {steps[data.step].content}
                </Card>
            </div>
            <div className="z-10 min-h-fit w-full max-w-xl">
                {!!steps[data.step + 1] && (
                    <NextStepPreview
                        step={t("card.step.label", { number: data.step + 2 })}
                        title={steps[data.step + 1].title}
                    />
                )}
                {!!steps[data.step + 2] && (
                    <NextStepPreview
                        step={t("card.step.label", { number: data.step + 3 })}
                        title={steps[data.step + 2].title}
                    />
                )}
            </div>
        </div>
    );
};
