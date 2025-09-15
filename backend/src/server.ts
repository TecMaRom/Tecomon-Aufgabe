import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./services/db";
import widgetRoutes from "./routes/widgets";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/widgets", widgetRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
