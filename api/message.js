/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 'use strict';

const Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
const config = require('../util/config');
const request = require('request');
const moment = require('moment');

// Create a Service Wrapper
let conversation = new Conversation(config.conversation);

let getConversationResponse = (message, context) => {
  let payload = {
    workspace_id: process.env.WORKSPACE_ID,
    context: context || {},
    input: message || {}
  };

  payload = preProcess(payload);

  return new Promise((resolved, rejected) => {
    // Send the input to the conversation service
    conversation.message(payload, function(err, data) {
      if (err) {
        rejected(err);
      }
      else{
        let processed = postProcess(data);
        if(processed){
          // return 값이 Promise 일 경우
          if(typeof processed.then === 'function'){
            processed.then(data => {
              resolved(data);
            }).catch(err => {
              rejected(err);
            });
          }
          // return 값이 변경된 data일 경우
          else{
            resolved(processed);
          }
        }
        else{
          // return 값이 없을 경우
          resolved(data);
        }
      }
    });
  });
};

let postMessage = (req, res) => {
  let message = req.body.input || {};
  let context = req.body.context || {};
  getConversationResponse(message, context).then(data => {
    return res.json(data);
  }).catch(err => {
    return res.status(err.code || 500).json(err);
  });
};

/** 
* 사용자의 메세지를 Watson Conversation 서비스에 전달하기 전에 처리할 코드
* @param  {Object} user input
*/ 
let preProcess = payload => {
  var inputText = payload.input.text; 
  console.log("User Input : " + inputText);
  console.log("Processed Input : " + inputText); 
  console.log("--------------------------------------------------");

  return payload;
};

/** 
 * Watson Conversation 서비스의 응답을 사용자에게 전달하기 전에 처리할 코드 
 * @param  {Object} watson response 
 */ 

let postProcess = response => { 
  console.log("Conversation Output : " + response.output.text);
  console.log("--------------------------------------------------");
  if(response.context && response.context.action){
    return doAction(response, response.context.action);
  }
};

/** 
 * 대화 도중 Action을 수행할 필요가 있을 때 처리되는 함수
 * @param  {Object} data : response object
 * @param  {Object} action 
 */ 
let doAction = (data, action) => {
  console.log("Action : " + action.command);
  switch(action.command){
    default: console.log("Command not supported.");
  }
};

module.exports = {
    'initialize': (app, options) => {
        app.post('/api/message', postMessage);
    },
    'getConversationResponse' : getConversationResponse
};