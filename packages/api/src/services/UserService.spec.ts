import { UserService } from './UserService';
import { prisma } from '@cvonthemove/db';

jest.mock('@cvonthemove/db', () => ({
  prisma: {
    user: { findMany: jest.fn() }
  }
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  it('should get all users', async () => {
    const mockUsers = [{ id: '1', email: 'test@example.com' }];
    (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

    const result = await service.getAllUsers();
    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });
});
