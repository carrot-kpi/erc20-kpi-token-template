import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ReactComponent as ChevronRight } from "../../../assets/chevron-right.svg";
import { Button } from "@carrot-kpi/ui";

interface NextButtonProps {
    t: NamespacedTranslateFunction;
    onClick: () => void;
    disabled?: boolean;
}

export const NextButton = ({ t, onClick, disabled }: NextButtonProps) => {
    return (
        <Button
            size="small"
            onClick={onClick}
            disabled={disabled}
            icon={ChevronRight}
            iconPlacement="right"
        >
            {t("next")}
        </Button>
    );
};
