import {
    type NamespacedTranslateFunction,
    useResolvedTemplate,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { Skeleton, Typography } from "@carrot-kpi/ui";
import type { ReactElement } from "react";
import { shortenAddress } from "../../utils/address";

interface OracleTemplateProps {
    t: NamespacedTranslateFunction;
    template: Template;
}

export const OracleTemplate = ({
    t,
    template,
}: OracleTemplateProps): ReactElement => {
    const { loading: resolvingTemplate, resolvedTemplate } =
        useResolvedTemplate({ template });

    return (
        <div className="relative p-1">
            <div className="absolute left-[1px] top-[1px] h-2 w-2 bg-black" />
            <div className="absolute right-[1px] top-[1px] h-2 w-2 bg-black" />
            <div className="absolute right-[1px] bottom-[1px] h-2 w-2 bg-black" />
            <div className="absolute left-[1px] bottom-[1px] h-2 w-2 bg-black" />

            <div className="flex w-60 flex-col border border-solid border-black">
                <div className="border-b border-black p-2.5">
                    {resolvingTemplate || !resolvedTemplate ? (
                        <Skeleton width="100px" />
                    ) : (
                        <Typography uppercase>
                            {resolvedTemplate.specification.name}
                        </Typography>
                    )}
                </div>
                <div className="border-b border-black p-2.5">
                    {resolvingTemplate || !resolvedTemplate ? (
                        <div className="flex flex-col">
                            <Skeleton width="100%" />
                            <Skeleton width="100%" />
                            <Skeleton width="100px" />
                        </div>
                    ) : (
                        <Typography>
                            {resolvedTemplate.specification.description}
                        </Typography>
                    )}
                </div>
                <div className="flex justify-between border-b border-black p-2.5">
                    {resolvingTemplate || !resolvedTemplate ? (
                        <>
                            <Skeleton width="60px" />
                            <Skeleton width="60px" />
                        </>
                    ) : (
                        <>
                            <Typography uppercase>
                                {t("oracle.version")}
                            </Typography>
                            <Typography>
                                {resolvedTemplate.version.toString()}
                            </Typography>
                        </>
                    )}
                </div>
                <div className="flex justify-between p-2.5">
                    {resolvingTemplate || !resolvedTemplate ? (
                        <>
                            <Skeleton width="60px" />
                            <Skeleton width="60px" />
                        </>
                    ) : (
                        <>
                            <Typography uppercase>
                                {t("oracle.address")}
                            </Typography>
                            <Typography>
                                {shortenAddress(template.address)}
                            </Typography>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
