import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestSeeder } from '../src/providers/database/postgres/seeders/test.seeder';
import { EntityManager, MikroORM, QueryOrder } from '@mikro-orm/core';
import { Reflector } from '@nestjs/core';
import { Coin } from '../src/types';
import { VendingMachine } from '../src/vending-machine/entitites/vending-machine.entity';
import { LoginRequestDto } from '../src/auth/dto/login-request.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let buyer1Bearer: string;
  let seller1Bearer: string;
  let seller2Bearer: string;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));

    await app.init();

    const orm = app.get<MikroORM>(MikroORM);
    const seeder = orm.getSeeder();
    await orm.getSchemaGenerator().refreshDatabase();

    await seeder.seed(TestSeeder);

    seller1Bearer = (
      await request(app.getHttpServer()).post('/auth/login').send({
        username: 'seller1',
        password: 'seller1Password',
      })
    ).body.access_token;

    seller2Bearer = (
      await request(app.getHttpServer()).post('/auth/login').send({
        username: 'seller2',
        password: 'seller2Password',
      })
    ).body.access_token;

    buyer1Bearer = (
      await request(app.getHttpServer()).post('/auth/login').send({
        username: 'buyer1',
        password: 'buyer1Password',
      })
    ).body.access_token;
  });

  describe('Auth controller', () => {
    it('should authenticate user with proper credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'buyer2',
          password: 'buyer2Password',
        } as LoginRequestDto)
        .expect(201);
      expect(response.body.access_token).toBeDefined();
    });

    it('should not authenticate cause session for this user exists', async () =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'buyer1',
          password: 'buyer1Password',
        } as LoginRequestDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'There is already an active session using your account',
          error: 'Bad Request',
        }));

    it('should not authenticate user with wrong credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'buyer1',
          password: 'wrong-password',
        } as LoginRequestDto)
        .expect(400);
      expect(response.body.access_token).toBeUndefined();
    });

    it('should not authenticate user with wrong shape of request', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          user: 'buyer1',
          pass: 'wrong-password',
        })
        .expect(401);
      expect(response.body.access_token).toBeUndefined();
    });
  });

  describe('Product controller', () => {
    it('should return products list', () =>
      request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${buyer1Bearer}`)
        .expect(200)
        .expect([
          {
            id: 2,
            amountAvailable: 12,
            cost: 3,
            productName: 'Awesome Bronze Table',
          },
          {
            id: 1,
            amountAvailable: 4,
            cost: 8,
            productName: 'Unbranded Wooden Fish',
          },
        ]));

    it('should return single product', () =>
      request(app.getHttpServer())
        .get('/products/1')
        .set('Authorization', `Bearer ${buyer1Bearer}`)
        .expect(200)
        .expect({
          id: 1,
          amountAvailable: 4,
          cost: 8,
          productName: 'Unbranded Wooden Fish',
        }));

    it('should create product', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${seller1Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        })
        .expect(201)
        .expect({
          id: 3,
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        });
    });

    it('should not create product if a buyer', () =>
      request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${buyer1Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        })
        .expect(403));

    it('should not create product if a wrong cost', () =>
      request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${seller1Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.53,
          productName: 'Test product',
        })
        .expect(400, {
          statusCode: 400,
          message:
            'Product cost must be multiple of smallest coin denomination to be able to withdraw a change',
          error: 'Bad Request',
        }));

    it('should not create product if not authorized', () =>
      request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${buyer1Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        })
        .expect(403));

    it('should not create product if request body is wrong', () =>
      request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${seller1Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
        })
        .expect(400));

    it('should not create product if request body is wrong', () =>
      request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${seller1Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
          seller: 1,
        })
        .expect(400));

    it('should update product', () =>
      request(app.getHttpServer())
        .patch('/products/2')
        .set('Authorization', `Bearer ${seller2Bearer}`)
        .send({
          amountAvailable: 101,
          cost: 123.5,
          productName: 'Test product updated',
        })
        .expect(403));

    it("should not update product if seller doesn't own it", () =>
      request(app.getHttpServer())
        .patch('/products/1')
        .set('Authorization', `Bearer ${seller2Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        })
        .expect(403));

    it('should not delete product if not found', () =>
      request(app.getHttpServer())
        .delete('/products/66')
        .set('Authorization', `Bearer ${seller1Bearer}`)
        .expect(404));

    it("should not delete product if seller doesn't own it", async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${seller2Bearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        });

      return request(app.getHttpServer())
        .delete('/products/3')
        .set('Authorization', `Bearer ${seller1Bearer}`)
        .expect(403);
    });
  });

  describe('Vending machine controller', () => {
    describe('Deposit', () => {
      it('should deposit user coins', async () => {
        await request(app.getHttpServer())
          .post('/vending-machine/deposit')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({ coins: [5, 10, 20, 50] })
          .expect(201)
          .expect({ deposit: 0.85 });

        await request(app.getHttpServer())
          .get('/users/3')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .expect(200, {
            id: 3,
            username: 'buyer1',
            coins: {
              '5': 1,
              '10': 1,
              '20': 1,
              '50': 1,
            },
            role: 0,
          });
      });

      it('should not deposit user coins due to wrong request', () =>
        request(app.getHttpServer())
          .post('/vending-machine/deposit')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({ coins: [1, 2, 3] })
          .expect(400));

      it('should not allow to deposit for anonymous', () =>
        request(app.getHttpServer())
          .post('/vending-machine/deposit')
          .send([5, 10, 15, 20])
          .expect(401));
    });

    describe('Buy', () => {
      it('should sell chosen product', async () => {
        await request(app.getHttpServer())
          .post('/vending-machine/deposit')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({ coins: [50, 50, 50, 50, 50, 50, 50, 20, 5] })
          .expect({ deposit: 3.75 });

        await request(app.getHttpServer())
          .post('/vending-machine/buy')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({
            productId: 2,
            amount: 1,
          })
          .expect(201)
          .expect({
            spent: 3,
            products: [
              {
                id: 2,
                amountAvailable: 11,
                cost: 3,
                productName: 'Awesome Bronze Table',
              },
            ],
            change: [50, 20, 5],
          });
      });

      it('should not sell to anonymous', () =>
        request(app.getHttpServer())
          .post('/vending-machine/buy')
          .send({
            productId: 2,
            amount: 1,
          })
          .expect(401));

      it('should not sell due too insufficient funds', async () => {
        await request(app.getHttpServer())
          .post('/vending-machine/deposit')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({ coins: [50, 50, 50, 50, 50, 50, 50] })
          .expect({ deposit: 3.5 });

        await request(app.getHttpServer())
          .post('/vending-machine/buy')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({
            productId: 1,
            amount: 1,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Insufficient funds',
            error: 'Bad Request',
          });
      });

      it('should not sell due too insufficient funds', async () => {
        await request(app.getHttpServer())
          .post('/vending-machine/deposit')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({ coins: [50, 50, 50, 50, 50, 50, 50] })
          .expect({ deposit: 3.5 });

        await request(app.getHttpServer())
          .post('/vending-machine/buy')
          .set('Authorization', `Bearer ${buyer1Bearer}`)
          .send({
            productId: 1,
            amount: 1,
          })
          .expect(400, {
            statusCode: 400,
            message: 'Insufficient funds',
            error: 'Bad Request',
          });
      });

      describe('with empty change at vending machine mutation', () => {
        beforeEach(async () => {
          const em = (await app.get<EntityManager>(EntityManager)).fork();
          const vms = await em.find(
            VendingMachine,
            {},
            { orderBy: { id: QueryOrder.ASC }, limit: 1 },
          );
          vms.forEach((vm) => (vm.coins = {} as Record<Coin, number>));
          await em.persistAndFlush(vms);
        });

        it('should not sell due too cannot withdrawn change', async () => {
          await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${seller1Bearer}`)
            .send({
              amountAvailable: 1,
              cost: 3.75,
              productName: 'Test product',
            });

          await request(app.getHttpServer())
            .post('/vending-machine/deposit')
            .set('Authorization', `Bearer ${buyer1Bearer}`)
            .send({ coins: [50, 50, 50, 50, 50, 50, 50, 20, 10] })
            .expect({ deposit: 3.8 });

          await request(app.getHttpServer())
            .post('/vending-machine/buy')
            .set('Authorization', `Bearer ${buyer1Bearer}`)
            .send({
              productId: 3, //cost is 3.75, change would be 0.05, but there is no 5 cents coins at vending machine
              amount: 1,
            })
            .expect(400, {
              statusCode: 400,
              message:
                'Amount could not be withdrawn, no proper available coins. Try to deposit without change.',
              error: 'Bad Request',
            });
        });
      });
    });
  });
});
