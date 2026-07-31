import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { Share2, Instagram, Facebook, Twitter, Linkedin, MessageCircle, Heart, Repeat, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";

const posts: any[] = [];

export default function MarketingSocial() {
  return (
    <PageContainer
      title="Social Media & Comunidade"
      subtitle="Acompanhe o engajamento e as estatísticas das suas redes sociais."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                 <Instagram className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs font-bold text-emerald-400">0%</span>
            </div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Seguidores</p>
            <h3 className="text-2xl font-black text-white">0</h3>
         </Card>
         <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                 <Linkedin className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-emerald-400">0%</span>
            </div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Conexões</p>
            <h3 className="text-2xl font-black text-white">0</h3>
         </Card>
         <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                 <Twitter className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-bold text-rose-400">0%</span>
            </div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Seguidores</p>
            <h3 className="text-2xl font-black text-white">0</h3>
         </Card>
         <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-800/10 flex items-center justify-center">
                 <Facebook className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-bold text-emerald-400">0%</span>
            </div>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Curtidas na Página</p>
            <h3 className="text-2xl font-black text-white">0</h3>
         </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-lg font-black text-white">Feed de Desempenho Recente</h3>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" className="bg-[var(--color-surface-elevated)] border border-white/10 text-slate-400 hover:text-white text-xs">Todos os Canais</Button>
           <Button variant="ghost" size="sm" className="bg-[var(--color-surface-elevated)] border border-white/10 text-slate-400 hover:text-white text-xs">Apenas Meta</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="p-5 bg-[var(--color-surface-elevated)] border-white/5 flex flex-col md:flex-row gap-6 hover:bg-[var(--color-surface-elevated)] transition-colors relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
               <div className="flex-1 relative z-10">
                 <div className="flex items-center gap-3 mb-3">
                   <div className={`p-2 rounded-lg ${
                     post.platform === 'Instagram' ? 'bg-pink-500/10 text-pink-500' :
                     post.platform === 'LinkedIn' ? 'bg-blue-600/10 text-blue-600' :
                     'bg-blue-400/10 text-blue-400'
                   }`}>
                     {post.platform === 'Instagram' && <Instagram className="w-4 h-4" />}
                     {post.platform === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                     {post.platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-white flex items-center gap-2">
                       {post.author}
                       <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">Sentimento Positivo</span>
                     </h4>
                     <p className="text-[10px] text-slate-500 font-medium">{post.date} • {post.platform}</p>
                   </div>
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed mb-4">
                   {post.content}
                 </p>
               </div>
               <div className="flex md:flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0 md:min-w-[200px] relative z-10">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                     <div className="flex items-center gap-2 text-slate-400">
                       <Heart className="w-4 h-4 hover:text-pink-500 cursor-pointer" />
                       <span className="text-xs font-bold">{post.likes}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-400">
                       <MessageCircle className="w-4 h-4 hover:text-blue-400 cursor-pointer" />
                       <span className="text-xs font-bold">{post.comments}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-400">
                       <Repeat className="w-4 h-4 hover:text-emerald-400 cursor-pointer" />
                       <span className="text-xs font-bold">{post.shares}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-400">
                       <Eye className="w-4 h-4 hover:text-indigo-400 cursor-pointer" />
                       <span className="text-xs font-bold">{post.views}</span>
                     </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-xs w-full font-bold">
                    Impulsionar Post
                  </Button>
               </div>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5">
             <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Status de Integração</h3>
             <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-300">Página do Facebook</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-slate-300">Conta Instagram</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-300">Company Page</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </li>
             </ul>
             <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10">Reconectar Contas</Button>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-[var(--color-surface-elevated)] border-indigo-500/20">
             <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Insight Analítico IA</h3>
             <p className="text-xs text-slate-300 leading-relaxed mb-4">
               A ferramenta de IA do Axis CRM detectou que postagens com a palavra-chave <span className="text-indigo-400 font-bold">"Kanban"</span> geram 45% mais engajamento esta semana. Recomendamos aumentar a frequência deste tópico.
             </p>
             <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30">Gerar Novas Ideias</Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
