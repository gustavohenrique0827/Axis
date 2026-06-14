import { Card } from "../../../../components/ui/card";

import { LeadsTableDesktop } from "./LeadsTableDesktop";
import { LeadsCardsMobile } from "./LeadsCardsMobile";

export function LeadsTable(props: {
  leads: any[];
  sellers: string[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  temperatureFilter: string;
  onTemperatureChange: (v: string) => void;
  sortOrder: "desc" | "asc";
  onSortToggle: () => void;
  onUpdateLead: (leadId: string, payload: any) => void;
  onSelectLead: (lead: any) => void;
}) {
  const { leads, sellers, onUpdateLead, onSelectLead } = props;

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

