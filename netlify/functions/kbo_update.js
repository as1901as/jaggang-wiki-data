const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const url = 'https://sports.news.naver.com/kbaseball/record/index?category=kbo';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const rows = $('.tbl_box .tbl tbody tr');
    const result = [];

    rows.each((i, el) => {
      const cols = $(el).find('td');
      result.push({
        rank: i + 1,
        team: $(cols[0]).text().trim(),
        game: $(cols[1]).text().trim(),
        win: $(cols[2]).text().trim(),
        lose: $(cols[3]).text().trim(),
        draw: $(cols[4]).text().trim(),
        rate: $(cols[5]).text().trim(),
        gap: $(cols[6]).text().trim()
      });
    });

    const outputPath = path.resolve(__dirname, '../../data/kbo_rank.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'KBO 순위가 성공적으로 갱신되었습니다.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
