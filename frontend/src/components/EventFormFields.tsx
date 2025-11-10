import type { UseFormRegister, FieldErrors, Path } from "react-hook-form";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import { EventStatus } from "../types";

interface EventFormFieldsProps<T extends Record<string, any>> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  showStatus?: boolean;
  statusValue?: string;
  startDate?: string;
}

export const EventFormFields = <T extends Record<string, any>>({
  register,
  errors,
  showStatus = false,
  statusValue,
  startDate,
}: EventFormFieldsProps<T>) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Event Name */}
      <Grid size={12}>
        <TextField
          {...register("name" as Path<T>)}
          label="Event Name"
          fullWidth
          required
          error={!!errors.name}
          helperText={errors.name?.message as string}
          inputProps={{ maxLength: 200 }}
          placeholder="Enter event name"
        />
      </Grid>

      {/* Date Fields */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register("startDate" as Path<T>)}
          label="Start Date"
          type="date"
          fullWidth
          required
          error={!!errors.startDate}
          helperText={errors.startDate?.message as string}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          inputProps={{
            min: today,
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          {...register("endDate" as Path<T>)}
          label="End Date"
          type="date"
          fullWidth
          required
          error={!!errors.endDate}
          helperText={errors.endDate?.message as string}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          inputProps={{
            min: startDate || today,
          }}
        />
      </Grid>

      {/* Location */}
      <Grid size={12}>
        <TextField
          {...register("location" as Path<T>)}
          label="Location"
          fullWidth
          required
          error={!!errors.location}
          helperText={errors.location?.message as string}
          inputProps={{ maxLength: 300 }}
          placeholder="Enter event location"
        />
      </Grid>

      {/* Status (only for edit) */}
      {showStatus && (
        <Grid size={12}>
          <FormControl fullWidth error={!!errors.status} required>
            <InputLabel>Event Status</InputLabel>
            <Select
              {...register("status" as Path<T>)}
              value={statusValue || EventStatus.ONGOING}
              label="Event Status"
            >
              <MenuItem value={EventStatus.ONGOING}>Ongoing</MenuItem>
              <MenuItem value={EventStatus.COMPLETED}>Completed</MenuItem>
            </Select>
            {errors.status && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.75 }}
              >
                {errors.status.message as string}
              </Typography>
            )}
          </FormControl>
        </Grid>
      )}
    </>
  );
};
