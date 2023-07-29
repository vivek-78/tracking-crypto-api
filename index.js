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
  const { firstName, lastName, userId, email, password } = req.body;
  const existingUser = await User.findOne({ userId });
  const existingEmail = await User.findOne({ email });
  if (existingUser || existingEmail) {
    return res.status(409).json({ message: "User already exists" });
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
  try {
    const { coin } = req.body;
    const user = req.user;
    if(!(user.watchlist.includes(coin))){
      user?.watchlist?.push(coin);
    }
    await user?.save();
    res.status(200).json({ message: "Item added to watchlist" });
  } catch (error) {
    console.error("Error adding item to watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/removeFromWatchlist", auth, async (req, res) => {
  try {
    const { coin } = req.body;
    const user = req.user;
    const watchList = user?.watchlist;
    user.watchlist = watchList.filter((watch)=> watch !== coin);
    await user?.save();
    res.status(200).json({ message: "Item removed from watchlist" });
  } catch (error) {
    console.error("Error removing item from watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/watchList", auth, async (req,res) =>{
  const user = req.user;
  res.send(user?.watchlist);
})

app.get("/trendingCoins", async (req, res) => {
  const trendingCoins = [];
  const fetchedData = await axios.get(
    "https://api.coingecko.com/api/v3/search/trending"
  );
  fetchedData?.data?.coins?.map((coin) => {
    trendingCoins.push(coin.item.symbol);
  });
  // console.log(trendingCoins);
  res.send(trendingCoins);
});

app.post("/sendMail", async (req, res) => {
  sendMail("vivek74543@gmail.com");
  res.sendStatus(200);
});
app.listen(8080, () => {
  console.log("server running on port 8080");
});
