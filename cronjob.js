import cron from "node-cron";
import User from "./models.js";
import axios from "axios";
import sendMail from "./sendEmail.js";

//cronjob for every 30min to send mails
cron.schedule("*/30 * * * *", async () => {
  console.log("corn job actitvated.....");
  try {
    console.log("corn job try actitvated.....");
    const users = await User.find({}, "userId email firstName emailWatchList");
    for (var user of users) {
      console.log("watchlist: "+user.emailWatchList)
      console.log("watchlist length: "+user.emailWatchList.length);
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
});

cron.schedule("0 0 * * *",async() => {
  console.log("cron job activated");
  try {
    const users = await User.find({}, "emailWatchlist");
    for (const user of users) {
      emailWatchlist = user?.emailWatchList;
      for(const coinData of emailWatchList)
        coinData.emailSent = false;
      await user.save();  
    }
  }catch(err){
    console.log(err);
  }
})
