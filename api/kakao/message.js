'use strict';

const conversation = require('../message');
const cloudant = require('../../util/db');
const db = cloudant.db;
const mssql = require('mssql');
const key1 = require('../../config1.js');
const key2 = require('../../config2.js');
const config_kakao = {
  user : key1.user,
  password : key1.password,
  server : key1.server,
  database : key1.database_kakao
};
const config_login = {
  user : key1.user,
  password : key1.password,
  server : key1.server,
  database : key1.database_login
};
const config_bong = {
  user : key1.user,
  password : key1.password,
  server : key1.server,
  database : key1.database_bong
};
const config_report = {
  user : key2.user,
  password : key2.password,
  server : key2.server,
  database : key2.database_report
};
let robot = "";

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
        "text": "종목명을 정확히 치면 종목 정보가, 종목명에 질문 (ex: 종목이 어떠냐고 물어보기, 물음표붙이기)을 하면 종목에 대한 의견을 들을 수 있습니다.\n[ 홈 ] 을 입력하시면 홉으로 이동합니다."
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
          "무료 인공지능 서비스 받기",
          "기존 VIP 인증하기"
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
  else if (content.text == "기존 VIP 인증하기")
  {
    let massage = {
      "message": {
        "text": "기존 VIP 회원분들은 인증을 통해 유료 인공지능 서비스를 받으실 수 있습니다.",
        "message_button": {
          "label": "인증하러 가기",
          "url": "http://61.72.187.6/kakao/login.php?UserKey=" + userKey
        }
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "사용법",
          "유료 인공지능 서비스 받기",
          "무료 인공지능 서비스 받기",
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
    try
    {
      let query = "INSERT INTO tbl_plus_free (user_key, robot) VALUES('" + userKey + "', '000');";
      
      new mssql.ConnectionPool(config_kakao).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        mssql.close();
      }).catch(err => {
        console.error(err);
        mssql.close();
      });
      
      let massage = {
        "message": {
          "text": "기존에 R-e를 사용하시던 분들은 필명과 비밀번호를 연속으로 입력해서 등록해주세요.\n'예시. 이름이 '필명'이고 비밀번호가 '3345'일때:\n[ 필명3345 ]  ' "
        }
      };
      sendKakaoText(massage);
    }
    catch(err)
    {
      console.error(err);
    }
  }
  else if (content.text == "무료 인공지능 *부미* 받기")
  {
    try
    {
      let query = "INSERT INTO tbl_plus_free (user_key, robot) VALUES('" + userKey + "', '000');";
    
      new mssql.ConnectionPool(config_kakao).connect().then(pool => {
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
    if (robot == '000')
    {
      let massage = {
        "message": {
          "text": "무료 종목 추천은 준비중 입니다."
        }
      };
      sendKakaoText(massage);
    }
    // 유료 버전
    else if (robot == '100')
    {
      let massage = {
        "message": {
          "text": "유료 종목 추천은 준비중 입니다."
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
        if (getOutputText(data) == "종목묻기")
        {
          serchStock(content).then(function(allCode){
            if(!allCode)
            {
              return res.json({
                "message" : {
                  "text" : "정확한 종목명으로 다시 물어봐주세요."
                }
              });
            }
            else
            {
              let answer;
              let code = allCode['코드'];
              headCheck(code).then(function(cutHeadDay){
                let string = cutHeadDay;
                
                selectAllCode(code).then(function(allCodeWhereCode){
                  let forHead = parseInt((string.replace("-", "")).replace("+", ""), 10).toLocaleString(undefined) + "원"; // 쉼표 넣은 것
                  let fuHead = parseInt((string.replace("-", "")).replace("+", ""), 10); // 쉼표 안 넣은 것
                  let forPrice = parseInt(allCodeWhereCode.recordset[0]['현재가'], 10).toLocaleString(undefined) + "원";
                  
                  let forHLine = parseInt(allCodeWhereCode.recordset[0]['HLine'], 10).toLocaleString(undefined) + "원";
                  let forLLine = parseInt(allCodeWhereCode.recordset[0]['LLine'], 10).toLocaleString(undefined) + "원";
                  
                  if (robot == "000")
                  {
                    if (allCodeWhereCode.recordset[0]['HLine'] <= allCodeWhereCode.recordset[0]['현재가'])
                    {
                      answer = "부미 :\n와 가격이 높네요.. 저도 황금알 점수를 보고 더 갈 수 있을지 알아봐야겠어요";
                    }
                    else if (allCodeWhereCode.recordset[0]['HLine'] > allCodeWhereCode.recordset[0]['현재가'] && allCodeWhereCode.recordset[0]['현재가'] > allCodeWhereCode.recordset[0]['LLine'])
                    {
                      if (string.substr(0, 1) == "+")
                      {
                        answer = "부미 :\n종목에서 힘이 느껴지네요 제 느낌엔 잘 될 것 같아요";
                      }
                      else if (string.substr(0, 1) == "-")
                      {
                        answer = "부미 :\n음... 종목이 기운이 없어보여요 잘 모르겠으니 황금알 점수를 봐야겠어요";
                      }
                    }
                    else if (allCodeWhereCode.recordset[0]['LLine'] >= allCodeWhereCode.recordset[0]['현재가'])
                    {
                      answer = "부미 :\n너무 떨어지는데요.. 유료 인공지능 선배님들은 이럴 때 어떻게 해야 하는지 알고계시던데...";
                    }
                  }
                  else if (robot == "100")
                  {
                    if (allCodeWhereCode.recordset[0]['현재가'] < fuHead)
                    {
                      answer = "R-e :\n" + allCodeWhereCode.recordset[0]['종목명'] + " 현재가가 " + forPrice + " 이고 큰손들 평단가가  " + forHead + " 정도인것 같은데 돈있는 사람들이 손해보고 팔거같진 않아 보이는데요?";
                    }
                    else if (allCodeWhereCode.recordset[0]['HLine'] <= allCodeWhereCode.recordset[0]['현재가'])
                    {
                      answer = "R-e :\n오.. 이제 전략적인 익절을 해야하지 않을까요? 전 너무 무섭네요";
                    }
                    else if (allCodeWhereCode.recordset[0]['HLine'] > allCodeWhereCode.recordset[0]['현재가'] && allCodeWhereCode.recordset[0]['현재가'] > allCodeWhereCode.recordset[0]['LLine'])
                    {
                      if (string.substr(0, 1) == "+")
                      {
                        answer = "R-e :\n수급이 들어오고 있는 추세네요 긍정적으로 바라봐도 될것 같네요 " + forHLine + " 쯤되면 파시는게 어떨까요?";
                      }
                      else if (string.substr(0, 1) == "-")
                      {
                        answer = "R-e :\n수급이 빠져나가고 있는 추세인것 같네요  " + forLLine + " 이 되면 매수해 보시는것도 나쁘지 않겠네요";
                      }
                    }
                    else if (allCodeWhereCode.recordset[0]['LLine'] >= allCodeWhereCode.recordset[0]['현재가'] && allCodeWhereCode.recordset[0]['황금알점수'] > 70)
                    {
                      answer = "R-e :\n요즘 상황이 나쁘지 않은 종목이라 할인 찬스라고 생각하셔도 될것 같은데요?";
                    }
                    else if (allCodeWhereCode.recordset[0]['LLine'] >= allCodeWhereCode.recordset[0]['현재가'] && allCodeWhereCode.recordset[0]['황금알점수'] <= 70)
                    {
                      answer = "R-e :\n저점이 이렇게 뚫리면... 어디까지 떨어질지.. 바닥이 없을 수도 있어요.. 가뜩이나 종목도 안좋은데.. 결단을 내리셔야 겠네요";
                    }
                  }
                  else
                  {
                    answer = "담당 인공지능이 없어요! [ 홈 ] 을 쳐보세요!";
                  }
                  
                  return res.json({
                    "message" : {
                      "text" : answer
                    }
                  });
                }).catch(function(err){
                  console.log(err);
                });
              }).catch(function(err){
                console.log(err);
              });
            }
          }).catch(function(err){
            console.log(err);
          });
        }
        else
        {
          serchStock(content).then(function(allCode){
            if (content.text == allCode['종목명'])
            {
              serchReportList(content).then(function(reportList){
                let nowPriceCol = parseInt(allCode['현재가'], 10).toLocaleString(undefined) + "원";
                let gpoint = allCode['황금알점수'];
                let ppoint = allCode['파워점수'];
                let hpoint = allCode['수급점수'];
                let spoint = allCode['실적점수'];
                
                if (reportList.recordset.length == 0)
                {
                  if (robot == "000")
                  {
                    return res.json({
                        "message" : {
                          "text" : "부미 :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n(리포트가 없는 종목입니다)\n(유료 인공지능은 자세한 종목점수와 리포트 전체를 편하게 보여드립니다)"
                        }
                    });
                  }
                  else if (robot == "100")
                  {
                    return res.json({
                          "message": {
                            "text": "R-e :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n파워점수는 " + ppoint + "\n수급점수는 " + hpoint + "\n실적점수는 " + spoint + "\n(리포트가 없는 종목입니다)"
                         }
                    });
                  }
                }
                else
                {
                  for (var i = 0; i < reportList.recordset.length; i++) {
                    let code = reportList.recordset[i]['code'];
                    
                    if (robot == "000")
                    {
                      return res.json({
                          "message" : {
                            "text" : "부미 :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n(최신 무료 리포트는 첫페이지만 제공됩니다)\n(유료 인공지능은 자세한 종목점수와 리포트 전체를 편하게 보여드립니다)",
                            "photo" : {
                              "url": "http://61.72.187.6/rep/" + code,
                              "width": 790,
                              "height": 990
                            }
                          }
                      });
                    }
                    else if (robot == "100")
                    {
                      return res.json({
                            "message": {
                              "text": "R-e :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n파워점수는 " + ppoint + "\n수급점수는 " + hpoint + "\n실적점수는 " + spoint,
                              "message_button": {
                                "label": "PDF리포트 전문",
                                "url": reportList.recordset[i]['키']
                              }
                           }
                      });
                    }
                  }
                }
              }).catch(function(err){
                console.log(err);
              });
            }
            else
            {
              return res.json({
                "message" : {
                  "text" : getOutputText(data)
                }
              });
            }
          }).catch(function(err) {
            console.log(err);
          });
        }
      }).catch(function(err){
        console.error(err.message);
        return res.json({
            "message" : {
              "text" : JSON.stringify(err.message)
            }
        });
      });
    }).catch(function(err) {
      console.error(err);
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
  function sendKakaoText(massage)
  {
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  }
  
  // 현재 user가 어떤 로봇을 사용중인지 확인
  function whatRobot(userKey)
  {
    try
    {
      let query = "SELECT robot FROM tbl_plus_free WHERE user_key = '"+ userKey +"';";
      
      new mssql.ConnectionPool(config_kakao).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        robot = result.recordset[0]['robot'];
        
        mssql.close();
      }).catch(err => {
        console.error(err);
        
        mssql.close();
      });
    }
    catch(err)
    {
      console.error(err.message);
    } 
  }
  
  let selectAllCode = function(code)
  {
    return new Promise(function(resolve, reject){
      let query = "SELECT * FROM tbl_allCode WHERE 코드 = '" + code + "'";
      
      new mssql.ConnectionPool(config_login).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        mssql.close();
        resolve (result);
      }).catch(err => {
        console.error(err);
        
        mssql.close();
      });
    });
  };
  
  let serchStock = function(content)
  {
    return new Promise(function(resolve, reject){
      let query = "SELECT * FROM tbl_allCode";
    
      new mssql.ConnectionPool(config_login).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        let answer;
        for (var i = 0; i < result.recordset.length; i++)
        {
          if ((content.text).includes(result.recordset[i]['종목명']))
          {
            answer = result.recordset[i];
            break;
          }
          else
          {
            answer = false;
          }
        }
        mssql.close();
        resolve(answer);
      }).catch(err => {
        console.error(err);
        
        mssql.close();
      });
    });
  };
  
  let headCheck = function(code)
  {
    return new Promise(function(resolve, reject){
      let query = "SELECT * FROM tbl_cutheadday WHERE 종목코드 = '" + code + "'";
      
      new mssql.ConnectionPool(config_bong).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        let realBuy = 0;
        let forBuy = 0;
        let forPrice = 0;
        let forPlus = "";
        
        for (var i = 0; i < result.recordset.length; i++) {
          if (result.recordset[i]['외인순매수'].substr(1) > 0)
          {
            realBuy = realBuy + parseInt((result.recordset[i]['외인순매수'].replace("-", "")).replace("+", ""), 10);
            forPrice = forPrice + parseInt(result.recordset[i]['외인순매수'].substr(1) * (result.recordset[i]['시가'].replace("-", "")).replace("+", ""), 10);
          }
        }
        
        if (forBuy > 0)
        {
          forPlus = "+";
        }
        else
        {
          forPlus = "-";
        }
        mssql.close();
        resolve(forPlus + (forPrice / realBuy));
      }).catch(err => {
        console.error(err);
        
        mssql.close();
      });
    });
  };
    
  let serchReportList = function(content)
  {
    return new Promise(function(resolve, reject){
      let query = "SELECT TOP(1) * FROM list WHERE title LIKE '" + content.text + "%' ORDER BY day DESC;";
      
      new mssql.ConnectionPool(config_report).connect().then(pool => {
        return pool.request().query(query);
      }).then(result => {
        mssql.close();
        resolve(result);
      }).catch(err => {
        console.error(err);
        
        mssql.close();
      });
    });
  };
};

module.exports = {
    'initialize': function(app, options) {
        app.post('/api/kakao/message', postMessage);
    }
};