import { FastifyInstance } from "fastify";
import { registerBarber } from "../services/barber.service.js";
import { loginBarber } from "../services/auth.service.js";
import { authenticate } from "../middleware/auth.middleware.js";

export async function authRoutes(app: FastifyInstance) {
    app.post("/auth/register/barber", async (request, reply) => {
        const body = request.body as {
            name: string;
            email: string;
            password: string;
            shopName: string;
            slug: string;
        };

        try {
            const result = await registerBarber(body);

            return reply.status(201).send({
                message: "Barbeiro cadastrado com sucesso.",
                barber: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.profile.fullName,
                    shop: {
                        id: result.barberShop.id,
                        name: result.barberShop.name,
                        slug: result.barberShop.slug,
                    },
                },
            });
        } catch (error) {
            if(error instanceof Error) {
                return reply.status(400). send({
                    message: error.message,
                });
            }

            return reply.status(500).send({
                message: "Erro interno do servidor.",
            });
        }
    });

    app.post("/auth/login", async (requestAnimationFrame, reply) => {
        const body = requestAnimationFrame.body as {
            email: string;
            password: string;
        };

        try {
            const result = await loginBarber(app, body);

            return reply.status(200).send(result);
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(401).send({
                    message: error.message,
                });
            }

            return reply.status(500).send({
                message: "Erro interno do servidor.",
            });
        }
    });

    app.get("/auth/me", {
        preHandler: authenticate,
    }, async (requestAnimationFrame, reply) => {
        return reply.status(200).send({
            message: "Autenticação funcionando.",
            user: requestAnimationFrame.user,
        });
    });
}