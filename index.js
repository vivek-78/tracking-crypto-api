import express from "express";
import axios from "axios";
import cors from "cors";
import sendMail from "./sendEmail.js";

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
  console.log(fetchedData?.data?.coins);
  fetchedData?.data?.coins?.map((coin) => {
    trendingCoins.push(coin.item.symbol);
  });
  console.log(trendingCoins);
  res.send(trendingCoins);
});
app.post("/addToWatchlist",async(req,res)=>{});

app.post("/sendMail",async(req,res)=>{
   sendMail("vivek74543@gmail.com");
   res.sendStatus(200);
})
app.listen(8080, () => {
  console.log("server running on port 8080");
});
