import { Button } from "./button";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { CHART_CONFIG } from "../../constants";

interface InfoDialogProps {
  className?: string;
  buttonClassName?: string;
}

export function InfoDialog({ className, buttonClassName }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={buttonClassName ?? "h-9 w-9"}
        >
          <Info className="h-5 w-5" />
          <span className="sr-only">Vis information om beregninger</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Om beregningerne</DialogTitle>
          <div className="space-y-4 text-left text-muted-foreground text-sm">
            <DialogDescription>
              Realløn.dk hjælper dig med at forstå, hvordan din løns købekraft har udviklet sig over tid i forhold til inflationen.
            </DialogDescription>
            
            <div>
              <strong>Grafen viser tre forskellige lønværdier:</strong>
            </div>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong style={{ color: CHART_CONFIG.salary.color }}>Nominel løn</strong> viser dine faktiske lønninger over tid uden justering for inflation - dette er de tal, du har indtastet.
              </li>
              <li>
                <strong style={{ color: CHART_CONFIG.realSalary.color }}>Realløn</strong> viser hvad din løn på et givent tidspunkt svarer til i købekraft ved startpunktet - dette giver dig et billede af din reelle købekraft.
              </li>
              <li>
                <strong style={{ color: CHART_CONFIG.cpiIndexed.color }}>Indeks løn</strong> viser hvordan din startløn ville have udviklet sig, hvis den kun fulgte inflationen - dette er dit sammenligningsgrundlag.
              </li>
            </ul>
            
            <div>
              <strong>Sådan læses grafen:</strong>
            </div>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Hvis din <span style={{ color: CHART_CONFIG.realSalary.color }}>realløn</span> ligger over <span style={{ color: CHART_CONFIG.cpiIndexed.color }}>indeks-lønnen</span>, har du fået mere i løn end inflationen tilsiger.
              </li>
              <li>
                Hvis din <span style={{ color: CHART_CONFIG.realSalary.color }}>realløn</span> ligger under <span style={{ color: CHART_CONFIG.cpiIndexed.color }}>indeks-lønnen</span>, har inflationen "spist" en del af din købekraft.
              </li>
              <li>
                Det valgte startpunkt (markeret med øje-ikonet) bruges som reference for beregningerne.
              </li>
            </ul>
            
            <div className="text-sm text-muted-foreground">
              Alle beregninger er baseret på de seneste tilgængelige CPI-data fra Danmarks Statistik.
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 