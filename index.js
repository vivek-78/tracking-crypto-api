import express from "express";
import axios from "axios";
import cors from "cors";
import sendMail from "./sendEmail.js";
import bodyParser from "body-parser";
import cookies from "cookie-parser";
import jwt from "jsonwebtoken";
import auth from "./auth.js";
import User from "./models.js";
// import "./cronjob.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookies());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("Server is Up");
});

app.post("/register", async (req, res) => {
  console.log("/register");
  const { firstName, lastName, userId, email, password } = req.body;
  const existingUser = await User.findOne({ userId });
  const existingEmail = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "UserId already exists" });
  }
  if (existingEmail) {
    return res.status(409).json({ message: "email already registered" });
  }
  const user = await User.create({
    firstName,
    lastName,
    userId,
    email,
    password,
  });
  const token = jwt.sign({ userId: user.userId }, "samplekey");
  res.send({ token });
});
 
app.post("/login", async (req, res) => {
  console.log("/login")
  const { userId, password } = req.body;
  const user = await User.findOne({ userId, password });
  if (user) {
    const token = jwt.sign({ userId }, "samplekey");
    res.send({
      token,
      firstName: user.firstName,
      userId: user.userId,
      watchList:user.watchlist
    });
  } else {
    res.send("invalid details");
  }
});

app.post("/addToWatchlist", auth, async (req, res) => {
  console.log("/addToWatchlist")
  try {
    const { coin } = req.body;
    const user = req.user;
    if(!(user?.watchlist.includes(coin))){
      user?.watchlist?.push(coin);
      user?.emailWatchList.push({coinName:coin})
    }
    await user?.save();
    res.status(200).json({ message: "Item added to watchlist" });
  } catch (error) {
    console.error("Error adding item to watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/removeFromWatchlist", auth, async (req, res) => {
  console.log("/removeFromWatchlist");
  try {
    const { coin } = req.body;
    const user = req.user;
    const newWatchList = user?.watchlist.filter((watch)=> watch !== coin);
    const newEmailWatchlist = user?.emailWatchList.filter((coinData) => coinData.coinName !== coin);
    user.watchlist = newWatchList;
    user.emailWatchList = newEmailWatchlist;
    await user.save();
    res.status(200).json({ message: "Item removed from watchlist" });
  } catch (error) {
    console.error("Error removing item from watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/watchList", auth, async (req,res) =>{
  console.log("/watchList");
  const user = req.user;
  res.send(user?.watchlist);
})

app.get("/trendingCoins", async (req, res) => {
  console.log("/trendingCoins");
  const trendingCoins = [];
  const fetchedData = await axios.get(
    "https://api.coingecko.com/api/v3/search/trending"
  );
  fetchedData?.data?.coins?.map((coin) => {
    trendingCoins.push(coin.item.symbol);
  });
  res.send(trendingCoins);
});

app.post("/sendMail", async (req, res) => {
  sendMail("vivek74543@gmail.com");
  res.sendStatus(200);
});
app.get("/checkCornJob",async()=>{
  console.log("/checkCornJob")
  try {
    console.log("corn job try actitvated.....");
    const users = await User.find({}, "userId email firstName emailWatchList");
    for (var user of users) {
      if (user.emailWatchList.length > 0) {
        var email = user.email;
        var name = user.firstName;
        var watchlist = user.emailWatchList;
        var coins = "";
        var changedCoins = [];
        for (const coinData of watchlist){
         if(!coinData.mailSent) 
          coins = coins + coinData.coinName + ",";
          coinData.mailSent = true;
        }
        console.log(coins);
        const fetchedData = await axios.get(
          `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coins}&tsyms=USD&api_key=6706b43124d7e0ea0461ed0aaba8e7f1ce88391081c5059678c0dd8fc9136325`
        );
        const coinsData = fetchedData?.data?.DISPLAY;
        for (var fetchedCoin in coinsData) {
          if (Math.abs(coinsData[fetchedCoin].USD.CHANGEPCT24HOUR) > 0) {
            changedCoins.push({
              coin: fetchedCoin, 
              change_percent: coinsData[fetchedCoin]?.USD?.CHANGEPCT24HOUR+"%",
            });
          }
        }
        if(changedCoins.length > 0){
        await sendMail(email,name,changedCoins);
        user.emailWatchList = watchlist;
        user.save();
        console.log("mail sent!!");
        }
      }
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
})
app.listen(8080, () => {
  console.log("server running on port 8080");
});
