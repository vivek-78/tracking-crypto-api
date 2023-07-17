import cron from "node-cron";
import User from "./models.js";
import axios from "axios";
import sendMail from "./sendEmail.js";

//cronjob for every 30min to send mails
cron.schedule("*/1 * * * *", async () => {
  console.log("corn job actitvated");
  try {
    const users = await User.find({}, "userId email firstName watchlist");
    for (var user of users) {
      if (user?.watchlist.length > 0) {
        var email = user?.email;
        var name = user?.firstName;
        var watchlist = user?.watchlist;
        var coins = "";
        var changedCoins = [];
        for (const coin of watchlist) coins = coins + coin + ",";
        const fetchedData = await axios.get(
          `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coins}&tsyms=USD&api_key=6706b43124d7e0ea0461ed0aaba8e7f1ce88391081c5059678c0dd8fc9136325`
        );
        const coinsData = fetchedData?.data?.DISPLAY;
        for (var fetchedCoin in coinsData) {
          if (Math.abs(coinsData[fetchedCoin].USD.CHANGEPCT24HOUR) > 5) {
            changedCoins.push({
              coin: fetchedCoin,
              change_percent: coinsData[fetchedCoin]?.USD?.CHANGEPCT24HOUR,
            });
          }
        }
        await sendMail(email,name,changedCoins);
        console.log("mail sent!!");
      }
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
});
