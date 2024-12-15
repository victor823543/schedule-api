import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongodb from "mongoose";
import { MONGO_URI } from "./config.js";
import { errorHandler } from "./handlers/errorHandler.js";

import "./models/CalendarEvent.js";
import "./models/Course.js";
import "./models/Group.js";
import "./models/Location.js";
import "./models/Schedule.js";
import "./models/Teacher.js";

import calendarEventRoutes from "./routes/calendarEvents.js";
import courseRoutes from "./routes/courses.js";
import entityRoutes from "./routes/entities.js";
import scheduleRoutes from "./routes/schedules.js";

const server = express();

const port = 4000;

server.use(cors({ origin: "*" }));
server.use(bodyParser.json());

server.use("/api/entities", entityRoutes);
server.use("/api/courses", courseRoutes);
server.use("/api/schedules", scheduleRoutes);
server.use("/api", calendarEventRoutes);

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
