import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, PieChart, Plus, Sparkles, Users, Settings as SettingsIcon } from 'lucide-react';
import { MOCK_POSTS, MOCK_CLIENTS, DEFAULT_STATUSES } from './constants';
import { Post, Client, ViewMode, WorkflowStatus, SocialNetwork } from './types';
import PostManager from './components/PostManager';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import ClientManager from './components/ClientManager';
import SettingsManager from './components/SettingsManager';
import AIAssistantModal from './components/AIAssistantModal';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // VERSIONAMENTO: Alterado para _v6 para carregar o novo status 'Sem postagens'
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('app_posts_v6');
      return saved ? JSON.parse(saved) : MOCK_POSTS;
    } catch (e) {
      console.error("Failed to load posts", e);
      return MOCK_POSTS;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('app_clients_v6');
      return saved ? JSON.parse(saved) : MOCK_CLIENTS;
    } catch (e) {
      console.error("Failed to load clients", e);
      return MOCK_CLIENTS;
    }
  });

  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>(() => {
    try {
      const saved = localStorage.getItem('app_statuses_v6');
      return saved ? JSON.parse(saved) : DEFAULT_STATUSES;
    } catch (e) {
      console.error("Failed to load statuses", e);
      return DEFAULT_STATUSES;
    }
  });
  
  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedPostForAI, setSelectedPostForAI] = useState<Post | null>(null);

  // Set loaded state to true after mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Persistence Effects - Using v6 keys
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('app_posts_v6', JSON.stringify(posts));
    }
  }, [posts, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('app_clients_v6', JSON.stringify(clients));
    }
  }, [clients, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('app_statuses_v6', JSON.stringify(workflowStatuses));
    }
  }, [workflowStatuses, isLoaded]);

  // Helper to generate posts for a specific client (Current Month)
  const generatePostsForClient = (client: Client): Post[] => {
      const newPosts: Post[] = [];
      const count = client.contractedPosts || 12;
      const today = new Date();
      const startObj = new Date(client.startDate);
      const targetDate = startObj > today ? startObj : today;
      
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      
      const interval = Math.floor(28 / count) || 1;

      for (let i = 1; i <= count; i++) {
          const day = Math.min(28, i * interval);
          const date = new Date(targetYear, targetMonth, day);
          
          if (date.getDay() === 0) date.setDate(date.getDate() + 1);
          if (date.getDay() === 6) date.setDate(date.getDate() + 2);

          newPosts.push({
              id: Math.random().toString(36).substr(2, 9),
              clientId: client.id,
              title: `Conteúdo #${i}`,
              date: date.toISOString().split('T')[0],
              startDate: new Date(targetYear, targetMonth, 1).toISOString().split('T')[0],
              postNumber: i,
              status: workflowStatuses[0]?.label || 'Roteiro',
              network: SocialNetwork.INSTAGRAM,
              format: 'Post',
              copy: ''
          });
      }
      return newPosts;
  };

  // --- NOVA LÓGICA DE GERAÇÃO: SEG/QUA/SEX (FEV-DEZ 2026) ---
  const handleGenerateYearlyContent = () => {
      // 1. Filtra apenas clientes ativos
      const activeClients = clients.filter(c => c.status === 'Ativo');

      if (activeClients.length === 0) {
          alert('Não há clientes ativos para gerar o calendário. Adicione ou ative um cliente primeiro.');
          return;
      }

      if (!confirm(`ATENÇÃO:\n\nIsso irá gerar posts de Fevereiro a Dezembro de 2026.\nDias: Segunda, Quarta e Sexta.\nInício do projeto: 1 mês antes da entrega.\n\nClientes afetados: ${activeClients.length}\n\nDeseja continuar?`)) {
          return;
      }

      const allNewPosts: Post[] = [];
      const year = 2026;

      activeClients.forEach(client => {
          let postCount = 1;

          // Loop de Fevereiro (1) a Dezembro (11)
          for (let month = 1; month <= 11; month++) {
             const daysInMonth = new Date(year, month + 1, 0).getDate();

             // Loop pelos dias do mês
             for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(year, month, day);
                const dayOfWeek = currentDate.getDay(); // 0=Dom, 1=Seg, ... 6=Sab

                // REGRA: Apenas Segunda (1), Quarta (3) e Sexta (5)
                if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
                    
                    // REGRA: Data de Início é 30 dias (1 mês) antes
                    const startDateObj = new Date(currentDate);
                    startDateObj.setMonth(startDateObj.getMonth() - 1);

                    const dateStr = currentDate.toISOString().split('T')[0];
                    const startDateStr = startDateObj.toISOString().split('T')[0];

                    allNewPosts.push({
                        id: `${year}-${client.id}-${month}-${day}-${Math.random().toString(36).substr(2, 9)}`,
                        clientId: client.id,
                        title: `Post ${postCount} - ${client.name}`,
                        date: dateStr,            // Data da Entrega
                        startDate: startDateStr,  // Início 1 mês antes
                        postNumber: postCount,
                        status: workflowStatuses[0]?.label || 'Roteiro',
                        network: SocialNetwork.INSTAGRAM,
                        format: 'Post',
                        copy: ''
                    });
                    postCount++;
                }
             }
          }
      });

      setPosts(prev => [...prev, ...allNewPosts]);
      
      if(confirm(`Sucesso! Foram gerados ${allNewPosts.length} novos posts (Seg/Qua/Sex) para 2026.\n\nDeseja visualizar as postagens agora?`)) {
          setView('list');
      }
  };

  // CRUD Actions Posts
  const handleAddPost = (newPost: Post) => {
    setPosts(prev => [...prev, newPost]);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // CRUD Actions Clients
  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    
    // Pergunta se quer gerar o calendário já no padrão novo
    if (confirm(`Cliente criado! Deseja gerar o calendário 2026 (Seg/Qua/Sex) para ${newClient.name} agora?`)) {
       // Reutiliza a lógica mas só para este cliente
       // (Para simplificar, chamamos a função global, mas idealmente extrairíamos a lógica. 
       //  Aqui, deixamos o usuário clicar no botão geral depois ou usamos a lógica simplificada abaixo)
       alert("Dica: Vá em 'Configurações' e clique em 'Gerar Calendário 2026' para criar os posts deste cliente junto com os outros.");
    } 
    else if (confirm(`Gerar apenas posts simples para este mês?`)) {
        const generatedPosts = generatePostsForClient(newClient);
        setPosts(prev => [...prev, ...generatedPosts]);
    }
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza? Isso pode afetar os posts associados.')) {
        setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  // CRUD Actions Statuses
  const handleAddStatus = (newStatus: WorkflowStatus) => {
    setWorkflowStatuses(prev => [...prev, newStatus]);
  };

  const handleUpdateStatus = (updatedStatus: WorkflowStatus) => {
    setWorkflowStatuses(prev => prev.map(s => s.id === updatedStatus.id ? updatedStatus : s));
  };

  const handleDeleteStatus = (id: string) => {
     setWorkflowStatuses(prev => prev.filter(s => s.id !== id));
  }
  
  const createNewEmptyPost = () => {
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: clients[0]?.id || '',
      title: 'Novo Conteúdo',
      date: new Date().toISOString().split('T')[0],
      status: workflowStatuses[0]?.label || 'Roteiro', // Default to first status
      network: SocialNetwork.INSTAGRAM,
      format: 'Post'
    };
    handleAddPost(newPost);
  }

  const openAICaption = (post: Post) => {
      setSelectedPostForAI(post);
      setIsAIModalOpen(true);
  }

  const openAIGenerator = () => {
      setSelectedPostForAI(null);
      setIsAIModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <div className="bg-white py-4 px-4 rounded-xl shadow-sm flex items-center justify-center">
             {/* Substitua o src abaixo pela URL da sua imagem anexada se necessário */}
             <img 
               src="/logo.png" 
               alt="Med Concept" 
               className="h-16 w-auto object-contain" 
             />
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setView('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'clients' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Users size={20} />
            <span>Clientes</span>
          </button>
          
          <button 
            onClick={() => setView('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <CalendarIcon size={20} />
            <span>Postagens</span>
          </button>
          
          <button 
            onClick={() => setView('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'reports' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <PieChart size={20} />
            <span>Relatórios</span>
          </button>

          <button 
            onClick={() => setView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <SettingsIcon size={20} />
            <span>Configurações</span>
          </button>

           <div className="pt-4 mt-4 border-t border-slate-800">
             <p className="px-4 text-xs font-semibold uppercase text-slate-500 mb-2">Ferramentas</p>
             <button 
                onClick={openAIGenerator}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-indigo-400 hover:bg-slate-800 hover:text-indigo-300"
            >
                <Sparkles size={20} />
                <span>IA Generator</span>
            </button>
           </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              MC
            </div>
            <div>
              <p className="text-sm text-white font-medium">Med Concept</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-8">
           <div>
               <h2 className="text-2xl font-bold text-slate-800 capitalize">
                {view === 'dashboard' && 'Bom dia, Gestor!'}
                {view === 'clients' && 'Gestão de Clientes'}
                {view === 'list' && 'Gerenciamento de Conteúdo'}
                {view === 'reports' && 'Relatórios e Métricas'}
                {view === 'settings' && 'Configurações do Sistema'}
               </h2>
               <p className="text-slate-500 text-sm mt-1">
                {view === 'dashboard' && 'Aqui está o resumo da sua agência hoje.'}
                {view === 'clients' && 'Gerencie seus contratos, prazos e clientes ativos.'}
                {view === 'list' && 'Gerencie o status e datas de todas as publicações.'}
                {view === 'settings' && 'Personalize os status e preferências da plataforma.'}
               </p>
           </div>
           
           {view === 'list' && (
               <button 
                onClick={createNewEmptyPost}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
               >
                   <Plus size={20} />
                   Novo Post
               </button>
           )}
        </div>

        {/* View Content */}
        {view === 'dashboard' && (
          <Dashboard posts={posts} clients={clients} />
        )}

        {view === 'clients' && (
          <ClientManager 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {view === 'list' && (
          <PostManager 
            posts={posts} 
            clients={clients} 
            statuses={workflowStatuses}
            onUpdatePost={handleUpdatePost} 
            onDeletePost={handleDeletePost}
            onGenerateCaption={openAICaption}
          />
        )}

        {view === 'reports' && (
          <Reports posts={posts} clients={clients} statuses={workflowStatuses} />
        )}

        {view === 'settings' && (
            <SettingsManager 
                statuses={workflowStatuses}
                onAddStatus={handleAddStatus}
                onUpdateStatus={handleUpdateStatus}
                onDeleteStatus={handleDeleteStatus}
                onGenerateYearlyContent={handleGenerateYearlyContent}
            />
        )}
      </main>

      {/* AI Modal */}
      <AIAssistantModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        clients={clients}
        posts={posts}
        initialPost={selectedPostForAI}
        onAddPost={handleAddPost}
        onUpdatePost={handleUpdatePost}
      />

    </div>
  );
};

export default App;
      
