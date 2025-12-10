// Hardcoded blog posts data

export interface BlogPost {
  id: string;
  date: string;
  title: string;
  content: string;
  type: "text" | "video" | "image";
  media?: string; // URL for image/video or YouTube embed URL
}

export const blogPosts: BlogPost[] = [
  {
    id: "popstar-bits",
    date: "Dec 07, 2025",
    title: "imma popstar in da bits",
    content: "",
    type: "video",
    media: "https://www.youtube.com/watch?v=UuRTJuIRaFQ&list=RDUuRTJuIRaFQ&start_radio=1",
  },
  {
    id: "the-deep-who",
    date: "Dec 07, 2025",
    title: "The Deep - Who",
    content: "i love the vibe of this, the song reminds me of like a fresh mix of mariah carey, but with some club elements. Drip is fly too, love it",
    type: "video",
    media: "https://www.youtube.com/watch?v=ulcLOCR7w5k&list=RDulcLOCR7w5k&start_radio=1",
  },
];

