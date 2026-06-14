import { ReactNode } from "react";

export function PipelineViewShell(props: { children: ReactNode }) {
  return <div className="flex flex-col space-y-4 flex-1 min-h-0">{props.children}</div>;
}

