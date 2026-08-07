/**
 * MCP Server Chain Configuration
 *
 * Configure external MCP servers that this server can connect to and proxy.
 * Tools from these servers will be available to the parent client with a prefix.
 *
 * @example
 * When configured with name: "cms", tools from that server appear as:
 * - cms:get-document
 * - cms:list-documents
 * - etc.
 */

import path from "path";
import { fileURLToPath } from "url";
import type { McpServerConfig } from "@umbraco-cms/mcp-server-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Use mock MCP server for testing chaining functionality.
 * Set USE_MOCK_MCP_CHAIN=true to use a simple mock server instead of real Umbraco.
 */
const useMockChain = process.env.USE_MOCK_MCP_CHAIN === "true";

/**
 * Mock MCP server configuration for testing.
 * Uses a simple server that returns mock tools and responses.
 * Path resolves from dist/ to src/ since tsx runs TypeScript directly.
 * Note: tsup bundles into dist/index.js so __dirname is dist/, not dist/config/
 */
const mockCmsServer: McpServerConfig = {
  name: "cms",
  command: "npx",
  args: [
    "tsx",
    // From dist/index.js, go to ../src/testing/
    path.resolve(__dirname, "../src/testing/mock-mcp-server.ts"),
  ],
  proxyTools: true,
};

/**
 * Real Umbraco CMS MCP server configuration.
 */
const realCmsServer: McpServerConfig = {
  name: "cms",
  command: "npx",
  args: ["-y", "@umbraco-cms/mcp-dev@17"],
  env: {
    UMBRACO_BASE_URL: process.env.UMBRACO_BASE_URL || "http://localhost:44391",
    UMBRACO_CLIENT_ID: process.env.UMBRACO_CLIENT_ID || "",
    UMBRACO_CLIENT_SECRET: process.env.UMBRACO_CLIENT_SECRET || "",
  },
  proxyTools: true,
};

/**
 * External MCP servers to chain to.
 *
 * Each server configured here will:
 * 1. Be available for internal delegation (tools calling mcpClientManager.callTool())
 * 2. Have its tools proxied to the parent client (if proxyTools is true)
 * 3. Receive the same filter configuration (tools, slices, modes) as this server
 */
export const mcpServers: McpServerConfig[] = [
  // Chaining to Umbraco's own MCP server is OFF by default, and deliberately so.
  //
  // The scaffold enables it, which spawns `npx -y @umbraco-cms/mcp-dev` at
  // startup and proxies its ~350 tools through this server. Three problems for a
  // published package:
  //
  //   1. The first run of a fresh install hangs, silently, while npx downloads
  //      mcp-dev. Locally it looks instant only because the package is cached.
  //   2. ~350 tools nobody asked for appear in the consumer's tool list.
  //   3. Anyone already running Umbraco's server sees every tool twice, and has
  //      to guess which to call.
  //
  // UpDoc's own tools do not delegate to it - they call UpDoc's endpoints. So
  // the chain earns nothing here and costs all three.
  //
  // Set UMBRACO_MCP_CHAIN=true to turn it back on.
  ...(process.env.UMBRACO_MCP_CHAIN === "true"
    ? [useMockChain ? mockCmsServer : realCmsServer]
    : []),
];
