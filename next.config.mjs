import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
export default {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
};
