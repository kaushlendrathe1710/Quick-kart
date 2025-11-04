CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'seller', 'deliveryPartner');--> statement-breakpoint
CREATE TABLE "delivery_partner_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"vehicle_type" varchar(50),
	"vehicle_number" varchar(20),
	"service_region" varchar(100),
	"driving_license_number" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_partner_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "seller_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text,
	"business_address" text,
	"gst_number" varchar(15),
	"bank_account_number" varchar(20),
	"ifsc_code" varchar(11),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "seller_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp (6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"avatar" text,
	"is_approved" boolean DEFAULT false,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_partner_info" ADD CONSTRAINT "delivery_partner_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_info" ADD CONSTRAINT "seller_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "session" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "otp_email_idx" ON "otp_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_expires_at_idx" ON "otp_verifications" USING btree ("expires_at");