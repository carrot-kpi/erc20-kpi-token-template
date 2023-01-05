import { TextMono } from "@carrot-kpi/ui";
import { ReactElement } from "react";
import { shortenAddress } from "../../utils/address";

interface OracleTemplateProps {
    name: string;
    description: string;
    address: string;
    version: number;
}

// TODO: move to the monorepo UI package
export const OracleTemplate = ({
    name,
    description,
    version,
    address,
}: OracleTemplateProps): ReactElement => {
    return (
        <div className="p-1 relative">
            <div className="w-2 h-2 bg-black absolute left-[1px] top-[1px]" />
            <div className="w-2 h-2 bg-black absolute right-[1px] top-[1px]" />
            <div className="w-2 h-2 bg-black absolute right-[1px] bottom-[1px]" />
            <div className="w-2 h-2 bg-black absolute left-[1px] bottom-[1px]" />

            <div className="w-[225px] flex flex-col border border-black border-solid">
                <div className="p-2.5 border-b border-black border-solid">
                    <TextMono caps={true} size="md">
                        {name}
                    </TextMono>
                </div>
                <div className="p-2.5 border-b border-black border-solid">
                    <TextMono size="md">{description}</TextMono>
                </div>
                <div className="flex justify-between p-2.5 border-b border-black border-solid">
                    <TextMono size="md" caps={true}>
                        VERSION
                    </TextMono>
                    <TextMono size="md">{version.toString()}</TextMono>
                </div>
                <div className="flex justify-between p-2.5">
                    <TextMono size="md" caps={true}>
                        ADDRESS
                    </TextMono>
                    <TextMono size="md">{shortenAddress(address)}</TextMono>
                </div>
            </div>
        </div>
    );
};
