const { PrismaClient } = require('@prisma/client');

// Use a symbol to avoid polluting global namespace
const prismaGlobal = globalThis as {
  __prisma?: typeof PrismaClient.prototype;
};

if (!prismaGlobal.__prisma) {
  prismaGlobal.__prisma = new PrismaClient();
}

const prisma = prismaGlobal.__prisma;

module.exports = prisma;
