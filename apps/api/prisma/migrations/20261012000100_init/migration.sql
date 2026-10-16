-- Initial production schema for Lumielle Flowers.
CREATE TYPE "OrderStatus" AS ENUM ('new', 'confirmed', 'delivering', 'delivered', 'cancelled');

CREATE TABLE "Customer" ("id" TEXT NOT NULL, "phone" TEXT NOT NULL, "name" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Customer_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Admin" ("id" TEXT NOT NULL, "login" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Admin_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Category" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Product" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "titleUz" TEXT NOT NULL, "titleRu" TEXT, "descriptionUz" TEXT, "descriptionRu" TEXT, "price" INTEGER NOT NULL, "discountPrice" INTEGER, "isActive" BOOLEAN NOT NULL DEFAULT false, "categoryId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Product_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProductImage" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "originalPath" TEXT NOT NULL, "smPath" TEXT NOT NULL, "mdPath" TEXT NOT NULL, "lgPath" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Order" ("id" TEXT NOT NULL, "number" SERIAL NOT NULL, "customerId" TEXT NOT NULL, "customerName" TEXT NOT NULL, "customerPhone" TEXT NOT NULL, "recipientPhone" TEXT NOT NULL, "address" TEXT NOT NULL, "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION, "note" TEXT, "status" "OrderStatus" NOT NULL DEFAULT 'new', "total" INTEGER NOT NULL, "idempotencyKey" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Order_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OrderItem" ("id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "productId" TEXT, "productTitle" TEXT NOT NULL, "unitPrice" INTEGER NOT NULL, "quantity" INTEGER NOT NULL, "lineTotal" INTEGER NOT NULL, CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OrderStatusHistory" ("id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "status" "OrderStatus" NOT NULL, "note" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id"));
CREATE TABLE "OtpCode" ("id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "codeHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE UNIQUE INDEX "Admin_login_key" ON "Admin"("login");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
