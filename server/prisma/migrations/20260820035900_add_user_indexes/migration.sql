-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_role_isVerified_idx" ON "User"("role", "isVerified");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_isVerified_idx" ON "User"("isVerified");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_schoolCategory_idx" ON "User"("schoolCategory");
