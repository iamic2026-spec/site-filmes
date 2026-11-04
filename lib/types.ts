export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  favoriteGenres: string[];
  joinedDate: string;
  badge: string;
  followersCount: number;
  followingCount: number;
  isGuest?: boolean;
}

export interface Movie {
  id: string;
  userId: string;
  title: string;
  originalTitle?: string;
  year: number;
  director: string;
  genre: string;
  secondaryGenre?: string;
  rating: number; // 1 to 10
  userReview: string; // "Uma palavra ou frase sobre o filme"
  posterUrl: string;
  backdropUrl?: string;
  duration?: string;
  techSpecs?: string[];
  tags?: string[];
  createdAt: string;
  likesCount?: number;
}

export interface ProfileComment {
  id: string;
  profileUserId: string; // The owner of the profile receiving the comment
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string; // Word or sentence about the favorite movies
  movieMention?: string; // Optional specific movie mentioned
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
}

export interface MoviePreset {
  title: string;
  year: number;
  director: string;
  genre: string;
  duration: string;
  posterUrl: string;
  backdropUrl: string;
  techSpecs: string[];
  defaultReview: string;
}
