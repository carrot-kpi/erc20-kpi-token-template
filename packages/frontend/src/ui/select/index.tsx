import { TextMono } from "@carrot-kpi/ui";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

import ArrowDownIcon from "../assets/arrow-down.svg";

interface Options {
    value: string;
    label: string;
    icon?: string;
}

interface SelectProps {
    value: string;
    options: Options[];
    onChange: (option: string) => void;
}

export const Select = ({
    value,
    options,
    onChange,
}: SelectProps): ReactElement => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);

    const handleOnClick = () => {
        setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen);
    };

    const handleOptionClick = (option: string) => {
        setIsDropdownOpen(false);
        onChange(option);
    };

    const active = useMemo(
        () => options.find((option) => option.value === value),
        [options, value]
    );

    return (
        <div
            ref={containerRef}
            className="bg-carrot-green relative rounded-2xl p-3 font-mono text-xl font-normal outline-none"
        >
            <div className="flex justify-between">
                <div onClick={handleOnClick}>
                    {active ? (
                        <div>
                            {active.icon ? <img src="" /> : null}
                            <TextMono size="2xl">{active?.label}</TextMono>
                        </div>
                    ) : null}
                </div>
                <img src={ArrowDownIcon} />
            </div>
            {isDropdownOpen ? (
                <div
                    ref={dropdownRef}
                    className="bg-carrot-green absolute left-0 mt-4 w-full rounded-2xl"
                >
                    {options
                        .filter((option) => option.value !== value)
                        .map((option) => (
                            <div
                                key={option.value}
                                className="p-3"
                                onClick={() => handleOptionClick(option.value)}
                            >
                                {option.icon ? <img src="" /> : null}
                                <TextMono size="2xl">{option.label}</TextMono>
                            </div>
                        ))}
                </div>
            ) : null}
        </div>
    );
};
