import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware.js";
import { CreateService, GetServices, UpdateService } from "../services/service.service.js";

export async function serviceRoutes(app: FastifyInstance) {
    app.post("/services", {
        preHandler: authenticate,
    }, async (request, reply) => {
        const body = request.body as {
            name: string;
            price: number;
        };

        const userId = request.user.sub;

        try {
            const service = await CreateService({
                name: body.name,
                price: body.price,
                userId,
            });

            return reply.status(201).send({
                message: "Serviço cadastrado com sucesso.",
                service,
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({
                    message: error.message,
                });
            }

            return reply.status(500).send({
                message: "Erro interno do servidor.",
            });
        }
    });

        app.get("/services", {
        preHandler: authenticate,
    }, async (request, reply) => {
        const userId = request.user.sub;

        try {
            const services = await GetServices(userId);

            return reply.status(200).send({
                services,
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({
                    message: error.message,
                });
            }

            return reply.status(500).send({
                message: "Erro interno do servidor.",
            });
        }
    });

    app.put("/services/:id", {
        preHandler: authenticate,
    }, async(request, reply) => {
        const params = request.params as {
            id: string;
        };

        const body = request.body as {
            name: string;
            price: number;
        };

        const userId = request.user.sub;

        try {
            const service = await UpdateService({
                id: params.id,
                name: body.name,
                price: body.price,
                userId,
            });

            return reply.status(200).send({
                message: "Serviço atualizado com sucesso.",
                service,
            });
        } catch (error) {
            if(error instanceof Error) {
                return reply.status(400).send({
                    message: error.message,
                });
            }

            return reply.status(500).send({
                message: "Erro interno do servidor.",
            });
        }
    });
}