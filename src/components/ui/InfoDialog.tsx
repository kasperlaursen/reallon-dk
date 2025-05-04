import { Button } from "./button";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface InfoDialogProps {
  className?: string;
  buttonClassName?: string;
  title?: string;
  children: React.ReactNode;
}

export function InfoDialog({ buttonClassName, title = "Information", children }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={buttonClassName ?? "h-9 w-9"}
        >
          <Info className="h-5 w-5" />
          <span className="sr-only">Vis information om {title.toLowerCase()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="space-y-4 text-left text-muted-foreground text-sm">
            {children}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 