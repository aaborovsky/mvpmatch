import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { User, UserId } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { LockMode } from '@mikro-orm/core';
import { VendingMachineService } from '../vending-machine/vending-machine.service';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly vendingMachineService: VendingMachineService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHashed = await bcrypt.hash(
      createUserDto.password,
      BCRYPT_SALT_ROUNDS,
    );
    return this.userRepo.create(
      {
        coins: {},
        vendingMachine:
          await this.vendingMachineService.getDefaultVendingMachine(),
        deposit: 0,
        password: passwordHashed,
        role: createUserDto.role,
        username: createUserDto.username,
      },
      { persist: true },
    );
  }

  findAll() {
    return this.userRepo.findAll();
  }

  findOne(id: UserId) {
    return this.userRepo.findOne({ id: id });
  }

  findOneByUsername(username: string) {
    return this.userRepo.findOne({ username });
  }

  async update(id: UserId, updateUserDto: UpdateUserDto) {
    let user = await this.findOneForModifyOrFail(id);
    try {
      user = this.userRepo.assign(user, updateUserDto, {
        onlyProperties: true,
      });
      return await this.userRepo.persistAndFlush(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async findOneForModifyOrFail(id: UserId) {
    try {
      return await this.userRepo.findOneOrFail(
        { id: id },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );
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
