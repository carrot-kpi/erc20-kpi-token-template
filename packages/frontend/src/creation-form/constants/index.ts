import { ChainId } from "@carrot-kpi/sdk";
import { Address } from "wagmi";

export const NO_SPECIAL_CHARACTERS_REGEX =
    /^[A-Z0-9@~`!@#$%^&*()_=+\\';:"\/?>.<,-\s]*$/i;

const COINGECKO_LIST = "https://tokens.coingecko.com/uniswap/all.json";
const CARROT_LIST = "https://carrot-kpi.dev/token-list.json";

export const TOKEN_LIST_URLS: string[] = [CARROT_LIST, COINGECKO_LIST];

export const PROTOCOL_FEE_BPS = 30;

export const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
    [ChainId.GNOSIS]: "0x87d24272071593B4a7907fd133E74EC30025D4F9",
    [ChainId.SEPOLIA]: "0x30aCa885869C68c079E8197a7738284B84013C2C",
};
