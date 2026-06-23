import { Typography } from "@/components/ui/typography";

type PageSubtitleProps = {
  subtitle: string;
};

export const PageSubtitle = ({ subtitle }: PageSubtitleProps) => {
  return <Typography variant="h2">{subtitle}</Typography>;
};
