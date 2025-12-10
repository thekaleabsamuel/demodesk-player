// Hardcoded albums and tracks data
import vampireArtwork from "@/assets/Vampire artwork.png";
import vampireAudio from "@/assets/vampire v3.2.mp3";
import greedyArtwork from "@/assets/2greedy.png";
import greedyAudio from "@/assets/2 greedy.mp3";
import cardiganArtwork from "@/assets/Cardigan.png";
import cardiganAudio from "@/assets/cardigan. 08 23 25 3.mp3";
import cumngoArtwork from "@/assets/cumngo.jpg";
import cumngoAudio from "@/assets/cumngo 3.mp3";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
  fileUrl?: string; // URL to the audio file (if you have audio files hosted)
  albumArt?: string; // URL to album art image
}

export interface Album {
  id: string;
  name: string;
  year: string;
  tracks: Track[];
  color: string;
  coverArt?: string; // URL to album art image
}

export const albums: Album[] = [
  {
    id: "vampire-single",
    name: "Vampire",
    year: "2025",
    color: "from-red-600 to-purple-600",
    coverArt: vampireArtwork,
    tracks: [
      {
        id: "vampire-track",
        title: "Vampire",
        artist: "You",
        album: "Vampire - Single",
        duration: "3:42", // Update this with actual duration if you know it
        durationSeconds: 222, // Update this with actual duration in seconds
        fileUrl: vampireAudio,
        albumArt: vampireArtwork, // Track artwork
      },
    ],
  },
  {
    id: "2greedy-single",
    name: "2 Greedy",
    year: "2025",
    color: "from-blue-600 to-cyan-600",
    coverArt: greedyArtwork,
    tracks: [
      {
        id: "2greedy-track",
        title: "2 Greedy",
        artist: "You",
        album: "2 Greedy - Single",
        duration: "3:00", // Update this with actual duration if you know it
        durationSeconds: 180, // Update this with actual duration in seconds
        fileUrl: greedyAudio,
        albumArt: greedyArtwork, // Track artwork
      },
    ],
  },
  {
    id: "cardigan-single",
    name: "Cardigan",
    year: "2025",
    color: "from-amber-600 to-orange-600",
    coverArt: cardiganArtwork,
    tracks: [
      {
        id: "cardigan-track",
        title: "Cardigan",
        artist: "You",
        album: "Cardigan - Single",
        duration: "3:00", // Update this with actual duration if you know it
        durationSeconds: 180, // Update this with actual duration in seconds
        fileUrl: cardiganAudio,
        albumArt: cardiganArtwork, // Track artwork
      },
    ],
  },
  {
    id: "cumngo-single",
    name: "CumnGo",
    year: "2025",
    color: "from-purple-600 to-pink-600",
    coverArt: cumngoArtwork,
    tracks: [
      {
        id: "cumngo-track",
        title: "CumnGo",
        artist: "You",
        album: "CumnGo - Single",
        duration: "3:00", // Update this with actual duration if you know it
        durationSeconds: 180, // Update this with actual duration in seconds
        fileUrl: cumngoAudio,
        albumArt: cumngoArtwork, // Track artwork
      },
    ],
  },
];

