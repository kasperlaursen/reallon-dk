import { InfoDialog } from "./InfoDialog";

export function AppHeader() {
  return (
    <header className="mt-4 mb-2 sm:mt-8 sm:mb-4 text-center relative">
      <div className="absolute right-0 top-0">
        <InfoDialog />
      </div>
      <h1 className="text-3xl font-bold mb-2">Realløn.dk</h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
        Se hvordan din løns købekraft har ændret sig over tid, sammenlignet
        med forbrugerprisindeksen.
      </p>
    </header>
  );
} 