import { Button, TextMono } from "@carrot-kpi/ui";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ReactElement, useCallback } from "react";

import { CollateralData, CreationData } from "../../types";
import { CollateralPicker } from "../../../ui/collateral-picker";
import { Token } from "@carrot-kpi/sdk";

interface CollateralProps {
    t: NamespacedTranslateFunction;
    collaterals: CollateralData[];
    onFieldChange: (
        field: keyof Pick<CreationData, "collaterals">,
        collateralData: CollateralData
    ) => void;
    onNext: () => void;
}

export const Collateral = ({
    t,
    collaterals,
    onFieldChange,
    onNext,
}: CollateralProps): ReactElement => {
    const handleCollateraDataChange = useCallback(
        (collateralData: CollateralData): void => {
            onFieldChange("collaterals", collateralData);
        },
        [onFieldChange]
    );

    // TODO: where should we get this data?
    const colleteralTokens = [
        new Token(
            CCT_CHAIN_ID,
            CCT_ERC20_1_ADDRESS,
            18,
            "TST_1",
            "Collateral test token 1"
        ),
        new Token(
            CCT_CHAIN_ID,
            CCT_ERC20_2_ADDRESS,
            18,
            "TST_2",
            "Collateral test token 2"
        ),
    ];

    return (
        <div className="flex flex-col gap-6">
            <CollateralPicker
                t={t}
                onConfirm={handleCollateraDataChange}
                tokens={colleteralTokens}
            />

            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3">
                    <TextMono className="font-medium" size="sm">
                        {t("label.collateral.table.collateral")}
                    </TextMono>
                    <TextMono className="text-center font-medium" size="sm">
                        {t("label.collateral.table.amount")}
                    </TextMono>
                    <TextMono className="text-right font-medium" size="sm">
                        {t("label.collateral.table.minimum.payout")}
                    </TextMono>
                </div>
                <div className="scrollbar max-h-48 overflow-y-auto rounded-xxl border border-black p-4">
                    {collaterals.map((collateral) => (
                        <div
                            key={collateral.address}
                            className="grid grid-cols-3"
                        >
                            <div>{}</div>
                            <TextMono className="text-center" size="md">
                                {collateral.amount.toNumber()}
                            </TextMono>
                            <TextMono className="text-right" size="md">
                                {collateral.minimumPayout.toNumber()}
                            </TextMono>
                        </div>
                    ))}
                </div>
            </div>

            <Button size="small" onClick={onNext}>
                {t("next")}
            </Button>
        </div>
    );
};
