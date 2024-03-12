#!/usr/bin/env node

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { SERVICE_URLS } from "@carrot-kpi/sdk";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../dist");

function prepareFolder(formData, basePath) {
    let totalBytes = 0;
    for (const fileName of readdirSync(basePath)) {
        const filePath = join(basePath, fileName);
        const fileStat = statSync(filePath);
        if (fileStat.isDirectory()) {
            totalBytes += prepareFolder(formData, filePath);
        } else {
            const content = readFileSync(filePath);
            const blob = new Blob([content]);
            totalBytes += blob.size;
            formData.append(filePath.replace(OUT_DIR, ""), blob);
        }
    }
    return totalBytes;
}

const [, , environment, jwt] = process.argv;

const serviceUrls = SERVICE_URLS[environment]
    ? SERVICE_URLS[environment]
    : undefined;
if (!serviceUrls) {
    console.error(
        `Invalid environment ${chalk.blue(environment)} specified, supported values are: ${chalk.blue(Object.keys(SERVICE_URLS).join(", "))}`,
    );
    process.exit(1);
}

if (!jwt) {
    console.error(
        `Please provide a valid JWT for the ${chalk.blue(environment)} data manager service`,
    );
    process.exit(1);
}

let spinner = ora();
spinner.info(`Uploading to ${chalk.blue(environment)} CDN`);
console.log();

spinner = ora();
if (!existsSync(OUT_DIR)) {
    spinner.fail(`Out folder ${chalk.blue(OUT_DIR)} does not exist`);
    process.exit(1);
}
spinner.succeed(`Out folder ${chalk.blue(OUT_DIR)} exists`);

spinner = ora("Preparing folder for upload...").start();
let totalBytes;
const formData = new FormData();
try {
    totalBytes = prepareFolder(formData, OUT_DIR);
} catch (error) {
    spinner.fail(`Could not prepare folder for upload`);
    console.error(error);
    process.exit(1);
}
spinner.succeed(
    `Folder successfully prepared for upload (${totalBytes} bytes)`,
);

spinner = ora(
    `Uploading template to ${chalk.blue(environment)} CDN...`,
).start();
try {
    const response = await fetch(
        new URL("/data/s3/templates", serviceUrls.dataManager),
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            body: formData,
        },
    );
    if (!response.ok) throw new Error(await response.text());
    const { cid } = await response.json();
    spinner.succeed(
        `Template uploaded to ${chalk.blue(environment)} CDN: ${serviceUrls.dataCdn}/${cid}/base.json`,
    );
} catch (error) {
    spinner.fail(`Could not upload ${OUT_DIR}`);
    console.log();
    console.error(error);
    process.exit(1);
}
