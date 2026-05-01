import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import connectDB, { closeDB } from "./config/database.js";
import swaggerSpec from "./config/swagger.js";
import { errorHandler, notFoundHandler } from "./middleware/ErrorMiddleware.js";
import routes from "./routes/index.js";
import { shutdownEmailWorker } from "./workers/EmailWorker.js";

dotenv.config();
const { NODE_ENV } = process.env;
const app = express();
app.set("trust proxy", 1);

const resolvedAllowedOrigins = (
    process.env.CORS_ORIGIN ||
    process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: resolvedAllowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(
            `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
        );
        next();
    });
}
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Doyum Catering API Docs",
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none",
            filter: true,
            tagsSorter: "alpha",
            operationsSorter: "method",
        },
    })
);

app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.use("/api/v1", routes);
app.get("/", (req, res) => {
    res.json({
        statusCode: 200,
        success: true,
        message: "Welcome to Doyum API",
        data: {
            version: "1.0.0",
            documentation: "/api-docs",
            health: "/api/v1/health",
        },
    });
});
app.use(notFoundHandler);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

let server;
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(async () => {
        console.log("HTTP server closed");
        await shutdownEmailWorker();
        await closeDB();
        console.log("Graceful shutdown completed");
        process.exit(0);
    });
    setTimeout(() => {
        console.error(
            "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
    }, 30000);
};
const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            console.log(`\nServer running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`Local: http://localhost:${PORT}`);
            console.log(
                `Swagger: http://localhost:${PORT}/api-docs`
            );
        });
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
            throw error;
        });
        process.on("SIGTERM", () =>
            gracefulShutdown("SIGTERM")
        );
        process.on("SIGINT", () =>
            gracefulShutdown("SIGINT")
        );
        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception:", error);
            gracefulShutdown("UNCAUGHT_EXCEPTION");
        });
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection at:",promise,"reason:",reason);
            gracefulShutdown("UNHANDLED_REJECTION");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
