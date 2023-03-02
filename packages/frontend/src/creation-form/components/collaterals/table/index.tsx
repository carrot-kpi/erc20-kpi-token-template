import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Typography } from "@carrot-kpi/ui";
import { CollateralData } from "../../../types";
import { CollateralRow } from "./row";

interface CollateralsTableProps {
    t: NamespacedTranslateFunction;
    onRemove: (index: number) => void;
    collaterals: CollateralData[];
}

export const CollateralsTable = ({
    t,
    onRemove,
    collaterals,
}: CollateralsTableProps) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3">
                <Typography weight="medium" variant="sm">
                    {t("label.collateral.table.collateral")}
                </Typography>
                <Typography
                    weight="medium"
                    className={{ root: "text-center" }}
                    variant="sm"
                >
                    {t("label.collateral.table.amount")}
                </Typography>
                <Typography
                    weight="medium"
                    className={{ root: "text-right" }}
                    variant="sm"
                >
                    {t("label.collateral.table.minimum.payout")}
                </Typography>
            </div>
            <div className="rounded-xxl flex max-h-48 flex-col gap-2 overflow-y-auto border border-black p-4">
                {collaterals.length === 0 ? (
                    <Typography
                        variant="sm"
                        className={{ root: "text-center" }}
                        weight="medium"
                    >
                        {t("label.collateral.table.empty")}
                    </Typography>
                ) : (
                    collaterals.map((collateral, index) => {
                        return (
                            <CollateralRow
                                t={t}
                                key={collateral.amount.currency.address}
                                index={index}
                                onRemove={onRemove}
                                {...collateral}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
