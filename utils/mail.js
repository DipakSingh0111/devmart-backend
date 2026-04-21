import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  auth: {
    user:process.env.EMAIL ,
    pass: process.env.APP_PASSWORD,
  },
  
});

export const sendOtpMail = async({to, otp})=>{
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "OTP for Password Reset",
        html: `<p>Your OTP for password reset is ${otp}. It is valid for 10 minutes.</p>`
        
    })
}
