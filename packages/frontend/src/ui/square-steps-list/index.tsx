import { Typography } from "@carrot-kpi/ui";
import { cva } from "class-variance-authority";
import { ReactElement, useCallback } from "react";

const rootStyles = cva(["flex"], {
    variants: {
        layout: {
            vertical: ["flex-col", "gap-8"],
            horizontal: ["relative", "flex-row", "gap-2"],
        },
    },
});

const stepStyles = cva(["flex", "items-center", "gap-4"], {
    variants: {
        layout: {
            vertical: [],
            horizontal: ["flex-col", "w-12"],
        },
        clickable: {
            true: ["hover:underline cursor-pointer"],
        },
    },
});

const squareStyles = cva(["relative", "h-3", "w-3"], {
    variants: {
        active: {
            true: ["bg-orange", "z-10"],
            false: ["bg-black"],
        },
    },
});

const lineStyles = cva(["absolute"], {
    variants: {
        layout: {
            vertical: ["left-1/2", "h-14", "w-[1px]", "-translate-x-[0.5px]"],
            horizontal: [
                "absolute",
                "top-1/2",
                "h-[1px]",
                "w-14",
                "-translate-y-[0.5px]",
            ],
        },
        active: {
            true: ["bg-orange"],
            false: ["bg-black"],
        },
    },
});

type SquareStepsLayout = "vertical" | "horizontal";

interface SquareStepsListProps {
    stepTitles: string[];
    activeStep: number;
    mostUpdatedStep: number;
    layout?: SquareStepsLayout;
    className?: {
        root?: string;
        step?: string;
        square?: string;
        line?: string;
    };
    onClick: (index: number) => void;
}

export const SquareStepsList = ({
    stepTitles,
    activeStep,
    mostUpdatedStep,
    layout = "vertical",
    className,
    onClick,
}: SquareStepsListProps): ReactElement => {
    const handleStepClick = useCallback(
        (clickedStep: number) => () => {
            onClick(clickedStep);
        },
        [onClick]
    );

    return (
        <div className={rootStyles({ layout, className: className?.root })}>
            {stepTitles.map((title, index) => {
                const currentStep = index === activeStep;
                const active = index <= mostUpdatedStep;
                const handleOnClick =
                    index <= mostUpdatedStep
                        ? handleStepClick(index)
                        : undefined;

                return (
                    <div
                        key={index}
                        className={stepStyles({
                            layout,
                            clickable: !!onClick,
                            className: className?.step,
                        })}
                        onClick={handleOnClick}
                    >
                        <div
                            className={squareStyles({
                                active,
                                className: className?.square,
                            })}
                        >
                            {index < stepTitles.length - 1 && (
                                <div
                                    className={lineStyles({
                                        layout,
                                        active,
                                        className: className?.line,
                                    })}
                                />
                            )}
                        </div>
                        {layout === "vertical" ? (
                            <Typography
                                weight={currentStep ? "medium" : undefined}
                            >
                                {title}
                            </Typography>
                        ) : activeStep === index ? (
                            <Typography
                                weight={currentStep ? "medium" : undefined}
                                className={{
                                    root: "absolute top-6 max-w-[176px] line-clamp-1",
                                }}
                            >
                                {title}
                            </Typography>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
