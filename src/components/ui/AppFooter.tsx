"use client";

import { Button } from "./button";

interface AppFooterProps {
  onClearData: () => void;
}

export function AppFooter({ onClearData }: AppFooterProps) {
  return (
    <footer className="mt-auto py-4 sm:py-6 text-center text-xs text-muted-foreground border-t">
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <div className="flex flex-col gap-2">
          <p>
            Data fra{" "}
            <a
              href="https://www.dst.dk/da/Statistik/emner/oekonomi/prisindeks/forbrugerprisindeks"
              target="_blank"
              className="text-primary underline hover:text-primary/80 transition-colors"
              rel="noopener noreferrer"
            >
              Danmarks Statistik forbrugerprisindeks
            </a>
            . Anvendelse af data er underlagt{" "}
            <a
              href="https://www.dst.dk/da/TilSalg/data-til-forskning/regler-og-datasikkerhed"
              target="_blank"
              className="text-primary underline hover:text-primary/80 transition-colors"
              rel="noopener noreferrer"
            >
              Danmarks Statistiks regler for brug af data
            </a>
            .
          </p>
          <p>
            Din indtastede data gemmes KUN lokalt i din browser og deles ikke
            med nogen. Ingen persondata eller mikrodata indsamles eller
            behandles.
          </p>
          <p className="text-[10px]">
            © {new Date().getFullYear()} Realløn.dk. Udviklet af{" "}
            <a
              href="https://twitter.com/kasperlaursen"
              target="_blank"
              className="text-primary hover:underline"
              rel="noopener noreferrer"
            >
              Kasper Laursen
            </a>
            . Dette er et uafhængigt værktøj og er ikke tilknyttet Danmarks
            Statistik.
          </p>
        </div>
        <Button variant="default" size="sm" onClick={onClearData}>
          Slet Data
        </Button>
      </div>
    </footer>
  );
}
