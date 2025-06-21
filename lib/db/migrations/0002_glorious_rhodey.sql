CREATE TABLE "breathing_guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"guide" text NOT NULL,
	"description" text NOT NULL,
	"audio_url" varchar(500),
	"duration" integer,
	"difficulty" varchar(50) DEFAULT 'beginner' NOT NULL,
	"category" varchar(100),
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
