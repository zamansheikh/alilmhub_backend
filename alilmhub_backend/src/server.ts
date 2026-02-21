import colors from "colors";
import mongoose from "mongoose";
import config from "./config";
import socketServer from "./socket/socketServer";
import { logger } from "./shared/logger/logger";

//uncaught exception
process.on("uncaughtException", (error) => {
  logger.error("UnhandledException Detected", error);
  process.exit(1);
});

const server = socketServer();
async function main() {
  try {
    //TODO:  seedSuperAdmin();
    
    // MongoDB connection with better error handling
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info(colors.green("🚀 Database connected successfully"));

    // Handle MongoDB connection events
    mongoose.connection.on('disconnected', () => {
      logger.warn(colors.yellow('⚠️  MongoDB disconnected'));
    });

    mongoose.connection.on('reconnected', () => {
      logger.info(colors.green('🔄 MongoDB reconnected'));
    });

    mongoose.connection.on('error', (err) => {
      logger.error(colors.red('❌ MongoDB connection error:'), err);
    });

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);
    console.log(port, "port");
    // await redisClient.connect();

    // Bind to all interfaces (avoids issues with WSL/Docker bridge IPs)
    server.listen(port, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening ${config.ip_address} on port:${config.port}`
        )
      );
    });
  } catch (error) {
    logger.error(colors.red("🤢 Failed to connect Database"), error);
    process.exit(1);
  }
}

//handle unhandledRejection
process.on("unhandledRejection", (error) => {
  if (server) {
    server.close(() => {
      logger.error("UnhandledRejection Detected", error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

main();

// Only handle SIGTERM in production environments
// In development, ts-node-dev handles restarts via SIGTERM
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully...");
    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed.");
        //TODO: close other resources like redis
        // await redisClient.disconnect();
        await mongoose.connection.close();
        process.exit(0);
      });
    }
  });
}
