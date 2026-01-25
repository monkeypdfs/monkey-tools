import { ScriptsContainer } from "../components/scripts-container";
import { ScriptsHeader } from "../components/scripts-header";

export function ScriptsView() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <ScriptsHeader />
      <ScriptsContainer />
    </div>
  );
}
