import { CircularProgress } from "@mui/material";

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <CircularProgress />
    </div>
  );
};
