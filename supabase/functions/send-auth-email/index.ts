import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: "signup" | "recovery" | "magic_link";
  token?: string;
  redirect_to?: string;
}

const getEmailContent = (type: string, confirmationUrl: string) => {
  switch (type) {
    case "signup":
      return {
        subject: "🔥 Confirme seu email - Desafio 30 Dias",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔥 Desafio 30 Dias</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Pedro Bahia</p>
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Bem-vindo(a) ao Desafio! 🎉</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Estamos muito felizes em ter você conosco! Para começar sua jornada de transformação, confirme seu email clicando no botão abaixo:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Confirmar meu Email
                  </a>
                </div>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                  Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                  <a href="${confirmationUrl}" style="color: #f97316; word-break: break-all;">${confirmationUrl}</a>
                </p>
              </div>
              <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                  © 2024 Desafio 30 Dias - Pedro Bahia. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
    case "recovery":
      return {
        subject: "🔐 Recuperação de senha - Desafio 30 Dias",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔥 Desafio 30 Dias</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Pedro Bahia</p>
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Recuperar sua senha 🔐</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Redefinir minha Senha
                  </a>
                </div>
                <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                  Se você não solicitou essa alteração, pode ignorar este email com segurança.
                </p>
              </div>
              <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                  © 2024 Desafio 30 Dias - Pedro Bahia. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
    default:
      return {
        subject: "🔥 Link de acesso - Desafio 30 Dias",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔥 Desafio 30 Dias</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Pedro Bahia</p>
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Seu link de acesso 🔗</h2>
                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  Clique no botão abaixo para acessar sua conta:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Acessar minha Conta
                  </a>
                </div>
              </div>
              <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                  © 2024 Desafio 30 Dias - Pedro Bahia. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-auth-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // Handle Auth Hook format from Supabase
    const email = payload.user?.email || payload.email;
    const type = payload.email_data?.email_action_type || payload.type || "signup";
    
    // Build confirmation URL
    let confirmationUrl = "";
    if (payload.email_data) {
      const { token_hash, redirect_to, email_action_type } = payload.email_data;
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || ""}`;
    } else if (payload.confirmation_url) {
      confirmationUrl = payload.confirmation_url;
    }

    if (!email) {
      console.error("Email not provided in payload");
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = getEmailContent(type, confirmationUrl);

    console.log(`Sending ${type} email to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Desafio 30 Dias <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
