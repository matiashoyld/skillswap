import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { db } from '~/server/db'; // Assuming your Prisma client is exported from here
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the necessary headers
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set in environment variables.');
    return new Response('Error: CLERK_WEBHOOK_SECRET is not configured.', { status: 500 });
  }

  // Get headers from the Request object
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Webhook error: Missing svix headers');
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get the body
  let payload: WebhookEvent;
  try {
    payload = await req.json() as WebhookEvent;
  } catch (err) {
    console.error('Webhook error: Invalid JSON payload', err);
    return new Response('Error: Invalid JSON', { status: 400 });
  }
  
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook error: Error verifying webhook signature:', err);
    return new Response('Error: Signature verification failed', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data; // User ID from Clerk
  const eventType = evt.type;

  console.log(`Webhook received: User ${id}, Event Type: ${eventType}`);

  // --- Handle the USER CREATED event --- 
  if (eventType === 'user.created') {
    console.log(`Processing user.created event for Clerk User ID: ${id}`);
    
    const userData = evt.data;
    
    // Ensure necessary data exists
    const primaryEmail = userData.email_addresses.find(e => e.id === userData.primary_email_address_id)?.email_address;

    if (!primaryEmail) {
      console.error(`Webhook error: Primary email not found for user ${id}`);
      // Respond with 200 OK even if email is missing to acknowledge receipt, 
      // but log the error. Clerk might send an update later.
      return new Response('Webhook received, primary email missing', { status: 200 });
    }

    try {
      // Check if user already exists in DB (idempotency)
      const existingUser = await db.user.findUnique({
        where: { clerkUserId: id },
      });

      if (existingUser) {
        console.log(`User ${id} already exists in DB. Skipping creation.`);
      } else {
        // Create the user in your Supabase DB via Prisma
        await db.user.create({
          data: {
            clerkUserId: String(id),
            email: primaryEmail,
            firstName: userData.first_name,
            lastName: userData.last_name,
            imageUrl: userData.image_url,
          },
        });
        console.log(`Successfully created user ${id} in database.`);
      }
    } catch (error) {
      console.error(`Webhook error: Failed to create user ${id} in database:`, error);
      // Return 500 to signal Clerk to retry if desired, or 200 if you don't want retries for DB errors.
      return new Response('Error: Failed to process webhook in database', { status: 500 });
    }
  }
  
  // --- Optional: Handle other events like user.updated or user.deleted --- 
  // Example for user.updated:
  /*
  if (eventType === 'user.updated') {
    console.log(`Processing user.updated event for Clerk User ID: ${id}`);
    const userData = evt.data;
    const primaryEmail = userData.email_addresses.find(e => e.id === userData.primary_email_address_id)?.email_address;
    
    if (!primaryEmail) {
       console.error(`Webhook error: Primary email not found for user ${id} during update`);
       return new Response('Webhook received, primary email missing', { status: 200 });
    }
    
    try {
       await db.user.update({
         where: { clerkUserId: id },
         data: {
           email: primaryEmail,
           firstName: userData.first_name,
           lastName: userData.last_name,
           imageUrl: userData.image_url,
         },
       });
       console.log(`Successfully updated user ${id} in database.`);
    } catch (error) {
       console.error(`Webhook error: Failed to update user ${id} in database:`, error);
       return new Response('Error: Failed to update user in database', { status: 500 });
    }
  }
  */
  
  // Example for user.deleted:
  /*
  if (eventType === 'user.deleted') {
     // Important: Check if it's a hard delete or soft delete if applicable
     const isHardDelete = evt.data.deleted; // Might vary based on Clerk event structure
     
     if(isHardDelete) {
       console.log(`Processing user.deleted event for Clerk User ID: ${id}`);
       try {
         await db.user.delete({
           where: { clerkUserId: id },
         });
         console.log(`Successfully deleted user ${id} from database.`);
       } catch (error) {
         console.error(`Webhook error: Failed to delete user ${id} from database:`, error);
         // Consider if a 404 (not found) should be ignored or logged
         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            console.log(`User ${id} not found in DB for deletion, skipping.`);
         } else {
           return new Response('Error: Failed to delete user from database', { status: 500 });
         }
       }
     }
  }
  */

  // Return a 200 response to acknowledge receipt of the event
  return new Response('Webhook processed successfully', { status: 200 });
} 