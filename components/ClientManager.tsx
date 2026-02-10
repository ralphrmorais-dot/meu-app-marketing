import React, { useState } from 'react';
import { Client, ClientStatus } from '../types';
import { Edit2, Trash2, Plus, Calendar, Briefcase, CheckCircle, X } from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    industry: '',
    contractedPosts: 10,
    status: 'Ativo',
    startDate: new Date().toISOString().split('T')[0]
  });

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        industry: '',
        contractedPosts: 10,
        status: 'Ativo',
        startDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate) return;

    const clientData = {
      ...formData,
      id: editingClient ? editingClient.id : Math.random().toString(36).substr(2, 9),
      avatarUrl: editingClient?.avatarUrl || `https://picsum.photos/200/200?random=${Math.random()}`
    } as Client;

    if (editingClient) {
      onUpdateClient(clientData);
    } else {
      onAddClient(clientData);
    }
    setIsModalOpen(false);
  };

  const statusColors: Record<ClientStatus, string> = {
    'Ativo': 'bg-emerald-100 text-emerald-700',
    'Inativo': 'bg-red-100 text-red-700',
    'Concluído': 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div>
             <h3 className="font-bold text-slate-800">Meus Clientes</h3>
             <p className="text-sm text-slate-500">Gerencie contratos e prazos</p>
         </div>
         <button 
            onClick={() => openModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
         >
             <Plus size={20} />
             Novo Cliente
         </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={client.avatarUrl} 
                    alt={client.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{client.name}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Briefcase size={12} /> {client.industry}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[client.status]}`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Posts Contratados</span>
                  <span className="font-semibold text-slate-800">{client.contractedPosts} / mês</span>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                   <span className="text-slate-500 flex items-center gap-1"><Calendar size={14}/> Início</span>
                   <span className="text-slate-800">{new Date(client.startDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => openModal(client)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button 
                  onClick={() => onDeleteClient(client.id)}
                  className="flex-none bg-white hover:bg-red-50 text-red-500 p-2 rounded-lg border border-slate-200 transition-colors"
                  title="Excluir Cliente"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {/* Progress Bar Mockup */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Progresso do contrato</span>
                    <span className="text-indigo-600 font-semibold">Ativo</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Tech Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Setor / Nicho</label>
                <input 
                  type="text" 
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Saúde e Bem-estar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Posts / Mês</label>
                   <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.contractedPosts}
                    onChange={(e) => setFormData({...formData, contractedPosts: Number(e.target.value)})}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                   <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ClientStatus})}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                   >
                     <option value="Ativo">Ativo</option>
                     <option value="Inativo">Inativo</option>
                     <option value="Concluído">Concluído</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                   <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                 >
                   Cancelar
                 </button>
                 <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700"
                 >
                   {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;