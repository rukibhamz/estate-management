-- Organizations & tenant isolation
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COMPANY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "Organization_name_idx" ON "Organization"("name");

CREATE TABLE "OrganizationMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");
CREATE INDEX "OrganizationMembership_userId_idx" ON "OrganizationMembership"("userId");

CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrganizationInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OrganizationInvitation_tokenHash_key" ON "OrganizationInvitation"("tokenHash");
CREATE INDEX "OrganizationInvitation_organizationId_email_idx" ON "OrganizationInvitation"("organizationId", "email");
CREATE INDEX "OrganizationInvitation_email_idx" ON "OrganizationInvitation"("email");

CREATE TABLE "SystemEmailSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

ALTER TABLE "Project" ADD COLUMN "organizationId" TEXT;

-- One org per project owner
INSERT INTO "Organization" ("id", "name", "type", "createdAt", "updatedAt")
SELECT
    'org_' || u."id",
    u."name" || ' Workspace',
    'COMPANY',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Project" p WHERE p."ownerId" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "Organization" o WHERE o."id" = 'org_' || u."id");

INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId", "role", "status", "createdAt", "updatedAt")
SELECT
    'om_owner_' || u."id",
    'org_' || u."id",
    u."id",
    'OWNER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Project" p WHERE p."ownerId" = u."id")
  AND NOT EXISTS (
    SELECT 1 FROM "OrganizationMembership" om WHERE om."organizationId" = 'org_' || u."id" AND om."userId" = u."id"
  );

UPDATE "Project" SET "organizationId" = 'org_' || "ownerId" WHERE "organizationId" IS NULL;

-- Org for users with subscriptions but no org (e.g. platform admin)
INSERT INTO "Organization" ("id", "name", "type", "createdAt", "updatedAt")
SELECT
    'org_' || u."id",
    u."name" || ' Workspace',
    'INDIVIDUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Subscription" s WHERE s."userId" = u."id")
  AND NOT EXISTS (SELECT 1 FROM "Organization" o WHERE o."id" = 'org_' || u."id");

INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId", "role", "status", "createdAt", "updatedAt")
SELECT
    'om_owner_' || u."id",
    'org_' || u."id",
    u."id",
    'OWNER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Subscription" s WHERE s."userId" = u."id")
  AND NOT EXISTS (
    SELECT 1 FROM "OrganizationMembership" om WHERE om."organizationId" = 'org_' || u."id" AND om."userId" = u."id"
  );

-- Project members join the project's organization
INSERT INTO "OrganizationMembership" ("id", "organizationId", "userId", "role", "status", "createdAt", "updatedAt")
SELECT
    'om_' || pm."userId" || '_' || p."organizationId",
    p."organizationId",
    pm."userId",
    'MEMBER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ProjectMembership" pm
JOIN "Project" p ON p."id" = pm."projectId"
WHERE pm."userId" IS NOT NULL
  AND pm."status" = 'ACTIVE'
  AND p."organizationId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "OrganizationMembership" om
    WHERE om."organizationId" = p."organizationId" AND om."userId" = pm."userId"
  );

CREATE TABLE "Subscription_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "status" TEXT NOT NULL DEFAULT 'TRIALING',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "Subscription_new" ("id", "organizationId", "plan", "status", "seats", "notes", "startedAt", "currentPeriodEnd", "createdAt", "updatedAt")
SELECT
    s."id",
    'org_' || s."userId",
    s."plan",
    s."status",
    s."seats",
    s."notes",
    s."startedAt",
    s."currentPeriodEnd",
    s."createdAt",
    s."updatedAt"
FROM "Subscription" s
WHERE EXISTS (SELECT 1 FROM "Organization" o WHERE o."id" = 'org_' || s."userId");

DROP TABLE "Subscription";
ALTER TABLE "Subscription_new" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

INSERT INTO "Subscription" ("id", "organizationId", "plan", "status", "seats", "startedAt", "currentPeriodEnd", "createdAt", "updatedAt")
SELECT
    'sub_' || o."id",
    o."id",
    'TRIAL',
    'TRIALING',
    5,
    CURRENT_TIMESTAMP,
    datetime('now', '+14 days'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Organization" o
WHERE NOT EXISTS (SELECT 1 FROM "Subscription" s WHERE s."organizationId" = o."id");

CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

INSERT INTO "SystemEmailSettings" ("id", "enabled", "smtpPort", "smtpSecure", "updatedAt")
VALUES ('default', 0, 587, 0, CURRENT_TIMESTAMP);
