import { prisma } from "../lib/prisma.js";
import { hashPassword } from "./password.service.js";

interface RegisterBarberData {
  name: string;
  email: string;
  password: string;
  shopName: string;
  slug: string;
}

export async function registerBarber(data: RegisterBarberData) {
  const { name, email, password, shopName, slug } = data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("E-mail já cadastrado.");
  }

  const existingShop = await prisma.barberShop.findUnique({
    where: {
      slug,
    },
  });

  if (existingShop) {
    throw new Error("Este slug já está em uso.");
  }

  const passwordHash = await hashPassword(password);

  const trialStartedAt = new Date();

  const trialEndsAt = new Date(trialStartedAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + 15);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const barberShop = await tx.barberShop.create({
      data: {
        name: shopName,
        slug,
        ownerId: user.id,
        trialStartedAt,
        trialEndsAt,
      },
    });

    const profile = await tx.profile.create({
      data: {
        id: user.id,
        fullName: name,
        role: "barber",
        barberShopId: barberShop.id,
      },
    });

    return {
      user,
      profile,
      barberShop,
    };
  });

  return result;
}