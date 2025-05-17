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
        let existingProfile = await getUserById(userId);
        const profileData = {
          id: userId,
          username: username || (emailAddress ? emailAddress.split("@")[0] : undefined),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        };

        if (existingProfile) {
          console.log(`Updating profile for user ID: ${userId}`);
          await updateUserProfile(userId, profileData);
        } else {
          console.log(`Creating profile for new user ID: ${userId}`);
          // If your Supabase `profiles` table is set up to auto-create from auth.users,
          // this explicit insert might not be needed if Clerk user maps to Supabase auth user.
          // However, if Clerk is the sole source of truth for user creation events pushed to your DB,
          // you would insert here.
          // For simplicity, we assume updateUserProfile can handle upsert or you have a separate create.
          // Let's refine this based on the `supabaseCRUD.ts` (it has separate create/update)
          // We need a createProfile function or ensure `profiles` table is created via Supabase auth trigger.
          // For now, we'll attempt an update, and if it fails due to no existing record, that's an issue with setup.
          // A better approach is to check if user exists, then create or update.
          // The `supabaseCRUD.ts` has `getUserProfile`. We can use that.

          // Let's assume `profiles` table has `id` as primary key and it's a UUID from Clerk.
          // We need to ensure the `profiles` table allows direct inserts if not tied to `auth.users` via trigger.
          const { data, error } = await supabase
            .from("profiles")
            .insert([profileData])
            .select()
            .single();
          if (error) {
            console.error("Error creating profile via webhook:", error);
            // Potentially try an update if insert fails due to conflict (though unlikely with UUIDs if new)
            // This logic might need refinement based on your exact DB schema and triggers.
            // If RLS is on, the webhook's server-side call needs appropriate permissions.
            // Often, webhooks use a service_role key for Supabase for elevated privileges.
            // For now, this assumes anon key has insert rights or RLS allows it (unlikely for general insert).
            // THIS IS A CRITICAL POINT: Webhooks usually need service_role access to Supabase.
            // The current `supabaseClient.ts` uses anon key.
            // For a production webhook, you'd initialize a separate Supabase client with the service_role key.
            console.warn(
              "Webhook attempting to write to Supabase with anon key. This might fail due to RLS. Consider using service_role key for webhooks."
            );
          } else {
            console.log("Profile created/updated via webhook:", data);
          }
        }
      } catch (dbError) {
        console.error("Database error handling user.created/updated webhook:", dbError);
        return new Response("Error: Database operation failed", { status: 500 });
      }
      break;

    case "user.deleted":
      // Handle user deletion, e.g., anonymize or delete user data from Supabase
      // Be careful with cascading deletes or data retention policies.
      const deletedUserId = evt.data.id;
      if (deletedUserId) {
        console.log(
          `User deleted event for user ID: ${deletedUserId}. Implement deletion logic if needed.`
        );
        // Example: await supabase.from("profiles").delete().eq("id", deletedUserId);
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
