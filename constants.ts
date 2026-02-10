import { Client, Post, PostStatus, SocialNetwork, WorkflowStatus } from './types';

export const MOCK_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    name: 'Maikai Prime', 
    industry: 'Serviços Premium', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Maikai+Prime&background=0D8ABC&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c2', 
    name: 'MedConcept', 
    industry: 'Marketing Médico', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Med+Concept&background=1e293b&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c3', 
    name: 'VetConcetp', 
    industry: 'Veterinária', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Vet+Concept&background=10b981&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c4', 
    name: 'Dr. Fernando Signore', 
    industry: 'Medicina', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Fernando+Signore&background=6366f1&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c5', 
    name: 'Dr. Victor Fernandes', 
    industry: 'Medicina', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Victor+Fernandes&background=8b5cf6&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c6', 
    name: 'Clinica Saúde da Mulher', 
    industry: 'Saúde Feminina', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Saude+Mulher&background=ec4899&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c7', 
    name: 'Clínica Mahalo', 
    industry: 'Saúde e Bem-estar', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Clinica+Mahalo&background=f59e0b&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c8', 
    name: 'Dr. João Mancusi', 
    industry: 'Medicina', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Joao+Mancusi&background=3b82f6&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c9', 
    name: 'CEBRAM', 
    industry: 'Institucional', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=CEBRAM&background=14b8a6&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
  { 
    id: 'c10', 
    name: 'Dr. Eduardo Battistella', 
    industry: 'Medicina', 
    contractedPosts: 12, 
    avatarUrl: 'https://ui-avatars.com/api/?name=Eduardo+Battistella&background=64748b&color=fff',
    startDate: '2026-02-01',
    status: 'Ativo'
  },
];

export const DEFAULT_STATUSES: WorkflowStatus[] = [
  { id: 'roteiro', label: 'Roteiro', colorClass: 'bg-gray-100 text-gray-700' },
  { id: 'captacao', label: 'Captação', colorClass: 'bg-blue-100 text-blue-700' },
  { id: 'design', label: 'Design', colorClass: 'bg-purple-100 text-purple-700' },
  { id: 'edicao', label: 'Edição', colorClass: 'bg-indigo-100 text-indigo-700' },
  { id: 'aprovacao-ralph', label: 'Aguardando aprovação Ralph', colorClass: 'bg-orange-100 text-orange-800' },
  { id: 'aprovacao-cliente', label: 'Aguardando Aprovação Cliente', colorClass: 'bg-yellow-100 text-yellow-800' },
  { id: 'ajustes', label: 'Ajustes', colorClass: 'bg-red-100 text-red-700' },
  { id: 'agendado', label: 'Aprovado e agendado pelo cliente', colorClass: 'bg-emerald-100 text-emerald-700' },
  { id: 'postado', label: 'Postado', colorClass: 'bg-slate-800 text-white' },
  { id: 'sem-postagens', label: 'Sem postagens', colorClass: 'bg-slate-200 text-slate-500' },
];

// Função auxiliar para gerar posts SOMENTE para 2026 (Fev a Dez)
const generateInitialPosts = (): Post[] => {
  const posts: Post[] = [];
  
  // Período de geração: Apenas 2026
  const year = 2026;

  MOCK_CLIENTS.forEach(client => {
      // Começa do mês 1 (Fevereiro) até 11 (Dezembro)
      for (let month = 1; month < 12; month++) {
          
          const count = client.contractedPosts || 12;
          const interval = Math.floor(28 / count) || 1; 

          for (let i = 1; i <= count; i++) {
              const day = Math.min(28, i * interval);
              const date = new Date(year, month, day);
              const startDate = new Date(year, month, 1);
              
              // Ajuste de fim de semana
              if (date.getDay() === 0) date.setDate(date.getDate() + 1); // Dom -> Seg
              if (date.getDay() === 6) date.setDate(date.getDate() + 2); // Sab -> Seg

              posts.push({
                  id: `${client.id}-${year}-${month}-${i}`,
                  clientId: client.id,
                  title: `Conteúdo ${month + 1}/${year} #${i}`,
                  date: date.toISOString().split('T')[0], // Prazo final
                  startDate: startDate.toISOString().split('T')[0], // Inicio do mês
                  postNumber: i,
                  status: 'Roteiro', // Status inicial atualizado
                  network: SocialNetwork.INSTAGRAM,
                  format: 'Post',
                  copy: ''
              });
          }
      }
  });
  return posts;
};

// Gera a lista inicial preenchida
export const MOCK_POSTS: Post[] = generateInitialPosts();

export const SOCIAL_ICONS: Record<SocialNetwork, string> = {
  [SocialNetwork.INSTAGRAM]: 'text-pink-600',
  [SocialNetwork.LINKEDIN]: 'text-blue-700',
  [SocialNetwork.TIKTOK]: 'text-black',
  [SocialNetwork.FACEBOOK]: 'text-blue-600',
};

// Available colors for status creation
export const STATUS_COLOR_OPTIONS = [
  { label: 'Cinza', value: 'bg-gray-100 text-gray-700' },
  { label: 'Azul', value: 'bg-blue-100 text-blue-700' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-700' },
  { label: 'Roxo', value: 'bg-purple-100 text-purple-700' },
  { label: 'Amarelo', value: 'bg-yellow-100 text-yellow-800' },
  { label: 'Laranja', value: 'bg-orange-100 text-orange-800' },
  { label: 'Verde', value: 'bg-emerald-100 text-emerald-700' },
  { label: 'Vermelho', value: 'bg-red-100 text-red-700' },
  { label: 'Escuro', value: 'bg-slate-800 text-white' },
];