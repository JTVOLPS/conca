export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { resend } = await import("./resend");
  if (!resend) return; // graceful no-op in dev
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Conca <notifications@conca.app>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
