import { InfoDialog } from "./InfoDialog";
import { ChartInfo } from "../chart/ChartInfo";

export function AppHeader() {
  return (
    <header className="mt-4 mb-2 sm:mt-8 sm:mb-4 text-center relative w-full max-w-2xl">
      <div className="absolute right-0 top-0">
        <InfoDialog title="Om beregningerne">
          <ChartInfo />
        </InfoDialog>
      </div>
      <h1 className="text-3xl font-bold mb-2">Realløn.dk</h1>
      <p className="text-base sm:text-lg text-muted-foreground mb-2">
        Se hvordan din løns købekraft har ændret sig over tid, sammenlignet
        med forbrugerprisindeksen.
      </p>
      <p className="text-sm text-muted-foreground/80 italic">
        Bemærk: Dette værktøj er kun til informationsbrug. Vi tager ikke ansvar for eventuelle fejl i beregningerne. 
        Verificér altid vigtige økonomiske beslutninger med en kvalificeret rådgiver.
      </p>
    </header>
  );
} 