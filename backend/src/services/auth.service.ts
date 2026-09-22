import { prisma } from "../lib/prisma.js";
import { verifyPassword } from "./password.service.js";
import { FastifyInstance } from "fastify";

interface LoginBarberData {
    email: string;
    password: string;
}

export async function loginBarber(
    app: FastifyInstance,
    data: LoginBarberData
) {
    const {email, password} = data;

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if(!user) {
        throw new Error("E-mail ou senha inválidos.");
    }

    const passwordIsValid = await verifyPassword(
        password,
        user.passwordHash
    );

    if(!passwordIsValid) {
        throw new Error("E-mail ou senha inválidos.");
    }

    const token = app.jwt.sign({
        sub: user.id,
        email: user.email,
    });

    return{
        token,
    };
}