import { useMemo } from 'react';
import { useDevProjects } from './useDevProjects';

export function useDevProjectsForFilter() {
  const { projects } = useDevProjects();

  return useMemo(() => {
    return (projects || []).map(p => ({
      id: p.id,
      name: p.name,
    }));
  }, [projects]);
}

