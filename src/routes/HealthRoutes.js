import { Router } from "express";
import mongoose from "mongoose";

const router = Router();
router.get("/", (req, res) => {
    res.status(200).json({
        statusCode: 200,
        success: true,
        message: "API is healthy",
        data: {
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
        },
    });
});

router.get("/detailed", async (req, res) => {
    const healthCheck = {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        memory: {
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        },
        dependencies: {
            database: {
                status: "UNKNOWN",
                latency: null,
            },
        },
    };

    try {
        const startTime = Date.now();
        const dbState = mongoose.connection.readyState;
        const dbStates = {
            0: "DISCONNECTED",
            1: "CONNECTED",
            2: "CONNECTING",
            3: "DISCONNECTING",
        };

        if (dbState === 1) {
            // Ping the database to check latency
            await mongoose.connection.db.admin().ping();
            healthCheck.dependencies.database = {
                status: "HEALTHY",
                latency: `${Date.now() - startTime}ms`,
            };
        } else {
            healthCheck.dependencies.database = {
                status: dbStates[dbState] || "UNKNOWN",
                latency: null,
            };
            healthCheck.status = "DEGRADED";
        }
    } catch (error) {
        healthCheck.dependencies.database = {
            status: "UNHEALTHY",
            error: error.message,
        };
        healthCheck.status = "UNHEALTHY";
    }

    const statusCode = healthCheck.status === "OK" ? 200 : 
                       healthCheck.status === "DEGRADED" ? 200 : 503;

    res.status(statusCode).json({
        statusCode,
        success: healthCheck.status !== "UNHEALTHY",
        message: `Health check: ${healthCheck.status}`,
        data: healthCheck,
    });
});

/**
 * @desc    Liveness probe (for Kubernetes/container orchestration)
 * @route   GET /api/health/live
 * @access  Public
 */
router.get("/live", (req, res) => {
    res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Application is alive",
        data: {
            status: "ALIVE",
            timestamp: new Date().toISOString(),
        },
    });
});

router.get("/ready", async (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Application is ready to receive traffic",
            data: {
                status: "READY",
                timestamp: new Date().toISOString(),
            },
        });
    } else {
        res.status(503).json({
            statusCode: 503,
            success: false,
            message: "Application is not ready",
            data: {
                status: "NOT_READY",
                reason: "Database connection not established",
                timestamp: new Date().toISOString(),
            },
        });
    }
});

export default router;
