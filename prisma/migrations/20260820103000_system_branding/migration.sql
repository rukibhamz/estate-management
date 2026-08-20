CREATE TABLE "SystemBranding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appName" TEXT NOT NULL,
    "logoFileKey" TEXT,
    "logoMime" TEXT,
    "faviconFileKey" TEXT,
    "faviconMime" TEXT,
    "colorPrimary" TEXT NOT NULL,
    "colorCanvas" TEXT NOT NULL,
    "colorInk" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

INSERT INTO "SystemBranding" ("id", "appName", "colorPrimary", "colorCanvas", "colorInk", "updatedAt")
VALUES ('default', 'EstateFlow', '#1F6B4A', '#F4EDE3', '#1F1B16', CURRENT_TIMESTAMP);
