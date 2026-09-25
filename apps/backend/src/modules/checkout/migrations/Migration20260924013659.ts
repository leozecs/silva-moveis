import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260924013659 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "checkout_attempt" drop constraint if exists "checkout_attempt_idempotency_key_unique";`);
    this.addSql(`alter table if exists "checkout_attempt" drop constraint if exists "checkout_attempt_cart_id_unique";`);
    this.addSql(`create table if not exists "checkout_attempt" ("id" text not null, "cart_id" text not null, "customer_id" text not null, "idempotency_key" text not null, "fingerprint" text not null, "method" text check ("method" in ('credit_card', 'pix', 'boleto')) not null, "amount" numeric not null, "currency_code" text not null, "state" text check ("state" in ('creating', 'pending', 'paid', 'failed', 'canceled', 'expired', 'unknown')) not null default 'creating', "order_id" text null, "payment_session_id" text null, "expires_at" timestamptz not null, "last_error" text null, "test_only" boolean not null default true, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "checkout_attempt_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_checkout_attempt_cart_id_unique" ON "checkout_attempt" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_checkout_attempt_customer_id" ON "checkout_attempt" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_checkout_attempt_idempotency_key_unique" ON "checkout_attempt" ("idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_checkout_attempt_expires_at" ON "checkout_attempt" ("expires_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_checkout_attempt_deleted_at" ON "checkout_attempt" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "checkout_attempt" cascade;`);
  }

}
