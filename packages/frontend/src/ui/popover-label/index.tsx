import { Popover, Typography, TypographyProps } from "@carrot-kpi/ui";
import { useCallback, useRef, useState } from "react";

type PopoverTextProps = {
    children: string;
    maxTextLenght?: number;
} & TypographyProps;

export const PopoverText = ({
    children,
    maxTextLenght = 16,
    ...rest
}: PopoverTextProps) => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const handleMouseEnter = useCallback(() => {
        setOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            {children.length > maxTextLenght ? (
                <>
                    <Typography
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        ref={anchorRef}
                        {...rest}
                    >
                        {`${children.substring(0, maxTextLenght)}...`}
                    </Typography>
                    <Popover open={open} anchor={anchorRef.current}>
                        <div className="p-2">
                            <Typography {...rest}>{children}</Typography>
                        </div>
                    </Popover>
                </>
            ) : (
                <Typography {...rest}>{children}</Typography>
            )}
        </>
    );
};
