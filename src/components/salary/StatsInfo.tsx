import { DialogDescription } from "../ui/dialog";
import { CHART_CONFIG } from "../../constants";

export const TotalChangeInfo = () => (
  <>
    <DialogDescription>
      Den samlede ændring viser forskellen mellem din første og seneste løn, både i nominelle og reelle termer.
    </DialogDescription>
    
    <ul className="list-disc pl-6 space-y-2">
      <li>
        <strong style={{ color: CHART_CONFIG.salary.color }}>Nominel ændring</strong> er den rå forskel i kroner og procent, uden hensyn til inflation.
      </li>
      <li>
        <strong style={{ color: CHART_CONFIG.realSalary.color }}>Real ændring</strong> viser den faktiske købekraftsændring, når der tages højde for inflation.
      </li>
    </ul>
  </>
);

export const FluctuationsInfo = () => (
  <>
    <DialogDescription>
      De største udsving viser de mest markante ændringer i din realløn mellem to på hinanden følgende lønændringer.
    </DialogDescription>
    
    <ul className="list-disc pl-6 space-y-2">
      <li>
        <strong className="text-green-500">Største stigning</strong> viser den periode, hvor din realløn steg mest i forhold til forrige løn.
      </li>
      <li>
        <strong className="text-red-500">Største fald</strong> viser den periode, hvor din realløn faldt mest i forhold til forrige løn.
      </li>
      <li>
        Disse tal kan hjælpe dig identificere vigtige karrierebegivenheder som forfremmelser eller jobskifte.
      </li>
    </ul>
  </>
);

export const YearlyChangeInfo = () => (
  <>
    <DialogDescription>
      12-måneders ændringen sammenligner din nuværende løn med lønnen for cirka et år siden.
    </DialogDescription>
    
    <ul className="list-disc pl-6 space-y-2">
      <li>
        Dette giver et godt billede af den kortsigtede lønudvikling og kan bruges til at vurdere, om din løn følger med inflationen.
      </li>
      <li>
        <strong style={{ color: CHART_CONFIG.salary.color }}>Nominel ændring</strong> viser den direkte lønforskel.
      </li>
      <li>
        <strong style={{ color: CHART_CONFIG.realSalary.color }}>Real ændring</strong> viser om din købekraft er steget eller faldet det seneste år.
      </li>
    </ul>
  </>
);

export const AverageChangeInfo = () => (
  <>
    <DialogDescription>
      Den årlige ændring viser din løns gennemsnitlige udvikling over hele perioden, udjævnet til en årlig rate.
    </DialogDescription>
    
    <ul className="list-disc pl-6 space-y-2">
      <li>
        Beregningen bruger CAGR (Compound Annual Growth Rate) for at give et retvisende billede af den årlige vækst.
      </li>
      <li>
        <strong style={{ color: CHART_CONFIG.salary.color }}>Nominel vækst</strong> viser den gennemsnitlige årlige stigning i din faktiske løn.
      </li>
      <li>
        <strong style={{ color: CHART_CONFIG.realSalary.color }}>Real vækst</strong> viser den gennemsnitlige årlige stigning i din købekraft.
      </li>
      <li>
        Dette tal er særligt nyttigt til at vurdere din langsigtede lønudvikling og karriereprogression.
      </li>
    </ul>
  </>
); 