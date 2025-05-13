const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

exports.handler = async (event, context) => {
  try {
    console.log('📦 KBO 순위 데이터 수집 시작...');

    const response = await axios.get('https://sports.news.naver.com/kbaseball/record/index?category=kbo');
    const $ = cheerio.load(response.data);
    const rows = $('.tbl_board tbody tr');

    const data = [];
    rows.each((index, row) => {
      const columns = $(row).find('td');
      data.push({
        rank: index + 1,
        team: $(columns[0]).text().trim(),
        games: $(columns[1]).text().trim(),
        win: $(columns[2]).text().trim(),
        draw: $(columns[3]).text().trim(),
        lose: $(columns[4]).text().trim(),
        winRate: $(columns[5]).text().trim(),
        gameGap: $(columns[6]).text().trim(),
        recent10: $(columns[7]).text().trim(),
        streak: $(columns[8]).text().trim(),
      });
    });

    console.log('✅ 순위 데이터 크롤링 성공');

    const filePath = path.join(__dirname, '../../data/kbo_rank.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('✅ JSON 파일 저장 완료:', filePath);

    // Git commit & push
    execSync('git config --global user.email "bot@netlify.com"');
    execSync('git config --global user.name "Netlify Bot"');
    execSync('git add data/kbo_rank.json');
    execSync('git commit -m "자동 업데이트: KBO 순위 갱신"');
    execSync('git push origin main');
    console.log('✅ GitHub 푸시 완료');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'KBO 순위 자동 갱신 완료!' })
    };
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'KBO 순위 갱신 실패', details: error.message })
    };
  }
};