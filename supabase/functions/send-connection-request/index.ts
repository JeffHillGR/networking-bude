import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Check if we're in local development
const isLocal =
  Deno.env.get("SUPABASE_URL")?.includes("localhost") ||
  Deno.env.get("ENVIRONMENT") === "local";

// SMTP email function for local development (uses Supabase's built-in Inbucket SMTP)
async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  from: string = "admin@networkingbude.local",
  replyTo?: string,
) {
  try {
    console.log("📧 Sending email via local SMTP server");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${from}`);

    // Import nodemailer for actual SMTP sending
    const { createTransport } = await import('npm:nodemailer@6.9.10');

    // Create SMTP transporter for local development
    // Use container IP since edge functions run in same Docker network
    const transporter = createTransport({
      host: '172.30.1.7', // Mailpit container IP
      port: 1025, // Mailpit's internal SMTP port
      secure: false,
      auth: undefined, // No auth needed for local Mailpit
    });

    // Send the email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      replyTo,
    });

    console.log(`📧 Email sent successfully: ${info.messageId}`);
    console.log(`📧 View emails at: http://localhost:54324`);

    return {
      success: true,
      service: "smtp-local",
      messageId: info.messageId,
      webUrl: "http://localhost:54324",
      note: "Email sent via local SMTP - check Inbucket at http://localhost:54324",
    };
  } catch (error) {
    console.error("❌ SMTP email failed:", error.message);
    
    return {
      success: false,
      service: "smtp-error",
      messageId: "error",
      error: error.message,
      note: "Failed to send email via SMTP",
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get request body
    const { currentUserId, targetUserId, connectionMessage } = await req.json();

    // Validate required fields
    if (!currentUserId || !targetUserId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: currentUserId, targetUserId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get sender user details
    const { data: senderUser, error: senderUserError } = await supabaseClient
      .from("users")
      .select("name, email, title, company, photo")
      .eq("id", currentUserId)
      .single();

    if (senderUserError || !senderUser) {
      return new Response(JSON.stringify({ error: "Sender user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get target user details
    const { data: targetUser, error: targetUserError } = await supabaseClient
      .from("users")
      .select("name, email, title, company")
      .eq("id", targetUserId)
      .single();

    if (targetUserError || !targetUser) {
      return new Response(JSON.stringify({ error: "Target user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = senderUser.name;
    const senderEmail = senderUser.email;
    const senderTitle = senderUser.title || "";
    const senderCompany = senderUser.company || "";
    const senderPhoto = senderUser.photo || null;

    // Get the match record to get compatibility score
    const { data: matchRecord, error: matchError } = await supabaseClient
      .from("matches")
      .select("compatibility_score")
      .eq("user_id", currentUserId)
      .eq("matched_user_id", targetUserId)
      .single();

    if (matchError || !matchRecord) {
      return new Response(JSON.stringify({ error: "Match record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const connectionScore = matchRecord.compatibility_score;

    // STEP 1: Update the match status to 'pending' FIRST
    const { error: updateError } = await supabaseClient
      .from("matches")
      .update({
        status: "pending",
        pending_since: new Date().toISOString(),
      })
      .eq("user_id", currentUserId)
      .eq("matched_user_id", targetUserId);

    if (updateError) {
      console.error("Error updating match status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update match status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // STEP 2: Check if the other person already sent a request (mutual connection)
    const { data: reciprocalMatch, error: reciprocalError } =
      await supabaseClient
        .from("matches")
        .select("status")
        .eq("user_id", targetUserId)
        .eq("matched_user_id", currentUserId)
        .single();

    let connectionResult = "pending";

    // If they already requested, create mutual connection
    if (reciprocalMatch && reciprocalMatch.status === "pending") {
      // Update both matches to 'connected'
      await supabaseClient
        .from("matches")
        .update({ status: "connected" })
        .eq("user_id", currentUserId)
        .eq("matched_user_id", targetUserId);

      await supabaseClient
        .from("matches")
        .update({ status: "connected" })
        .eq("user_id", targetUserId)
        .eq("matched_user_id", currentUserId);

      connectionResult = "connected";
    }

    // STEP 3: Create notification for recipient
    const { error: notificationError } = await supabaseClient
      .from("notifications")
      .insert({
        user_id: targetUserId,
        from_user_id: currentUserId,
        type: "connection_request",
        message: `${senderName} wants to connect with you!`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the entire request for notification errors
    }

    // STEP 4: Send email LAST (after all database operations are complete)
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .header { background: linear-gradient(135deg, #009900 0%, #D0ED00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
            .profile-card { display: flex; align-items: center; gap: 20px; background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #D0ED00; }
            .profile-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #009900; flex-shrink: 0; }
            .profile-initials { width: 80px; height: 80px; border-radius: 50%; background: white; border: 3px solid #009900; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #009900; flex-shrink: 0; }
            .profile-info { flex: 1; }
            .profile-name { font-size: 20px; font-weight: bold; color: #009900; margin: 0 0 5px 0; }
            .profile-title { color: #666; margin: 0; font-size: 14px; }
            .badge { background: #D0ED00; color: #009900; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; font-size: 16px; }
            .button { display: inline-block; background: #009900; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; border: 2px solid #D0ED00; }
            .button:hover { background: #007700; }
            .message-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #009900; margin: 20px 0; font-style: italic; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .footer a { color: #009900; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 New Connection Request</h1>
            </div>
            <div class="content">
              <p><strong>Hi ${targetUser.name}</strong>,</p>

              <p>Someone wants to connect with you on Networking BudE!</p>

              <div class="profile-card">
                ${
                  senderPhoto
                    ? `<img src="${senderPhoto}" alt="${senderName}" class="profile-photo" />`
                    : `<div class="profile-initials">${getInitials(senderName)}</div>`
                }
                <div class="profile-info">
                  <h2 class="profile-name">${senderName}</h2>
                  ${senderTitle ? `<p class="profile-title">${senderTitle}${senderCompany ? ` at ${senderCompany}` : ""}</p>` : ""}
                  <span class="badge">${connectionScore}% Compatible</span>
                </div>
              </div>

              ${
                connectionMessage
                  ? `
                <div class="message-box">
                  <strong>Personal Message:</strong><br>
                  "${connectionMessage}"
                </div>
              `
                  : ""
              }

              <div style="text-align: center;">
                <a href="https://networking-bude.vercel.app/dashboard?tab=connections&highlightUser=${currentUserId}" class="button">
                  View Profile & Respond
                </a>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                Log in to see ${senderName}'s full profile and decide if you'd like to connect!
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by Networking BudE<br>
              <a href="https://networkingbude.com">networkingbude.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Mailpit (local) or Resend (production)
    let emailResult;
    if (isLocal) {
      console.log("🧪 Using SMTP for local email testing");
      emailResult = await sendEmailViaSMTP(
        targetUser.email,
        `${senderName} wants to connect with you on Networking BudE`,
        emailHtml,
        "BudE Team <team@mail.networkingbude.com>",
        'no-reply@mail.networkingbude.com',
      );
      console.log("✅ Connection email logged for SMTP:", emailResult);
    } else {
      console.log("📧 Using Resend for production email");
      emailResult = await resend.emails.send({
        from: "BudE Team <team@mail.networkingbude.com>",
        to: targetUser.email,
        subject: `${senderName} wants to connect with you on Networking BudE`,
        html: emailHtml,
        replyTo: 'no-reply@mail.networkingbude.com',
      });
      console.log("✅ Connection email sent via Resend:", emailResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        connectionResult,
        emailId: isLocal ? "mailhog-test" : emailResult.data?.id,
        emailService: isLocal ? emailResult.service : "resend",
        message: "Connection request sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in send-connection-request function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
