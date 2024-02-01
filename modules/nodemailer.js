import nodemailer from "nodemailer";
import info from "../config/sendInfo.json" assert { type: "json" };

const mailSender = {
  // 메일발송 함수
  sendGmail: async function (param) {
    var transporter = nodemailer.createTransport({
      service: "gmail", // 메일 보내는 곳
      port: 587,
      host: "smtp.gmail.com",
      secure: false,
      requireTLS: true,
      auth: {
        user: info.user, // 보내는 메일의 주소
        pass: info.pass, // 보내는 메일의 비밀번호
      },
    });
    // 메일 옵션
    var mailOptions = {
      from: info.user, // 보내는 메일의 주소
      to: param.toEmail, // 수신할 이메일
      subject: param.subject, // 메일 제목
      text: param.text, // 메일 내용
    };

    // 메일 발송
    let resp = await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};

export default mailSender;
