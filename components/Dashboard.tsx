import React from 'react';
import { Post, Client } from '../types';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  posts: Post[];
  clients: Client[];
}

const Dashboard: React.FC<DashboardProps> = ({ posts, clients }) => {
  // Logic identifying completed status by string keyword
  const isCompleted = (status: string) => {
    const s = status.toLowerCase();
    return s.includes('publicado') || s.includes('agendado');
  };

  const pendingPosts = posts.filter(p => !isCompleted(p.status));
  const latePosts = pendingPosts.filter(p => new Date(p.date) < new Date());
  const completedCount = posts.filter(p => isCompleted(p.status)).length;
  
  // Sort pending by date soonest first
  const upcomingDeadlines = [...pendingPosts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <span className="text-sm text-slate-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Late Actions */}
        <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-semibold text-slate-700">Atrasados</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{latePosts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Posts com data passada não publicados</p>
        </div>

        {/* Card 2: Upcoming */}
        <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="font-semibold text-slate-700">Próximos Prazos</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{pendingPosts.length}</p>
           <p className="text-xs text-slate-500 mt-1">Posts em produção</p>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <h3 className="font-semibold text-slate-700">Prontos / Agendados</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {completedCount}
          </p>
           <p className="text-xs text-slate-500 mt-1">Neste mês</p>
        </div>
      </div>

      {/* Upcoming List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Fila de Prioridade</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {upcomingDeadlines.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Tudo em dia! Sem pendências urgentes.</div>
          ) : (
            upcomingDeadlines.map(post => {
              const client = clients.find(c => c.id === post.clientId);
              const isLate = new Date(post.date) < new Date();
              return (
                <div key={post.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                     <div className={`w-2 h-12 rounded-full ${isLate ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                     <div>
                        <h4 className="font-semibold text-slate-800">{post.title}</h4>
                        <p className="text-xs text-slate-500">{client?.name} • {post.network}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-sm font-medium ${isLate ? 'text-red-600' : 'text-slate-600'}`}>
                        {new Date(post.date).toLocaleDateString('pt-BR')}
                     </div>
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {post.status}
                     </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;