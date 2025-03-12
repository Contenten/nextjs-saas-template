import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york/ui/dialog";

interface LoadingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoading: boolean;
  status: "idle" | "success" | "error";
  successMessage: string;
  idleMessage: string;
  errorMessage: string;
}

export function LoadingDialog({
  isOpen,
  onOpenChange,
  isLoading,
  status,
  successMessage,
  idleMessage,
  errorMessage,
}: LoadingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === "success" ? "Success!" : "In Progress"}
          </DialogTitle>
          <DialogDescription>
            {status === "idle" && idleMessage}
            {status === "success" && successMessage}
            {status === "error" && errorMessage}
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex justify-center py-4">
            <svg
              className="animate-spin h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
              />
            </svg>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
