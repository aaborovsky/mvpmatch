import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestSeeder } from '../src/providers/database/postgres/seeders/test.seeder';
import { MikroORM } from '@mikro-orm/core';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let sellerBearer: string;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const orm = app.get<MikroORM>(MikroORM);
    const seeder = orm.getSeeder();
    await orm.getSchemaGenerator().refreshDatabase();

    // Seed using a seeder defined by you
    await seeder.seed(TestSeeder);

    sellerBearer = (
      await request(app.getHttpServer()).post('/auth/login').send({
        username: 'seller1',
        password: 'seller1Password',
      })
    ).body.access_token;
  });

  // describe('Auth controller', () => {
  //   it('should authenticate user with proper credentials', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send({
  //         username: 'buyer1',
  //         password: 'buyer1Password',
  //       } as LoginRequestDto)
  //       .expect(201);
  //     expect(response.body.access_token).toBeDefined();
  //   });
  //
  //   it('should not authenticate user with wrong credentials', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send({
  //         username: 'buyer1',
  //         password: 'wrong-password',
  //       } as LoginRequestDto)
  //       .expect(400);
  //     expect(response.body.access_token).toBeUndefined();
  //   });
  //
  //   it('should not authenticate user with wrong shape of request', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send({
  //         user: 'buyer1',
  //         pass: 'wrong-password',
  //       })
  //       .expect(401);
  //     expect(response.body.access_token).toBeUndefined();
  //   });
  // });

  describe('Product controller', () => {
    it('Create product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerBearer}`)
        .send({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        })
        .expect(201)
        .expect({
          amountAvailable: 100,
          cost: 123.55,
          productName: 'Test product',
        });
    });
  });
});
