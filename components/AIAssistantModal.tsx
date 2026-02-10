import React, { useState } from 'react';
import { X, Sparkles, Loader2, Copy, CheckCircle } from 'lucide-react';
import { Client, Post, PostStatus, SocialNetwork } from '../types';
import { generatePostIdeas, generateCaption, analyzeSchedule } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  posts: Post[];
  initialPost?: Post | null;
  onAddPost?: (post: Post) => void;
  onUpdatePost?: (post: Post) => void;
}

type Tab = 'ideas' | 'caption' | 'analyze';

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, clients, posts, initialPost, onAddPost, onUpdatePost }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialPost ? 'caption' : 'ideas');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // Can be array of ideas, or string caption
  
  if (!isOpen) return null;

  const handleGenerateIdeas = async () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    setLoading(true);
    setResult(null);
    const ideas = await generatePostIdeas(client);
    setResult(ideas);
    setLoading(false);
  };

  const handleGenerateCaption = async () => {
    if (!initialPost) return;
    const client = clients.find(c => c.id === initialPost.clientId);
    setLoading(true);
    const caption = await generateCaption(initialPost, client?.name || '');
    setResult(caption);
    setLoading(false);
  };
  
  const handleAnalyze = async () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    const clientPosts = posts.filter(p => p.clientId === client.id);
    setLoading(true);
    const analysis = await analyzeSchedule(clientPosts, client.name);
    setResult(analysis);
    setLoading(false);
  }

  const handleSaveIdea = (idea: any) => {
      if (onAddPost) {
          const newPost: Post = {
              id: Math.random().toString(36).substr(2, 9),
              clientId: selectedClientId,
              title: idea.title,
              date: new Date().toISOString().split('T')[0],
              status: PostStatus.IDEA,
              network: SocialNetwork.INSTAGRAM, // Default
              format: idea.format,
              copy: idea.concept
          };
          onAddPost(newPost);
          alert('Ideia adicionada ao quadro!');
      }
  }

  const handleSaveCaption = () => {
      if (onUpdatePost && initialPost && typeof result === 'string') {
          onUpdatePost({
              ...initialPost,
              copy: result
          });
          alert('Legenda salva no post!');
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="animate-pulse" />
            <h2 className="text-xl font-bold">Assistente IA</h2>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition-colors"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('ideas')}
            className={`flex-1 py-3 font-medium text-sm ${activeTab === 'ideas' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Gerar Ideias
          </button>
          <button 
             onClick={() => setActiveTab('caption')}
             disabled={!initialPost}
             className={`flex-1 py-3 font-medium text-sm ${activeTab === 'caption' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'} ${!initialPost && 'opacity-50 cursor-not-allowed'}`}
          >
            Escrever Legenda
          </button>
           <button 
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 py-3 font-medium text-sm ${activeTab === 'analyze' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Analisar Calendário
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select 
                  value={selectedClientId} 
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex-1 border-slate-300 rounded-lg p-2"
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button 
                  onClick={handleGenerateIdeas}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                  Gerar
                </button>
              </div>

              {result && Array.isArray(result) && (
                <div className="space-y-3 mt-4">
                  {result.map((idea: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group">
                      <div className="flex justify-between items-start">
                         <div>
                            <h4 className="font-bold text-slate-800">{idea.title}</h4>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded mt-1 inline-block">{idea.format}</span>
                            <p className="text-sm text-slate-600 mt-2">{idea.concept}</p>
                         </div>
                         <button 
                            onClick={() => handleSaveIdea(idea)}
                            className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-indigo-50 rounded"
                            title="Criar post com essa ideia"
                         >
                             <CheckCircle size={20} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'caption' && initialPost && (
             <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800">Post: {initialPost.title}</h3>
                    <p className="text-sm text-slate-500">{initialPost.format} • {initialPost.network}</p>
                </div>
                
                <button 
                  onClick={handleGenerateCaption}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                  {result ? 'Regerar Legenda' : 'Gerar Legenda'}
                </button>

                {result && typeof result === 'string' && (
                    <div className="mt-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-700 text-sm h-64 overflow-y-auto">
                            <ReactMarkdown>{result}</ReactMarkdown>
                        </div>
                        <button 
                            onClick={handleSaveCaption}
                            className="mt-2 w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg font-medium transition-colors"
                        >
                            Salvar no Post
                        </button>
                    </div>
                )}
             </div>
          )}
          
          {activeTab === 'analyze' && (
             <div className="space-y-4">
                 <div className="flex gap-2">
                <select 
                  value={selectedClientId} 
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex-1 border-slate-300 rounded-lg p-2"
                >
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                  Analisar
                </button>
              </div>
              
              {result && typeof result === 'string' && (
                   <div className="bg-white p-6 rounded-lg border border-slate-200 text-slate-700">
                       <h3 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="text-yellow-500" size={20}/> Análise do Consultor IA</h3>
                       <ReactMarkdown className="prose prose-sm">{result}</ReactMarkdown>
                   </div>
              )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;