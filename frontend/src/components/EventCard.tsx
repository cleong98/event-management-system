import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
} from "@mui/material";
import { LocationOn, CalendarToday } from "@mui/icons-material";
import { format } from "date-fns";
import { EventStatusChip } from "./EventStatusChip";
import type { Event } from "../types";

interface EventCardProps {
  event: Event;
  onClick: (eventId: string) => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div className="w-full">
      <Card className="h-full flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        <CardActionArea
          onClick={() => onClick(event.id)}
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
              <EventStatusChip
                status={event.status}
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
  );
};
