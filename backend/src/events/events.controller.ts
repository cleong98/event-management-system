import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AuthService } from '../auth/auth.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { DeleteEventDto } from './dto/delete-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new event', description: 'Create a new event (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all events with filters', description: 'Get paginated list of all events with optional filters (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  findAll(@Query() filterDto: EventFilterDto) {
    return this.eventsService.findAll(filterDto);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public events', description: 'Get list of all public events (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Public events retrieved successfully' })
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get single public event', description: 'Get details of a single public event (no authentication required)' })
  @ApiParam({ name: 'id', description: 'Event ID', type: String })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOnePublic(@Param('id') id: string) {
    return this.eventsService.findOnePublic(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single event', description: 'Get details of a single event (requires authentication)' })
  @ApiParam({ name: 'id', description: 'Event ID', type: String })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event', description: 'Update an existing event (requires authentication and ownership)' })
  @ApiParam({ name: 'id', description: 'Event ID', type: String })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.eventsService.update(id, updateEventDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete event', description: 'Delete an event (requires authentication, ownership, and password verification)' })
  @ApiParam({ name: 'id', description: 'Event ID', type: String })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token or wrong password' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the event owner' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async delete(
    @Param('id') id: string,
    @Body() body: DeleteEventDto,
    @CurrentUser() user: { id: string; email: string },
  ) {
    // Verify password before deletion
    await this.authService.verifyPassword(user.id, body.password);
    return this.eventsService.delete(id, user.id);
  }
}
