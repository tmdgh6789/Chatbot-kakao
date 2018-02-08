'use strict';

const conversation = require('../message');
const cloudant = require('../../util/db');
const db = cloudant.db;

let postMessage = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  //{ user_key: 'DBpb8t6y66U2', type: 'text', content: 'Hello' }
  let user_key = req.body.user_key;
  let type = req.body.type;
  let content = {
  	'text' : req.body.content
  };

  if(content.text == "사용법")
  {
    let massage = {
      "message": {
        "text": '종목명을 정확히 치면 종목 정보가, 종목명에 질문 (ex: 종목이 어떠냐고 물어보기, 물음표붙이기)을 하면 종목에대한 의견을 들을 수 있습니다.'
      }
    };
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  }
  else
  {
    if(content.text == "홈")
    {
      let massage = {
        "message": {
          "text": "유료가입으로 '지금 이 방에서' 자신이 선택한 인공지능/인간 전문가의 서비스를 받아볼 수 있습니다",
          "message_button": {
            "label": "가입하러 가기",
            "url": "http://61.72.187.6/kakao/index?UserKey=" + user_key
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
      res.set({
        'content-type': 'application/json'
      }).send(JSON.stringify(massage));
    }
    else if (content.text == "유료 인공지능 서비스 받기")
    {
      
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
            "무료 인공지능 *안선생* 받기"
          ]
        }
      }; 
      res.set({
        'content-type': 'application/json'
      }).send(JSON.stringify(massage));
    }
    else
    {
      if (context.text == "무료 인공지능 *부미* 받기")
      {
        // const mssql = require('mssql');
        // let config = {
        //   user : process.env.USER,
        //   password : process.env.PASSWORD,
        //   server : process.env.SERVER,
        //   database : process.env.DATABASE
        // }
        // const pool = new mssql.ConnectionPool(config);
        // const transaction = new mssql.Transaction(pool)
        // transaction.begin(err => {
        //   let sql = "INSERT INTO tbl_plus_free (user_key, robot) VALUES("+ user_key +",'000');";
        //   const request = new mssql.Request(transaction);
        //   request.query(sql, (err, result) => {
        //     transaction.commit(err => {
              let massage = {
                "message": {
                  "text": "무료 로봇 등록 완료                                             [ 홈 ] 을 적어서 사용방법 확인."
                }
              };
        //       console.log("Transaction committed")
        //       if (err)
        //       {
        //         let massage = {
        //           "message": {
        //             "text": "이미 무료 로봇을 받았거나 유료봇 사용중입니다."
        //           }
        //         };
        //         console.log(err);
        //       }
        //     })
        //   });
        // });
        res.set({
          'content-type': 'application/json'
        }).send(JSON.stringify(massage));
      }
      else if (context.text == "무료 인공지능 *안선생* 받기")
      {
        let massage = {
          "message": {
            "text": "준비중인 인공지능입니다 [ 홈 ]이라고 치면 처음부터 시작할 수 있습니다."
          }
        };
        res.set({
          'content-type': 'application/json'
        }).send(JSON.stringify(massage));
      }
      //user_key를 사용하여 db에 저장된 context가 있는지 확인합니다.
      db.get(user_key).then(doc => {
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
            '_id' : user_key,
            'user_key' : user_key,
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
  }
  
  let getOutputText = data => {
    let output = data.output;
    if(output.text && Array.isArray(output.text)){
      return output.text.join('\\n');
    }
    else if(output.text){
      return output.text;
    }
    else return "";
  }
}

module.exports = {
    'initialize': function(app, options) {
        app.post('/api/kakao/message', postMessage);
    }
};