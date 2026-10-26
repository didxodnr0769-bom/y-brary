import { parseLearningNotes } from "@/lib/content/note-parser";

const files = import.meta.glob<string>("../../../content/notes/*.md", { query: "?raw", import: "default", eager: true });
export const learningNotes = parseLearningNotes(files);
