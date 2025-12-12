import { TBaseUser } from '../../modules/user/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: TBaseUser & { _id: any };
      id?: string;
    }
  }
}
