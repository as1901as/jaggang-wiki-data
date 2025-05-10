const fetch = require("node-fetch");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { content } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = process.env.REPO_NAME;
    const FILE_PATH = process.env.FILE_PATH;
    const BRANCH = process.env.GIT_BRANCH || "main";

    // 현재 파일 SHA 가져오기
    const metadataRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const metadata = await metadataRes.json();
    if (!metadata.sha) throw new Error("SHA 정보를 불러오지 못했습니다.");

    // 파일 업데이트 요청
    const updateRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "Update content.json via Netlify",
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha: metadata.sha,
        branch: BRANCH,
      }),
    });

    if (!updateRes.ok) {
      const error = await updateRes.json();
      throw new Error(JSON.stringify(error));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "content.json 저장 완료" }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "저장 실패", detail: err.message }),
    };
  }
};