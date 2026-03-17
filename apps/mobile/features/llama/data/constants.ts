export const HUGGINGFACE_BASE_URL = "https://huggingface.co";

export const getModelDownloadUrl = (repo: string, filename: string) =>
  `${HUGGINGFACE_BASE_URL}/${repo}/resolve/main/${filename}?download=true`;
