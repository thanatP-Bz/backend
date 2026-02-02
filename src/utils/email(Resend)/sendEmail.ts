import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your App Name <onboarding@resend.dev>", // Change this later to your domain
      to,
      subject,
      html,
      ...(text && { text }), // Include text version if provided
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error("Failed to send email");
    }

    console.log("✅ Email sent successfully:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};
