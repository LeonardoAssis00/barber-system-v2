import fastify from "fastify";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import fastifyJwt from "@fastify/jwt";
import { serviceRoutes } from "./routes/services.js";

export const app = fastify({
    logger: true,
});

app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
});

app.register(healthRoutes);
app.register(authRoutes);
app.register(serviceRoutes);