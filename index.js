const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const  connectDB  = require("./db/connectDB.js");
const authRoutes = require("./routes/auth.route.js");
const userRoutes=require("./routes/user.route.js");
const briefRoutes=require("./routes/brief.route.js");
const campaignRoutes=require("./routes/campaign.route.js");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json()); // Allows us to parse incoming JSON requests
app.use(cookieParser()); // Allows us to parse incoming cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/", briefRoutes);
app.use("/api/", campaignRoutes);
app.use("/api/user",userRoutes);
// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Start server
const server = app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port:", PORT);
});

// Export for testing or external use
module.exports = server;
