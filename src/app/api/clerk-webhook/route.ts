// src/app/api/clerk-webhook/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { supabaseClient as supabase, supabaseAdmin } from "@/lib/supabaseClient"; // Assuming alias @ is configured for src
import { updateUserProfile, getUserById } from "@/lib/supabaseCRUD"; // Assuming alias @ is configured for src

// Ensure your Supabase client and CRUD functions are correctly imported
// If you don't have path aliases configured, use relative paths:
// import { supabase } from "../../../lib/supabaseClient";
// import { updateUserProfile, getUserProfile } from "../../../lib/supabaseCRUD";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("Clerk Webhook Secret not found in environment variables.");
    return new Response("Error: Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Webhook verification failed", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook event type: ${eventType} for user ID: ${id}`);

  if (!supabase) {
    console.error("Supabase client not initialized. Cannot process webhook.");
    return new Response("Error: Database client not initialized", { status: 500 });
  }

  // Handle the event
  switch (eventType) {
    case "user.created":
    case "user.updated":
      const userId = evt.data.id;
      const emailAddress = evt.data.email_addresses?.find(
        (email) => email.id === evt.data.primary_email_address_id
      )?.email_address;
      const username = evt.data.username;
      const avatarUrl = evt.data.image_url;

      if (!userId) {
        console.error("User ID not found in webhook payload for user.created/updated event.");
        return new Response("Error: Missing user ID", { status: 400 });
      }

      try {
        // ユーザー情報を取得
        const firstName = evt.data.first_name || '';
        const lastName = evt.data.last_name || '';
        const email = emailAddress || '';

        // ユーザーテーブルにユーザー情報を挿入または更新
        console.log(`Upserting user data for user ID: ${userId}`);

        // サービスロールキーを使用してRLSをバイパス
        const { data: userData, error: userError } = await supabaseAdmin
          .from("users")
          .upsert([
            {
              id: userId,
              email: email,
              first_name: firstName,
              last_name: lastName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (userError) {
          console.error("Error upserting user via webhook:", userError);
          throw userError;
        }

        console.log("User data upserted successfully:", userData);

        // プロファイルテーブルが存在する場合は、そちらも更新
        try {
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert([
              {
                id: userId,
                username: username || (email ? email.split("@")[0] : ''),
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (profileError) {
            // プロファイルテーブルが存在しない場合はエラーを無視
            console.warn("Profile table might not exist or other error:", profileError);
          } else {
            console.log("Profile data upserted successfully:", profileData);
          }
        } catch (profileError) {
          // プロファイル更新のエラーはメインの処理に影響しないようにする
          console.warn("Error updating profile, but user update was successful:", profileError);
        }
      } catch (dbError) {
        console.error("Database error handling user.created/updated webhook:", dbError);
        return new Response("Error: Database operation failed", { status: 500 });
      }
      break;

    case "user.deleted":
      // ユーザー削除の処理
      const deletedUserId = evt.data.id;
      if (deletedUserId) {
        console.log(`User deleted event for user ID: ${deletedUserId}. Deleting user data.`);

        try {
          // サービスロールキーを使用してRLSをバイパス
          const { error } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", deletedUserId);

          if (error) {
            console.error("Error deleting user data:", error);
            throw error;
          }

          console.log(`User data deleted successfully for user ID: ${deletedUserId}`);
        } catch (deleteError) {
          console.error("Error handling user deletion:", deleteError);
          return new Response("Error: Failed to delete user data", { status: 500 });
        }
      } else {
        console.warn("User ID not found in webhook payload for user.deleted event.");
      }
      break;

    // Add other event types as needed (e.g., session.created, organization.*, etc.)
    default:
      console.log(`Received unhandled webhook event type: ${eventType}`);
  }

  return new Response("Webhook received successfully", { status: 200 });
}
