import { BaseService } from '../core/BaseService';
import { User } from '@cvonthemove/db';

export class UserService extends BaseService {
  public async getAllUsers(): Promise<User[]> {
    return this.db.user.findMany();
  }
}
