import React, { useState, useEffect } from 'react';
import { 
  Video, Mic, Camera, Monitor, 
  MessageSquare, Users, Clock, ShieldCheck,
  Phone, Globe, Zap, Settings,
  Activity, ClipboardList, Plus,
  Share2, Maximize2, LogIn, ExternalLink, Loader2
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { initAuth, googleSignIn, logout, getAccessToken } from "../../lib/google-auth";
import { createMeetSpace, MeetSpace } from "../../lib/meet";
import { toast } from "sonner";

const activeConferences = [
  { id: 1, patient: 'Marcelo Dias', dr: 'Dr. Lucas Ferro', startTime: '15:30', duration: '12:00', status: 'In Call' },
  { id: 2, patient: 'Beatriz Santos', dr: 'Dra. Ana Costa', startTime: '16:00', duration: '00:00', status: 'Waiting' },
];

export default function TelemedicinaDashboard() {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<MeetSpace | null>(null);
  const [signalStrength, setSignalStrength] = useState(100);

  useEffect(() => {
    let interval: any;
    if (activeMeeting) {
      interval = setInterval(() => {
        setSignalStrength(prev => {
          const change = Math.floor(Math.random() * 5) - 2;
          return Math.max(85, Math.min(100, prev + change));
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeMeeting]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        setGoogleUser(user);
        setToken(accessToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setToken(result.accessToken);
        toast.success("Conectado ao Google Workspace!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar ao Google.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartMeeting = async () => {
    if (!token) {
      toast.error("Por favor, conecte sua conta Google primeiro.");
      return;
    }

    setIsCreatingMeeting(true);
    try {
      const space = await createMeetSpace(token);
      setActiveMeeting(space);
      toast.success("Nova sala virtual criada no Google Meet!");
      // Optionally open automatically
      window.open(space.meetingUri, '_blank');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao criar sala virtual.");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  return (
    <PageContainer 
      title="Telemedicina Axis" 
      description="Consultas virtuais criptografadas, monitoramento remoto e chat em tempo real via Google Meet."
      actions={
        <div className="flex gap-3">
          {!googleUser ? (
            <Button 
              onClick={handleGoogleLogin}
              disabled={isConnecting}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Conectar Google Workspace
            </Button>
          ) : (
            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-1">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Conectado</span>
                  <span className="text-[10px] font-bold text-white/60">{googleUser.email}</span>
               </div>
               <button onClick={() => logout()} className="text-emerald-400 hover:text-white transition-colors">
                  <Maximize2 className="w-4 h-4 rotate-45" />
               </button>
            </div>
          )}

          <Button 
            onClick={handleStartMeeting}
            disabled={!token || isCreatingMeeting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-indigo-950/30"
          >
             {isCreatingMeeting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
             Gerar Sala Google Meet
          </Button>
        </div>
      }
    >
      <div className="grid lg:grid-cols-4 gap-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Virtual Room & Controls */}
        <div className="lg:col-span-3 space-y-6">
           <Card className="aspect-video bg-[var(--color-surface)] border-white/10 relative overflow-hidden group shadow-2xl">
              {activeMeeting ? (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-10">
                     <div className="p-6 bg-indigo-600 rounded-full mb-6 animate-pulse">
                        <Video className="w-12 h-12 text-white" />
                     </div>
                     <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">Sala Google Meet Ativa</h2>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center gap-2">
                        Código: {activeMeeting.meetingCode}
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        Status: <span className="text-emerald-400 font-black">LIVE</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        Sinal: <span className={signalStrength > 90 ? "text-emerald-400" : "text-amber-400"}>{signalStrength}%</span>
                     </p>
                     
                     <div className="flex gap-4">
                        <Button 
                          onClick={() => window.open(activeMeeting.meetingUri, '_blank')}
                          className="bg-white text-indigo-900 hover:bg-slate-200 rounded-2xl h-14 px-10 text-xs font-black uppercase tracking-widest gap-2 shadow-2xl"
                        >
                           <ExternalLink className="w-5 h-5" /> Abrir Chamada
                        </Button>
                        <Button 
                          onClick={() => setActiveMeeting(null)}
                          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl h-14 px-10 text-xs font-black uppercase tracking-widest shadow-2xl"
                        >
                           Finalizar Sessão
                        </Button>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center relative">
                      <div className="w-32 h-32 rounded-full bg-slate-800 animate-pulse mx-auto mb-4 border-2 border-white/5" />
                      <h3 className="text-xl font-black text-white italic tracking-tighter">Aguardando Conexão</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">
                        {token ? "Clique em 'Gerar Sala' para iniciar" : "Conecte sua conta Google Workspace"}
                      </p>
                  </div>
                </div>
              )}

              {/* Patient Data Overlay */}
              <div className="absolute top-8 left-8 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                 <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold">Freq. Cardíaca</p>
                       <p className="text-sm font-black text-white font-mono italic">72 BPM</p>
                    </div>
                 </div>
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                 <button onClick={() => setIsMicOn(!isMicOn)} className={`p-5 rounded-2xl border transition-all ${isMicOn ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-rose-500 border-rose-600 text-white'}`}>
                    <Mic className="w-6 h-6" />
                 </button>
                 <button onClick={() => setIsCameraOn(!isCameraOn)} className={`p-5 rounded-2xl border transition-all ${isCameraOn ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-rose-500 border-rose-600 text-white'}`}>
                    <Camera className="w-6 h-6" />
                 </button>
                 <button className="p-5 rounded-2xl bg-rose-600 border border-rose-700 text-white hover:bg-rose-700 active:scale-95 transition-all">
                    <Phone className="w-6 h-6 rotate-[135deg]" />
                 </button>
                 <button className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10">
                    <Share2 className="w-6 h-6" />
                 </button>
              </div>

              <div className="absolute top-8 right-8">
                 <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-2 m-auto" />
                    <span className="text-[10px] font-black text-white px-2 py-1">REC 12:42</span>
                 </div>
              </div>
           </Card>

           <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-400" /> Notas da Consulta
                 </h4>
                 <textarea 
                   placeholder="Digite as observações em tempo real..."
                   className="w-full h-40 bg-white/5 border border-white/5 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                 />
                 <Button className="w-full mt-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl hover:bg-indigo-600 hover:border-indigo-600 transition-all">Anexar ao Prontuário</Button>
              </Card>

              <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5 flex flex-col justify-between">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-indigo-400" /> Chat com Paciente
                    </h4>
                    <div className="space-y-4">
                       <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0" />
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                             <p className="text-xs text-slate-300 leading-relaxed font-medium">Os exames de sangue já estão disponíveis no portal?</p>
                          </div>
                       </div>
                       <div className="flex gap-3 justify-end">
                          <div className="bg-indigo-600/20 rounded-2xl p-4 border border-indigo-500/10">
                             <p className="text-xs text-white leading-relaxed font-medium">Sim, acabaram de ser anexados ao sistema.</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="relative mt-10">
                    <input type="text" placeholder="Mensagem..." className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-6 pr-12 text-xs text-white" />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400"><Share2 className="w-5 h-5" /></button>
                 </div>
              </Card>
           </div>
        </div>

        {/* Call Queue & Health Data */}
        <div className="space-y-6">
           <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Fila Virtual</h4>
              <div className="space-y-4">
                 {activeConferences.map((conf) => (
                    <div key={conf.id} className={`p-4 rounded-2xl border transition-all ${conf.status === 'In Call' ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-white/5 border-white/5 opacity-60'}`}>
                       <p className="text-sm font-black text-white mb-1">{conf.patient}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">{conf.dr}</p>
                       <div className="flex items-center justify-between mt-4">
                          <span className="text-[9px] font-black text-indigo-400 bg-white/5 px-2 py-1 rounded-lg uppercase">{conf.status}</span>
                          <span className="text-xs font-mono text-slate-500">{conf.startTime}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-20 h-20 text-indigo-400" />
              </div>
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Zap className="w-4 h-4" /> MIA Teleanalisys
              </h4>
              <p className="text-xs text-slate-400 italic mb-6 leading-relaxed">
                 "Durante a chamada, detectamos uma saturação de oxigênio abaixo do normal (94%). Recomendado repouso imediato."
              </p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                 <span className="text-[9px] font-black text-rose-400 uppercase">Alerta Clínico</span>
              </div>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                 <Settings className="w-5 h-5 text-slate-600 mb-2" />
                 <span className="text-[9px] font-black text-slate-500 uppercase">Config</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                 <Users className="w-5 h-5 text-slate-600 mb-2" />
                 <span className="text-[9px] font-black text-slate-500 uppercase">Grupal</span>
              </div>
           </div>
        </div>

      </div>
    </PageContainer>
  );
}
