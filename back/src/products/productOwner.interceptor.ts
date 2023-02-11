import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable, tap, throwError } from 'rxjs';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';
import { ProductsService } from './products.service';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { ProductId } from './entities/product.entity';

@Injectable()
export class ProductOwnerInterceptor implements NestInterceptor {
  constructor(private readonly productService: ProductsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { user, params } = context.switchToHttp().getRequest<{
      user?: AuthenticatedUserDto;
      params: { id?: ProductId };
    }>();
    if (!user) {
      throw new ForbiddenException(
        'User must be logged in to verify product owning',
      );
    }
    if (!params.id) {
      throw new ForbiddenException(
        'Product id must be a route parameter to verify product owning',
      );
    }
    return fromPromise(
      this.productService.isProductOwnedByUser(params.id, user.id),
    ).pipe(
      tap((isOwned) =>
        isOwned
          ? next.handle()
          : throwError(
              new ForbiddenException('Product does not belong to requester'),
            ),
      ),
    );
  }
}
