import { motion } from "motion/react";
import { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; path?: string }[];
}

export function PageContainer({ 
  children, 
  title, 
  description,
  subtitle,
  actions,
  breadcrumb 
}: PageContainerProps) {
  const location = useLocation();
  const displayDescription = description || subtitle;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb Pattern */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/app/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Início
            </Link>
            {breadcrumb?.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-700" />
                {item.path ? (
                  <Link to={item.path} className="hover:text-white transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-[#2563EB]">{item.label}</span>
                )}
              </div>
            ))}
            {!breadcrumb && (
               <>
                <ChevronRight className="w-3 h-3 text-slate-700" />
                <span className="text-[#2563EB]">{title}</span>
               </>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            {title}
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse hidden md:inline-block"></span>
          </h1>
          {displayDescription && (
            <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium">{displayDescription}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-50"></div>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
