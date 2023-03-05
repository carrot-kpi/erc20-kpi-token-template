#!/usr/bin/env node

import { dirname, join } from "path";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const [, , chainId, factoryAddress, kpiTokensManagerAddress, templateId] =
    process.argv;

if (!chainId || !factoryAddress || !kpiTokensManagerAddress || !templateId) {
    console.error(
        "provide a chain id, a factory address, a kpi tokens manager address and a template id"
    );
    process.exit(1);
}

const generate = async () => {
    let source = (
        await readFile(join(__dirname, "./src/CreationProxy.sol"))
    ).toString();
    source = source
        .replace("address(1111111111)", `address(${factoryAddress})`)
        .replace("address(2222222222)", `address(${kpiTokensManagerAddress})`)
        .replace("3333333333", `uint256(${templateId})`);

    await writeFile(
        join(__dirname, `./src/CreationProxy${chainId}.sol`),
        source
    );
};

generate().then().catch(console.error);
