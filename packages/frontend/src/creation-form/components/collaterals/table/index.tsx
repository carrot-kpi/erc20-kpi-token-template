import type { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Typography } from "@carrot-kpi/ui";
import { cva } from "class-variance-authority";
import type { CollateralData } from "../../../types";
import { CollateralRow } from "./row";

const containerStyles = cva(
    ["flex", "max-h-48", "flex-col", "gap-1", "overflow-y-auto"],
    {
        variants: {
            noBorder: {
                false: [
                    "rounded-xxl",
                    "border",
                    "border-black",
                    "px-4",
                    "py-2",
                ],
            },
        },
    }
);

interface CollateralsTableProps {
    t: NamespacedTranslateFunction;
    onRemove?: (index: number) => void;
    collaterals: CollateralData[];
    noEdit?: boolean;
    noBorder?: boolean;
}

export const CollateralsTable = ({
    t,
    noEdit,
    noBorder = false,
    onRemove,
    collaterals,
}: CollateralsTableProps) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-collaterals">
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
            <div className={containerStyles({ noBorder })}>
                {collaterals.length === 0 ? (
                    <Typography
                        variant="sm"
                        className={{
                            root: "h-10 flex justify-center items-center",
                        }}
                        weight="medium"
                    >
                        {t("label.collateral.table.empty")}
                    </Typography>
                ) : (
                    collaterals.map((collateral, index) => {
                        return (
                            <CollateralRow
                                t={t}
                                noEdit={noEdit}
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
