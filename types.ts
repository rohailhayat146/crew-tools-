import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export type SuggestedPrompt = {
  title: string;
  prompt: string;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
  cardBg?: string;
  borderColor?: string;
};

export interface ChatSessionRecord {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type AppMode = 'home' | 'chat' | 'thumbnail';

// --- Visual Editor Types ---

export type LayerType = 'text' | 'image' | 'shape' | 'icon';

export interface LayerStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  boxShadow?: string;
  textShadow?: string;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number; // width in pixels (or 0 for auto text)
  height: number; // height in pixels
  rotation: number;
  content: string; // text content or icon name/url
  style: LayerStyle;
  isLocked?: boolean;
}

export interface ThumbnailState {
  background: string; // css background value
  width: number;
  height: number;
  layers: Layer[];
  selectedLayerId: string | null;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailState: ThumbnailState; // The initial state for this template
  previewColor: string;
}