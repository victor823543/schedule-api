import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongodb from "mongoose";
import { MONGO_URI } from "./config.js";
import { errorHandler } from "./handlers/errorHandler.js";

import "./models/Course.js";
import "./models/Group.js";
import "./models/Location.js";
import "./models/Teacher.js";

import courseRoutes from "./routes/courses.js";
import entityRoutes from "./routes/entities.js";

const server = express();

const port = 4000;

server.use(cors({ origin: "*" }));
server.use(bodyParser.json());

server.use("/api/entities", entityRoutes);
server.use("/api/courses", courseRoutes);

server.use(errorHandler);

server.use("/api/health", (req, res) => {
  res.status(200).send("OK");
});

mongodb
  .connect(`${MONGO_URI}`)
  .then(() => {
    console.log("Successfully connected to mongodb.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

server.listen(port, async () => {
  console.log(`Listening on port: ${port}`);
});

export default server;
