import { Chip } from "@mui/material";
import { EventStatus } from "../types";

interface EventStatusChipProps {
  status: EventStatus;
  size?: "small" | "medium";
  className?: string;
}

export const EventStatusChip = ({ status, size = "small", className }: EventStatusChipProps) => {
  const getStatusColor = (status: EventStatus) => {
    return status === EventStatus.ONGOING ? "success" : "default";
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size={size}
      className={className}
    />
  );
};
