const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

exports.handler = async function () {
  try {
    // 1. 크롤링 대상 URL (Naver KBO 순위)
    const url = "https://sports.news.naver.com/kbaseball/record/index.nhn?category=kbo";
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // 2. 순위 테이블 파싱
    const rows = $("table.tbl_box tbody tr");
    const ranks = [];

    rows.each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length >= 6) {
        ranks.push({
          team: tds.eq(1).text().trim(),
          win: Number(tds.eq(2).text().trim()),
          loss: Number(tds.eq(3).text().trim()),
          draw: Number(tds.eq(4).text().trim()),
          rate: tds.eq(5).text().trim(),
        });
      }
    });

    const jsonContent = JSON.stringify(ranks, null, 2);

    // 3. GitHub API로 파일 업데이트
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_NAME = process.env.REPO_NAME;
    const FILE_PATH = process.env.KBO_FILE_PATH || "data/kbo_rank.json";
    const BRANCH = process.env.GIT_BRANCH || "main";

    // 현재 SHA 가져오기
    const metaRes = await fetch(`https://api.github.com/repos/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const metadata = await metaRes.json();
    const sha = metadata.sha;

    // 파일 업데이트
    const updateRes = await fetch(`https://api.github.com/repos/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "🤖 Update KBO ranking data",
        content: Buffer.from(jsonContent).toString("base64"),
        branch: BRANCH,
        sha,
      }),
    });

    const result = await updateRes.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Updated successfully", result }),
    };
  } catch (err) {
    console.error("KBO 업데이트 실패:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "KBO 크롤링 실패", detail: err.message }),
    };
  }
};
