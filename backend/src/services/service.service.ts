import { prisma } from "../lib/prisma.js";

interface CreateServiceData {
    name: string;
    price: number;
    userId: string;
}

export async function CreateService(data: CreateServiceData) {
    const { name, price, userId } = data;

    const profile = await prisma.profile.findUnique({
        where: {
            id: userId,
        },
    });

    if(!profile) {
        throw new Error("Perfil do usuário não encontrado.");
    }

    if(!profile.barberShopId) {
        throw new Error("Usuário não possui uma barbearia vinculada.");
    }

    const service = await prisma.service.create({
        data: {
            name,
            price,
            barberShopId: profile.barberShopId,
        },
    });

    return service;
}