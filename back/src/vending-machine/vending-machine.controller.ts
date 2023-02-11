import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VendingMachineService } from './vending-machine.service';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../roles/role.enum';
import { BuyRequestDto } from './dto/buy-request.dto';
import { Request } from 'express';
import { AuthenticatedUserDto } from '../auth/dto/authenticated-user.dto';
import { RolesRequired } from '../roles/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositRequestDto } from './dto/deposit-request.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesRequired(Role.BUYER)
@Controller('vending-machine')
export class VendingMachineController {
  constructor(private readonly vmService: VendingMachineService) {}

  @Post('buy')
  async buy(@Body() body: BuyRequestDto, @Req() req: Request) {
    return this.vmService.buy(req.user as AuthenticatedUserDto, body);
  }

  @Post('deposit')
  async deposit(@Body() body: DepositRequestDto, @Req() req: Request) {
    return this.vmService.deposit(req.user as AuthenticatedUserDto, body);
  }

  @Post('reset')
  async reset(@Req() req: Request) {
    return this.vmService.reset(req.user as AuthenticatedUserDto);
  }
}
