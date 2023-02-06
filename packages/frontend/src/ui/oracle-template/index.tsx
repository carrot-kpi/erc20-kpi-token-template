import { Typography } from "@carrot-kpi/ui";
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
        <div className="relative p-1">
            <div className="absolute left-[1px] top-[1px] h-2 w-2 bg-black" />
            <div className="absolute right-[1px] top-[1px] h-2 w-2 bg-black" />
            <div className="absolute right-[1px] bottom-[1px] h-2 w-2 bg-black" />
            <div className="absolute left-[1px] bottom-[1px] h-2 w-2 bg-black" />

            <div className="flex w-[225px] flex-col border border-solid border-black">
                <div className="border-b border-solid border-black p-2.5">
                    <Typography uppercase>{name}</Typography>
                </div>
                <div className="border-b border-solid border-black p-2.5">
                    <Typography>{description}</Typography>
                </div>
                <div className="flex justify-between border-b border-solid border-black p-2.5">
                    <Typography uppercase>VERSION</Typography>
                    <Typography>{version.toString()}</Typography>
                </div>
                <div className="flex justify-between p-2.5">
                    <Typography uppercase>ADDRESS</Typography>
                    <Typography>{shortenAddress(address)}</Typography>
                </div>
            </div>
        </div>
    );
};
