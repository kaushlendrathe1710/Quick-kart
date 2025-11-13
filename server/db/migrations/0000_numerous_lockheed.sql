CREATE TYPE "public"."account_type" AS ENUM('savings', 'current');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'assigned', 'in_progress', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('petrol', 'diesel', 'electric', 'cng', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."issue_type" AS ENUM('payment_issue', 'technical_problem', 'account_related', 'delivery_issue', 'vehicle_issue', 'other');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('applied', 'processing', 'paid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('completed', 'pending', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('received', 'pending', 'deducted', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('motorcycle', 'scooter', 'bicycle', 'car', 'van');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'seller', 'deliveryPartner');--> statement-breakpoint
CREATE TYPE "public"."card_type" AS ENUM('Visa', 'MasterCard', 'American Express', 'Discover', 'Rupay', 'Other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order', 'payment', 'delivery', 'promotion', 'account', 'system');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"address_type" varchar(50) NOT NULL,
	"address_line" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(100) DEFAULT 'India' NOT NULL,
	"landmark" text,
	"contact_number" varchar(15),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"image" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"delivery_partner_id" integer,
	"pickup_location" json NOT NULL,
	"drop_location" json NOT NULL,
	"buyer_id" integer NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"assigned_at" timestamp,
	"picked_up_at" timestamp,
	"delivered_at" timestamp,
	"rating_id" integer,
	"tip" numeric(10, 2) DEFAULT '0.00',
	"delivery_fee" numeric(10, 2) NOT NULL,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "deliveries_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_partner_bank_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_partner_id" integer NOT NULL,
	"account_holder_name" varchar(200) NOT NULL,
	"account_number" varchar(30) NOT NULL,
	"ifsc_code" varchar(11) NOT NULL,
	"bank_name" varchar(200) NOT NULL,
	"branch_name" varchar(200),
	"account_type" "account_type" DEFAULT 'savings' NOT NULL,
	"upi_id" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_partner_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_partner_id" integer NOT NULL,
	"aadhar_card" text,
	"pan_card" text,
	"driving_license" text,
	"vehicle_registration" text,
	"insurance_certificate" text,
	"aadhar_number" text,
	"pan_number" text,
	"license_number" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_partner_vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_partner_id" integer NOT NULL,
	"vehicle_type" "vehicle_type" NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"registration_number" varchar(20) NOT NULL,
	"color" varchar(50),
	"year" integer,
	"fuel_type" "fuel_type" NOT NULL,
	"insurance_certificate" text,
	"puc_certificate" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_partner_vehicles_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "delivery_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_id" integer NOT NULL,
	"delivery_partner_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"rating" smallint NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_ratings_delivery_id_unique" UNIQUE("delivery_id")
);
--> statement-breakpoint
CREATE TABLE "seller_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text,
	"business_address" text,
	"gst_number" varchar(15),
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
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"contact_number" varchar(15),
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
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0',
	"stock" integer DEFAULT 0 NOT NULL,
	"images" json,
	"specifications" json,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"card_holder_name" varchar(100) NOT NULL,
	"card_number" varchar(20) NOT NULL,
	"expiry_month" varchar(2) NOT NULL,
	"expiry_year" varchar(4) NOT NULL,
	"card_type" "card_type" NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"final_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	"order_status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"final_amount" numeric(10, 2) NOT NULL,
	"delivery_partner_id" integer,
	"tracking_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_partner_id" integer NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_earnings" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_withdrawn" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wallets_delivery_partner_id_unique" UNIQUE("delivery_partner_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_id" integer NOT NULL,
	"delivery_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'completed' NOT NULL,
	"description" text,
	"reference_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payout_status" DEFAULT 'applied' NOT NULL,
	"payment_reference_id" text,
	"payment_method" text,
	"rejection_reason" text,
	"applied_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_partner_id" integer NOT NULL,
	"issue_type" "issue_type" NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"admin_response" text,
	"admin_id" integer,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_partner_bank_details" ADD CONSTRAINT "delivery_partner_bank_details_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_partner_documents" ADD CONSTRAINT "delivery_partner_documents_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_partner_vehicles" ADD CONSTRAINT "delivery_partner_vehicles_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_info" ADD CONSTRAINT "seller_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_delivery_partner_id_users_id_fk" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "delivery_order_idx" ON "deliveries" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "delivery_partner_idx" ON "deliveries" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "delivery_buyer_idx" ON "deliveries" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "delivery_status_idx" ON "deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dp_bank_partner_idx" ON "delivery_partner_bank_details" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "dp_documents_partner_idx" ON "delivery_partner_documents" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "dp_vehicle_partner_idx" ON "delivery_partner_vehicles" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "dp_vehicle_reg_idx" ON "delivery_partner_vehicles" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "delivery_rating_delivery_idx" ON "delivery_ratings" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "delivery_rating_partner_idx" ON "delivery_ratings" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "delivery_rating_buyer_idx" ON "delivery_ratings" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "session" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "otp_email_idx" ON "otp_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_expires_at_idx" ON "otp_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "wallet_partner_idx" ON "wallets" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "transaction_wallet_idx" ON "wallet_transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "transaction_delivery_idx" ON "wallet_transactions" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "transaction_type_idx" ON "wallet_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transaction_status_idx" ON "wallet_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transaction_created_at_idx" ON "wallet_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payout_wallet_idx" ON "payouts" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "payout_status_idx" ON "payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payout_applied_at_idx" ON "payouts" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "ticket_partner_idx" ON "tickets" USING btree ("delivery_partner_id");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ticket_issue_type_idx" ON "tickets" USING btree ("issue_type");--> statement-breakpoint
CREATE INDEX "ticket_created_at_idx" ON "tickets" USING btree ("created_at");