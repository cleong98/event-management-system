import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { LocationOn, CalendarToday } from "@mui/icons-material";
import { format } from "date-fns";
import { eventsService } from "../../services/events.service";
import { EventStatus } from "../../types";

export const EventsGallery = () => {
  const navigate = useNavigate();

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => eventsService.getPublicEvents(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const getStatusColor = (status: EventStatus) => {
    return status === EventStatus.ONGOING ? "success" : "default";
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Alert severity="error">Failed to load events. Please try again.</Alert>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No Events Available
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Check back later for upcoming events!
        </Typography>
      </div>
    );
  }

  return (
    <Container maxWidth="xl" className="px-0">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800"
        >
          Upcoming Events
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          className="text-sm sm:text-base md:text-lg text-gray-600"
        >
          Discover and explore exciting events happening around you
        </Typography>
      </div>

      {/* Responsive Grid: 1 col (mobile), 2 cols (tablet), 3 cols (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {events.map((event) => (
          <div key={event.id} className="w-full">
            <Card className="h-full flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
              <CardActionArea
                onClick={() => handleEventClick(event.id)}
                className="h-full flex flex-col"
              >
                {/* Event Image */}
                <CardMedia
                  component="img"
                  className="h-48 sm:h-52 md:h-56 object-cover"
                  image={
                    event.posterUrl
                      ? `${event.posterUrl}`
                      : "https://via.placeholder.com/400x200?text=No+Image"
                  }
                  alt={event.name}
                />

                {/* Event Content */}
                <CardContent className="flex-grow p-4 sm:p-5">
                  {/* Title and Status */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <Typography
                      variant="h6"
                      component="h2"
                      className="font-bold text-base sm:text-lg md:text-xl line-clamp-2"
                    >
                      {event.name}
                    </Typography>
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status)}
                      size="small"
                      className="text-xs shrink-0"
                    />
                  </div>

                  {/* Location */}
                  <div className="flex items-center mb-2 gap-1">
                    <LocationOn
                      fontSize="small"
                      color="action"
                      className="shrink-0"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="text-sm truncate"
                    >
                      {event.location}
                    </Typography>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-1">
                    <CalendarToday
                      fontSize="small"
                      color="action"
                      className="shrink-0"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="text-xs sm:text-sm"
                    >
                      {format(new Date(event.startDate), "MMM dd, yyyy")} -{" "}
                      {format(new Date(event.endDate), "MMM dd, yyyy")}
                    </Typography>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          </div>
        ))}
      </div>
    </Container>
  );
};
