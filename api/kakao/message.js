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

// tbl_dig  모두 조회
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

// tbl_fuday 모두 조회
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

// tbl_plus_free에 lastQcode에 사용자가 마지막으로 입력한 종목명 저장
let saveStockName = (stockName, userKey) => {
  return new Promise((resolve, reject) => {
    let query = "UPDATE tbl_plus_free SET lastQcode = '" + stockName + "' WHERE user_key = '" + userKey + "'";

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

// tbl_day 종목 코드로 조회
let selectDay = (code, sort) => {
  return new Promise((resolve, reject) => {
    let query;
    if (sort == "고가")
    {
      query = "SELECT TOP (1) 고가 FROM tbl_day WHERE 종목코드 = '" + code + "' ORDER BY CAST([고가] AS FLOAT) DESC;";
    }
    else if (sort == "저가")
    {
      query = "SELECT TOP (1) 저가 FROM tbl_day WHERE 종목코드 = '" + code + "' ORDER BY CAST([저가] AS FLOAT) ASC;";
    }
    
    new mssql.ConnectionPool(config_bong).connect().then(pool => {
      return pool.request().query(query);
    }).then(result => {
      mssql.close();
      resolve(result.recordset[0]);
    }).catch(err => {
      console.error(err);
      
      mssql.close();
    });
  });
};

// tbl_gar, apar  모두 조회
let selectGarOrApar = (table, column) => {
  return new Promise((resolve, reject) => {
    let query;
    if (table == "gar")
    {
      query = "SELECT TOP (1) " + column + " FROM tbl_gar WHERE " + column + " IS NOT NULL;";
    }
    else if (table == "apar")
    {
      query = "SELECT TOP (1) " + column + " FROM tbl_apar WHERE " + column + " IS NOT NULL;";
    }
    
    new mssql.ConnectionPool(config_kakao).connect().then(pool => {
      return pool.request().query(query);
    }).then(result => {
      mssql.close();
      resolve(result.recordset[0]);
    }).catch(err => {
      console.error(err);
      
      mssql.close();
    });
  });
};

let postMessage = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  let userKey = req.body.user_key;
  let type = req.body.type;
  let content = {
  	'text' : req.body.content
  };
  
  // 사용자가 한 말 저장
  updateAllLog(userKey, content);

  if(content.text == "홈")
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
  else if(content.text == "사용법")
  {
    let massage = {
      "message": {
        "text": "[상담원으로 전환하기] 버튼을 누르고 [ 종목수신동의 ] 라고 치시면 실시간으로 종목 알림을 받으실 수 있습니다. (이후 다시 [챗봇으로 전환하기] 버튼을 눌러주세요.)\n\n[ 홈 ]이라고 치시면 절차에 따라 인공지능을 설치 하실 수 있습니다.\n\n항목별 사용법은 아래 버튼을 눌러서 확인해주세요."
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "종목 정보 묻기",
          "종목 상황 묻기",
          "관심 종목 묻기",
          "종목 분석 묻기",
          "추가 매수 분석 묻기",
          "홈"
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
          "사용법",
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
          "사용법",
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
          "사용법",
          "홈"
        ]
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "종목 분석 묻기")
  {
    let massage = {
      "message": {
        "text": "종목명, 매수가, 비중을 넣어서 물어보시면 분석 결과를 받아보실 수 있습니다.\n예시) 삼성전자 250만원 10프로"
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "사용법",
          "홈"
        ]
      }
    };
    sendKakaoText(massage);
  }
  else if (content.text == "추가 매수 분석 묻기")
  {
    let massage = {
      "message": {
        "text": "종목명, 매수가, 비중, 추가매수를 넣어서 물어보시면 분석 결과를 받아보실 수 있습니다.\n예시) 삼성전자 250만원 10프로 추가매수"
      },
      "keyboard": {
        "type": "buttons",
        "buttons": [
          "사용법",
          "홈"
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
        "text": "유료가입으로 '지금 이 방에서' 자신이 선택한 인공지능/인간 전문가의 서비스를 받아볼 수 있습니다."
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
  else if (content.text == "기존 VIP 인증하기" || content.text == "MBN 김성남 인공지능 R-e 받기")
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
    catch(err)
    {
      console.error(err);
    }
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
            "text": "무료 로봇 등록 완료\n[ 홈 ] 에서 사용법을 확인해주세요."
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "홈"
            ]
          }
        };
        sendKakaoText(massage);
        
        mssql.close();
      }).catch(err => {
        console.log(err.message);
        let massage = {
          "message": {
            "text": "이미 무료 로봇을 받았거나 유료봇 사용중입니다."
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "홈"
            ]
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
        "text": "준비중인 인공지능입니다 [ 홈 ]에서 처음부터 시작할 수 있습니다."
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
    serchStock(content).then(allCode => {
      // 사용자 말에 종목명이 포함되어 있을 경우 DB에 저장
      if (allCode)
      {
        saveStockName(allCode['종목명'], userKey);
      }
      // 사용자의 말이 정확한 종목명일 때
      if (content.text == allCode['종목명'])
      {
        // report 검색
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
          // 종목명이 없을 경우 아무것도 안함
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
            conversation.getConversationResponse(str, doc.context).then(data => {
              // context를 업데이트 합니다.
              db.insert(Object.assign(doc, {
                'context': Object.assign(data.context, {
                  'timezone' : "Asia/Seoul"
                }),
              }));
              watsonResponse(data);
            }).catch(err => {
              console.error(err.message);
              if ((err.message.indexOf("tab") !== -1) || (err.message.indexOf("new line") !== -1))
              {
                return res.json({
                    "message" : {
                      "text" : "엔터를 빼고 입력해주세요."
                    }
                });
              }
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
            }).catch(err => {
              if ((err.message.indexOf("tab") !== -1) || (err.message.indexOf("new line") !== -1))
              {
                return res.json({
                    "message" : {
                      "text" : "엔터를 빼고 입력해주세요."
                    }
                });
              }
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
  
  // kakao로 출력
  function sendKakaoText(massage) {
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  }

  // watson 응답 출력
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
            
            let forHead = parseInt((string.replace("-", "")).replace("+", ""), 10).toLocaleString(undefined) + "원"; // 쉼표 넣은 것
            let fuHead = parseInt((string.replace("-", "")).replace("+", ""), 10); // 쉼표 안 넣은 것
            let forPrice = parseInt(allCode['현재가'], 10).toLocaleString(undefined) + "원";
            
            let forHLine = parseInt(allCode['HLine'], 10).toLocaleString(undefined) + "원"; // 황금추세선 상단
            let forLLine = parseInt(allCode['LLine'], 10).toLocaleString(undefined) + "원"; // 황금추세선 하단
            
            whatRobot(userKey).then(robot => {
              // 사용자의 로봇이 무료봇일때
              if (robot == "000")
              {
                if (allCode['HLine'] <= allCode['현재가'])
                {
                  answer = "부미 :\n와 가격이 높네요.. 저도 황금알 점수를 보고 더 갈 수 있을지 알아봐야겠어요";
                }
                else if (allCode['HLine'] > allCode['현재가'] && allCode['현재가'] > allCode['LLine'])
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
                else if (allCode['LLine'] >= allCode['현재가'])
                {
                  answer = "부미 :\n너무 떨어지는데요.. 유료 인공지능 선배님들은 이럴 때 어떻게 해야 하는지 알고계시던데...";
                }
              }
              // 사용자의 로봇이 유료봇일때
              else if (robot == "100")
              {
                if (allCode['현재가'] < fuHead)
                {
                  answer = "R-e :\n" + allCode['종목명'] + " 현재가가 " + forPrice + " 이고 큰손들 평단가가  " + forHead + " 정도인것 같은데 돈있는 사람들이 손해보고 팔거같진 않아 보이는데요?";
                }
                else if (allCode['HLine'] <= allCode['현재가'])
                {
                  answer = "R-e :\n오.. 이제 전략적인 익절을 해야하지 않을까요? 전 너무 무섭네요";
                }
                else if (allCode['HLine'] > allCode['현재가'] && allCode['현재가'] > allCode['LLine'])
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
                else if (allCode['LLine'] >= allCode['현재가'] && allCode['황금알점수'] > 70)
                {
                  answer = "R-e :\n요즘 상황이 나쁘지 않은 종목이라 할인 찬스라고 생각하셔도 될것 같은데요?";
                }
                else if (allCode['LLine'] >= allCode['현재가'] && allCode['황금알점수'] <= 70)
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
        }
      }
      // watson 대답이 분석요청일 때 (의도 : 종목 분석 요청)
      else if ((getOutputText(data)).indexOf("분석요청") !== -1)
      {
        let column;

        serchStock(content).then(allCode => {
          let code = allCode['코드'];
          let watsonArray = getOutputText(data).split(',');
          let buyPrice = parseInt(watsonArray[1], 10); // 매수가
          let weight = parseInt(watsonArray[2], 10); // 비중
          let fivePercent = buyPrice * 0.05;
          
          let forHLine = parseInt(allCode['HLine'], 10);
          let forLLine = parseInt(allCode['LLine'], 10);
          let forPrice = parseInt(allCode['현재가'], 10);
          let golden = "";
          let imgUrl = "";

          selectDay(code, "고가").then(high => {
            if (buyPrice > parseInt(high['고가']))
            {
              return res.json({
                "message" : {
                  "text" : "매수가가 비정상적으로 높네요.\n저를 시험하려고 하신 건가요?"
                }
              });
            }
            else
            {
              selectDay(code, "저가").then(low => {
                if (buyPrice < parseInt(low['저가']))
                {
                  return res.json({
                    "message" : {
                      "text" : "매수가가 비정상적으로 낮네요.\n저를 시험하려고 하신 건가요?"
                    }
                  });
                }
                else
                {
                  // 황금추세선 상선상단
                  if (forPrice >= forHLine)
                  {
                    if (forPrice > buyPrice)
                    {
                      if ((forPrice - buyPrice) >= fivePercent)
                      {
                        column = "up_profits_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((forPrice - buyPrice) < fivePercent)
                      {
                        column = "up_profits_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else if (forPrice < buyPrice)
                    {
                      if ((buyPrice - forPrice) >= fivePercent)
                      {
                        column = "up_loss_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((buyPrice - forPrice) < fivePercent)
                      {
                        column = "up_loss_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else
                    {
                      column = "no_change";
                    }
                  }
                  // 황금추세선 상선하단, 하선상단
                  else if (forPrice < forHLine)
                  {
                    if (forPrice > buyPrice)
                    {
                      if ((forPrice - buyPrice) >= fivePercent)
                      {
                        column = "middle_profits_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((forPrice - buyPrice) < fivePercent)
                      {
                        column = "middle_profits_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else if (forPrice < buyPrice)
                    {
                      if ((buyPrice - forPrice) >= fivePercent)
                      {
                        column = "middle_loss_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((buyPrice - forPrice) < fivePercent)
                      {
                        column = "middle_loss_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else
                    {
                      column = "no_change";
                    }
                  }
                  // 황금추세선 하선하단
                  else if (forPrice <= forLLine)
                  {
                    if (forPrice > buyPrice)
                    {
                      if ((forPrice - buyPrice) >= fivePercent)
                      {
                        column = "down_profits_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((forPrice - buyPrice) < fivePercent)
                      {
                        column = "down_profits_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else if (forPrice < buyPrice)
                    {
                      if ((buyPrice - forPrice) >= fivePercent)
                      {
                        column = "down_loss_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((buyPrice - forPrice) < fivePercent)
                      {
                        column = "down_loss_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else
                    {
                      column = "no_change";
                    }
                  }
                  golden = "황금추세선 상단주가 : " + forHLine + "원\n황금추세선 하단주가 : " + forLLine + "원";

                  selectGarOrApar("gar", column).then(answer => {
                    let answerObj = JSON.parse(answer[column]);
                    let random = Math.floor((Math.random() * Object.keys(answerObj).length) + 1);
                    let randomStr = random.toString();
                    
                    whatRobot(userKey).then(robot => {
                      if (robot == "000")
                      {
                        return res.json({
                          "message" : {
                            "text" : answerObj[randomStr],
                          }
                        });
                      }
                      else if (robot == "100")
                      {
                        return res.json({
                          "message" : {
                            "text" : answerObj[randomStr] + "\n\n" + golden,
                            "photo": {
                              "url": imgUrl,
                              "width": 88,
                              "height": 44
                            }
                          }
                        });
                      }
                    });
                  });
                }
              });
            }
          });
        });
      }
      else if ((getOutputText(data)).indexOf("추가매수의도") !== -1)
      {
        let column;
        // 분석요청과 같은 로직
        serchStock(content).then(allCode => {
          let code = allCode['코드'];
          let watsonArray = getOutputText(data).split(',');
          let buyPrice = parseInt(watsonArray[1], 10); // 매수가
          let weight = parseInt(watsonArray[2], 10); // 비중
          let fivePercent = buyPrice * 0.05;

          let forHLine = parseInt(allCode['HLine'], 10);
          let forLLine = parseInt(allCode['LLine'], 10);
          let forPrice = parseInt(allCode['현재가'], 10);
          let golden = "";
          let imgUrl = "";

          selectDay(code, "고가").then(high => {
            if (buyPrice > parseInt(high['고가']))
            {
              return res.json({
                "message" : {
                  "text" : "매수가가 비정상적으로 높네요.\n저를 시험하려고 하신 건가요?"
                }
              });
            }
            else
            {
              selectDay(code, "저가").then(low => {
                if (buyPrice < parseInt(low['저가']))
                {
                  return res.json({
                    "message" : {
                      "text" : "매수가가 비정상적으로 낮네요.\n저를 시험하려고 하신 건가요?"
                    }
                  });
                }
                else
                {
                  // 황금추세선 상선상단
                  if (forPrice >= forHLine)
                  {
                    if (forPrice > buyPrice)
                    {
                      if ((forPrice - buyPrice) >= fivePercent)
                      {
                        column = "up_profits_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((forPrice - buyPrice) < fivePercent)
                      {
                        column = "up_profits_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else if (forPrice < buyPrice)
                    {
                      if ((buyPrice - forPrice) >= fivePercent)
                      {
                        column = "up_loss_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((buyPrice - forPrice) < fivePercent)
                      {
                        column = "up_loss_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else
                    {
                      column = "no_change";
                    }
                  }
                  // 황금추세선 상선하단, 하선상단
                  else if (forPrice < forHLine)
                  {
                    if (forPrice > buyPrice)
                    {
                      if ((forPrice - buyPrice) >= fivePercent)
                      {
                        column = "middle_profits_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((forPrice - buyPrice) < fivePercent)
                      {
                        column = "middle_profits_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else if (forPrice < buyPrice)
                    {
                      if ((buyPrice - forPrice) >= fivePercent)
                      {
                        column = "middle_loss_fiveup";
                      }
                      else if ((buyPrice - forPrice) < fivePercent)
                      {
                        column = "middle_loss_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else
                    {
                      column = "no_change";
                    }
                  }
                  // 황금추세선 하선하단
                  else if (forPrice <= forLLine)
                  {
                    if (forPrice > buyPrice)
                    {
                      if ((forPrice - buyPrice) >= fivePercent)
                      {
                        column = "down_profits_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((forPrice - buyPrice) < fivePercent)
                      {
                        column = "down_profits_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else if (forPrice < buyPrice)
                    {
                      if ((buyPrice - forPrice) >= fivePercent)
                      {
                        column = "down_loss_fiveup";
                        imgUrl = "http://61.72.187.6/images/Sellout";
                      }
                      else if ((buyPrice - forPrice) < fivePercent)
                      {
                        column = "down_loss_fivedown";
                        imgUrl = "http://61.72.187.6/images/Retention";
                      }
                    }
                    else
                    {
                      column = "no_change";
                    }
                  }
                  golden = "황금추세선 상단주가 : " + forHLine + "원\n황금추세선 하단주가 : " + forLLine + "원";

                  selectGarOrApar("apar", column).then(answer => {
                    let answerObj = JSON.parse(answer[column]);
                    let random = Math.floor((Math.random() * Object.keys(answerObj).length) + 1);
                    let randomStr = random.toString();

                    whatRobot(userKey).then(robot => {
                      if (robot == "000")
                      {
                        return res.json({
                          "message" : {
                            "text" : answerObj[randomStr],
                          }
                        });
                      }
                      else if (robot == "100")
                      {
                        return res.json({
                          "message" : {
                            "text" : answerObj[randomStr] + "\n\n" + golden,
                            "photo": {
                              "url": imgUrl,
                              "width": 88,
                              "height": 44
                            }
                          }
                        });
                      }
                    });
                  });
                }
              });
            }
          });
        });
      }
      else if ((getOutputText(data)).indexOf("황금알질문") !== -1)
      {
        let answer;
        let watsonArray = getOutputText(data).split(',');
        let entity = watsonArray[1];
        
        if (entity == "황금알")
        {
          return res.json({
            "message" : {
              "text" : "황금알시스템에서 확인해주세요!"
            }
          });
        }
        else if (entity == "종목명없음")
        {
          return res.json({
            "message" : {
              "text" : "확인하고 싶으신 종목명도 같이 입력해주세요!"
            }
          });
        }
        else
        {
          serchStock(content).then(allCode => {
            let name = allCode['종목명'];
            let forHLine = parseInt(allCode['HLine'], 10).toLocaleString(undefined) + "원";
            let forLLine = parseInt(allCode['LLine'], 10).toLocaleString(undefined) + "원";

            whatRobot(userKey).then(robot => {
              if (robot == "000")
              {
                if (entity == "상단")
                {
                  answer = "부미 :\n저는 아무것도 몰라요... 근데 R-e는 저보다 더 많이 알고 있어요!";
                }
                else if (entity == "하단")
                {
                  answer = "부미 :\n잘 모르겠어요... R-e는 알고 있지 않을까요?";
                }
              }
              else if (robot == "100")
              {
                if (entity == "상단")
                {
                  answer = "R-e :\n현재 [" + name + "]의 황금추세선 상단주가는 " + forHLine +" 입니다";
                }
                else if (entity == "하단")
                {
                  answer = "R-e :\n현재 [" + name + "]의 황금추세선 하단주가는 " + forLLine +" 입니다";
                }
              }
              
              return res.json({
                "message" : {
                  "text" : answer
                }
              });
            });
          });
        }
      }
      else if (getOutputText(data) == "분석조건재요청")
      {
        return res.json({
          "message" : {
            "text" : "필요 조건을 모두 넣어서 요청해주세요.\n필요 조건 : 종목명 매수가 비중\n예시) 삼성전자 250만원 10프로"
          }
        });
      }
      else if ((getOutputText(data)).indexOf("추가매수분석조건재요청") !== -1)
      {
        return res.json({
          "message" : {
            "text" : "필요 조건을 모두 넣어서 요청해주세요.\n필요 조건 : 종목명 매수가 비중\n예시) 삼성전자 250만원 10프로 추가매수"
          }
        });
      }
      // watson 대답이 매도의도 일 때 (의도 : 매도)
      else if (getOutputText(data) == "매도의도")
      {
        return res.json({
          "message" : {
            "text" : "필요 조건을 모두 넣어서 요청해주세요.\n필요 조건 : 종목명 매수가 비중\n예시) 삼성전자 250만원 10프로"
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
      else if ((getOutputText(data)).indexOf("날씨") !== -1)
      {
        let answer;
        let watsonArray = getOutputText(data).split(',');
        let date;
        if (watsonArray[1] != '')
        {
          date = watsonArray[1];
        }
        else
        {
          let objDate = new Date();
          let year = objDate.getFullYear();
          let month = objDate.getMonth() + 1;
          let day = objDate.getDate();
          date = year + "-" + month + "-" + day;
        }
        let location = watsonArray[2];

        return res.json({
          "message" : {
            "text" : "날씨는 아직 준비중이에요!\n빠른 시일 내로 서비스할 수 있도록 노력해볼게요!\n\n다른 정보가 궁금하시면 [ 홈 ]에서 사용법을 확인해주세요!"
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "사용법",
              "홈"
            ]
          }
        });
      }
      else if ((content.text).indexOf(allCode['종목명']) != -1)
      {
        return res.json({
          "message" : {
            "text" : "사용법을 확인해주세요!"
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "사용법"
            ]
          }
        });
      }
      else if (getOutputText(data) == "" || getOutputText(data) == null)
      {
        return res.json({
          "message" : {
            "text" : "사용법을 확인해주세요!"
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "사용법"
            ]
          }
        });
      }
      // 그 외는 watson 대답 출력
      else
      {
        return res.json({
          "message" : {
            "text" : getOutputText(data) + "\n\n다른 정보가 궁금하시면 [ 홈 ]에서 사용법을 확인해주세요!"
          },
          "keyboard": {
            "type": "buttons",
            "buttons": [
              "사용법",
              "홈"
            ]
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