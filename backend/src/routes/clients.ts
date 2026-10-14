import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware.js";
import { CreateClient, GetClients, UpdateClient, DeleteClient } from "../services/client.service.js";

export async function clientRoutes(app: FastifyInstance) {
    app.post("/clients", {
        preHandler: authenticate,
    }, async (request, reply ) => {
        const body = request.body as {
            name: string;
            phone: string;
        };

        const userId = request.user.sub;

        try {
            const client = await CreateClient({
                name: body.name,
                phone: body.phone,
                userId,
            });

            return reply.status(201).send({
                message: "Cliente cadastrado com sucesso.",
                client,
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

    app.get("/clients", {
        preHandler: authenticate,
    }, async (request , reply) => {
        const userId = request.user.sub;

        try {
            const clients = await GetClients(userId);

            return reply.status(200).send({
                clients,
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

    app.put("/clients/:id", {
        preHandler: authenticate,
    }, async (request , reply) => {
        const params = request.params as {
            id: string;
        };

        const body = request.body as {
            name: string;
            phone: string;
        };

        const userId = request.user.sub;

        try {
            const client = await UpdateClient({
                id: params.id,
                name: body.name,
                phone: body.phone,
                userId,
            });

            return reply.status(200).send({
                message: "Cliente atualizado com sucesso.",
                client,
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

    app.delete("/clients/:id", {
        preHandler: authenticate,
    }, async (request , reply) => {
        const params = request.params as {
            id: string;
        };

        const userId = request.user.sub;

        try {
            const client = await DeleteClient({
                id: params.id,
                userId,
            });

            return reply.status(200).send({
                message: "Cliente excluído com sucesso.",
                client,
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
}