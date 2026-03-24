import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { requestIdMiddleware } from "./utils/requestId.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { logger } from "./utils/logger.js";
export function createApp() {
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(requestIdMiddleware);
    app.use(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pinoHttp({
        logger,
        genReqId: (req) => req.requestId ?? "",
    }));
    app.use("/", routes);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map