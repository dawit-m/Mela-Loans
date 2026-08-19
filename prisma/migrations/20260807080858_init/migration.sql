-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('bank', 'microfinance');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "institutions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "phone" VARCHAR(30),
    "address" VARCHAR(255),
    "contact_person" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_products" (
    "id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "eligible_status" TEXT[],
    "min_income" DECIMAL(12,2),
    "amount_min" DECIMAL(12,2) NOT NULL,
    "amount_max" DECIMAL(12,2) NOT NULL,
    "requires_guarantor" BOOLEAN NOT NULL DEFAULT false,
    "required_documents" TEXT,
    "interest_rate" VARCHAR(50),
    "repayment_term" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" SERIAL NOT NULL,
    "telegram_user_id" BIGINT NOT NULL,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "full_name" VARCHAR(150),
    "status" VARCHAR(30) NOT NULL,
    "monthly_income" DECIMAL(12,2),
    "desired_amount_min" DECIMAL(12,2) NOT NULL,
    "desired_amount_max" DECIMAL(12,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_screenshot_file_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loan_products_institution_id_idx" ON "loan_products"("institution_id");

-- CreateIndex
CREATE INDEX "loan_products_amount_min_amount_max_idx" ON "loan_products"("amount_min", "amount_max");

-- CreateIndex
CREATE INDEX "user_sessions_telegram_user_id_idx" ON "user_sessions"("telegram_user_id");

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
