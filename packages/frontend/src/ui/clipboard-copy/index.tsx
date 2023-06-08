import { type ReactElement, useEffect, useState } from "react";
import { ReactComponent as Copy } from "../../assets/copy.svg";
import { ReactComponent as CircleOk } from "../../assets/circle-ok.svg";
import { useCopyToClipboard } from "../../utils/clipboard";

interface ClipboardCopyProps {
    text: string;
}

export const ClipboardCopy = ({ text }: ClipboardCopyProps): ReactElement => {
    const [copied, setCopied] = useState<boolean>(false);
    const [, copy] = useCopyToClipboard();

    useEffect(() => {
        if (!copied) return;

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    const handleCopyTextToClipboard = async () => {
        await copy(text);
        setCopied(true);
    };

    return copied ? (
        <CircleOk
            className="stroke-black dark:stroke-white hover:cursor-pointer h-6 w-6"
            viewBox="0 0 24 24"
        />
    ) : (
        <Copy
            className="stroke-black dark:stroke-white hover:cursor-pointer h-6 w-6"
            viewBox="0 0 24 24"
            onClick={handleCopyTextToClipboard}
        />
    );
};
