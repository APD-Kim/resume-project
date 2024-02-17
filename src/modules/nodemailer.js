import nodemailer from "nodemailer";
import info from "../../config/sendInfo.json" assert { type: "json" };

const mailSender = {
  // 메일발송 함수
  sendGmail: async function (param) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      host: "smtp.gmail.com",
      auth: {
        user: info.user,
        pass: info.pass,
      },
    });
    // 메일 옵션
    let mailOptions = {
      from: info.user,
      to: param.toEmail,
      subject: param.subject,
      text: param.text,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};

export default mailSender;
