import { Server } from "http";
import app from "./app";
import config from "./app/config";
let server: Server;

const gracefulShutdown = () => {
  if (server) {
    server.close(() => {
      console.info("🔌 Server closed gracefully.");
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
};

const handleUnexpectedError = (error: unknown, type: string) => {
  console.error(`❗ ${type}:`, error);
  gracefulShutdown();
};

const main = async () => {
  try {
    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });

    // Catch uncaught exceptions (e.g., sync code errors)
    process.on("uncaughtException", (error) => handleUnexpectedError(error, "Uncaught Exception"));

    // Catch unhandled promise rejections
    process.on("unhandledRejection", (reason) =>
      handleUnexpectedError(reason, "Unhandled Rejection")
    );

    // Graceful shutdown on SIGTERM or SIGINT (e.g., Ctrl+C or Docker stop)
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down...");
      gracefulShutdown();
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received. Shutting down...");
      gracefulShutdown();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

main();
