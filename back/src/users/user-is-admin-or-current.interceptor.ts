import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';
import { UserId } from './entities/user.entity';
import { Role } from '../roles/role.enum';

@Injectable()
export class UserIsAdminOrCurrentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { user, params } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUserDto; params: { id?: UserId } }>();

    if (!user) {
      throw new ForbiddenException(
        'User must be logged in to verify access rights',
      );
    }
    if (!params.id) {
      throw new ForbiddenException(
        'User id must be a route parameter to be verified',
      );
    }
    if (user.role !== Role.ADMIN && user.id != params.id) {
      throw new ForbiddenException('User entity access forbidden');
    }
    return next.handle();
  }
}
