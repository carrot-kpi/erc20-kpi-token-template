import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Typography } from "@carrot-kpi/ui";
import { ReactElement } from "react";
import { shortenAddress } from "../../utils/address";

interface OracleTemplateProps {
    t: NamespacedTranslateFunction;
    template: Template;
}

export const OracleTemplate = ({
    t,
    template,
}: OracleTemplateProps): ReactElement => {
    return (
        <div className="relative p-1">
            <div className="absolute left-[1px] top-[1px] h-2 w-2 bg-black" />
            <div className="absolute right-[1px] top-[1px] h-2 w-2 bg-black" />
            <div className="absolute right-[1px] bottom-[1px] h-2 w-2 bg-black" />
            <div className="absolute left-[1px] bottom-[1px] h-2 w-2 bg-black" />

            <div className="flex w-60 flex-col border border-solid border-black">
                <div className="border-b border-black p-2.5">
                    <Typography uppercase>
                        {template.specification.name}
                    </Typography>
                </div>
                <div className="border-b border-black p-2.5">
                    <Typography>
                        {template.specification.description}
                    </Typography>
                </div>
                <div className="flex justify-between border-b border-black p-2.5">
                    <Typography uppercase>{t("oracle.version")}</Typography>
                    <Typography>{template.version.toString()}</Typography>
                </div>
                <div className="flex justify-between p-2.5">
                    <Typography uppercase>{t("oracle.address")}</Typography>
                    <Typography>{shortenAddress(template.address)}</Typography>
                </div>
            </div>
        </div>
    );
};
