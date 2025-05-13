exports.handler = async function () {
  try {
    const url = "https://www.koreabaseball.com/TeamRank/TeamRank.aspx";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // 로그 찍기
    console.log("페이지 길이:", data.length);
    const title = $("title").text();
    console.log("페이지 타이틀:", title);

    const rows = $("table.tData tr");
    console.log("선택된 tr 수:", rows.length);

    const ranks = [];

    rows.each((i, el) => {
      const cells = $(el).find("td");
      if (cells.length > 0) {
        ranks.push({
          rank: $(cells[0]).text().trim(),
          team: $(cells[1]).text().trim(),
          wins: $(cells[2]).text().trim(),
          losses: $(cells[3]).text().trim(),
          draws: $(cells[4]).text().trim(),
          gamesBehind: $(cells[5]).text().trim(),
          winRate: $(cells[6]).text().trim(),
        });
      }
    });

    console.log("파싱된 결과:", ranks);

    return {
      statusCode: 200,
      body: JSON.stringify(ranks),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    console.error("크롤링 오류:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};