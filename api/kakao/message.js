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

// tbl_plus_free allLog 조회
let selectAllLog = (userKey) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT (allLog) FROM tbl_plus_free WHERE user_key = '" + userKey + "'";
    
    new mssql.ConnectionPool(config_kakao).connect().then(pool => {
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

// tbl_plus_free allLog 업데이트
function updateAllLog(userKey, content) {
  selectAllLog(userKey).then(result => {
    let query;

    // allLog에 데이터가 없을 경우
    if(result.recordset[0]['allLog'] == null)
    {
      query = "UPDATE tbl_plus_free SET allLog = '" + content.text + "' WHERE user_key = '" + userKey + "'";
    }
    // allLog에 데이터가 있을 경우
    else
    {
      query = "UPDATE tbl_plus_free SET allLog = (SELECT allLog FROM tbl_plus_free WHERE user_key = '" + userKey + "') + '|" + content.text + "' WHERE user_key = '" + userKey + "';";
    }

    new mssql.ConnectionPool(config_kakao).connect().then(pool => {
      return pool.request().query(query);
    }).then(result => {
      mssql.close();
    }).catch(err => {
      console.error(err);
      
      mssql.close();
    });
  });
}

// 현재 user가 어떤 로봇을 사용중인지 확인
let whatRobot = userKey => {
  return new Promise((resolve, reject) => {
    let query = "SELECT robot FROM tbl_plus_free WHERE user_key = '"+ userKey +"';";
    
    new mssql.ConnectionPool(config_kakao).connect().then(pool => {
      return pool.request().query(query);
    }).then(result => {
      resolve(result.recordset[0]['robot']);
      
      mssql.close();
    }).catch(err => {
      console.error(err);
      
      mssql.close();
    });
  });
};

// tbl_allCode 코드로 조회
let selectAllCode = code => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM tbl_allCode WHERE 코드 = '" + code + "' ORDER BY 종목명 DESC";
    
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

// tbl_allCode 모두 조회
let serchStock = content => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM tbl_allCode ORDER BY 종목명 DESC";
  
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

// tbl_cutheadday 종목코드로 조회 후 계산
let headCheck = code => {
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
  
// list title에 종목 이름 포함된 리포트 조회
let serchReportList = content => {
  return new Promise((resolve, reject) => {
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

let selectDig = () => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM tbl_dig;";
    
    new mssql.ConnectionPool(config_bong).connect().then(pool => {
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

let selectFuday = () => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM tbl_fuday;";
    
    new mssql.ConnectionPool(config_bong).connect().then(pool => {
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

// 코스피 점수
function briefingMarketConditions (robot, quotient) {
  let answer;
  if (robot == "000")
  {
    if (quotient >= 60)
    {
      answer = "괜찮은 것 같아요!";
    }
    else if (quotient < 60 && quotient >= 40)
    {
      answer = "평범하네요~";
    }
    else if (quotient < 40)
    {
      answer = "안좋은 것 같아요...";
    }
  }
  else if (robot == "100")
  {
    if (quotient >= 70)
    {
      answer = Math.round(quotient) + "점으로 아주 괜찮은 점수에요!";
    }
    else if (quotient < 70 && quotient >= 60)
    {
      answer = Math.round(quotient) + "점으로 괜찮은 점수같아요!";
    }
    else if (quotient < 60 && quotient >= 40)
    {
      answer = Math.round(quotient) + "점으로 평범한 점수에요~";
    }
    else if (quotient < 40 && quotient >= 30)
    {
      answer = Math.round(quotient) + "점으로 안좋은 점수에요..";
    }
    else if (quotient < 30)
    {
      answer = Math.round(quotient) + "점으로 아주 안좋아요...";
    }
  }
  return answer;
}

let postMessage = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  let userKey = req.body.user_key;
  let type = req.body.type;
  let content = {
  	'text' : req.body.content
  };
  
  // 사용자가 한 말 저장
  updateAllLog(userKey, content);

  if(content.text == "사용법")
  {
    let massage = {
      "message": {
        "text": "[상담원으로 전환하기] 버튼을 누르고 [ 종목수신동의 ] 라고 치시면 실시간으로 종목알림을 받으실 수 있습니다 (이후 다시 챗봇으로 전환하기 버튼을 눌러주세요.)\n[ 홈 ]이라고 치시면 절차에 따라 인공지능을 설치 하실 수 있습니다."
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "종목 정보 묻기",
          "종목 상황 묻기",
          "관심 종목 묻기"
        ]
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "종목 정보 묻기") 
  {
    let massage = {
      "message": {
        "text": "종목명만을 정확히 치면 종목 정보를 알려드립니다."
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "홈"
        ]
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "종목 상황 묻기")
  {
    let massage = {
      "message": {
        "text": "종목명에 질문을 하면 종목에 대한 의견을 알려드립니다.\nex) 종목명? 또는 종목명 어때? 등"
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "홈"
        ]
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "관심 종목 묻기")
  {
    let massage = {
      "message": {
        "text": "[ 종목 ] 이라고 치시면 관심 종목을 볼 수 있습니다."
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "홈"
        ]
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
          "text": "기존에 R-e를 사용하시던 분들은 '기존 VIP 인증하기'를 입력 후 등록해주세요. "
        },
        "keyboard": {
          "type": "buttons",
          "buttons": [
            "기존 VIP 인증하기",
            "홈"
          ]
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
    whatRobot(userKey).then(robot => {
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
    });

  }
  // 그 외 모든 말은 watson 으로 전송
  else
  {
    // 사용자의 말이 종목명일 때
    serchStock(content).then(allCode => {
      if (content.text == allCode['종목명'])
      {
        serchReportList(content).then(reportList => {
          let nowPriceCol = parseInt(allCode['현재가'], 10).toLocaleString(undefined) + "원";
          let gpoint = allCode['황금알점수'];
          let ppoint = allCode['파워점수'];
          let hpoint = allCode['수급점수'];
          let spoint = allCode['실적점수'];
          
          whatRobot(userKey).then(robot => {
            if (reportList.recordset.length == 0)
            {
              if (robot == "000")
              {
                let message = {
                  "message" : {
                    "text" : "부미 :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n(리포트가 없는 종목입니다)\n(유료 인공지능은 자세한 종목점수와 리포트 전체를 편하게 보여드립니다)"
                  }
                };
                sendKakaoText(message);
              }
              else if (robot == "100")
              {
                let message = {
                  "message": {
                    "text": "R-e :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n파워점수는 " + ppoint + "\n수급점수는 " + hpoint + "\n실적점수는 " + spoint + "\n(리포트가 없는 종목입니다)"
                  }
                };
                sendKakaoText(message);
              }
            }
            else
            {
              for (var i = 0; i < reportList.recordset.length; i++) {
                let code = reportList.recordset[i]['code'];
                
                if (robot == "000")
                {
                  let message = {
                    "message" : {
                      "text" : "부미 :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n(최신 무료 리포트는 첫페이지만 제공됩니다)\n(유료 인공지능은 자세한 종목점수와 리포트 전체를 편하게 보여드립니다)",
                      "photo" : {
                        "url": "http://61.72.187.6/rep/" + code,
                        "width": 790,
                        "height": 990
                      }
                    }
                  };
                  sendKakaoText(message);
                }
                else if (robot == "100")
                {
                  let message = {
                    "message": {
                      "text": "R-e :\n' " + content.text + " '의 현재가는 " + nowPriceCol + "\n황금알 점수는 " + gpoint + "\n파워점수는 " + ppoint + "\n수급점수는 " + hpoint + "\n실적점수는 " + spoint,
                      "message_button": {
                        "label": "PDF리포트 전문",
                        "url": reportList.recordset[i]['키']
                      }
                    }
                  };
                  sendKakaoText(message);
                }
              }
            }
          });
        }).catch(err => {
          console.log(err);
        });
      }
      // 그 외 일 때 watson
      else
      {
        // 사용자가 한 말 중 종목명이 포함되어 있을 때 종목명을 "종목명"으로 바꾸기 위함
        let str = {
          'text' : content.text
        };
        serchStock(content).then(allCode => {
          if (!allCode) { }
          // 종목명이 있을 경우 종목명을 "종목명"으로 바꿈
          else
          {
            str.text = str.text.replace(allCode['종목명'], "종목명");
          }
        }).then(result => {
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
              watsonResponse(data);
            }).catch(err => {
              console.error(err.message);
              return res.json({
                  "message" : {
                    "text" : JSON.stringify(err.message)
                  }
              });
            });
          }).catch(err => {
            console.error(err);
            // 처음 대화인 경우 context가 없습니다. 이러한 경우 context 없이 conversation api를 호출합니다.
            conversation.getConversationResponse(str, {}).then(data => {
              // context를 저장합니다.
              db.insert({
                '_id' : userKey,
                'user_key' : userKey,
                'context': data.context,
                'type' : 'kakao'
              });
              watsonResponse(data);
            }).catch(function(err){
              return res.json({
                  "message" : {
                    "text" : JSON.stringify(err.message)
                  }
              });
            });
          });
        });
      }
    }).catch(err => {
      console.log(err);
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
  function sendKakaoText(massage) {
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  }

  // watson으로 보내기
  function watsonResponse(data) {
    serchStock(content).then(allCode => {
      // watson 대답이 종목묻기이거나 사용자의 말이 '종목명?' 일 때 (의도 : 종목 어떤지 묻기)
      if (getOutputText(data) == "종목묻기" || content.text == allCode['종목명'] + "?")
      {
        // 종목명 검색 후 종목명이 없을 때
        if(!allCode)
        {
          return res.json({
            "message" : {
              "text" : "정확한 종목명으로 다시 물어봐주세요."
            }
          });
        }
        // 종목명이 있을 때
        else
        {
          let answer;
          let code = allCode['코드'];
          headCheck(code).then(cutHeadDay => {
            let string = cutHeadDay;
            
            selectAllCode(code).then(allCodeWhereCode => {
              let forHead = parseInt((string.replace("-", "")).replace("+", ""), 10).toLocaleString(undefined) + "원"; // 쉼표 넣은 것
              let fuHead = parseInt((string.replace("-", "")).replace("+", ""), 10); // 쉼표 안 넣은 것
              let forPrice = parseInt(allCodeWhereCode.recordset[0]['현재가'], 10).toLocaleString(undefined) + "원";
              
              let forHLine = parseInt(allCodeWhereCode.recordset[0]['HLine'], 10).toLocaleString(undefined) + "원";
              let forLLine = parseInt(allCodeWhereCode.recordset[0]['LLine'], 10).toLocaleString(undefined) + "원";
              
              whatRobot(userKey).then(robot => {
                // 사용자의 로봇이 무료봇일때
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
                // 사용자의 로봇이 유료봇일때
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
                // 사용자가 로봇을 선택하지 않았을때
                else
                {
                  answer = "담당 인공지능이 없어요! [ 홈 ] 을 쳐보세요!";
                }

                return res.json({
                  "message" : {
                    "text" : answer
                  }
                });
              });
            }).catch(err => {
              console.log(err);
            });
          }).catch(err => {
            console.log(err);
          });
        }
      }
      else if (getOutputText(data) == "분석요청")
      {
        // 기능 구현하기
        {
          // //황금추세선 상선하단/[수익중] 매수가보다 현재가가 높을 때
          // let upDownProfits = [];
          // upDownProfits.push("다행히 현재 수익 중 이십니다. 추세선 상단의 목표 구간까지 보유가 가능해 보입니다.");
          // upDownProfits.push("최근 해당 종목의 움직임에 매물대까지 고려하신다면 비중을 좀 줄이시는 전략이 좋아 보입니다.");
          // upDownProfits.push("수익축하합니다. 일단 오늘 종가까지 지켜보시고 익절 기준에 이탈 없으면 추세선 기준까지 보유하시기 바랍니다.");
          // upDownProfits.push("나쁘지 않습니다. 단기적인 수급이 더 들어오길 기다려 보시기 바랍니다.");
          // upDownProfits.push("단기적인 관점이라면 현재 위치에서는 보유물량을 좀 줄이시는 전략으로 판단합니다.");
          // upDownProfits.push("시장의 흐름과 같이 본다면 현재 비중을 무겁게 가져가시는 전략보다는 가볍게 들고 가시길 권유합니다.");
          // upDownProfits.push("수익중이시네요 축하합니다. 매도 포인트를 잘 포착하시기 바랍니다.");
          // upDownProfits.push("매수가보다 현재가가 높군요. 매도타이밍 잘 잡으시고 큰 수익 내시면 좋겠습니다.");
          // upDownProfits.push("이런 기회를 더 살려 좋은 결과 내시면 좋겠습니다. 전략상 일부는 수익실현 하시기 바랍니다.");
          // upDownProfits.push("해당 종목의 상태가 나쁘지 않습니다. 며칠 더 두고 보시고 관망하시기 바랍니다.");
          
          // let upDownLoss = [];
          // upDownLoss.push("손실 중이시라면 매수의 타이밍이 좀 아쉽습니다. 황금추세선 하선의 기준으로 매수를 하셨으면 더 좋은 결과가 있었다고 판단합니다.");
          // upDownLoss.push("현재 추세선 상선보다 아래에 위치한 주가의 흐름은 시장의 영향에 따른 변동성이 있어 보입니다. 추세선 하단선 지지선 기준으로 보유합니다.");
          // upDownLoss.push("아직은 종목의 흐름을 판단하기가 여러모로 변수가 있습니다. 다만 하단기준선을 깨지 않는 관점에서는 보유하시길 권유합니다.");
          // upDownLoss.push("현재 구간에서 지수의 변동성을 제외하더라도 종목의 흐름이 단기적인 변수를 가지는 구간입니다. 비중 추가 보다는 보유 전락을 가져가시길 권유합니다.");
          // upDownLoss.push("수급의 확실한 기준을 파악하기 위해서는 좀 더 관망하시면서 보유전략이 바르다고 판단합니다.");
          // upDownLoss.push("강한 파동을 기대하시기보다는 시간적인 투자가 필요합니다. 비중 유지하시면서 보유 전락으로 관망하시기 바랍니다.");
          // upDownLoss.push("황금추세선 하단까지 전략적으로 끌고 가시는 편이 좋아 보입니다. 추세선 터치 시 다시 전략을 고민하셔야 할 거 같습니다.");
          // upDownLoss.push("황금추세선 하단에 주가가 접근 시 현재 비중에 대한 부분을 고민할 필요가 있습니다. 우선 그 상황까지는 보유관점으로 판단합니다.");
          // upDownLoss.push("황금추세선 상선과 하단선의 기준을 점검하시고 추가적인 대응 시 비중관리 하시면 좋겠습니다. 일단은 보유관점입니다.");
          // upDownLoss.push("해당 종목이 진행에 있어 현재 구간에서 황금추세선 상단까지 주가가 상승하면 그 시점에는 비중을 줄이시고 조정 시 하단 기준선까지 보유전략입니다.");
  
          // let upUpProfits = [];
          // upUpProfits.push("종목이 단기적인 탄력이 좋을 때는 일부 비중을 축소하시고 수익을 극대화하시기 바랍니다.");
          // upUpProfits.push("황금추세선 상단을 돌파하는 구간입니다. 비중을 줄여 수익 내시고 나머지는 익절가 기준 잡고 보유하시길 권유합니다.");
          // upUpProfits.push("수급의 흐름을 좀 더 관망하겠습니다. 수익 중이시면 일단 수익실현 하시고 추후 다시 보시는 게 좋다고 판단합니다.");
          // upUpProfits.push("파동의 주기가 짧은 종목입니다. 수익 중이시면 수익 내시고 조정 시 다시 공략 하시는 게 좋아 보입니다.");
          // upUpProfits.push("기본적인 차트의 상황은 좋습니다. 일부 비중 축소 후 수익을 가져가시길 권유합니다.");
          // upUpProfits.push("팔아야 수익입니다. 수익 축하합니다.");
          // upUpProfits.push("추가적인 상승이 나오지 않으면 매도기준을 상단선 기준으로 익절가 제시합니다.");
          // upUpProfits.push("단기적인 상승세에 신뢰를 하시는 거 보다. 수익을 가져가시는 게 좋다고 판단합니다.");
          // upUpProfits.push("추가적인 상승 시 황금추세 상단 선을 기준으로 익절 기준입니다. 좋은 결과 바랍니다.");
          // upUpProfits.push("수익 중이더라도 추가적인 상승이 더 나 올지 궁금하기 마련입니다. 그렇다면 일단 비중을 줄이시고 관망하시기 바랍니다.");
          
          // let upUpLoss = [];
          // upUpLoss.push("현재 손실 중입니다. 리스크관리 하셔야 합니다. 단기적인 파동이 변수입니다.");
          // upUpLoss.push("따라가는 매매는 좋지 않습니다. 만일 급하게 매수하신 부분이라면 황금추세선 상단라인 기준으로 리스크관리 하시길 권유합니다.");
          // upUpLoss.push("상선 기준선 매수 타이밍은 눌림목 매수가 이상적입니다. 현재 손실 중이시라면 황금추세선 상선 기준으로 이탈 시 리스크관리 하시기 바랍니다.");
          // upUpLoss.push("추세선 상단의 기준선보다 높게 매수하신 경우 변동성이 커지는 구간이라 관리가 쉽지 않습니다. 우선 매수가 위로 자리 오면 비중을 축소하시고 리스크관리 하시기 바랍니다.");
          // upUpLoss.push("최근 해당 종목의 흐름은 나쁘지 않으나 매수 타이밍이 아쉽습니다. 단기적인 관점이라면 매수가 위로 자리 주면 가능한 비중을 줄이시거나 리스크 관리에 신경 쓰시면 좋겠습니다.");
          // upUpLoss.push("혹시 최근에 상승을 따라간 경우라면 오히려 파동의 변동성이 리스크로 작용할 경우가 많습니다. 황금추세선을 기준으로 대응하시면 좋겠습니다.");
          // upUpLoss.push("혹시 조정이 나오더라도 손실이 크지 않은 상황이라면 황금추세선 상선 이탈 없을 시 타이밍을 보고 좀 더 보유하시는 관점 입니다.");
          // upUpLoss.push("단기파동의 상승 파동을 기다리시는 구간이라면 황금추세선 상단선 이탈 없으면 보유하시고 매수가 위로 비중 축소 후 관망하는 관점으로 판단합니다.");
          // upUpLoss.push("실질적인 파동의 끝자락은 파악하기가 쉽지 않으나 황금추세선의 상선을 기준으로 이탈 없으면 보유가 가능합니다. 수익 또는 익절 기준 잡고 좋은 결과 내시기 바랍니다.");
          // upUpLoss.push("상선 추세선을 기준으로 눌림목 이후 파동이 나올 가능성은 기준선 이탈이 나오지 않은 경우입니다. 기준잡고 좀 더 보유하시는 관점입니다.");
  
          // let downUpProfits = [];
          // downUpProfits.push("현재 수익 중입니다. 황금추세선 상단 선 기준으로 기준 잡으시고 보유전략 권유합니다.");
          // downUpProfits.push("추가적인 수익이 좀 아쉬우나 다행히 현재 구간에서는 시간을 투자하신다면 좋은 결과가 기대됩니다. 기준선은 황금추세선 상단 선과 하단의 지지라인입니다.");
          // downUpProfits.push("주가의 흐름이 탄탄하나 시장의 방향성에 대한 주가의 변동은 불가피합니다. 황금추세선 상단 선을 저항으로 수익 구간이며 하단의 지지선을 기준으로 리스크관리 하시기 바랍니다.");
          // downUpProfits.push("단기적인 주가의 변동성에 대한 대응이 필요합니다. 비중은 그대로 보유관점이며 황금추세선 상단의 기준과 하단라인의 기준을 확인하시기 바랍니다.");
          // downUpProfits.push("현재 구간에서 추가적인 주가의 추이를 좀 더 확인할 필요가 있습니다. 우선 보유관점으로 판단되며 황금추세선의 상단 선과 하단 선을 기준을 확인하시기 바랍니다.");
          // downUpProfits.push("단기적으로 수익에 대한 부분은 비중을 줄일 필요가 있습니다. 해당 종목의 비중을 절반 정도만 보유하는 전략을 권유합니다. 기준가는 황금추세선 상단 선과 하단 선의 주가를 체크하시기 바랍니다.");
          // downUpProfits.push("기준이 되는 황금추세선 상단과 하단 사이에 주가가 진행하는 구간입니다. 보유관점으로 판단하며 수익 구간과 리스크관리의 타이밍에 집중하시기 바랍니다.");
          // downUpProfits.push("수익에 대한 부분은 일부 실현하시고 추가적인 조정 시 황금추세선 하단라인 기준으로 리스크관리 하시고 상단선 터치 시 나머지 비중도 수익실현 하시면 좋겠습니다.");
          // downUpProfits.push("기본적인 매수 타이밍에 수익까지 나쁘지는 않습니다. 다만 황금추세선을 기준으로 매매 하셨다면 더 좋은 진행을 기대할 수 있다고 판단합니다. 황금추세선 상단 선과 하단 선을 기준으로 매매전략 세우시기 바랍니다.");
          // downUpProfits.push("현재 주가의 진행에 기준가를 제시한다면 황금추세선의 상단 선은 수익 구간으로 보고 하단 선의 기준가는 리스크를 관리하시는 전략으로 보입니다.");
  
          // let downDownLoss = [];
          // downDownLoss.push("추세가 단기적으로 힘이 없다고 판단되는 구간이라 리스크관리 하시기 바랍니다.");
          // downDownLoss.push("추가하락에 대한 리스크관리가 필요합니다. 황금추세선 하단 선까지 반등이 없다면 비중축소를 권유합니다.");
          // downDownLoss.push("손실의 영역이 더 커지기 전에 리스크관리가 필요한 시점입니다. 다만 반등 시 황금추세선 하단 선을 돌파하지 못하면 정리 관점으로 판단합니다.");
          // downDownLoss.push("추세가 다시 반등을 시도하기까지는 크게 의미가 없는 구간으로 판단합니다. 비중을 점진적으로 축소하시는 방향을 권유합니다.");
          // downDownLoss.push("황금추세선 하단 선을 회복하기 전까지는 진행상 비중을 더 늘리는 대응은 금물입니다. 반등이 나오지 않으면 리스크 관리를 하시는 전략으로 판단합니다.");
          // downDownLoss.push("주가의 반등 없이 손실이 더 커지기 전에 비중을 줄이시거나 종목교체를 통해 추후를 도모하시는 편이 낫다고 판단이 됩니다.");
          // downDownLoss.push("해당 종목의 진행에 추가적인 시장의 영향을 고려한다면 지금은 기간적인 안목을 더 멀리 두고 반등을 기다리시기 바랍니다. 황금추세선 하단 선을 기준으로 보유전략을 권유합니다.");
          // downDownLoss.push("손실 중인 종목에 대한 무리한 방치는 오히려 독이 됩니다. 단기적인 관점에서는 황금추세선 하단라인까지 반등이 없다면 리스크관리 하시길 권유합니다.");
          // downDownLoss.push("하락의 추세가 멈추고 지지선이 잡히면 황금추세선 하단 선까지 반등을 기다리시기 바랍니다. 전략적 비중축소를 권유합니다.");
          // downDownLoss.push("단기적인 관점으로는 반등이 어려워 보입니다. 비중을 축소하고 종목교체를 통한 회복에 집중하시는 전략을 권유합니다.");
        }
        
        return res.json({
          "message" : {
            "text" : "준비 중인 서비스입니다."
          }
        });
      }
      else if (getOutputText(data) == "조건다시요청")
      {
        return res.json({
          "message" : {
            "text" : "필요 조건을 모두 넣어서 요청해주세요.\n조건 : 종목명 매수가 비중\n예시) 삼성전자 250만원 10프로"
          }
        });
      }
      // watson 대답이 매도의도 일 때 (의도 : 매도)
      else if (getOutputText(data) == "매도의도")
      {
        return res.json({
          "message" : {
            "text" : "준비중인 서비스입니다."
          }
        });
      }
      // watson 대답이 매수의도 일 때 (의도 : 매수)
      else if (getOutputText(data) == "매수의도")
      {
        return res.json({
          "message" : {
            "text" : "준비중인 서비스입니다."
          }
        });
      }
      // watson 대답이 시황묻기 일 때 (의도 : 코스피, 코스닥, 선물지수, 대형주, 중형주, 소형주, 시황 묻기)
      else if (getOutputText(data) == "시황묻기")
      {
        let zzou, zzod; // 코스피 상승종목수, 하락종목수
        let ozou, ozod; // 코스닥 상승종목수, 하락종목수
        let zzlu, zzld; // 대형주 상승종목수, 하락종목수
        let zzmu, zzmd; // 중형주 상승종목수, 하락종목수
        let zzsu, zzsd; // 소형주 상승종목수, 하락종목수
        
        let kospi, kosdaq, large, medium, small, futuresIndex; // 코스피, 코스닥, 대형주, 중형주, 소형주, 선물지수 종가
        let kospiAnswer, kosdaqAnswer, largeAnswer, mediumAnswer, smallAnswer;

        selectDig().then(dig => {
          zzou = parseInt(dig.recordset[0]['zzou']); zzod = parseInt(dig.recordset[0]['zzod']);
          ozou = parseInt(dig.recordset[0]['ozou']); ozod = parseInt(dig.recordset[0]['ozod']);
          zzlu = parseInt(dig.recordset[0]['zztu']); zzld = parseInt(dig.recordset[0]['zztd']);
          zzmu = parseInt(dig.recordset[0]['zz3u']); zzmd = parseInt(dig.recordset[0]['zz3d']);
          zzsu = parseInt(dig.recordset[0]['zzfu']); zzsd = parseInt(dig.recordset[0]['zzfd']);

          // 백분율 계산 (1이 붙은 이유는 상승종목수, 하락종목수가 모두 0 이면 안되기 때문에 크게 의미 없을 1이 붙음)
          kospi = (zzou * 100) / (zzou + zzod + 1);
          kosdaq = (ozou * 100) / (ozou + ozod + 1);
          large = (zzlu * 100) / (zzlu + zzld + 1);
          medium = (zzmu * 100) / (zzmu + zzmd + 1);
          small = (zzsu * 100) / (zzsu + zzsd + 1);

          whatRobot(userKey).then(robot => {
            // 로봇에 따라 달라야 하기 때문에 whatRobot으로 robot정보 가져옴
            kospiAnswer = briefingMarketConditions(robot, kospi);
            kosdaqAnswer = briefingMarketConditions(robot, kosdaq);
            largeAnswer = briefingMarketConditions(robot, large);
            mediumAnswer = briefingMarketConditions(robot, medium);
            smallAnswer = briefingMarketConditions(robot, small);
          }).then(selectFuday().then(fuday => {
            futuresIndex = fuday.recordset[0]['종가'];
  
            return res.json({
              "message" : {
                "text" : "R-e :\n코스피는 " + kospiAnswer + "\n코스닥은 " + kosdaqAnswer + "\n대형주는 " + largeAnswer + "\n중형주는 " + mediumAnswer + "\n소형주는 " + smallAnswer + "\n선물지수는 " + futuresIndex + " 포인트 입니다."
              }
            });
          }));
        });
      }
      // 그 외는 watson 대답 출력
      else
      {
        return res.json({
          "message" : {
            "text" : getOutputText(data) + "\n\n다른 정보가 궁금하시면 [ 홈 ]을 입력해주세요!"
          }
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }
};

module.exports = {
    'initialize': function(app, options) {
        app.post('/api/kakao/message', postMessage);
    }
};