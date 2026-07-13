CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bodyweight_entries" DROP CONSTRAINT "bodyweight_entries_date_unique";--> statement-breakpoint
ALTER TABLE "bodyweight_entries" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "mesocycles" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "personal_records" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "bodyweight_entries" ADD CONSTRAINT "bodyweight_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesocycles" ADD CONSTRAINT "mesocycles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bodyweight_entries" ADD CONSTRAINT "bodyweight_entries_user_date_unique" UNIQUE("user_id","date");