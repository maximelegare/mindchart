/** @type {import('expo/metro-config').MetroConfig} */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const NOBLE_UTILS_SHIM = path.resolve(
  __dirname,
  "lib/shims/nobleHashesUtils.ts"
);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath ?? "";
  const isNobleUtilsImport =
    moduleName === "@noble/hashes/utils" ||
    moduleName === "@noble/hashes/utils.js" ||
    (moduleName.endsWith("/utils.js") && origin.includes("@noble/hashes"));

  if (isNobleUtilsImport && !origin.includes("lib/shims/nobleHashesUtils")) {
    return { filePath: NOBLE_UTILS_SHIM, type: "sourceFile" };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.sourceExts.push("sql");

// Add wasm asset support
config.resolver.assetExts.push("wasm");
config.resolver.assetExts.push("bin");

config.resolver.unstable_conditionNames = [
  "browser",
  "require",
  "react-native",
];

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    middleware(req, res, next);
  };
};

module.exports = withNativeWind(config, {
  input: "./app/global.css",
  configPath: "./tailwind.config.ts",
});
