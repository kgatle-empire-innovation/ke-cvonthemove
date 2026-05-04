import { PrismaClient } from '@cvonthemove/db';
import { prisma } from '@cvonthemove/db';

export abstract class BaseService {
  protected db: PrismaClient;

  constructor() {
    this.db = prisma;
  }
}
