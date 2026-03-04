
export function getRankClass(rank) {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "";
}

export function renderTeams(topTeams) {
    const container = document.getElementById("teamsGrid");
    if (!container) return;

    container.innerHTML = topTeams
        .map(
            (team) => `
    <div class="team-card">
      <div class="team-card-header">
        <div class="team-logo-wrapper">
          <div class="team-logo">
            <img src="${team.logo}" alt="${team.name}">
            <div class="team-rank ${getRankClass(team.rank)}">#${team.rank
                }</div>
          </div>
          <div>
            <h3 class="team-name">${team.name}</h3>
            <div class="team-region">📍 ${team.region}</div>
          </div>
        </div>
        ${team.trending
                    ? '<span class="badge" style="background: hsl(var(--accent) / 0.2); color: hsl(var(--accent));">📈 Trending</span>'
                    : ""
                }
      </div>
      <span class="badge game-badge" style="margin-bottom: 1rem; display: inline-block;">${team.game
                }</span>
      <div class="team-stats">
        <div class="team-stat">
          <span class="team-stat-label">Win Rate</span>
          <span style="font-weight: 600; color: #22c55e;">${team.winRate}</span>
        </div>
        <div class="team-stat">
          <span class="team-stat-label">Total Wins</span>
          <span style="font-weight: 600;">${team.totalWins}</span>
        </div>
        <div class="team-stat">
          <span class="team-stat-label">Prize Money</span>
          <span style="font-weight: 600; color: hsl(var(--primary));">${team.prize
                }</span>
        </div>
      </div>
      <div class="team-form">
        <span class="team-form-label">Recent Form</span>
        <div class="team-form-badges">
          ${team.recentForm
                    .map(
                        (win) => `
            <div class="form-badge ${win ? "win" : "loss"}">${win ? "W" : "L"
                            }</div>
          `
                    )
                    .join("")}
        </div>
      </div>
      <div class="team-card-footer">
        <div class="team-followers">👥 ${team.followers} followers</div>
        <button class="btn btn-outline btn-sm">⭐ Follow</button>
      </div>
    </div>
  `
        )
        .join("");
}