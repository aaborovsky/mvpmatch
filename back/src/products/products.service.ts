import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Product, ProductId } from './entities/product.entity';
import { UserId } from '../users/entities/user.entity';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Role } from '../roles/role.enum';
import { QueryOrder } from '@mikro-orm/core';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
    private readonly userService: UsersService,
  ) {}

  async create(createProductDto: CreateProductDto, user: AuthenticatedUserDto) {
    const userEntity = await this.userService.findOne(user.id);
    if (userEntity?.role !== Role.SELLER) {
      throw new ForbiddenException('Only seller could create a product');
    }
    const product = await this.productRepo.create({
      ...createProductDto,
      seller: userEntity,
    });
    await this.productRepo.persistAndFlush(product);
    return product;
  }

  findAll() {
    return this.productRepo.findAll({
      orderBy: { productName: QueryOrder.ASC },
    });
  }

  findOne(id: ProductId) {
    return this.productRepo
      .findOneOrFail({ id })
      .catch((e) => Promise.reject(new NotFoundException(e)));
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepo
      .findOneOrFail({ id })
      .catch((e) => Promise.reject(new NotFoundException(e)));
    return this.productRepo.assign(product, updateProductDto);
  }

  async remove(id: number) {
    const product = await this.productRepo
      .findOneOrFail({ id })
      .catch((e) => Promise.reject(new NotFoundException(e)));
    return this.productRepo.remove(product);
  }

  async isProductOwnedByUser(productId: ProductId, sellerId: UserId) {
    const productsCount = await this.productRepo
      .createQueryBuilder()
      .count('id')
      .where({ id: productId, seller: sellerId });
    return productsCount >= 1;
  }
}
