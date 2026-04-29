import { useGenerateLocalNote } from "./services/locally";
import { GenerateNoteService } from "./types";

export const useGenerateNoteService = () => {
  const { generateLocalNote } = useGenerateLocalNote();

  const generateNoteService = async (props: GenerateNoteService) => {
    const { data, options } = props;

    if (options?.providers?.llamaChat === "local") {
      return generateLocalNote(data);
    } else {
      return generateLocalNote(data);
    }

    // if(options?.providers?.llm === "cloud"){
    //     return generateNote(data, generateLocalNote)
    // }
  };

  return { generateNoteService };
};
