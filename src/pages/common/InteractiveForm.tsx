import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Zap, Home, Heart, GraduationCap, Briefcase, Rocket, ShieldCheck, Smartphone } from 'lucide-react';
import { MascotMIA6 } from '../../components/MascotMIA6';

const niches: Record<string, any> = {
  "mia-6": {
    name: "Axis Core Systems",
    title: "Implante o Axis na Sua Empresa",
    subtitle: "Automatize processos, integre o MIA-6 e escale a sua operação de vendas de ponta a ponta.",
    icon: Rocket,
    color: "blue",
    bgGradient: "from-blue-900 to-slate-900",
    questions: [
      { id: 'q1', type: 'input', subtype: 'text', title: "Qual o seu nome completo?", placeholder: "João da Silva" },
      { id: 'q2', type: 'input', subtype: 'text', title: "Qual é o nome da sua empresa?", placeholder: "Ex: Axis Innovations" },
      { id: 'q3', type: 'input', subtype: 'text', title: "Qual o CNPJ da empresa?", placeholder: "00.000.000/0000-00" },
      { id: 'q4', type: 'choice', title: "Qual o tamanho atual da sua equipe de vendas?", options: ["Sou sozinho", "2 a 5 vendedores", "6 a 15 vendedores", "Mais de 15"] },
      { id: 'q5', type: 'choice', title: "Qual o seu faturamento médio mensal?", options: ["Até R$ 50 mil", "R$ 50k a R$ 200k", "R$ 200k a 1 Milhão", "Mais de 1 Milhão"] },
      { id: 'q6', type: 'choice', title: "Qual seu principal desafio hoje?", options: ["Desorganização de Leads", "Baixa Conversão", "Falta de Automação/IA", "Métricas Inexatas"] },
      { id: 'q7', type: 'input', subtype: 'email', title: "Qual o seu e-mail corporativo?", placeholder: "joao@empresa.com.br" },
      { id: 'q8', type: 'input', subtype: 'tel', title: "Qual o seu WhatsApp corporativo?", placeholder: "(11) 99999-9999" },
    ]
  },
  apple: {
    name: "Revenda Premium Apple",
    title: "Escale a Venda dos Seus Devices",
    subtitle: "Estruture sua operação, fidelize clientes e escale seu faturamento de forma inteligente.",
    icon: Smartphone,
    color: "slate",
    bgGradient: "from-slate-900 to-black",
    questions: [
      { id: 'q1', type: 'choice', title: "Qual é o carro-chefe da sua operação hoje?", options: ["iPhones Seminovos", "iPhones Lacrados", "MacBooks & iPads", "Acessórios e Assistência"] },
      { id: 'q2', type: 'choice', title: "Qual o seu volume atual de vendas por mês?", options: ["Iniciando (Até 10 aparelhos)", "Crescendo (10 a 50 aparelhos)", "Escalando (50 a 150 aparelhos)", "Alta Escala (+150 aparelhos)"] },
      { id: 'q3', type: 'choice', title: "O que mais trava o seu crescimento hoje?", options: ["Gestão de Estoque e Compras", "Falta de Leads Qualificados", "Baixa Conversão no WhatsApp", "Organização da Equipe"] },
      { id: 'q4', type: 'input', subtype: 'text', title: "Qual o nome do seu negócio?", placeholder: "Ex: iStore Premium" },
      { id: 'q5', type: 'input', subtype: 'tel', title: "Qual o seu WhatsApp para enviarmos uma estratégia grátis?", placeholder: "(11) 99999-9999" },
    ]
  },
  solar: {
    name: "Energia Solar",
    title: "Projetos Fotovoltaicos",
    subtitle: "Simule sua economia e dê o primeiro passo para a energia limpa.",
    icon: Zap,
    color: "yellow",
    bgGradient: "from-amber-900 to-slate-900",
    questions: [
      { id: 'q1', type: 'choice', title: "Qual o seu gasto médio mensal com energia?", options: ["Até R$ 500", "R$ 500 a R$ 1.000", "R$ 1.000 a R$ 2.500", "Acima de R$ 2.500"] },
      { id: 'q2', type: 'choice', title: "O seu imóvel/terreno é próprio ou alugado?", options: ["Próprio", "Alugado", "Em construção", "Apenas lote"] },
      { id: 'q3', type: 'input', subtype: 'text', title: "Como podemos te chamar?", placeholder: "Seu nome completo" },
      { id: 'q4', type: 'input', subtype: 'tel', title: "Qual número mandaremos o estudo de viabilidade?", placeholder: "(11) 99999-9999" },
    ]
  },
  imobiliaria: {
    name: "Imobiliária",
    title: "Encontre o Imóvel Ideal",
    subtitle: "Mapeamos os melhores imóveis de acordo com seu perfil.",
    icon: Home,
    color: "emerald",
    bgGradient: "from-emerald-900 to-slate-900",
    questions: [
      { id: 'q1', type: 'choice', title: "Você está buscando um imóvel para:", options: ["Morar", "Investir", "Comercial / Empresa"] },
      { id: 'q2', type: 'choice', title: "Qual o seu formato preferido?", options: ["Apartamento", "Casa em Condomínio", "Casa de Rua", "Cobertura/Duplex"] },
      { id: 'q3', type: 'choice', title: "Qual sua pretensão de investimento?", options: ["Até R$ 500 mil", "R$ 500k a 1 Milhão", "1 a 3 Milhões", "Acima de 3 Milhões"] },
      { id: 'q4', type: 'input', subtype: 'text', title: "Qual é o seu nome?", placeholder: "Nome completo" },
      { id: 'q5', type: 'input', subtype: 'tel', title: "Deixe seu WhatsApp para receber as opções secretas", placeholder: "(11) 99999-9999" },
    ]
  },
  clinica: {
    name: "Clínicas & Saúde",
    title: "Agende seu Atendimento",
    subtitle: "Especialistas focados na sua saúde com atendimento premium.",
    icon: Heart,
    color: "rose",
    bgGradient: "from-rose-900 to-slate-900",
    questions: [
      { id: 'q1', type: 'choice', title: "O atendimento será por Plano de Saúde ou Particular?", options: ["Plano de Saúde", "Particular", "Ainda não sei"] },
      { id: 'q2', type: 'choice', title: "Qual especialidade você busca hoje?", options: ["Clínica Geral", "Dermatologia", "Nutrição", "Outra Especialidade"] },
      { id: 'q3', type: 'input', subtype: 'text', title: "Qual o nome do paciente?", placeholder: "Nome completo" },
      { id: 'q4', type: 'input', subtype: 'tel', title: "Qual WhatsApp para confirmação do agendamento?", placeholder: "(11) 99999-9999" },
    ]
  },
  educacao: {
    name: "Educação Corporativa",
    title: "Evolua sua Carreira",
    subtitle: "Trilhas de conhecimento desenhadas para resultados práticos.",
    icon: GraduationCap,
    color: "purple",
    bgGradient: "from-purple-900 to-slate-900",
    questions: [
      { id: 'q1', type: 'choice', title: "Qual o seu nível de experiência atual?", options: ["Iniciante / Estudante", "Pleno", "Sênior", "Liderança / Executivo"] },
      { id: 'q2', type: 'choice', title: "Qual seu principal objetivo?", options: ["Promoção / Salário maior", "Transição de Carreira", "Criar um negócio", "Especialização técnica"] },
      { id: 'q3', type: 'input', subtype: 'text', title: "Como gosta de ser chamado?", placeholder: "Seu nome" },
      { id: 'q4', type: 'input', subtype: 'email', title: "Para qual e-mail enviamos o seu diagnóstico?", placeholder: "voce@email.com" },
    ]
  }
};

export function InteractiveForm() {
  const { niche } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Fallback to 'apple' if invalid niche
  const formConfig = niches[niche || ''] || niches['apple'];
  const totalSteps = formConfig.questions.length;
  const currentQuestion = formConfig.questions[currentStep];

  useEffect(() => {
    // Reset state when niche changes
    setCurrentStep(0);
    setAnswers({});
    setInputValue('');
    setIsCompleted(false);
  }, [niche]);

  const handleChoice = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
    goToNextStep();
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: inputValue }));
    setInputValue('');
    goToNextStep();
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
      // Aqui faria a requisição para enviar o Lead para o Axis CRM backend
      console.log('Lead Capturado:', { nicho: formConfig.name, answers });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const colorVariants: Record<string, { ring: string, bg: string, text: string, hover: string, buttonText?: string }> = {
    blue: { ring: "focus:ring-blue-500", bg: "bg-blue-600", text: "text-blue-400", hover: "hover:border-blue-500/50 hover:bg-blue-500/10" },
    yellow: { ring: "focus:ring-amber-500", bg: "bg-amber-500", text: "text-amber-400", hover: "hover:border-amber-500/50 hover:bg-amber-500/10" },
    emerald: { ring: "focus:ring-emerald-500", bg: "bg-emerald-600", text: "text-emerald-400", hover: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
    rose: { ring: "focus:ring-rose-500", bg: "bg-rose-600", text: "text-rose-400", hover: "hover:border-rose-500/50 hover:bg-rose-500/10" },
    purple: { ring: "focus:ring-purple-500", bg: "bg-purple-600", text: "text-purple-400", hover: "hover:border-purple-500/50 hover:bg-purple-500/10" },
    slate: { ring: "focus:ring-slate-300", bg: "bg-slate-200", text: "text-slate-300", hover: "hover:border-slate-400/50 hover:bg-slate-400/10", buttonText: "text-slate-900" },
  };

  const theme = colorVariants[formConfig.color];
  const Icon = formConfig.icon;

  if (isCompleted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${formConfig.bgGradient} flex items-center justify-center p-4`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0B1120]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-lg w-full text-center shadow-2xl"
        >
          <div className={`w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner ${theme.text}`}>
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Inscrição Recebida!</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Obrigado pelo seu tempo. Nossa equipe já recebeu seus dados e os analisará para um atendimento totalmente personalizado. Retornaremos em breve.
          </p>
          <button 
            onClick={() => navigate('/')}
            className={`w-full py-4 rounded-xl font-bold transition-all ${theme.bg} ${theme.buttonText || 'text-white'} hover:opacity-90 shadow-lg`}
          >
            Voltar ao Início
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${formConfig.bgGradient} flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      {/* Decorative Mascot for MIA-6 Form */}
      {niche === 'mia-6' && (
        <div className="absolute top-1/2 right-[-200px] -translate-y-1/2 opacity-30 lg:opacity-100 lg:right-10 pointer-events-none xl:right-32">
          <MascotMIA6 className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]" />
        </div>
      )}

      <div className="w-full max-w-3xl relative z-10">
        
        {/* Header / Progress */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/5 shadow-lg ${theme.text}`}>
                  <Icon className="w-5 h-5" />
               </div>
               <div>
                  <h1 className="text-white font-bold text-sm tracking-widest uppercase opacity-90">{formConfig.name}</h1>
                  <p className="text-white/50 text-xs font-mono">Passo {currentStep + 1} de {totalSteps}</p>
               </div>
            </div>

            <div className="flex gap-1">
               {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= currentStep ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
               ))}
            </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0B1120]/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[400px] flex flex-col relative">
          
          {/* Navigation Top Bar */}
          <div className="absolute top-4 left-4 z-20">
            {currentStep > 0 && (
                <button onClick={goToPrevStep} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8 sm:p-12 flex-1 flex flex-col justify-center"
            >
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-8 leading-tight">
                {currentQuestion.title}
              </h2>

              {currentQuestion.type === 'choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleChoice(option)}
                      className={`text-left p-6 rounded-2xl border border-white/10 bg-white/5 transition-all group relative overflow-hidden ${theme.hover}`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-slate-200 font-medium text-lg leading-snug group-hover:text-white transition-colors">
                           {option}
                        </span>
                        <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/10 transition-all">
                           <ArrowRight className="w-3 h-3 text-transparent group-hover:text-white transition-all" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'input' && (
                <form onSubmit={handleInputSubmit} className="flex flex-col gap-6">
                  <input
                    type={currentQuestion.subtype || 'text'}
                    autoFocus
                    placeholder={currentQuestion.placeholder}
                    value={inputValue}
                    onChange={(e) => {
                       let val = e.target.value;
                       if (currentQuestion.id === 'q3' && niche === 'mia-6') {
                          val = val.replace(/\D/g, '');
                          let formatted = val;
                          if (val.length > 2) formatted = `${val.slice(0, 2)}.${val.slice(2)}`;
                          if (val.length > 5) formatted = `${val.slice(0, 2)}.${val.slice(2, 5)}.${val.slice(5)}`;
                          if (val.length > 8) formatted = `${val.slice(0, 2)}.${val.slice(2, 5)}.${val.slice(5, 8)}/${val.slice(8)}`;
                          if (val.length > 12) formatted = `${val.slice(0, 2)}.${val.slice(2, 5)}.${val.slice(5, 8)}/${val.slice(8, 12)}-${val.slice(12, 14)}`;
                          setInputValue(formatted);
                       } else if (currentQuestion.subtype === 'tel') {
                          val = val.replace(/\D/g, '');
                          let formatted = val;
                          if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                          if (val.length > 6) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`;
                          setInputValue(formatted.slice(0, 15));
                       } else {
                          setInputValue(val);
                       }
                    }}
                    className={`w-full bg-white/5 border border-white/20 rounded-2xl p-6 text-xl text-white outline-none placeholder:text-slate-500 transition-all focus:border-white/50 focus:bg-white/10 ${theme.ring}`}
                  />
                  <div className="flex justify-end">
                      <button 
                         type="submit"
                         disabled={!inputValue.trim()}
                         className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.bg} ${theme.buttonText || 'text-white'} shadow-lg`}
                      >
                         Continuar <ArrowRight className="w-5 h-5" />
                      </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-white/40 font-mono tracking-wide">
          <p>Powered by Axis CRM ✦ Captação Segura e Inteligente</p>
        </div>

      </div>
    </div>
  );
}
