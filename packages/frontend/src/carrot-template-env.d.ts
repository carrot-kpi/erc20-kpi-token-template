import "carrot-scripts";

import { Address } from "wagmi";

declare global {
    const ROOT_ID: string;
    const CCT_ERC20_1_ADDRESS: Address;
    const CCT_ERC20_2_ADDRESS: Address;
    const CCT_CREATION_PROXY_ADDRESS: Address;
    const CCT_TEMPLATE_URL: string;
}
