import { Resend } from "resend";
import { getPasswordResetEmail } from "./emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  userName?: string,
) => {
  const emailContent = getPasswordResetEmail(resetUrl, userName);

  try {
    const { data, error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>", // Use verified domain later
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    console.log("✅ Email sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};
