import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { User, UserId } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { LockMode, RequiredEntityData } from '@mikro-orm/core';
import { VendingMachineService } from '../vending-machine/vending-machine.service';
import { hashPassword } from './utils/hashPassword.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly vendingMachineService: VendingMachineService,
  ) {}

  async create(createUserDto: CreateUserDto & Pick<User, 'role'>) {
    if ((await this.userRepo.count({ username: createUserDto.username })) > 0) {
      throw new BadRequestException('User with such username already exists');
    }
    const user = this.userRepo.create({
      coins: {},
      vendingMachine:
        //TODO: later one could support few simultaneous VendingMachine, so user able to choose: which one he use on creation
        await this.vendingMachineService.getDefaultVendingMachine(),
      deposit: 0,
      password: await hashPassword(createUserDto.password),
      role: createUserDto.role,
      username: createUserDto.username,
    });
    await this.userRepo.persistAndFlush(user);
    return user;
  }

  findAll() {
    return this.userRepo.findAll();
  }

  findOne(id: UserId) {
    return this.userRepo.findOne({ id });
  }

  findOneByUsernameWithSession(username: string) {
    return this.userRepo.findOne({ username });
  }

  async update(id: UserId, updateUserDto: UpdateUserDto) {
    let user = await this.findOneForModifyOrFail(id);
    try {
      if (updateUserDto.password != undefined) {
        updateUserDto.password = await hashPassword(updateUserDto.password);
      }
      user = this.userRepo.assign(user, updateUserDto, {
        onlyProperties: true,
      });
      await this.userRepo.persistAndFlush(user);
      return user;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async findOneForModifyOrFail(id: UserId) {
    try {
      return await this.userRepo.findOneOrFail({ id });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async remove(id: UserId) {
    const user = await this.findOneForModifyOrFail(id);
    try {
      return await this.userRepo.removeAndFlush(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
