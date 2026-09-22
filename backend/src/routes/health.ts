import { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
    app.get("/health", async () => {
        return {
            message: "Barber System Backend funcionando!",
        };
    });
}