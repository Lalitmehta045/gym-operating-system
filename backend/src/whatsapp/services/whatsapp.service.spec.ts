import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from './whatsapp.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import axios from 'axios';

describe('WhatsappService', () => {
  let service: WhatsappService;
  let prismaService: jest.Mocked<PrismaService>;
  let axiosPostSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockPrismaService = {
      whatsAppLog: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
    prismaService = module.get(PrismaService);

    // Set env vars for tests
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '12345';

    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message and log it if configured', async () => {
      axiosPostSpy.mockResolvedValueOnce({
        data: { messages: [{ id: 'msg-id' }] },
      });

      const result = await service.sendMessage(
        '919876543210',
        'Test',
        'tenant-1',
        'member-1',
        'TEST_TYPE',
      );

      expect(axiosPostSpy).toHaveBeenCalledWith(
        'https://graph.facebook.com/v19.0/12345/messages',
        {
          messaging_product: 'whatsapp',
          to: '919876543210',
          type: 'text',
          text: { body: 'Test' },
        },
        expect.any(Object),
      );

      expect(prismaService.whatsAppLog.create).toHaveBeenCalledWith({
        data: {
          tenantId: 'tenant-1',
          memberId: 'member-1',
          messageId: 'msg-id',
          type: 'TEST_TYPE',
          status: 'SENT',
        },
      });

      expect(result.messages[0].id).toBe('msg-id');
    });

    it('should not send message if not configured', async () => {
      process.env.WHATSAPP_ACCESS_TOKEN = '';
      const result = await service.sendMessage('919876543210', 'Test');
      expect(axiosPostSpy).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('sendRenewalReminder', () => {
    it('should send a reminder if not sent recently', async () => {
      prismaService.member.findFirst.mockResolvedValueOnce({
        id: 'member-1',
        tenantId: 'tenant-1',
        firstName: 'John',
        phone: '919876543210',
      } as any);

      prismaService.whatsAppLog.findFirst.mockResolvedValueOnce(null); // No recent log
      axiosPostSpy.mockResolvedValueOnce({
        data: { messages: [{ id: 'msg-id' }] },
      });

      await service.sendRenewalReminder('tenant-1', 'member-1', 7);

      expect(prismaService.whatsAppLog.findFirst).toHaveBeenCalled();
      expect(axiosPostSpy).toHaveBeenCalled();
    });

    it('should not send a reminder if sent recently', async () => {
      prismaService.member.findFirst.mockResolvedValueOnce({
        id: 'member-1',
        tenantId: 'tenant-1',
        firstName: 'John',
        phone: '919876543210',
      } as any);

      prismaService.whatsAppLog.findFirst.mockResolvedValueOnce({
        id: 'log-1',
      } as any); // Recent log exists

      await service.sendRenewalReminder('tenant-1', 'member-1', 7);

      expect(axiosPostSpy).not.toHaveBeenCalled();
    });
  });

  describe('processWebhook', () => {
    it('should update log status on delivery webhook', async () => {
      const mockBody = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  statuses: [
                    {
                      id: 'msg-123',
                      status: 'delivered',
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await service.processWebhook(mockBody);

      expect(prismaService.whatsAppLog.updateMany).toHaveBeenCalledWith({
        where: { messageId: 'msg-123' },
        data: { status: 'DELIVERED' },
      });
    });
  });
});
