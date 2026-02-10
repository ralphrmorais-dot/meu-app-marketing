export enum PostStatus {
  IDEA = 'Ideia',
  BRIEFING = 'Briefing',
  COPYWRITING = 'Copy',
  DESIGN = 'Design',
  APPROVAL = 'Aprovação',
  SCHEDULED = 'Agendado',
  PUBLISHED = 'Publicado'
}

export interface WorkflowStatus {
  id: string;
  label: string;
  colorClass: string; // Tailwind class set, e.g., 'bg-blue-100 text-blue-700'
}

export enum SocialNetwork {
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn',
  TIKTOK = 'TikTok',
  FACEBOOK = 'Facebook'
}

export type ClientStatus = 'Ativo' | 'Inativo' | 'Concluído';

export interface Client {
  id: string;
  name: string;
  industry: string;
  contractedPosts: number;
  avatarUrl?: string;
  startDate: string; // ISO Date YYYY-MM-DD
  status: ClientStatus;
}

export interface Post {
  id: string;
  clientId: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD (Prazo Final / Deadline)
  startDate?: string; // ISO Date string YYYY-MM-DD (Prazo de Início)
  postNumber?: number; // Post sequence number
  status: string; // Changed from enum to string to support dynamic statuses
  network: SocialNetwork;
  format: string; // e.g., Reels, Carousel, Static
  copy?: string;
  feedback?: string;
}

export interface AIContentSuggestion {
  title: string;
  concept: string;
  suggestedCopy: string;
}

export type ViewMode = 'dashboard' | 'calendar' | 'list' | 'reports' | 'clients' | 'settings';