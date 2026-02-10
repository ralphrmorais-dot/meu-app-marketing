import React, { useState } from 'react';
import { WorkflowStatus } from '../types';
import { STATUS_COLOR_OPTIONS } from '../constants';
import { Plus, Trash2, Edit2, X, Check, CalendarRange } from 'lucide-react';

interface SettingsManagerProps {
  statuses: WorkflowStatus[];
  onAddStatus: (status: WorkflowStatus) => void;
  onUpdateStatus: (status: WorkflowStatus) => void;
  onDeleteStatus: (id: string) => void;
  onGenerateYearlyContent?: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ statuses, onAddStatus, onUpdateStatus, onDeleteStatus, onGenerateYearlyContent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<{label: string, colorClass: string}>({
    label: '',
    colorClass: STATUS_COLOR_OPTIONS[0].value
  });

  const handleStartAdd = () => {
    setFormData({ label: '', colorClass: STATUS_COLOR_OPTIONS[0].value });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (status: WorkflowStatus) => {
    setFormData({ label: status.label, colorClass: status.colorClass });
    setEditingId(status.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label) return;

    if (editingId) {
      onUpdateStatus({ id: editingId, ...formData });
    } else {
      onAddStatus({ 
        id: formData.label.toLowerCase().replace(/\s+/g, '-'), 
        ...formData 
      });
    }
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Bulk Generation Section */}
      {onGenerateYearlyContent && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarRange className="text-indigo-600" />
                        Planejamento Anual 2026
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 max-w-lg">
                        Gere automaticamente 12 posts (espaçados mensalmente) para <strong>todos os meses do ano de 2026</strong> para <strong>todos os clientes ativos</strong>. Use com cautela.
                    </p>
                </div>
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onGenerateYearlyContent();
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <CalendarRange size={18} /> Gerar Calendário 2026
                </button>
             </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Status de Workflow</h2>
                <p className="text-sm text-slate-500">Personalize os status das postagens para o seu fluxo de trabalho.</p>
            </div>
            {!isAdding && (
                <button 
                type="button"
                onClick={handleStartAdd}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                <Plus size={18} /> Novo Status
                </button>
            )}
        </div>

        {isAdding && (
          <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-indigo-100">
            <h3 className="font-semibold text-slate-700 mb-4">{editingId ? 'Editar Status' : 'Novo Status'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome do Status</label>
                    <input 
                        type="text" 
                        value={formData.label}
                        onChange={(e) => setFormData({...formData, label: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ex: Em Revisão"
                        required
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cor</label>
                    <select
                        value={formData.colorClass}
                        onChange={(e) => setFormData({...formData, colorClass: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {STATUS_COLOR_OPTIONS.map((opt, idx) => (
                            <option key={idx} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 flex-1 md:flex-none justify-center flex"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 flex-1 md:flex-none justify-center flex items-center gap-2"
                    >
                        <Check size={18} /> Salvar
                    </button>
                </div>
            </form>
            
            {/* Preview */}
            {formData.label && (
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Preview:</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${formData.colorClass}`}>
                        {formData.label}
                    </span>
                </div>
            )}
          </div>
        )}

        <div className="grid gap-3">
          {statuses.map(status => (
            <div key={status.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.colorClass.split(' ')[0]}`}>
                     <div className={`w-3 h-3 rounded-full ${status.colorClass.replace('bg-', 'bg-opacity-50 ')}`}></div>
                 </div>
                 <div>
                     <p className="font-semibold text-slate-800">{status.label}</p>
                     <p className="text-xs text-slate-400 font-mono">{status.id}</p>
                 </div>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2 ${status.colorClass}`}>
                    Exemplo
                 </span>
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                    type="button"
                    onClick={() => handleStartEdit(status)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                 >
                    <Edit2 size={18} />
                 </button>
                 <button 
                    type="button"
                    onClick={() => {
                        if (confirm(`Excluir o status "${status.label}"?`)) onDeleteStatus(status.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;