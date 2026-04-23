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

  // ── 1. Teams ──
  for (const team of data.teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: {},
      create: {
        id: team.id,
        name: team.name,
        shortName: team.short_name,
        strength: team.strength,
        strengthAttackH: team.strength_attack_home,
        strengthAttackA: team.strength_attack_away,
        strengthDefenceH: team.strength_defence_home,
        strengthDefenceA: team.strength_defence_away,
      },
    });
  }
  console.log(`Seeded ${data.teams.length} teams`);

  // ── 2. Gameweeks ──
  for (const gw of data.events) {
    await prisma.gameweek.upsert({
      where: { fplId: gw.id },
      update: {},
      create: {
        fplId: gw.id,
        name: gw.name,
        deadlineTime: new Date(gw.deadline_time),
        deadlineTimeEpoch: gw.deadline_time_epoch,
        finished: gw.finished,
        isCurrent: gw.is_current,
        isNext: gw.is_next,
        isPrevious: gw.is_previous,
        averageEntryScore: gw.average_entry_score,
        highestScore: gw.highest_score,
        mostSelected: gw.most_selected,
        mostTransferredIn: gw.most_transferred_in,
        topElement: gw.top_element,
        chipPlays: gw.chip_plays,
      },
    });
  }
  console.log(`Seeded ${data.events.length} gameweeks`);

  // ── 3. Players ── (teams must exist first — foreign key constraint)
  for (const p of data.elements) {
    await prisma.player.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        webName: p.web_name,
        firstName: p.first_name,
        lastName: p.second_name,
        position: p.element_type,
        teamId: p.team,
        nowCost: p.now_cost,
        costChangeStart: p.cost_change_start,
        costChangeEvent: p.cost_change_event,
        status: mapStatus(p.status),
        chanceOfPlayingNextRound: p.chance_of_playing_next_round,
        chanceOfPlayingThisRound: p.chance_of_playing_this_round,
        news: p.news || null,
        selectedByPercent: parseFloat(p.selected_by_percent),
        transfersIn: p.transfers_in,
        transfersOut: p.transfers_out,
        transfersInEvent: p.transfers_in_event,
        transfersOutEvent: p.transfers_out_event,
        totalPoints: p.total_points,
        eventPoints: p.event_points,
        form: parseFloat(p.form),
        pointsPerGame: parseFloat(p.points_per_game),
        minutesPlayed: p.minutes,
        startsCount: p.starts,
        goalsScored: p.goals_scored,
        assists: p.assists,
        yellowCards: p.yellow_cards,
        redCards: p.red_cards,
        bonusPoints: p.bonus,
        bps: p.bps,
        cleanSheets: p.clean_sheets,
        goalsConceded: p.goals_conceded,
        ownGoals: p.own_goals,
        penaltiesSaved: p.penalties_saved,
        penaltiesMissed: p.penalties_missed,
        saves: p.saves,
        influence: parseFloat(p.influence),
        creativity: parseFloat(p.creativity),
        threat: parseFloat(p.threat),
        ictIndex: parseFloat(p.ict_index),
        influenceRank: p.influence_rank,
        creativityRank: p.creativity_rank,
        threatRank: p.threat_rank,
        ictIndexRank: p.ict_index_rank,
        expectedGoals: parseFloat(p.expected_goals),
        expectedAssists: parseFloat(p.expected_assists),
        expectedGoalInvolvements: parseFloat(p.expected_goal_involvements),
        expectedGoalsConceded: parseFloat(p.expected_goals_conceded),
        expectedGoalsPer90: parseFloat(p.expected_goals_per_90),
        expectedAssistsPer90: parseFloat(p.expected_assists_per_90),
        expectedGIPer90: parseFloat(p.expected_goal_involvements_per_90),
        expectedGCPer90: parseFloat(p.expected_goals_conceded_per_90),
        savesPer90: parseFloat(p.saves_per_90),
        cleanSheetsPer90: parseFloat(p.clean_sheets_per_90),
        goalsConcededPer90: parseFloat(p.goals_conceded_per_90),
        startsPer90: parseFloat(p.starts_per_90),
        cornersOrder: p.corners_and_indirect_freekicks_order,
        directFreekicksOrder: p.direct_freekicks_order,
        penaltiesOrder: p.penalties_order,
      },
    });
  }
  console.log(`Seeded ${data.elements.length} players`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
