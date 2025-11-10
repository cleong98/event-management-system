import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Button,
  Divider,
} from "@mui/material";
import { LocationOn, CalendarToday, ArrowBack } from "@mui/icons-material";
import { format } from "date-fns";
import { eventsService } from "../../services/events.service";
import { EventStatus } from "../../types";

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-event", id],
    queryFn: () => eventsService.getPublicEventById(id!),
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const getStatusColor = (status: EventStatus) => {
    return status === EventStatus.ONGOING ? "success" : "default";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Alert severity="error">Event not found or failed to load.</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          variant="contained"
        >
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" className="px-4">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          className="text-sm sm:text-base"
        >
          Back to Events
        </Button>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        {/* Event Image - Full width on mobile, half on desktop */}
        <div className="w-full">
          <Card className="shadow-lg">
            <CardMedia
              component="img"
              className="w-full h-auto min-w-[300px] min-h-[200px] max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-cover"
              image={
                event.posterUrl
                  ? `${event.posterUrl}`
                  : "https://via.placeholder.com/600x400?text=No+Image"
              }
              alt={event.name}
            />
          </Card>
        </div>

        {/* Event Details - Full width on mobile, half on desktop */}
        <div className="w-full">
          {/* Title and Status */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <Typography
              variant="h3"
              component="h1"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800"
            >
              {event.name}
            </Typography>
            <Chip
              label={event.status}
              color={getStatusColor(event.status)}
              size="medium"
              className="self-start sm:self-auto"
            />
          </div>

          <Divider className="my-4 sm:my-6" />

          {/* Event Information */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="flex items-start gap-3 sm:gap-4">
              <CalendarToday
                color="primary"
                className="text-2xl sm:text-3xl mt-1 shrink-0"
              />
              <div>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  className="text-xs sm:text-sm"
                >
                  Event Dates
                </Typography>
                <Typography
                  variant="h6"
                  className="text-base sm:text-lg md:text-xl font-semibold mt-1"
                >
                  {format(new Date(event.startDate), "MMMM dd, yyyy")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  className="text-sm sm:text-base"
                >
                  to {format(new Date(event.endDate), "MMMM dd, yyyy")}
                </Typography>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 sm:gap-4">
              <LocationOn
                color="primary"
                className="text-2xl sm:text-3xl mt-1 shrink-0"
              />
              <div>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  className="text-xs sm:text-sm"
                >
                  Location
                </Typography>
                <Typography
                  variant="h6"
                  className="text-base sm:text-lg md:text-xl font-semibold mt-1"
                >
                  {event.location}
                </Typography>
              </div>
            </div>
          </div>

          <Divider className="my-4 sm:my-6" />

          {/* Event Status Description */}
          <div>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              className="text-xs sm:text-sm"
            >
              Event Status
            </Typography>
            <Typography
              variant="body1"
              className="text-sm sm:text-base text-gray-700"
            >
              {event.status === EventStatus.ONGOING
                ? "This event is currently ongoing. Don't miss out!"
                : "This event has been completed."}
            </Typography>
          </div>
        </div>
      </div>
    </Container>
  );
};
