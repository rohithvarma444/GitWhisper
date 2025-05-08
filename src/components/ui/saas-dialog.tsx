import React from "react";
import { Dialog as ShadcnDialog, DialogContent as ShadcnDialogContent, DialogHeader as ShadcnDialogHeader, DialogFooter as ShadcnDialogFooter, DialogTitle as ShadcnDialogTitle, DialogDescription as ShadcnDialogDescription } from "./dialog";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface SaasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  isCompact?: boolean;
  onToggleCompact?: () => void;
  className?: string;
}

export function SaasDialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  isCompact = false,
  onToggleCompact,
  className,
}: SaasDialogProps) {
  return (
    <ShadcnDialog open={open} onOpenChange={onOpenChange}>
      <ShadcnDialogContent 
        className={cn(
          "max-w-5xl p-0 rounded-xl overflow-hidden flex flex-col",
          isCompact ? "h-[60vh]" : "h-[85vh]",
          className
        )}
        style={{ maxHeight: "90vh" }}
      >
        <ShadcnDialogHeader className="px-6 py-4 border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <ShadcnDialogTitle className="text-xl font-semibold">{title}</ShadcnDialogTitle>
              {description && (
                <ShadcnDialogDescription className="mt-1 text-sm text-muted-foreground">
                  {description}
                </ShadcnDialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onToggleCompact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCompact}
                  className="p-1 h-8 w-8 rounded-full hover:bg-muted"
                  title={isCompact ? "Maximize" : "Minimize"}
                >
                  {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="p-1 h-8 w-8 rounded-full hover:bg-muted"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ShadcnDialogHeader>
        {children}
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}

export function SaasDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ShadcnDialogFooter className={cn("px-6 py-4 border-t bg-card sticky bottom-0 z-10", className)}>
      {children}
    </ShadcnDialogFooter>
  );
}