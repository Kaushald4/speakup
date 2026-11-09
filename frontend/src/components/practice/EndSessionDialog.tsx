import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/common/Spinner";

interface EndSessionDialogProps {
  open: boolean;
  ending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function EndSessionDialog({
  open,
  ending,
  onOpenChange,
  onConfirm,
}: EndSessionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End this session?</AlertDialogTitle>
          <AlertDialogDescription>
            We will stop the microphone, score the answers so far, and open your report.
            You can always start another five-minute session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={ending}>Keep talking</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={ending}>
            {ending && <Spinner className="size-4" />}
            {ending ? "Ending..." : "End session"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
