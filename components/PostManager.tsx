import React, { useState } from 'react';
import { Post, Client, SocialNetwork, WorkflowStatus } from '../types';
import { SOCIAL_ICONS } from '../constants';
import { Edit2, Trash2, CheckCircle, Clock, FileText, Sparkles, X, Save, ListFilter } from 'lucide-react';

interface PostManagerProps {
  posts: Post[];
  clients: Client[];
  statuses: WorkflowStatus[];
  onUpdatePost: (post: Post) => void;
  onDeletePost: (id: string) => void;
  onGenerateCaption: (post: Post) => void;
}

const PostManager: React.FC<PostManagerProps> = ({ posts, clients, statuses, onUpdatePost, onDeletePost, onGenerateCaption }) => {
  const [filterClient, setFilterClient] = useState<string>('all');
  // Changed default to 2026-02 since Jan 2026 is now excluded
  const [filterMonth, setFilterMonth] = useState<string>('2026-02'); 
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Helper to get client name
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Desconhecido';

  // Helper to get status object
  const getStatus = (label: string) => statuses.find(s => s.label === label) || { label, colorClass: 'bg-gray-100 text-gray-800' };

  const filteredPosts = posts.filter(post => {
    const matchesClient = filterClient === 'all' || post.clientId === filterClient;
    // If filterMonth is empty, show all. Otherwise check startsWith
    const matchesMonth = !filterMonth || post.date.startsWith(filterMonth);
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesClient && matchesMonth && matchesStatus;
  });

  // Sort by date
  filteredPosts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleEditClick = (post: Post) => {
    setEditingPost({ ...post });
    setIsEditModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      onUpdatePost(editingPost);
      setIsEditModalOpen(false);
      setEditingPost(null);
    }
  };

  const clearDateFilter = () => {
      setFilterMonth('');
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Filters Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mês</label>
            <div className="flex items-center gap-2">
                <input 
                type="month" 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                />
                {filterMonth && (
                    <button 
                        onClick={clearDateFilter}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium whitespace-nowrap tooltip"
                        title="Ver todo o histórico e futuro"
                    >
                        Ver Todos
                    </button>
                )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cliente</label>
            <select 
              value={filterClient} 
              onChange={(e) => setFilterClient(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
            >
              <option value="all">Todos os Clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
            >
              <option value="all">Todos os Status</option>
              {statuses.map(status => (
                <option key={status.id} value={status.label}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="text-sm text-slate-500">
          Mostrando <strong>{filteredPosts.length}</strong> posts {filterMonth === '' ? '(Total)' : '(Neste mês)'}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3">Prazos</th>
              <th scope="col" className="px-6 py-3">Cliente</th>
              <th scope="col" className="px-6 py-3">Conteúdo / Post #</th>
              <th scope="col" className="px-6 py-3">Formato & Rede</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <ListFilter size={32} className="text-slate-300"/>
                    <p>Nenhum post encontrado para este filtro.</p>
                    {filterMonth && (
                        <button onClick={clearDateFilter} className="text-indigo-600 hover:underline">
                            Limpar filtro de data para ver posts futuros
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => {
                const statusObj = getStatus(post.status);
                return (
                  <tr key={post.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-xs gap-1">
                        {post.startDate && (
                             <div className="flex items-center gap-1 text-slate-500" title="Data de Início">
                                <span className="w-10">Início:</span>
                                <span>{new Date(post.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                             </div>
                        )}
                        <div className="flex items-center gap-1 font-medium text-slate-700" title="Prazo Final">
                            <span className="w-10">Final:</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 py-1 px-2 rounded text-xs font-semibold">
                        {getClientName(post.clientId)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="text-xs text-slate-400 font-mono mb-0.5">POST #{post.postNumber || '-'}</span>
                         <div className="font-semibold text-slate-800">{post.title}</div>
                         {post.copy && (
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate max-w-[200px]">
                            <FileText size={12} /> Copy anexada
                            </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold ${SOCIAL_ICONS[post.network]}`}>
                          {post.network}
                        </span>
                        <span className="text-xs text-slate-500">{post.format}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-xs font-medium px-2.5 py-1 rounded ${statusObj.colorClass}`}>
                          {post.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(post)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors tooltip"
                          title="Editar Detalhes"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onGenerateCaption(post)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors tooltip"
                          title="Gerar Legenda com IA"
                        >
                          <Sparkles size={16} />
                        </button>
                        <button 
                          onClick={() => onDeletePost(post.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Post Modal */}
      {isEditModalOpen && editingPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Edit2 size={20} className="text-indigo-600" />
                      Editar Postagem
                  </h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={20} />
                  </button>
              </div>

              <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-4 flex-1">
                  
                  {/* First Row: Client and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                          <select 
                              value={editingPost.clientId}
                              onChange={(e) => setEditingPost({...editingPost, clientId: e.target.value})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          >
                              {clients.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                          <select 
                              value={editingPost.status}
                              onChange={(e) => setEditingPost({...editingPost, status: e.target.value})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          >
                              {statuses.map(s => (
                                  <option key={s.id} value={s.label}>{s.label}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                   {/* Second Row: Dates and Number */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Número do Post</label>
                          <input 
                              type="number"
                              min="1"
                              value={editingPost.postNumber || ''}
                              onChange={(e) => setEditingPost({...editingPost, postNumber: parseInt(e.target.value)})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="#"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Prazo de Início</label>
                          <input 
                              type="date"
                              value={editingPost.startDate || ''}
                              onChange={(e) => setEditingPost({...editingPost, startDate: e.target.value})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Prazo Final</label>
                          <input 
                              type="date"
                              value={editingPost.date}
                              onChange={(e) => setEditingPost({...editingPost, date: e.target.value})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                              required
                          />
                       </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1">Título / Ideia Central</label>
                       <input 
                          type="text"
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                          className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                       />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Rede Social</label>
                           <select 
                              value={editingPost.network}
                              onChange={(e) => setEditingPost({...editingPost, network: e.target.value as SocialNetwork})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                           >
                              {Object.values(SocialNetwork).map(n => (
                                  <option key={n} value={n}>{n}</option>
                              ))}
                           </select>
                      </div>
                      <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Formato</label>
                           <input 
                              type="text"
                              value={editingPost.format}
                              onChange={(e) => setEditingPost({...editingPost, format: e.target.value})}
                              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="Ex: Reels, Carrossel..."
                           />
                      </div>
                  </div>
                  
                  <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Legenda / Copy</label>
                       <textarea 
                          value={editingPost.copy || ''}
                          onChange={(e) => setEditingPost({...editingPost, copy: e.target.value})}
                          className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                          placeholder="Texto da legenda..."
                       />
                  </div>

              </form>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
                   <button 
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-white transition-colors"
                   >
                       Cancelar
                   </button>
                   <button 
                      onClick={handleSavePost}
                      className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all"
                   >
                       <Save size={18} /> Salvar Alterações
                   </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PostManager;