import { DialogDescription } from "../ui/dialog";
import { CHART_CONFIG } from "../../constants";

export function ChartInfo() {
  return (
    <>
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
          Hvis din <span style={{ color: CHART_CONFIG.realSalary.color }}>realløn</span> ligger under <span style={{ color: CHART_CONFIG.cpiIndexed.color }}>indeks-lønnen</span>, har inflationen &quot;spist&quot; en del af din købekraft.
        </li>
        <li>
          Det valgte startpunkt (markeret med øje-ikonet) bruges som reference for beregningerne.
        </li>
      </ul>
      
      <div className="text-sm text-muted-foreground">
        Alle beregninger er baseret på de seneste tilgængelige CPI-data fra Danmarks Statistik.
      </div>
    </>
  );
} 