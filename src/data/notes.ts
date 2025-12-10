// Hardcoded notes data

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const initialNotes: Note[] = [
  {
    id: "where-have-i-been",
    title: "Where Have I Been ?",
    content: "I took some time to really develop my skills and work on executing on a bigger level.\n\nI was so sick of the rat race that I was running on instagram, and tiktok, and etc\n\nSo being able to make stuff like this where I can just post my ideas, demos, and be in touch with other like minded people has been helping\n\nMy next album is gonna be 100% produced by myself but until then here are some new demos and ideas I've been working on.\n\nBest,\n\nKaleab Samuel\n\n12/07/2025",
    createdAt: new Date("2025-12-07").toISOString(),
    updatedAt: new Date("2025-12-07").toISOString(),
  },
  {
    id: "admin-notes",
    title: "Admin Notes",
    content: "This is prelaunch version 0.1 of the website it doesnt even have a name yet but new updates will be taking place.\n\nFor now thanks for visiting the website",
    createdAt: new Date("2025-12-07").toISOString(),
    updatedAt: new Date("2025-12-07").toISOString(),
  },
];

