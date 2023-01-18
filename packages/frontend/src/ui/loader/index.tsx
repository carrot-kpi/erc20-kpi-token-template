import { ReactComponent as LoaderSvg } from "../../assets/loader.svg";

export const Loader = () => (
    <div className="flex justify-center items-center h-full w-full">
        <LoaderSvg className="animate-pulse" />
    </div>
);
