import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { map, merge, Observable, switchMap, tap, throwError } from 'rxjs';
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
      params: { id?: string };
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
      Promise.all([
        this.productService.doesProductExist(Number(params.id)),
        this.productService.isProductOwnedByUser(Number(params.id), user.id),
      ]),
    ).pipe(
      switchMap(([isExists, isOwned]) =>
        //skip validation is product doesnt exist
        !isExists || isOwned
          ? next.handle()
          : throwError(
              () =>
                new ForbiddenException('Product does not belong to requester'),
            ),
      ),
    );
  }
}
