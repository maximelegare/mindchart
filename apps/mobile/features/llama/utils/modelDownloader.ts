import RNBlobUtil from "react-native-blob-util";
import { getModelDownloadUrl } from "../data/constants";

export interface DownloadProgress {
  written: number;
  total: number;
  percentage: number;
}

export class ModelDownloader {
  private activeDownloads = new Map<string, boolean>();

  private static detectSplitFile(filename: string) {
    const splitPattern = /^(.+)-(\d+)-of-(\d+)\.gguf$/;
    const match = filename.match(splitPattern);
    if (!match) return null;
    return {
      baseName: match[1],
      totalParts: parseInt(match[3], 10),
      padding: match[2].length,
    };
  }

  static generateSplitFilenames(filename: string): string[] {
    const info = this.detectSplitFile(filename);
    if (!info) return [filename];
    const names = [];
    for (let i = 1; i <= info.totalParts; i++) {
      const part = i.toString().padStart(info.padding, "0");
      names.push(
        `${info.baseName}-${part}-of-${info.totalParts.toString().padStart(info.padding, "0")}.gguf`
      );
    }
    return names;
  }

  async downloadModel(
    repo: string,
    filename: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const filenames = ModelDownloader.generateSplitFilenames(filename);
    const downloadDir = `${RNBlobUtil.fs.dirs.DocumentDir}/models`;

    if (!(await RNBlobUtil.fs.exists(downloadDir))) {
      await RNBlobUtil.fs.mkdir(downloadDir);
    }

    for (const file of filenames) {
      const filePath = `${downloadDir}/${file}`;
      if (await RNBlobUtil.fs.exists(filePath)) continue;

      const url = getModelDownloadUrl(repo, file);
      await RNBlobUtil.config({ path: `${filePath}.tmp` })
        .fetch("GET", url)
        .progress((written, total) => {
          if (onProgress) {
            onProgress({
              written: Number(written),
              total: Number(total), // Note: This is per-file total
              percentage: Math.round((Number(written) / Number(total)) * 100),
            });
          }
        });
      await RNBlobUtil.fs.mv(`${filePath}.tmp`, filePath);
    }

    // Return the path to the FIRST file (llama.rn handles the rest)
    return `${downloadDir}/${filenames[0]}`;
  }
}
