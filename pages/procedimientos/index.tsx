import { ProceduresView } from "@/procedures/views/ProceduresView";
import type { ProceduresViewProps } from "@/procedures/contracts/procedure-catalog-contract";

export default function ProcedimientosPage(props: ProceduresViewProps) {
  return <ProceduresView {...props} />;
}
