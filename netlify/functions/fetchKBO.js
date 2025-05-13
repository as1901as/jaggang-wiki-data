const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
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

    const output = JSON.stringify(data, null, 2);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: output
    };
  } catch (error) {
    console.error(error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '크롤링 실패', detail: error.message })
    };
  }
};