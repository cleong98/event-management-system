import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto = {
        name: 'Test Event',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        location: 'Test Location',
        posterUrl: 'http://example.com/poster.jpg',
      };

      const adminId = 'admin123';
      const createdEvent = {
        id: 'event123',
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        status: EventStatus.ONGOING,
        createdById: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.event.create.mockResolvedValue(createdEvent);

      const result = await service.create(createEventDto, adminId);

      expect(mockPrismaService.event.create).toHaveBeenCalledWith({
        data: {
          name: createEventDto.name,
          startDate: new Date(createEventDto.startDate),
          endDate: new Date(createEventDto.endDate),
          location: createEventDto.location,
          posterUrl: createEventDto.posterUrl,
          createdById: adminId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(createdEvent);
    });
  });

  describe('findAll', () => {
    it('should return paginated events with filters', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        status: EventStatus.ONGOING,
        search: 'test',
      };

      const events = [
        {
          id: 'event1',
          name: 'Test Event',
          startDate: new Date(),
          endDate: new Date(),
          location: 'Location',
          posterUrl: 'url',
          status: EventStatus.ONGOING,
          createdById: 'admin1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.event.findMany.mockResolvedValue(events);
      mockPrismaService.event.count.mockResolvedValue(1);

      const result = await service.findAll(filterDto);

      expect(result).toEqual({
        data: events,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      const event = {
        id: 'event123',
        name: 'Test Event',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Location',
        posterUrl: 'url',
        status: EventStatus.ONGOING,
        createdById: 'admin1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.event.findUnique.mockResolvedValue(event);

      const result = await service.findOne('event123');

      expect(result).toEqual(event);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateDto = {
        name: 'Updated Event',
        status: EventStatus.COMPLETED,
      };

      const event = {
        id: 'event123',
        createdById: 'admin123',
      };

      const updatedEvent = {
        ...event,
        ...updateDto,
        startDate: new Date(),
        endDate: new Date(),
        location: 'Location',
        posterUrl: 'url',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.event.findUnique.mockResolvedValue(event);
      mockPrismaService.event.update.mockResolvedValue(updatedEvent);

      const result = await service.update('event123', updateDto, 'admin123');

      expect(result).toEqual(updatedEvent);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      const event = {
        id: 'event123',
        createdById: 'admin123',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(event);

      await expect(
        service.update('event123', { name: 'Updated' }, 'admin456'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete an event', async () => {
      const event = {
        id: 'event123',
        createdById: 'admin123',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(event);
      mockPrismaService.event.delete.mockResolvedValue(event);

      const result = await service.delete('event123', 'admin123');

      expect(mockPrismaService.event.delete).toHaveBeenCalledWith({
        where: { id: 'event123' },
      });
      expect(result).toEqual({ message: 'Event deleted successfully' });
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      const event = {
        id: 'event123',
        createdById: 'admin123',
      };

      mockPrismaService.event.findUnique.mockResolvedValue(event);

      await expect(service.delete('event123', 'admin456')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
