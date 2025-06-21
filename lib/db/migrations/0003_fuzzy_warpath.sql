ALTER TABLE "breathing_guides" ADD COLUMN "serial" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "breathing_guides" DROP COLUMN "difficulty";--> statement-breakpoint
ALTER TABLE "breathing_guides" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "breathing_guides" ADD CONSTRAINT "breathing_guides_serial_unique" UNIQUE("serial");