import { config as baseConfig } from "./base.js";

export const mobileConfig = [
  ...baseConfig,
  // fbtee.configs.recommended,
  {
    ignores: [
      "__generated__",
      ".expo",
      "android/",
      "ios/",
      "metro.config.js",
      "babel.config.js",
    ],
  },
  {
    files: ["scripts/**/*.tsx"],
    rules: {
      "no-console": 0,
    },
  },
  {
    files: ["metro.config.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": 0,
      "no-undef": "off",
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              importNames: ["Text"],
              name: "react-native",
              message:
                "Please use the corresponding UI components from `src/ui/` instead.",
            },
            {
              importNames: ["ScrollView"],
              name: "react-native",
              message:
                "Please use the corresponding UI component from `react-native-gesture-handler` instead.",
            },
            {
              importNames: ["BottomSheetModal"],
              name: "@gorhom/bottom-sheet",
              message:
                "Please use the corresponding UI components from `src/ui/` instead.",
            },
          ],
        },
      ],
    },
  },
  // {
  //   // plugins: {
  //   //   '@nkzw/fbtee': fbtee,
  //   // },
  //   rules: {

  //   },
  //   settings: {
  //     'import-x/resolver': {
  //       typescript: {
  //         project: './tsconfig.json',
  //       },
  //     },
  //   },
  // },
];
