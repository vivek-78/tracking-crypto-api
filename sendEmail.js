import nodemailer from "nodemailer";
import Mailgen from "mailgen";
const EMAIL = "cryptostracker0@gmail.com";
const PASSWORD = "gjuqvohvfnbizqiw";

const sendMail = (userEmail, name,data) => {
  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  };
  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/",
    },
  });
  let response = {
    body: {
      name,
      intro: "Huge price moves in your watchList!",
      table: {
        data,
      },
      outro: "These are coins with big moves today",
    },
  };
  let mail = MailGenerator.generate(response);
  let message = {
    from: EMAIL,
    to: userEmail,
    subject: "Place Order",
    html: mail,
  };
  transporter
    .sendMail(message)
    .then(() => {
      console.log("Done");
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

export default sendMail;
