"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PartyPopper } from "lucide-react";

interface CreditsEarnedDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  creditsEarned: number;
}

export const CreditsEarnedDialog: React.FC<CreditsEarnedDialogProps> = ({
  isOpen,
  onOpenChange,
  creditsEarned,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <PartyPopper className="h-16 w-16 text-yellow-500 mb-3" />
          <DialogTitle className="text-2xl font-semibold">Congratulations!</DialogTitle>
          <DialogDescription className="mt-2 text-base">
            You have successfully submitted your feedback and earned{" "}
            <span className="font-bold text-brand-primary">{creditsEarned}</span>{" "}
            {creditsEarned === 1 ? "credit" : "credits"}.
            <br />
            It has been added to your balance.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-brand-primary hover:bg-brand-primary/90"
          >
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 