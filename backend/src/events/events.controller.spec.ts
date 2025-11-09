import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthService } from '../auth/auth.service';
import { EventStatus } from '@prisma/client';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;
  let authService: AuthService;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllPublic: jest.fn(),
    findOnePublic: jest.fn(),
  };

  const mockAuthService = {
    verifyPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createDto = {
        name: 'Test Event',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        location: 'Test Location',
        posterUrl: 'http://example.com/poster.jpg',
      };

      const user = { id: 'admin123', email: 'test@example.com' };
      const result = { id: 'event123', ...createDto };

      mockEventsService.create.mockResolvedValue(result);

      expect(await controller.create(createDto, user)).toEqual(result);
      expect(mockEventsService.create).toHaveBeenCalledWith(createDto, user.id);
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      const result = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      mockEventsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(filterDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return an event', async () => {
      const event = { id: 'event123', name: 'Test Event' };
      mockEventsService.findOne.mockResolvedValue(event);

      expect(await controller.findOne('event123')).toEqual(event);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateDto = { name: 'Updated Event' };
      const user = { id: 'admin123', email: 'test@example.com' };
      const result = { id: 'event123', ...updateDto };

      mockEventsService.update.mockResolvedValue(result);

      expect(await controller.update('event123', updateDto, user)).toEqual(result);
    });
  });

  describe('delete', () => {
    it('should delete an event after password verification', async () => {
      const user = { id: 'admin123', email: 'test@example.com' };
      const body = { password: 'password123' };
      const result = { message: 'Event deleted successfully' };

      mockAuthService.verifyPassword.mockResolvedValue(true);
      mockEventsService.delete.mockResolvedValue(result);

      expect(await controller.delete('event123', body, user)).toEqual(result);
      expect(mockAuthService.verifyPassword).toHaveBeenCalledWith(user.id, body.password);
    });
  });

  describe('findAllPublic', () => {
    it('should return all public events', async () => {
      const events = [{ id: 'event1' }, { id: 'event2' }];
      mockEventsService.findAllPublic.mockResolvedValue(events);

      expect(await controller.findAllPublic()).toEqual(events);
    });
  });

  describe('findOnePublic', () => {
    it('should return a public event', async () => {
      const event = { id: 'event123', name: 'Test Event' };
      mockEventsService.findOnePublic.mockResolvedValue(event);

      expect(await controller.findOnePublic('event123')).toEqual(event);
    });
  });
});
