const topics = [
  "graph-ui",
  "ai-summarization",
  "voice-notes",
  "local-first",
  "productivity",
  "focus",
  "note-linking",
  "knowledge-graph",
];

const people = ["Alex", "Sam", "Jordan"];
const places = ["cafe", "home", "workspace"];

const categories = [
  "ideas",
  "feelings",
  "tasks",
  "events",
  "people",
  "places",
  "goals",
  "problems",
  "insights",
  "plans",
  "questions",
  "memories",
  "learning",
  "preferences",
  "projects",
  "random",
  "uncategorized",
  "other",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// keeps global memory → THIS is key
const globalMemory = {
  activeTopics: topics,
  recentEntities: [] as string[],
};

function createThought(topic: string) {
  const type = rand(categories);

  const base = {
    title: "",
    summary: "",
    category: type,
    semanticLabel: topic,
  };

  switch (type) {
    case "ideas": {
      base.title = "New idea";
      base.summary = `Improve ${topic} with a new approach.`;
      break;
    }

    case "problems": {
      base.title = "Issue found";
      base.summary = `${topic} is not working as expected.`;
      break;
    }

    case "insights": {
      base.title = "Realization";
      base.summary = `${topic} works better when simplified.`;
      break;
    }

    case "tasks": {
      base.title = "Action";
      base.summary = `Implement changes for ${topic}.`;
      break;
    }

    case "people": {
      const person = rand(people);
      base.title = "Discussion";
      base.summary = `Talked with ${person} about ${topic}.`;
      break;
    }

    case "places": {
      const place = rand(places);
      base.title = "Location";
      base.summary = `Worked on ${topic} at ${place}.`;
      break;
    }

    default:
      base.title = "Thought";
      base.summary = `Thinking about ${topic}.`;
  }

  return base;
}

function createNote(index: number) {
  // bias toward repeating topics
  const mainTopic = rand(globalMemory.activeTopics);

  const thoughts = Array.from({ length: 4 }, () => createThought(mainTopic));

  return {
    title: `Note ${index} about ${mainTopic}`,
    summary: `Ongoing exploration of ${mainTopic}.`,
    thoughts,
  };
}

export function generateGraphNotes(count = 10) {
  return Array.from({ length: count }, (_, i) => createNote(i));
}
