'use strict';

const conversation = require('../message');
const cloudant = require('../../util/db');
const db = cloudant.db;
var key = require('../../config.js');
const mssql = require('mssql');
const config = {
  user : key.user,
  password : key.password,
  server : key.server,
  database : key.database
};
let botName = "";

let postMessage = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  //{ user_key: 'DBpb8t6y66U2', type: 'text', content: 'Hello' }
  let userKey = req.body.user_key;
  let type = req.body.type;
  let content = {
  	'text' : req.body.content
  };

  whatRobot(userKey);
  
  if(content.text == "사용법")
  {
    let massage = {
      "message": {
        "text": "종목명을 정확히 치면 종목 정보가, 종목명에 질문 (ex: 종목이 어떠냐고 물어보기, 물음표붙이기)을 하면 종목에대한 의견을 들을 수 있습니다."
      }
    };
    sendKakaoText(massage);
  }
  else if(content.text == "홈")
  {
    let massage = {
      "message": {
        "text": "유료가입으로 '지금 이 방에서' 자신이 선택한 인공지능/인간 전문가의 서비스를 받아볼 수 있습니다",
        "message_button": {
          "label": "가입하러 가기",
          "url": "http://61.72.187.6/kakao/index?UserKey=" + userKey
        }
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "사용법",
          "유료 인공지능 서비스 받기",
          "무료 인공지능 서비스 받기"
        ]
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "유료 인공지능 서비스 받기")
  {
    let massage = {
      "message": {
        "text": "유료가입으로 '지금 이 방에서' 자신이 선택한 인공지능/인간 전문가의 서비스를 받아볼 수 있습니다",
        "message_button": {
          "label": "가입하러 가기",
          "url": "http://61.72.187.6/kakao/index?UserKey=" + userKey
        }
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "서비스 소개",
          "무료 인공지능 서비스 받기",
          "MBN 김성남 인공지능 R-e 받기",
          "홈"
        ]
      }
    }; 
    sendKakaoText(massage);
  }
  else if (content.text == "무료 인공지능 서비스 받기")
  {
    let massage = {
      "message": {
        "text": "유료가입으로 '지금 이 방에서' 자신이 선택한 인공지능/인간 전문가의 서비스를 받아볼 수 있습니다"
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "무료 인공지능 *부미* 받기",
          "무료 인공지능 *안선생* 받기",
          "홈"
        ]
      }
    }; 
    sendKakaoText(massage);
  }
  else if (content.text == "서비스 소개")
  {
    let massage = {
      "message": {
        "text": "유료 인공지능은 각 인공지능별로 고유의 로직을 바탕으로 종목에 대한 상담과 의견제시, 평가를 내립니다.\n각자의 딥러닝된 로직을 바탕으로 실시간 종목추천 밑 매수 매도 구간 제안을 해줍니다.\n[ 홈 ]이라고 치면 처음부터 시작할 수 있습니다"
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "MBN 김성남 인공지능 R-e 받기")
  {
    let massage = {
      "message": {
        "text": "기존에 R-e를 사용하시던 분들은 필명과 비밀번호를 연속으로 입력해서 등록해주세요.\n'예시. 이름이 '필명'이고 비밀번호가 '3345'일때:\n[ 필명3345 ]  ' "
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "무료 인공지능 *부미* 받기")
  {
    try
    {
      let query = "INSERT INTO tbl_plus_free (user_key, robot) VALUES('" + userKey + "', '000');";
    
      new mssql.ConnectionPool(config).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        let massage = {
          "message": {
            "text": "무료 로봇 등록 완료\n[ 홈 ] 을 적어서 사용방법 확인."
          }
        };
        sendKakaoText(massage);
        
        mssql.close();
      }).catch(err => {
        console.log(err.message);
        let massage = {
          "message": {
            "text": "이미 무료 로봇을 받았거나 유료봇 사용중입니다."
          }
        };
        sendKakaoText(massage);
        
        mssql.close();
      });
    }
    catch (err)
    {
      console.log(err.message);
    }
  }
  else if (content.text == "무료 인공지능 *안선생* 받기")
  {
    let massage = {
      "message": {
        "text": "준비중인 인공지능입니다 [ 홈 ]이라고 치면 처음부터 시작할 수 있습니다."
      }
    };
    sendKakaoText(massage);
  }
  else if ((content.text).indexOf("종목") !== -1)
  {
    // 무료 버전
    if (botName['robot'] == '000')
    {
      let massage = {
        "message": {
          "text": "종목 추천은 준비중 입니다."
        }
      };
      sendKakaoText(massage);
    }
    // 유료 버전
    else if (botName['robot'] == '100')
    {
      let massage = {
        "message": {
          "text": "종목 추천은 준비중 입니다."
        }
      };
      sendKakaoText(massage);
    }
  }
  // 그 외 모든 말은 watson 으로 전송
  else
  {
    //user_key를 사용하여 db에 저장된 context가 있는지 확인합니다.
    db.get(userKey).then(doc => {
      //저장된 context가 있는 경우 이를 사용하여 conversation api를 호출합니다.
      conversation.getConversationResponse(content, doc.context).then(data => {
        // context를 업데이트 합니다.
        db.insert(Object.assign(doc, {
          'context': Object.assign(data.context, {
            'timezone' : "Asia/Seoul"
          }),
        }));
        return res.json({
          "message" : {
            "text" : getOutputText(data)
          }
        });
      }).catch(function(err){
        return res.json({
            "message" : {
              "text" : JSON.stringify(err.message)
            }
        });
      });
    }).catch(function(err) {
      // 처음 대화인 경우 context가 없습니다. 이러한 경우 context 없이 conversation api를 호출합니다.
      conversation.getConversationResponse(content, {}).then(data => {
        // context를 저장합니다.
        db.insert({
          '_id' : userKey,
          'user_key' : userKey,
          'context': data.context,
          'type' : 'kakao'
        });
        return res.json({
            "message" : {
              "text" : getOutputText(data)
            }
        });   
      }).catch(function(err){
        return res.json({
            "message" : {
              "text" : JSON.stringify(err.message)
            }
        });
      });
    });
  }
  
  // watson 에서 데이터 가져오기
  let getOutputText = data => {
    let output = data.output;
    if(output.text && Array.isArray(output.text)){
      return output.text.join('\\n');
    }
    else if(output.text){
      return output.text;
    }
    else return "";
  };
  
  // kakao로 보내기
  function sendKakaoText(massage){
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  }
  
  // 현재 user가 어떤 로봇을 사용중인지 확인
  function whatRobot(userKey) {
    try
    {
      let query = "SELECT robot FROM tbl_plus_free WHERE user_key = '"+ userKey +"';";
      
      new mssql.ConnectionPool(config).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        botName = result.recordset[0];
        
        mssql.close();
      }).catch(err => {
        console.log(err);
        
        mssql.close();
      });
    }
    catch(err)
    {
      console.log(err.message);
    } 
  }
};

module.exports = {
    'initialize': function(app, options) {
        app.post('/api/kakao/message', postMessage);
    }
};