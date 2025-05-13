document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("kbo-rank");

  fetch("/.netlify/functions/getKboRank")
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        container.innerText = "KBO 순위를 불러오지 못했습니다.";
        return;
      }

      const table = document.createElement("table");
      table.innerHTML = `
        <thead>
          <tr>
            <th>순위</th>
            <th>팀</th>
            <th>승</th>
            <th>패</th>
            <th>무</th>
            <th>게임차</th>
            <th>승률</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (team) => `
            <tr>
              <td>${team.rank}</td>
              <td>${team.team}</td>
              <td>${team.wins}</td>
              <td>${team.losses}</td>
              <td>${team.draws}</td>
              <td>${team.gamesBehind}</td>
              <td>${team.winRate}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      `;
      container.appendChild(table);
    })
    .catch((err) => {
      container.innerText = "오류가 발생했습니다.";
      console.error(err);
    });
});