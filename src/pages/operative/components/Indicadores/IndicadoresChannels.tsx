import { Card } from "../../../../components/ui/card";
import { ArrowUpRight } from "lucide-react";

const CHANNELS = [
  { title: "Indicações", value: "0", sub: "0%", color: "text-[#06B6D4]" },
  { title: "Instagram", value: "0", sub: "0%", color: "text-[#06B6D4]" },
  { title: "LinkedIn", value: "0", sub: "0%", color: "text-[#06B6D4]" },
  { title: "Google Ads", value: "0", sub: "0%", color: "text-[#06B6D4]" },
];

export function IndicadoresChannels() {
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {CHANNELS.map((item, i) => (
        <Card key={i} className="p-5 border-white/5 bg-white/5 backdrop-blur-lg flex items-center justify-between group hover:bg-white/[0.08] transition-colors cursor-pointer">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">{item.title}</p>
            <h4 className="text-xl font-bold text-white">{item.value}</h4>
          </div>
          <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Card>
      ))}
    </div>
  );
}
