import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ReactComponent as ChevronLeft } from "../../../assets/chevron-left.svg";
import { Button } from "@carrot-kpi/ui";

interface PreviousButtonProps {
    t: NamespacedTranslateFunction;
    onClick: () => void;
    disabled?: boolean;
}

export const PreviousButton = ({
    t,
    onClick,
    disabled,
}: PreviousButtonProps) => {
    return (
        <Button
            variant="secondary"
            size="small"
            onClick={onClick}
            disabled={disabled}
            icon={ChevronLeft}
        >
            {t("previous")}
        </Button>
    );
};
