import { prisma } from "../lib/prisma.js";

interface CreateClientData {
    name: string;
    phone: string;
    userId: string;
}

export async function CreateClient(data: CreateClientData) {
    const {name, phone, userId} = data;

    const profile = await prisma.profile.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile) {
        throw new Error("Perfil do usuário não encontrado.");
    }

    if (!profile.barberShopId) {
        throw new Error("Usuário não possui uma barbearia vinculada.");
    }

    const client = await prisma.client.create({
        data: {
            name,
            phone,
            barberShopId: profile.barberShopId,
        },
    });

    return client;
}

export async function GetClients(userId: string) {
    const profile = await prisma.profile.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile) {
        throw new Error("Perfil do usuário não encontrado.");
    }

    if (!profile.barberShopId) {
        throw new Error("Usuário não possui uma barbearia vinculada.");
    }

    const clients = await prisma.client.findMany({
        where: {
            barberShopId: profile.barberShopId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return clients;
}

interface UpdateClientData {
    id: string;
    name: string;
    phone: string;
    userId: string;
}

export async function UpdateClient(data: UpdateClientData) {
    const {id, name, phone, userId} = data;

    const profile = await prisma.profile.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile) {
        throw new Error("Perfil do usuário não encontrado.");
    }

    if (!profile.barberShopId) {
        throw new Error("Usuário não possui uma barbearia vinculada.");
    }

    const client = await prisma.client.findUnique({
        where: {
            id,
        },
    });

    if (!client) {
        throw new Error("Cliente não encontrado.");
    }

    if (client.barberShopId !== profile.barberShopId) {
        throw new Error("Cliente nao pertence à sua barbearia.");
    }

    const updatedClient = await prisma.client.update({
        where: {
            id,
        },
        data: {
            name,
            phone,
        },
    });

    return updatedClient;
}

interface DeleteClientData {
    id: string;
    userId: string;
}

export async function DeleteClient(data: DeleteClientData) {
    const {id, userId} = data;

    const profile = await prisma.profile.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile) {
        throw new Error("Perfil do usuário não encontrado.");
    }

    if (!profile.barberShopId) {
        throw new Error("Usuário não possui uma barbearia vinculada.");
    }

    const client = await prisma.client.findUnique({
        where: {
            id,
        },
    });

    if (!client) {
        throw new Error("Cliente não encontrado.");
    }

    if (client.barberShopId !== profile.barberShopId) {
        throw new Error("Cliente não pertence à sua barbearia.");
    }

    const deletedClient = await prisma.client.delete({
        where: {
            id,
        },
    });

    return deletedClient;
}