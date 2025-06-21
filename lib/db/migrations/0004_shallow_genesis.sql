CREATE TYPE "public"."user_status" AS ENUM('regular', 'premium');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'regular' NOT NULL;