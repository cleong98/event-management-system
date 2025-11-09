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
import { EventsService } from './events.service';
import { AuthService } from '../auth/auth.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filterDto: EventFilterDto) {
    return this.eventsService.findAll(filterDto);
  }

  @Get('public')
  findAllPublic() {
    return this.eventsService.findAllPublic();
  }

  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.eventsService.findOnePublic(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.eventsService.update(id, updateEventDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Body() body: { password: string },
    @CurrentUser() user: { id: string; email: string },
  ) {
    // Verify password before deletion
    await this.authService.verifyPassword(user.id, body.password);
    return this.eventsService.delete(id, user.id);
  }
}
