import { config as baseConfig } from "./base.js";
import nodePlugin from "eslint-plugin-node";
import securityPlugin from "eslint-plugin-security";
import promisePlugin from "eslint-plugin-promise";

export const serverConfig = [
  ...baseConfig,
  // Node.js-specific rules
  {
    plugins: {
      node: nodePlugin,
    },
    rules: {
      "node/no-unsupported-features/es-syntax": "off", // if using ESM
      "node/no-missing-import": "error",
      "node/no-extraneous-import": "error",
      "node/no-missing-import": "off",
    },
    settings: {},
  },

  // Security plugin for common Node/Express security issues
  {
    plugins: {
      security: securityPlugin,
    },
    rules: {
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
    },
  },

  // Promise plugin for proper async/await handling
  {
    plugins: {
      promise: promisePlugin,
    },
    rules: {
      "promise/catch-or-return": "error",
      "promise/always-return": "warn",
    },
  },
];
