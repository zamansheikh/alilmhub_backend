import nodemailer from "nodemailer";
import config from "../../config";
import { ISendEmail } from "./email.type";
import { logger } from "../logger/logger";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: config.email.port === "465", // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `"Alilmhub" ${config.email.from}`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    logger.info("Mail send successfully", info.accepted);
  } catch (error) {
    logger.error("Email", error);
  }
};

export const emailSender = {
  sendEmail,
};
