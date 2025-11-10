import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Typography, Alert, Container } from "@mui/material";
import { getPublicEvents } from "../../api/events";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EventCard } from "../../components/EventCard";

export const EventsGallery = () => {
  const navigate = useNavigate();

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
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
          <EventCard key={event.id} event={event} onClick={handleEventClick} />
        ))}
      </div>
    </Container>
  );
};
