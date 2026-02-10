import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Post, Client, WorkflowStatus } from '../types';
import { Filter } from 'lucide-react';

interface ReportsProps {
  posts: Post[];
  clients: Client[];
  statuses: WorkflowStatus[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#475569'];

const Reports: React.FC<ReportsProps> = ({ posts, clients, statuses }) => {
  // Filters State
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all'); // Acts as "Category"

  // Extract unique formats for the Category filter
  const uniqueFormats = Array.from(new Set(posts.map(p => p.format))).filter(Boolean);

  // Filter Logic
  const filteredPosts = posts.filter(post => {
      const matchesClient = filterClient === 'all' || post.clientId === filterClient;
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
      const matchesFormat = filterFormat === 'all' || post.format === filterFormat;
      return matchesClient && matchesStatus && matchesFormat;
  });

  // Helper to identify "completed" statuses (simple logic: contains 'Postado' or 'Agendado')
  const isCompleted = (statusLabel: string) => {
    const s = statusLabel.toLowerCase();
    return s.includes('postado') || s.includes('agendado') || s.includes('concluído');
  };

  // Data for Posts per Client (Based on Filtered Data)
  // If a specific client is selected, this chart will show just that client, which is expected behavior
  const postsPerClient = clients
    .filter(c => filterClient === 'all' || c.id === filterClient)
    .map(client => {
      const clientPosts = filteredPosts.filter(p => p.clientId === client.id);
      
      // If we are filtering by status, the "completed" logic might look weird (e.g. if I filter by "Idea", completed is 0).
      // So we just count raw numbers based on the filter context.
      const completed = clientPosts.filter(p => isCompleted(p.status)).length;
      const pending = clientPosts.length - completed;
      
      return {
        name: client.name,
        Concluídos: completed,
        Pendentes: pending,
        Total: clientPosts.length,
        Meta: client.contractedPosts // Using contracted as meta (static)
      };
    }).filter(d => d.Total > 0 || filterClient !== 'all'); // Hide empty clients unless specifically selected

  // Data for Status Distribution (Based on Filtered Data)
  const statusCounts = statuses.map(status => ({
    name: status.label,
    value: filteredPosts.filter(p => p.status === status.label).length
  })).filter(item => item.value > 0);

  // Total completed calculation for summary card (Based on Filtered Data)
  const totalCompleted = filteredPosts.filter(p => isCompleted(p.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Relatórios de Desempenho</h2>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
              <Filter size={18} />
              Filtros:
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                  <option value="all">Todos os Clientes</option>
                  {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>

              <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                  <option value="all">Todos os Status</option>
                  {statuses.map(s => (
                      <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
              </select>

              <select 
                  value={filterFormat}
                  onChange={(e) => setFilterFormat(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                  <option value="all">Todas Categorias (Formatos)</option>
                  {uniqueFormats.map((fmt, idx) => (
                      <option key={idx} value={fmt}>{fmt}</option>
                  ))}
              </select>
          </div>

          {(filterClient !== 'all' || filterStatus !== 'all' || filterFormat !== 'all') && (
              <button 
                onClick={() => {
                    setFilterClient('all');
                    setFilterStatus('all');
                    setFilterFormat('all');
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
              >
                  Limpar Filtros
              </button>
          )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Production vs Goal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Volume de Produção (Filtrado)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={postsPerClient}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="Concluídos" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Pendentes" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                {filterClient === 'all' && filterStatus === 'all' && (
                     <Bar dataKey="Meta" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={5} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribuição de Status (Funil)</h3>
          <div className="h-80 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statuses.find(s => s.label === entry.name)?.colorClass.includes('emerald') ? '#10b981' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
             <p className="text-indigo-100 text-sm font-medium uppercase">Total de Posts (Filtro)</p>
             <p className="text-4xl font-bold mt-2">{filteredPosts.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-200">
             <p className="text-emerald-100 text-sm font-medium uppercase">Concluídos (Filtro)</p>
             <p className="text-4xl font-bold mt-2">
                {totalCompleted} <span className="text-lg opacity-80 font-normal">/ {filteredPosts.length}</span>
             </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
             <p className="text-slate-500 text-sm font-medium uppercase">Categorias Encontradas</p>
             <p className="text-4xl font-bold mt-2 text-slate-800">{uniqueFormats.length}</p>
          </div>
      </div>
    </div>
  );
};

export default Reports;