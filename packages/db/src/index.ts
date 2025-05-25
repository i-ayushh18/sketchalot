const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();

async function getRoom() {
  try {
    const room = await prismaClient.room.findUnique({
      where: { slug: 'drawapp' },
    });

    console.log(room);
  } catch (error) {
    console.error("Error fetching room:", error);
  } finally {
    await prismaClient.$disconnect();
  }
}

getRoom();

module.exports = { prismaClient };