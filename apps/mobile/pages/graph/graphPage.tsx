import { Redirect } from "expo-router";

export const GraphPage = () => {
  const lastFocusedId = "your-default-id";
  return <Redirect href={`/graph/${lastFocusedId}`} />;
};
