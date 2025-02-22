const express = require("express");
const db = require("./db"); // Import koneksi database

const app = express();
const port = 3000;

// Route utama untuk menghindari "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Server berjalan! 🚀");
});

// Route untuk mengetes koneksi database
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS now");
    res.json({ message: "Database connected!", time: rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
