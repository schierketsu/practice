-- Custom URL segment for company pages: /компания/{slug}
ALTER TABLE "Company" ADD COLUMN "slug" TEXT NOT NULL DEFAULT 'company-migrate';

UPDATE "Company" SET "slug" = 'company-' || id;

CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
