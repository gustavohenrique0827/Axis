import { LeadsTableDesktop } from "./LeadsTableDesktop";
import { LeadsCardsMobile } from "./LeadsCardsMobile";

interface LeadsTableProps {
  leads: any[];
  sellers: string[];
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
  temperatureFilter?: string;
  onTemperatureChange?: (v: string) => void;
  sortOrder?: "desc" | "asc";
  onSortToggle?: () => void;
  onUpdateLead: (leadId: string, payload: any) => void;
  onSelectLead: (lead: any) => void;
}

export function LeadsTable({ leads, sellers, onUpdateLead, onSelectLead }: LeadsTableProps) {
  return (
    <>
      <LeadsTableDesktop
        filteredLeads={leads}
        setSelectedLead={onSelectLead}
        updateLead={onUpdateLead}
        sellers={sellers}
      />

      <LeadsCardsMobile
        filteredLeads={leads}
        setSelectedLead={onSelectLead}
        updateLead={onUpdateLead}
        sellers={sellers}
      />
    </>
  );
}

