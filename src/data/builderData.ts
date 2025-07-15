import { CardTheme, AnimationFX } from '../types';

export const themes: CardTheme[] = [
  {
    name: 'Creator',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff'
    },
    font: 'Inter, sans-serif',
    style: 'Colorful, modern, round font'
  },
  {
    name: 'Bold',
    colors: {
      primary: '#ff4757',
      secondary: '#2f3542',
      accent: '#ffa502',
      background: 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)',
      text: '#ffffff'
    },
    font: 'Inter, sans-serif',
    style: 'Big text, high contrast'
  },
  {
    name: 'Calm',
    colors: {
      primary: '#a8e6cf',
      secondary: '#dcedc8',
      accent: '#b39ddb',
      background: 'linear-gradient(135deg, #74b9ff 0%, #81ecec 100%)',
      text: '#2d3436'
    },
    font: 'Inter, sans-serif',
    style: 'Soft pastels, subtle shadows'
  },
  {
    name: 'Hacker',
    colors: {
      primary: '#00ff00',
      secondary: '#1e272e',
      accent: '#00d2d3',
      background: 'linear-gradient(135deg, #0c0c0c 0%, #1e1e1e 100%)',
      text: '#00ff00'
    },
    font: 'JetBrains Mono, monospace',
    style: 'Monospaced, terminal-style'
  },
  {
    name: 'Minimal Pro',
    colors: {
      primary: '#2d3436',
      secondary: '#636e72',
      accent: '#74b9ff',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      text: '#2d3436'
    },
    font: 'Inter, sans-serif',
    style: 'Clean, neutral, professional'
  },
  {
    name: 'Neon',
    colors: {
      primary: '#ff006e',
      secondary: '#8338ec',
      accent: '#3a86ff',
      background: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)',
      text: '#ffffff'
    },
    font: 'Inter, sans-serif',
    style: 'Neon glows, cyberpunk'
  }
];

export const animations: AnimationFX[] = [
  {
    name: 'Typewriter',
    type: 'typewriter',
    duration: 3000
  },
  {
    name: 'Fade Zoom',
    type: 'fade',
    duration: 1500
  },
  {
    name: 'Swipe In',
    type: 'swipe',
    duration: 1200
  },
  {
    name: 'Punch',
    type: 'punch',
    duration: 1000
  },
  {
    name: 'Glitch',
    type: 'glitch',
    duration: 2000
  }
];