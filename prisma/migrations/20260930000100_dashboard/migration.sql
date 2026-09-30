-- CreateTable
CREATE TABLE "ProtectedAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "maskedIpAddress" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtectedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficEvent" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceIp" TEXT NOT NULL,
    "sourceCountry" TEXT NOT NULL,
    "requestPath" TEXT NOT NULL,
    "requestMethod" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "protectedAssetId" TEXT NOT NULL,
    "attackSessionId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "TrafficEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskDecision" (
    "id" TEXT NOT NULL,
    "trafficEventId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "matchedRules" JSONB NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttackSession" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sessionCode" TEXT NOT NULL,
    "sourceIp" TEXT NOT NULL,
    "sourceCountry" TEXT NOT NULL,
    "attackType" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "ghostEnvironmentId" TEXT,
    "protectedAssetId" TEXT NOT NULL,
    "assignedAnalystId" TEXT,
    "simulated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AttackSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAction" (
    "id" TEXT NOT NULL,
    "attackSessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionType" TEXT NOT NULL,
    "commandText" TEXT,
    "filePath" TEXT,
    "result" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "simulated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SessionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GhostEnvironment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "serviceTemplate" TEXT NOT NULL,
    "networkProfile" TEXT NOT NULL,
    "simulationLevel" TEXT NOT NULL,
    "loggingLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STOPPED',
    "isolationStatus" TEXT NOT NULL DEFAULT 'SIMULATED_ISOLATION',
    "cpuUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memoryUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GhostEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedUserId" TEXT,
    "trafficEventId" TEXT,
    "attackSessionId" TEXT,
    "ghostEnvironmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "simulated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatIndicator" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "indicatorType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "simulated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ThreatIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "generatedById" TEXT NOT NULL,
    "fileUrl" TEXT,
    "snapshot" JSONB NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "userId" TEXT NOT NULL,
    "notificationPreferences" JSONB NOT NULL DEFAULT '{"alerts":true,"simulation":true}',
    "detectionSensitivity" INTEGER NOT NULL DEFAULT 50,
    "monitorThreshold" INTEGER NOT NULL DEFAULT 25,
    "divertThreshold" INTEGER NOT NULL DEFAULT 60,
    "blockThreshold" INTEGER NOT NULL DEFAULT 90,
    "ghostDefaults" JSONB NOT NULL DEFAULT '{}',
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationState" (
    "userId" TEXT NOT NULL,
    "running" BOOLEAN NOT NULL DEFAULT false,
    "speed" INTEGER NOT NULL DEFAULT 1,
    "lastTick" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "MutationReceipt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MutationReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProtectedAsset_ownerId_status_idx" ON "ProtectedAsset"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProtectedAsset_ownerId_hostname_key" ON "ProtectedAsset"("ownerId", "hostname");

-- CreateIndex
CREATE INDEX "TrafficEvent_ownerId_timestamp_idx" ON "TrafficEvent"("ownerId", "timestamp");

-- CreateIndex
CREATE INDEX "TrafficEvent_ownerId_riskScore_idx" ON "TrafficEvent"("ownerId", "riskScore");

-- CreateIndex
CREATE INDEX "TrafficEvent_ownerId_decision_status_idx" ON "TrafficEvent"("ownerId", "decision", "status");

-- CreateIndex
CREATE INDEX "TrafficEvent_ownerId_sourceIp_timestamp_idx" ON "TrafficEvent"("ownerId", "sourceIp", "timestamp");

-- CreateIndex
CREATE INDEX "TrafficEvent_protectedAssetId_idx" ON "TrafficEvent"("protectedAssetId");

-- CreateIndex
CREATE INDEX "TrafficEvent_attackSessionId_idx" ON "TrafficEvent"("attackSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskDecision_trafficEventId_key" ON "RiskDecision"("trafficEventId");

-- CreateIndex
CREATE UNIQUE INDEX "AttackSession_sessionCode_key" ON "AttackSession"("sessionCode");

-- CreateIndex
CREATE INDEX "AttackSession_ownerId_status_startedAt_idx" ON "AttackSession"("ownerId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "AttackSession_ownerId_riskScore_idx" ON "AttackSession"("ownerId", "riskScore");

-- CreateIndex
CREATE INDEX "AttackSession_ghostEnvironmentId_idx" ON "AttackSession"("ghostEnvironmentId");

-- CreateIndex
CREATE INDEX "AttackSession_protectedAssetId_idx" ON "AttackSession"("protectedAssetId");

-- CreateIndex
CREATE INDEX "AttackSession_assignedAnalystId_idx" ON "AttackSession"("assignedAnalystId");

-- CreateIndex
CREATE INDEX "SessionAction_attackSessionId_timestamp_idx" ON "SessionAction"("attackSessionId", "timestamp");

-- CreateIndex
CREATE INDEX "GhostEnvironment_createdById_status_idx" ON "GhostEnvironment"("createdById", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GhostEnvironment_createdById_name_key" ON "GhostEnvironment"("createdById", "name");

-- CreateIndex
CREATE INDEX "Alert_ownerId_status_createdAt_idx" ON "Alert"("ownerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_ownerId_severity_idx" ON "Alert"("ownerId", "severity");

-- CreateIndex
CREATE INDEX "Alert_assignedUserId_idx" ON "Alert"("assignedUserId");

-- CreateIndex
CREATE INDEX "Alert_trafficEventId_idx" ON "Alert"("trafficEventId");

-- CreateIndex
CREATE INDEX "Alert_attackSessionId_idx" ON "Alert"("attackSessionId");

-- CreateIndex
CREATE INDEX "Alert_ghostEnvironmentId_idx" ON "Alert"("ghostEnvironmentId");

-- CreateIndex
CREATE INDEX "ThreatIndicator_ownerId_lastSeen_idx" ON "ThreatIndicator"("ownerId", "lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatIndicator_ownerId_indicatorType_value_simulated_key" ON "ThreatIndicator"("ownerId", "indicatorType", "value", "simulated");

-- CreateIndex
CREATE INDEX "Report_generatedById_createdAt_idx" ON "Report"("generatedById", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_resourceType_resourceId_idx" ON "AuditLog"("userId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "MutationReceipt_userId_createdAt_idx" ON "MutationReceipt"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProtectedAsset" ADD CONSTRAINT "ProtectedAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficEvent" ADD CONSTRAINT "TrafficEvent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficEvent" ADD CONSTRAINT "TrafficEvent_protectedAssetId_fkey" FOREIGN KEY ("protectedAssetId") REFERENCES "ProtectedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficEvent" ADD CONSTRAINT "TrafficEvent_attackSessionId_fkey" FOREIGN KEY ("attackSessionId") REFERENCES "AttackSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskDecision" ADD CONSTRAINT "RiskDecision_trafficEventId_fkey" FOREIGN KEY ("trafficEventId") REFERENCES "TrafficEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackSession" ADD CONSTRAINT "AttackSession_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackSession" ADD CONSTRAINT "AttackSession_ghostEnvironmentId_fkey" FOREIGN KEY ("ghostEnvironmentId") REFERENCES "GhostEnvironment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackSession" ADD CONSTRAINT "AttackSession_protectedAssetId_fkey" FOREIGN KEY ("protectedAssetId") REFERENCES "ProtectedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttackSession" ADD CONSTRAINT "AttackSession_assignedAnalystId_fkey" FOREIGN KEY ("assignedAnalystId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAction" ADD CONSTRAINT "SessionAction_attackSessionId_fkey" FOREIGN KEY ("attackSessionId") REFERENCES "AttackSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GhostEnvironment" ADD CONSTRAINT "GhostEnvironment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_trafficEventId_fkey" FOREIGN KEY ("trafficEventId") REFERENCES "TrafficEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_attackSessionId_fkey" FOREIGN KEY ("attackSessionId") REFERENCES "AttackSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_ghostEnvironmentId_fkey" FOREIGN KEY ("ghostEnvironmentId") REFERENCES "GhostEnvironment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreatIndicator" ADD CONSTRAINT "ThreatIndicator_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationState" ADD CONSTRAINT "SimulationState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutationReceipt" ADD CONSTRAINT "MutationReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

