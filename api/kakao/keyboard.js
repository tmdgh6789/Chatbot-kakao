'use strict';

let getKeyboard = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  return res.json({
    "type" : "buttons",
    "buttons" : [
      "사용법",
      "유료 인공지능 서비스 받기",
      "무료 인공지능 서비스 받기",
      "기존 VIP 인증하기"
    ]
  })
};

module.exports = {
  'initialize': function(app, options) {
    app.get('/api/kakao/keyboard', getKeyboard);
  }
};

