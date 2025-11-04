CREATE TABLE "delivery_partner_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"aadhar_card" text,
	"pan_card" text,
	"driving_license" text,
	"vehicle_registration" text,
	"insurance" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_partner_documents_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_partner_payment_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"account_holder_name" text,
	"account_number" varchar(20),
	"ifsc_code" varchar(11),
	"bank_name" text,
	"branch_name" text,
	"account_type" varchar(20),
	"upi_id" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_partner_payment_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_partner_vehicle_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"vehicle_type" varchar(50),
	"brand" varchar(50),
	"model" varchar(50),
	"registration_number" varchar(20),
	"color" varchar(30),
	"year" integer,
	"fuel" varchar(20),
	"insurance_expiry" timestamp,
	"puc_certificate_expiry" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_partner_vehicle_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"payment_type" varchar(20) NOT NULL,
	"card_holder_name" text,
	"card_number" varchar(19),
	"expiry_month" varchar(2),
	"expiry_year" varchar(4),
	"upi_id" varchar(100),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "delivery_partner_info" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "contact_number" varchar(15);--> statement-breakpoint
ALTER TABLE "delivery_partner_documents" ADD CONSTRAINT "delivery_partner_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_partner_payment_info" ADD CONSTRAINT "delivery_partner_payment_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_partner_vehicle_info" ADD CONSTRAINT "delivery_partner_vehicle_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_info" DROP COLUMN "bank_account_number";--> statement-breakpoint
ALTER TABLE "seller_info" DROP COLUMN "ifsc_code";