export interface CardData {
  title: string;
  message: string;
  tags: string[];
  tip: string;
  rarity: 'common' | 'rare' | 'ultra';
  category: string;
  tone: string;
  goal: string;
}

export interface FavoriteCard extends CardData {
  id: string;
  savedAt: string;
}

export interface VisualCard {
  title: string;
  message: string;
  logo?: string;
  cta?: string;
  theme: CardTheme;
  animation: AnimationFX;
}

export interface CardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  font: string;
  style: string;
}

export interface AnimationFX {
  name: string;
  type: 'typewriter' | 'glitch' | 'swipe' | 'fade' | 'punch';
  duration: number;
}

export interface ExportOptions {
  format: 'gif' | 'mp4' | 'png';
  quality: 'low' | 'medium' | 'high';
  size: '9:16' | '1:1' | '16:9';
}