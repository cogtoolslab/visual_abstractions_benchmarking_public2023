var jsPsychSurveyTextEdited = (function (jspsych) {
  'use strict';

  const info = {
      name: "survey-text",
      parameters: {
          questions: {
              type: jspsych.ParameterType.COMPLEX,
              array: true,
              pretty_name: "Questions",
              default: undefined,
              nested: {
                  /** Question prompt. */
                  prompt: {
                      type: jspsych.ParameterType.HTML_STRING,
                      pretty_name: "Prompt",
                      default: undefined,
                  },
                  /** Placeholder text in the response text box. */
                  placeholder: {
                      type: jspsych.ParameterType.INT,
                      pretty_name: "Placeholder",
                      default: "",
                  },
                  /** The number of rows for the response text box. */
                  rows: {
                      type: jspsych.ParameterType.INT,
                      pretty_name: "Rows",
                      default: 1,
                  },
                  /** The number of columns for the response text box. */
                  columns: {
                      type: jspsych.ParameterType.INT,
                      pretty_name: "Columns",
                      default: 40,
                  },
                  /** Whether or not a response to this question must be given in order to continue. */
                  required: {
                      type: jspsych.ParameterType.BOOL,
                      pretty_name: "Required",
                      default: false,
                  },
                  /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
                  name: {
                      type: jspsych.ParameterType.STRING,
                      pretty_name: "Question Name",
                      default: "",
                  },
              },
          },
          /** If true, the order of the questions in the 'questions' array will be randomized. */
          randomize_question_order: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Randomize Question Order",
              default: false,
          },
          /** HTML-formatted string to display at top of the page above all of the questions. */
          promptTitle: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Preamble",
              default: null,
          },
        /** HTML-formatted string to display at top of the page above all of the questions. */
        text_impossible: {
            type: jspsych.ParameterType.HTML_STRING,
            pretty_name: "Preamble",
            default: '<b>Important note:</b> Click the below button only if you strongly \
            believe that the above data visualization <i>does not</i> provide the necessary information to \
            answer the question. Otherwise, please provide your best guess.',
        },
          /** Label of the button to submit responses. */
          button_label: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Button label",
              default: "Continue",
          },
          /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
          autocomplete: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Allow autocomplete",
              default: false,
          },
      },
  };
  /**
   * **survey-text**
   *
   * jsPsych plugin for free text response survey questions
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-survey-text/ survey-text plugin documentation on jspsych.org}
   */
  class SurveyTextPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          for (var i = 0; i < trial.questions.length; i++) {
              if (typeof trial.questions[i].rows == "undefined") {
                  trial.questions[i].rows = 1;
              }
          }
          for (var i = 0; i < trial.questions.length; i++) {
              if (typeof trial.questions[i].columns == "undefined") {
                  trial.questions[i].columns = 40;
              }
          }
          for (var i = 0; i < trial.questions.length; i++) {
              if (typeof trial.questions[i].value == "undefined") {
                  trial.questions[i].value = "";
              }
          }

          var html = "";

          if (trial.practice == 'practice') {
            html += '<div class="practice"> ' + "Question: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
          } else if (trial.practice != 'practice') {
            html += '<div class="trialNum"> ' + "Question: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
          }

          html += '<div class="container">'

          // show preamble text
          if (trial.promptTitle !== null) {
              html +=
                  '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble" style="text-align: center; text-decoration: underline;">' +
                      trial.promptTitle +
                      "</div>";
          }

          if (trial.description !== null) {
            html +=
                '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble" style="margin-bottom: 20px;">' +
                    trial.description +
                    "</div>";
        }

          // start form
          if (trial.autocomplete) {
              html += '<form id="jspsych-survey-text-form">';
          }
          else {
              html += '<form id="jspsych-survey-text-form" autocomplete="off">';
          }

        // insert data visualization image (PNG)
        html += '<div id="data visualization">'
        html += "<img src='" + 'images/' + trial.graphID + "' class='graph_images'></img>"
        html += '</div>' // close data visualization

        html += '<div class="row">'
          // generate question order
          var question_order = [];
          for (var i = 0; i < trial.questions.length; i++) {
              question_order.push(i);
          }
          if (trial.randomize_question_order) {
              question_order = this.jsPsych.randomization.shuffle(question_order);
          }
          // add questions
          for (var i = 0; i < trial.questions.length; i++) {
              var question = trial.questions[question_order[i]];
              var question_index = question_order[i];
              html +=
                  '<div id="jspsych-survey-text-' +
                      question_index +
                      '" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
              html += '<p class="jspsych-survey-text">' + question.prompt + "</p><p style='font-size: 15px !important; margin-bottom: 2px; font-style: italic'>Please round to the nearest 100th place (e.g., 2.175 => 2.18)</p>";
              var autofocus = i == 0 ? "autofocus" : "";
              var req = question.required ? "required" : "";
              if (question.rows == 1) {
                  html +=
                    //   '<input type="text" id="input-' +
                      '<input type="number" step="0.01" id="input-' +
                          question_index +
                          '"  name="#jspsych-survey-text-response-' +
                          question_index +
                          '" data-name="' +
                          question.name +
                          '" size="' +
                          question.columns +
                          '" ' +
                          autofocus +
                          " " +
                          req +
                          ' placeholder="' +
                          question.placeholder +
                          '"></input>';
              }
              else {
                  html +=
                      '<textarea id="input-' +
                          question_index +
                          '" name="#jspsych-survey-text-response-' +
                          question_index +
                          '" data-name="' +
                          question.name +
                          '" cols="' +
                          question.columns +
                          '" rows="' +
                          question.rows +
                          '" ' +
                          autofocus +
                          " " +
                          req +
                          ' placeholder="' +
                          question.placeholder +
                          '"></textarea>';
              }
              html += "</div>";
          }
            html += '</div>' // close row

            // add submit button
            html +=
            '<input type="submit" id="next" class="jspsych-btn jspsych-survey-text" value="' +
              trial.button_label +
              '"></input>';
            html += "</form>";

            // add impossible text
            if (trial.text_impossible !== null) {
                html +=
                    '<div id="text_impossible" class="jspsych-survey-text-preamble">' +
                    '<b>Important note:</b> Click the below button only if you strongly \
                    believe that the above data visualization <i>does not</i> provide the necessary information to \
                    answer the question. Otherwise, please provide your best guess.' +
                        "</div>";
            }

            // add impossible button
            html +=
            '<input id="impossible" class="jspsych-btn jspsych-survey-text" value="' +
                'Not possible to answer' +
                '"></input>';
            html += "</form>";
            html += '<p id="impossible_explanation"></p>'

          html += '</div>' // close container

          setTimeout(() => {
            display_element.innerHTML = html;

            // backup in case autofocus doesn't work
            display_element.querySelector("#input-" + question_order[0]).focus();
            console.log('delay 1000');

          var startTime = performance.now();

          display_element.querySelector("#jspsych-survey-text-form").addEventListener("submit", (e) => {
              e.preventDefault();

              // measure response time
              var endTime = performance.now();
              var response_time = Math.round(endTime - startTime);

              // create object to hold responses
              var question_data = {};
              for (var index = 0; index < trial.questions.length; index++) {
                  var id = "Q" + index;
                  var q_element = document
                      .querySelector("#jspsych-survey-text-" + index)
                      .querySelector("textarea, input");
                  var val = q_element.value;
                  var name = q_element.attributes["data-name"].value;
                  if (name == "") {
                      name = id;
                  }
                  var obje = {};
                  obje[name] = val;
                  Object.assign(question_data, obje);
              }

              // save data
          if (trial.practice == 'practice') {
            var trialdata = {
                gameID: trial.gameID,
                dbname: 'davinci_receiver',
                colname: 'davinci_receiver',
                iterationName: trial.iterationName,   
                version: trial.version,
                recruitmentPlatform: trial.recruitmentPlatform,
                eventType: 'practice',   
                survey: 'not_survey',         
                corrAns: trial.corrAns,
                startTime: startTime,
                endTime: endTime, 
                rt: response_time,
                response: question_data['Q0'],
                explanation: 'NA',
                taskCategory: trial.taskCategory, 
                questionType: trial.questionType,
                graph_PNG: trial.graphID,
                graphType: trial.graphType,
                prompt: trial.prompt,
                promptTitle: trial.promptTitle,
                dataset: trial.dataset,
                trialNum: trial.trialNum
            };          
        } else if (trial.practice != 'practice') {
            var trialdata = {
                gameID: trial.gameID,
                dbname: trial.dbname,
                colname: trial.colname,
                iterationName: trial.iterationName,   
                version: trial.version,
                recruitmentPlatform: trial.recruitmentPlatform,
                eventType: 'test',      
                survey: 'not_survey',  
                corrAns: trial.corrAns,    
                startTime: startTime,
                endTime: endTime, 
                rt: response_time,
                response: question_data['Q0'],
                explanation: 'NA',
                taskCategory: trial.taskCategory, 
                questionType: trial.questionType,
                graph_PNG: trial.graphID,
                graphType: trial.graphType,
                prompt: trial.prompt,
                promptTitle: trial.promptTitle,
                dataset: trial.dataset,
                trialNum: trial.trialNum
            };
        }
                // send data to mongoDB
                console.log('currentData', trialdata);
                socket.emit('currentData', trialdata);

              display_element.innerHTML = "";
              // next trial
              this.jsPsych.finishTrial(trialdata);
          });
        }, 1000)

          $("#impossible").click(function() {
            
            let explain_prompt = prompt("Please explain why you are unable to answer the question:", " ");
            if (explain_prompt != null) {
            
            // measure response time
            var endTime = performance.now();
            var response_time = Math.round(endTime - startTime);

            // create object to hold responses
            var question_data = {};
            for (var index = 0; index < trial.questions.length; index++) {
                var id = "Q" + index;
                var q_element = document
                    .querySelector("#jspsych-survey-text-" + index)
                    .querySelector("textarea, input");
                var val = q_element.value;
                var name = q_element.attributes["data-name"].value;
                if (name == "") {
                    name = id;
                }
                var obje = {};
                obje[name] = val;
                Object.assign(question_data, obje);
            }

            // save data
        if (trial.practice == 'practice') {
          var trialdata = {
              gameID: trial.gameID,
              dbname: 'davinci_receiver',
              colname: 'davinci_receiver',
              iterationName: trial.iterationName,   
              version: trial.version,
              recruitmentPlatform: trial.recruitmentPlatform,
              eventType: 'practice',   
              survey: 'not_survey',   
              corrAns: trial.corrAns,      
              startTime: startTime,
              endTime: endTime, 
              rt: response_time,
              response: 'impossible',
              explanation: explain_prompt,
              taskCategory: trial.taskCategory, 
              questionType: trial.questionType,
              graph_PNG: trial.graphID,
              graphType: trial.graphType,
              prompt: trial.prompt,
              promptTitle: trial.promptTitle,
              dataset: trial.dataset,
              trialNum: trial.trialNum
          };          
      } else if (trial.practice != 'practice') {
          var trialdata = {
              gameID: trial.gameID,
              dbname: trial.dbname,
              colname: trial.colname,
              iterationName: trial.iterationName,   
              version: trial.version,
              recruitmentPlatform: trial.recruitmentPlatform,
              eventType: 'test',      
              survey: 'not_survey',  
              corrAns: trial.corrAns,    
              startTime: startTime,
              endTime: endTime, 
              rt: response_time,
              response: 'impossible',
              explanation: explain_prompt,
              taskCategory: trial.taskCategory, 
              questionType: trial.questionType,
              graph_PNG: trial.graphID,
              graphType: trial.graphType,
              prompt: trial.prompt,
              promptTitle: trial.promptTitle,
              dataset: trial.dataset,
              trialNum: trial.trialNum
          };
      }
              // send data to mongoDB
              console.log('currentData', trialdata);
              socket.emit('currentData', trialdata);
              localStorage.clear();

            display_element.innerHTML = "";
            // next trial
            jsPsych.finishTrial(trialdata); 

            // make fullscreen
            // function requestFullScreen(element) {
            //     // Supports most browsers and their versions.
            //     var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
            
            //     if (requestMethod) { // Native full screen.
            //         requestMethod.call(element);
            //     } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
            //         var wscript = new ActiveXObject("WScript.Shell");
            //         if (wscript !== null) {
            //             wscript.SendKeys("{F11}");
            //         }
            //     }
            // }
            // var elem = document.body; // Make the body go full screen.
            // requestFullScreen(elem);
            } else if (explain_prompt == null) { // user hit cancel or OK without answering
                // make fullscreen
                // function requestFullScreen(element) {
                //     // Supports most browsers and their versions.
                //     var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
                
                //     if (requestMethod) { // Native full screen.
                //         requestMethod.call(element);
                //     } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                //         var wscript = new ActiveXObject("WScript.Shell");
                //         if (wscript !== null) {
                //             wscript.SendKeys("{F11}");
                //         }
                //     }
                // }
                var elem = document.body; // Make the body go full screen.
                requestFullScreen(elem);    
                } else { // user hit cancel or OK without answering
            // make fullscreen
            // function requestFullScreen(element) {
            //     // Supports most browsers and their versions.
            //     var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
            
            //     if (requestMethod) { // Native full screen.
            //         requestMethod.call(element);
            //     } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
            //         var wscript = new ActiveXObject("WScript.Shell");
            //         if (wscript !== null) {
            //             wscript.SendKeys("{F11}");
            //         }
            //     }
            // }
            // var elem = document.body; // Make the body go full screen.
            // requestFullScreen(elem);    
            }
          })
      }

      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      create_simulation_data(trial, simulation_options) {
          const question_data = {};
          let rt = 1000;
          for (const q of trial.questions) {
              const name = q.name ? q.name : `Q${trial.questions.indexOf(q)}`;
              const ans_words = q.rows == 1
                  ? this.jsPsych.randomization.sampleExponential(0.25)
                  : this.jsPsych.randomization.randomInt(1, 10) * q.rows;
              question_data[name] = this.jsPsych.randomization.randomWords({
                  exactly: ans_words,
                  join: " ",
              });
              rt += this.jsPsych.randomization.sampleExGaussian(2000, 400, 0.004, true);
          }
          const default_data = {
              response: question_data,
              rt: rt,
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          this.trial(display_element, trial);
          load_callback();
          const answers = Object.entries(data.response).map((x) => {
              return x[1];
          });
          for (let i = 0; i < answers.length; i++) {
              this.jsPsych.pluginAPI.fillTextInput(display_element.querySelector(`#input-${i}`), answers[i], ((data.rt - 1000) / answers.length) * (i + 1));
          }
          this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("#jspsych-survey-text-next"), data.rt);
      }
  }
  SurveyTextPlugin.info = info;

  return SurveyTextPlugin;

})(jsPsychModule);
