import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesRequired } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { RolesGuard } from '../roles/roles.guard';
import { ProductOwnerInterceptor } from './productOwner.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';
import { CreateProductResponseDto } from './dto/create-product.response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesRequired(Role.SELLER)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ): Promise<CreateProductResponseDto> {
    return this.productsService.create(
      createProductDto,
      req.user as AuthenticatedUserDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ProductOwnerInterceptor)
  @RolesRequired(Role.SELLER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @RolesRequired(Role.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ProductOwnerInterceptor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
