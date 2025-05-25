import { PrismaClient } from '@prisma/client';

declare namespace NodeJS {
  interface Global {
    __prisma?: PrismaClient;
  }
}
