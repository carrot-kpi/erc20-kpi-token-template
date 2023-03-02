import { ChainId } from "@carrot-kpi/sdk";
import { Address } from "wagmi";

const COINGECKO_LIST = "https://tokens.coingecko.com/uniswap/all.json";
const CARROT_LIST = "https://carrot-kpi.dev/token-list.json";

export const TOKEN_LIST_URLS: string[] = [CARROT_LIST, COINGECKO_LIST];

export const PROTOCOL_FEE_BPS = 300;

export const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
    [ChainId.GOERLI]: "0x66ad026c2dAF2A7CbF265f7E1804712bb250F549",
    [ChainId.SEPOLIA]: "0x60Dbf4e0Ab6194F1c3a6dcbA48522FF654c2d95f",
};
