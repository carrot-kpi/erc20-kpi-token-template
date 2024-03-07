#!/usr/bin/env node

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { existsSync } from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { UnixFS } from "@web3-storage/upload-client";
import { filesFromPaths } from "files-from-path";
import mime from "mime";

const ALLOWED_ENVIRONMENTS = ["prod", "staging", "dev"];

let spinner = ora();
const [, , environment] = process.argv;
if (!ALLOWED_ENVIRONMENTS.includes(environment)) {
    spinner.fail(
        `Invalid environment ${chalk.blue(environment)} specified, supported values are: ${chalk.blue(ALLOWED_ENVIRONMENTS.join(", "))}`,
    );
    process.exit(1);
}
spinner.info(`Uploading to ${chalk.blue(environment)} CDN`);
console.log();

spinner = ora();
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../dist");
if (!existsSync(outDir)) {
    spinner.fail(`Out folder ${chalk.blue(outDir)} does not exist`);
    process.exit(1);
}
spinner.succeed(`Out folder ${chalk.blue(outDir)} exists`);

spinner = ora("Calculating template CID...").start();
let files;
let templateCID;
try {
    files = await filesFromPaths(outDir);
    templateCID = (await UnixFS.encodeDirectory(files)).cid.toV1().toString();
} catch (error) {
    spinner.fail(`Could not calculate template CID`);
    console.error(error);
    process.exit(1);
}
spinner.succeed(`Calculated template CID: ${templateCID}`);

spinner = ora(
    `Uploading template to ${chalk.blue(environment)} CDN...`,
).start();
let filePath;
let fileSpinner;
try {
    const s3Client = new S3Client({
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint: "https://nyc3.digitaloceanspaces.com",
        region: "us-east-1",
    });
    for (const file of files) {
        filePath = join(outDir, file.name);
        fileSpinner = ora({
            text: `Uploading ${chalk.blue(filePath)}...`,
            indent: 2,
        });
        /** @type {Uint8Array} */
        let rawContent = Uint8Array.from([]);
        let offset = 0;
        for await (const chunk of file.stream()) {
            rawContent.set(offset, chunk);
            offset += chunk.length;
        }
        const put = new PutObjectCommand({
            ACL: "public-read",
            Bucket: `${environment}-carrot-data`,
            Body: Buffer.from(rawContent),
            Key: `${templateCID}/${file.name}`,
            ContentType: mime.getType(file.name),
        });
        await s3Client.send(put);
        fileSpinner.succeed(`${chalk.blue(filePath)} uploaded`);
    }
    spinner.succeed(
        `Template uploaded to ${chalk.blue(environment)} CDN: https://data.${environment === "staging" ? "staging." : ""}carrot.community/${templateCID}/base.json`,
    );
} catch (error) {
    fileSpinner.fail(`Could not upload ${filePath}`);
    console.error(error);
    process.exit(1);
}
