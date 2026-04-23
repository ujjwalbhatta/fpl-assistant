-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('AVAILABLE', 'DOUBTFUL', 'INJURED', 'SUSPENDED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "GameweekStatusType" AS ENUM ('BLANK', 'SINGLE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "ChipType" AS ENUM ('WILDCARD', 'FREE_HIT', 'BENCH_BOOST', 'TRIPLE_CAPTAIN', 'NONE');

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "strength" INTEGER NOT NULL,
    "strengthAttackH" INTEGER NOT NULL,
    "strengthAttackA" INTEGER NOT NULL,
    "strengthDefenceH" INTEGER NOT NULL,
    "strengthDefenceA" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamGameweekStatus" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "status" "GameweekStatusType" NOT NULL DEFAULT 'SINGLE',
    "fixtureCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamGameweekStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "webName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "nowCost" INTEGER NOT NULL DEFAULT 0,
    "costChangeStart" INTEGER NOT NULL DEFAULT 0,
    "costChangeEvent" INTEGER NOT NULL DEFAULT 0,
    "status" "PlayerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "chanceOfPlayingNextRound" INTEGER,
    "chanceOfPlayingThisRound" INTEGER,
    "news" TEXT,
    "newsAdded" TIMESTAMP(3),
    "selectedByPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transfersIn" INTEGER NOT NULL DEFAULT 0,
    "transfersOut" INTEGER NOT NULL DEFAULT 0,
    "transfersInEvent" INTEGER NOT NULL DEFAULT 0,
    "transfersOutEvent" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "eventPoints" INTEGER NOT NULL DEFAULT 0,
    "form" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointsPerGame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "startsCount" INTEGER NOT NULL DEFAULT 0,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "bps" INTEGER NOT NULL DEFAULT 0,
    "cleanSheets" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "ownGoals" INTEGER NOT NULL DEFAULT 0,
    "penaltiesSaved" INTEGER NOT NULL DEFAULT 0,
    "penaltiesMissed" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "clearancesBlocksInterceptions" INTEGER NOT NULL DEFAULT 0,
    "defensiveContributions" INTEGER NOT NULL DEFAULT 0,
    "defensiveContributionPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "influence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "threat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ictIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "influenceRank" INTEGER,
    "creativityRank" INTEGER,
    "threatRank" INTEGER,
    "ictIndexRank" INTEGER,
    "expectedGoals" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedAssists" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGoalInvolvements" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGoalsConceded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGoalsPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedAssistsPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGIPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGCPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savesPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cleanSheetsPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalsConcededPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startsPer90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cornersOrder" INTEGER,
    "directFreekicksOrder" INTEGER,
    "penaltiesOrder" INTEGER,
    "valueIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fixtureScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "oldCost" INTEGER NOT NULL,
    "newCost" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGameweekStat" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "goalsScored" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "cleanSheet" BOOLEAN NOT NULL DEFAULT false,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "bps" INTEGER NOT NULL DEFAULT 0,
    "influence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creativity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "threat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ictIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGoals" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedAssists" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedGI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cbit" INTEGER NOT NULL DEFAULT 0,
    "cbirt" INTEGER NOT NULL DEFAULT 0,
    "dcPoints" INTEGER NOT NULL DEFAULT 0,
    "selected" INTEGER NOT NULL DEFAULT 0,
    "transfersIn" INTEGER NOT NULL DEFAULT 0,
    "transfersOut" INTEGER NOT NULL DEFAULT 0,
    "value" INTEGER NOT NULL DEFAULT 0,
    "wasHome" BOOLEAN NOT NULL DEFAULT false,
    "opponentTeamId" INTEGER,

    CONSTRAINT "PlayerGameweekStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeTeamDifficulty" INTEGER NOT NULL,
    "awayTeamDifficulty" INTEGER NOT NULL,
    "homeTeamScore" INTEGER,
    "awayTeamScore" INTEGER,
    "kickoffTime" TIMESTAMP(3),
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "finishedProvisional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gameweek" (
    "id" SERIAL NOT NULL,
    "fplId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "deadlineTime" TIMESTAMP(3) NOT NULL,
    "deadlineTimeEpoch" INTEGER NOT NULL,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isNext" BOOLEAN NOT NULL DEFAULT false,
    "isPrevious" BOOLEAN NOT NULL DEFAULT false,
    "averageEntryScore" INTEGER,
    "highestScore" INTEGER,
    "mostSelected" INTEGER,
    "mostTransferredIn" INTEGER,
    "topElement" INTEGER,
    "chipPlays" JSONB,
    "dgwTeams" JSONB,
    "bgwTeams" JSONB,
    "isDgw" BOOLEAN NOT NULL DEFAULT false,
    "isBgw" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gameweek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChipRecommendation" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "recommendedChip" "ChipType" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "availableChips" JSONB NOT NULL,
    "isCurrentDgw" BOOLEAN NOT NULL DEFAULT false,
    "isCurrentBgw" BOOLEAN NOT NULL DEFAULT false,
    "upcomingDgwGw" INTEGER,
    "upcomingBgwGw" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChipRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferAdviceCache" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "response" JSONB NOT NULL,
    "squadSnapshot" JSONB,
    "topPicksSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferAdviceCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTrend" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "rollingAvgPts" DOUBLE PRECISION NOT NULL,
    "formScore" DOUBLE PRECISION NOT NULL,
    "fixtureScore" DOUBLE PRECISION NOT NULL,
    "valueIndex" DOUBLE PRECISION NOT NULL,
    "dcAvgPerGame" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dcHitRatePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ownershipPct" DOUBLE PRECISION NOT NULL,
    "priceRiseCount" INTEGER NOT NULL DEFAULT 0,
    "isDgwNext" BOOLEAN NOT NULL DEFAULT false,
    "isBgwNext" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerTrend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamGameweekStatus_gameweek_idx" ON "TeamGameweekStatus"("gameweek");

-- CreateIndex
CREATE UNIQUE INDEX "TeamGameweekStatus_teamId_gameweek_key" ON "TeamGameweekStatus"("teamId", "gameweek");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_position_idx" ON "Player"("position");

-- CreateIndex
CREATE INDEX "Player_status_idx" ON "Player"("status");

-- CreateIndex
CREATE INDEX "Player_valueIndex_idx" ON "Player"("valueIndex");

-- CreateIndex
CREATE INDEX "Player_fixtureScore_idx" ON "Player"("fixtureScore");

-- CreateIndex
CREATE INDEX "PriceHistory_playerId_changedAt_idx" ON "PriceHistory"("playerId", "changedAt");

-- CreateIndex
CREATE INDEX "PlayerGameweekStat_gameweek_idx" ON "PlayerGameweekStat"("gameweek");

-- CreateIndex
CREATE INDEX "PlayerGameweekStat_playerId_idx" ON "PlayerGameweekStat"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGameweekStat_playerId_gameweek_key" ON "PlayerGameweekStat"("playerId", "gameweek");

-- CreateIndex
CREATE INDEX "Fixture_gameweek_idx" ON "Fixture"("gameweek");

-- CreateIndex
CREATE INDEX "Fixture_homeTeamId_gameweek_idx" ON "Fixture"("homeTeamId", "gameweek");

-- CreateIndex
CREATE INDEX "Fixture_awayTeamId_gameweek_idx" ON "Fixture"("awayTeamId", "gameweek");

-- CreateIndex
CREATE UNIQUE INDEX "Gameweek_fplId_key" ON "Gameweek"("fplId");

-- CreateIndex
CREATE INDEX "Gameweek_isCurrent_idx" ON "Gameweek"("isCurrent");

-- CreateIndex
CREATE INDEX "Gameweek_isNext_idx" ON "Gameweek"("isNext");

-- CreateIndex
CREATE INDEX "ChipRecommendation_teamId_idx" ON "ChipRecommendation"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "ChipRecommendation_teamId_gameweek_key" ON "ChipRecommendation"("teamId", "gameweek");

-- CreateIndex
CREATE INDEX "TransferAdviceCache_teamId_idx" ON "TransferAdviceCache"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferAdviceCache_teamId_gameweek_key" ON "TransferAdviceCache"("teamId", "gameweek");

-- CreateIndex
CREATE INDEX "PlayerTrend_gameweek_idx" ON "PlayerTrend"("gameweek");

-- CreateIndex
CREATE INDEX "PlayerTrend_valueIndex_idx" ON "PlayerTrend"("valueIndex");

-- CreateIndex
CREATE INDEX "PlayerTrend_rollingAvgPts_idx" ON "PlayerTrend"("rollingAvgPts");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTrend_playerId_gameweek_key" ON "PlayerTrend"("playerId", "gameweek");

-- AddForeignKey
ALTER TABLE "TeamGameweekStatus" ADD CONSTRAINT "TeamGameweekStatus_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameweekStat" ADD CONSTRAINT "PlayerGameweekStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
