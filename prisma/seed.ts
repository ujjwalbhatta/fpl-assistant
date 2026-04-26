import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const FPL_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

function mapStatus(status: string) {
  const map: Record<
    string,
    'AVAILABLE' | 'DOUBTFUL' | 'INJURED' | 'SUSPENDED' | 'UNAVAILABLE'
  > = {
    a: 'AVAILABLE',
    d: 'DOUBTFUL',
    i: 'INJURED',
    s: 'SUSPENDED',
    u: 'UNAVAILABLE',
  };
  return map[status] ?? 'UNAVAILABLE';
}

async function main() {
  console.log('Fetching FPL data...');
  const { data } = await axios.get(FPL_URL);
  console.log(
    `Got ${data.teams.length} teams, ${data.elements.length} players, ${data.events.length} gameweeks`,
  );

  // 1. Teams
  for (const team of data.teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: { name: team.name, shortName: team.short_name },
      create: { id: team.id, name: team.name, shortName: team.short_name },
    });
  }
  console.log(`Seeded ${data.teams.length} teams`);

  // 2. Gameweeks
  for (const gw of data.events) {
    await prisma.gameweek.upsert({
      where: { id: gw.id },
      update: {
        isCurrent: gw.is_current,
        isNext: gw.is_next,
        finished: gw.finished,
      },
      create: {
        id: gw.id,
        name: gw.name,
        isCurrent: gw.is_current,
        isNext: gw.is_next,
        finished: gw.finished,
      },
    });
  }
  console.log(`Seeded ${data.events.length} gameweeks`);

  // 3. Players
  for (const p of data.elements) {
    await prisma.player.upsert({
      where: { id: p.id },
      update: {
        nowCost: p.now_cost,
        form: parseFloat(p.form) || 0,
        totalPoints: p.total_points,
        pointsPerGame: parseFloat(p.points_per_game) || 0,
        selectedByPercent: parseFloat(p.selected_by_percent) || 0,
        transfersInEvent: p.transfers_in_event,
        status: mapStatus(p.status),
        chanceOfPlayingNextRound: p.chance_of_playing_next_round,
        news: p.news || null,
        goalsScored: p.goals_scored,
        assists: p.assists,
        cleanSheets: p.clean_sheets,
        ictIndex: parseFloat(p.ict_index) || 0,
        expectedGIPer90: parseFloat(p.expected_goal_involvements_per_90) || 0,
        penaltiesOrder: p.penalties_order,
      },
      create: {
        id: p.id,
        webName: p.web_name,
        position: p.element_type,
        teamId: p.team,
        nowCost: p.now_cost,
        form: parseFloat(p.form) || 0,
        totalPoints: p.total_points,
        pointsPerGame: parseFloat(p.points_per_game) || 0,
        selectedByPercent: parseFloat(p.selected_by_percent) || 0,
        transfersInEvent: p.transfers_in_event,
        status: mapStatus(p.status),
        chanceOfPlayingNextRound: p.chance_of_playing_next_round,
        news: p.news || null,
        goalsScored: p.goals_scored,
        assists: p.assists,
        cleanSheets: p.clean_sheets,
        ictIndex: parseFloat(p.ict_index) || 0,
        expectedGIPer90: parseFloat(p.expected_goal_involvements_per_90) || 0,
        penaltiesOrder: p.penalties_order,
      },
    });
  }
  console.log(`Seeded ${data.elements.length} players`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
