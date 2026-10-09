import {
  getThoughtPlainText,
  isTextLikeThought,
  type Thought,
} from "@repo/zod-schemas";

const stripForHash = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const djb2 = (value: string) => {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
};

export const hashNlpSource = (input: {
  type: string;
  style?: string;
  text: string;
}): string =>
  djb2(`${input.type}\n${input.style ?? ""}\n${stripForHash(input.text)}`);

export const thoughtNlpSourceHash = (thought: Thought): string =>
  hashNlpSource({
    type: thought.type,
    style: isTextLikeThought(thought) ? thought.content.style : undefined,
    text: getThoughtPlainText(thought) || "",
  });

export const thoughtHasNlpText = (thought: Thought): boolean =>
  stripForHash(getThoughtPlainText(thought)).length > 0;
