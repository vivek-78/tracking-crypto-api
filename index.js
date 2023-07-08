const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
app.use(cors());

app.get("/", async (req, res) => {
  res.send("Server is Up");
});
app.get("/trendingCoins", async (req, res) => {
  const trendingCoins = [];
  const fetchedData = await axios.get(
    "https://api.coingecko.com/api/v3/search/trending"
  );
  fetchedData?.data?.coins?.map((coin) => {
    trendingCoins.push(coin.item.symbol);
  });
  res.send(trendingCoins);
});
app.listen(8080, () => {
  console.log("server running on port 8080");
});
