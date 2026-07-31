import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@pimpots.netlify.app";

let isConfigured = false;

export const configureEmail = () => {
  if (!SENDGRID_API_KEY) {
    console.warn(
      "[email] SendGrid API key not configured. Password reset emails will not be sent. " +
        "Set SENDGRID_API_KEY in your environment variables."
    );
    return false;
  }
  sgMail.setApiKey(SENDGRID_API_KEY);
  isConfigured = true;
  return true;
};

export interface PasswordResetEmailProps {
  to: string;
  firstName: string;
  temporaryPassword: string;
}

export const sendPasswordResetEmail = async (
  props: PasswordResetEmailProps
): Promise<boolean> => {
  if (!isConfigured && !configureEmail()) {
    console.error("[email] Cannot send email: SendGrid not configured");
    return false;
  }

  const { to, firstName, temporaryPassword } = props;

  const msg = {
    to,
    from: {
      email: SENDER_EMAIL,
      name: "Pimpôts - Réinitialisation de mot de passe",
    },
    subject: "Votre nouveau mot de passe temporaire - Pimpôts",
    text: `Bonjour ${firstName},

Vous avez demandé une réinitialisation de votre mot de passe pour Pimpôts.

Voici votre nouveau mot de passe temporaire :
${temporaryPassword}

Utilisez-le pour vous connecter, puis changez-le immédiatement dans votre profil.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe Pimpôts`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Réinitialisation de mot de passe - Pimpôts</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">Bonjour ${firstName},</h2>
    <p>Vous avez demandé une réinitialisation de votre mot de passe pour <strong>Pimpôts</strong>.</p>
    <p>Voici votre nouveau mot de passe temporaire :</p>
    <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 20px 0;">
      <code style="font-size: 18px; font-weight: bold; color: #2563eb;">${temporaryPassword}</code>
    </div>
    <p>Utilisez-le pour vous connecter, puis <strong>changez-le immédiatement</strong> dans votre profil.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
      Cordialement,<br>
      L'équipe Pimpôts
    </p>
  </div>
</body>
</html>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`[email] Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[email] Failed to send password reset email:", error);
    return false;
  }
};
