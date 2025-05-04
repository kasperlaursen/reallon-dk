import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertTriangle } from "lucide-react";

interface CPIErrorAlertProps {
  error: string;
}

export function CPIErrorAlert({ error }: CPIErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Fejl ved indlæsning af CPI data</AlertTitle>
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  );
} 