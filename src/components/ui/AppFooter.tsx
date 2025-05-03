"use client";

import { Button } from "./button";
import { Github } from "lucide-react";

interface AppFooterProps {
  onClearData: () => void;
}

export function AppFooter({ onClearData }: AppFooterProps) {
  return (
    <footer className="mt-auto py-4 sm:py-6 text-center text-xs text-muted-foreground border-t">
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <div className="flex flex-col gap-2">
          <p>
            Dette er et uafhængigt værktøj og er ikke tilknyttet Danmarks
            Statistik.
          </p>
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
            .{" "}
          </p>
          <p>
            Anvendelse af data er underlagt{" "}
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
            med nogen.{" "}
          </p>
          <p>Ingen persondata eller mikrodata indsamles eller behandles.</p>
          <p className="text-[10px]">
            © {new Date().getFullYear()} Realløn.dk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={onClearData}>
            Slet Data
          </Button>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a
              href="https://github.com/kasperlaursen/reallon-dk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} />
              <span>Se kildekoden</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
