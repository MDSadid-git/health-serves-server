const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Health Serves Is Running");
});
app.listen(port, () => {
  console.log(`Health Serves Is Running ${port}`);
});
