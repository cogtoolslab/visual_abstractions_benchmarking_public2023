let jsPsychSketchLabel = (function (jspsych) {
  'use strict';

  const info = {
    name: "sketch-label",
    parameters: {
      /**
       * Length of time before trial ends. If `null` the trial will not timeout.
       */
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      /**
       * Whether to show a countdown timer for the remaining trial duration
       */
      show_countdown_trial_duration: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },
      /**
       * The html for the countdown timer.
       */
      countdown_timer_html: {
        type: jspsych.ParameterType.HTML_STRING,
        default: `<span id="sketchpad-timer"></span> remaining`,
      },

      max_bar: {
        type: jspsych.ParameterType.INT,
        default: 5,
      },

      min_bar: {
        type: jspsych.ParameterType.INT,
        default: 1,
      },

      canvas_size: {
        type: jspsych.ParameterType.HTML_STRING,
        default: "360px",
      },

      show_trial_count: {
        type: jspsych.ParameterType.BOOL,
        default: false,
      },

      concept: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
      totalTrials: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      currentTrial: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      png_path: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
      filename: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
      gameID: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
      uniqueID: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
      num_strokes: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      abstraction: {
        type: jspsych.ParameterType.INT,
        default: null,
      },
      filename_recog: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null,
      },
    }, // close parameters
  }; // close info
  /**
   * **plugin-sketch-label**
   *
   * jsPsych plugin for sketch prompt labeling
   *
   */
  class SketchLabelPlugin {

    time_stamp = {};

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    } // close constructor

    trial(display_element, trial) {
      this.display = display_element;
      this.params = trial;
      this.init_display();
      this.setup_event_listeners();
      this.start_time = performance.now();
      this.set_trial_duration_timer();
    }

    init_display() {

      // creating trial ui
      let canvas_html = `
      
      <div id="question-trial">
      <h2 id="question">What is this object?</h2>
      <p id="trial-counter"></p>
      </div>
      <img id='sketch' src="${this.params.png_path}" alt="image">
      <div>
       <span id='message' style= "height:50%;"><pre></pre> </span>
      <div id="search-container">
      <div class="ui-widget" id="search">
      </div>
      </div>
      </div>
      <div style="text-align: center;">
      <button class="jspsych-btn" id="plus-btn">&plus;</button>
      </div>
      <div>
      <p id="error" style="color: red; font-size: 14px"></p>
      <button class="jspsych-btn" id="finish-button">Submit</button>
      </div>`;

      // optional timer
      let timer_html = "";
      if (this.params.show_countdown_trial_duration && this.params.trial_duration) {
        timer_html = `<h3 id="countdown-timer">${this.params.countdown_timer_html}</h3>`;
        this.display.innerHTML += timer_html;
      }

      this.display.innerHTML += canvas_html;

      // Adding minimum number of search bars
      const searchContainer = document.getElementById("search-container");
      const newSearch = document.createElement("div");
      newSearch.classList.add("ui-widget");
      newSearch.setAttribute("id", "search");
      newSearch.innerHTML = `<label for="tags1"></label>
              <input id="tags1" placeholder="Enter your answer here" class="autoc">`;
      searchContainer.appendChild(newSearch);

      // Adds additional minimum number of search bars
      for (let i = 1; i < this.params.min_bar; i++) {

        const message = document.getElementById("message");
        const boxWidth = message.offsetWidth;
        let width = boxWidth + "px"
        
        const searchContainer = document.getElementById("search-container");
        const newSearch = document.createElement("div");

        searchContainer.appendChild(newSearch);
        newSearch.classList.add("ui-widget");
        newSearch.setAttribute("id", "search");
        newSearch.innerHTML = `<label for="tags"></label>
                            <input id="tags1" placeholder="Enter your answer here" class="autoc" style="width:${width}; margin-left: 36px">
                            <span class="jspsych-btn" id="minus-btn">&minus;</span>`;

          /// @Rio: I just changed the order in which things get appended to the seach container and when we add attributes. It affects things like spacing etc!
        // newSearch.classList.add("ui-widget");
        // newSearch.setAttribute("id", "search");
        // newSearch.innerHTML = `<label for="tags"></label>
        // <input id="tags1" placeholder="Enter your answer here" class="autoc" style="margin-left: 36px">
        // <span class="jspsych-btn" id="minus-btn">&minus;</span>`;
        // searchContainer.appendChild(newSearch);
     
      }

      // Creating remove button minimum search bars
      const minusButtons = document.querySelectorAll("#minus-btn");
      minusButtons.forEach((minus, i) => {
        const num_text_boxes = $("#search-container div").length;
        const ind = num_text_boxes - document.querySelectorAll("#minus-btn").length + i;
        minus.addEventListener("click", () => {
          const text_box = minus.parentElement;
          // removes time stamp if button clicked
          let index = ind - 1;
          delete this.time_stamp[index]
          text_box.remove();
        }
        )
      }
      )

      // Adds Trial counter
      const trial_html = document.getElementById("trial-counter");
      if (this.params.show_trial_count) {
        trial_html.innerText = `Trial ${this.params.currentTrial} / ${this.params.totalTrials}`;
      }

      // Adds elements and dynamically changing css
      this.add_css();
      this.dynamic_css();

      // creating array of concepts
      fetch("https://vab-recog.s3.us-west-2.amazonaws.com/things1854.json")
        .then(response => response.json())
        .then(data => {
          const thingsData = data.things1854;
          const tags = Object.values(thingsData.displayed_text);

          // creating search bar autocomplete
          this.add_autocomplete(tags, this.pushTime);
          $("#courses").autocomplete("widget").addClass("fixedHeight");
        })
    }

    pushTime(ind, val) {
      // pushes changed value timestamp to corresponding list in time_stamp dictionary
      this.time_stamp = this.get_timestamps(this.time_stamp, 0);
      let index = ind - 1;
      const times_length = Object.keys(this.time_stamp).length
      if (!(index in this.time_stamp)) {
        this.time_stamp[index] = [val];
      } else {
        try {
          this.time_stamp[index].push(val);
        } catch (error) {
          // logs potential pushing to null value error for given key
          // console.log(`Dictionary Key error! index: ${index}; Dict_keys: ${Object.keys(this.time_stamp)}; replacing value`)
          this.time_stamp[index] = [val];
        }
      }
    }

    add_autocomplete(tags, callback) {
      const searchBar = document.getElementById("search-container");
      // creates jQuery autocomplete search bar
      $(searchBar).find(".autoc").autocomplete({
        source: function (req, resp) {
          let results_1 = $.map(tags, function (tag) {
            if (((tag.toUpperCase().indexOf(req.term.toUpperCase()) === 0))) {
              return tag;
            }
          })

          let results_2 = $.map(tags, function (tag) {
            if ((tag.toUpperCase().includes(req.term.toUpperCase())) && !(tag.toUpperCase().indexOf(req.term.toUpperCase()) === 0)) {
              return tag;
            }
          })

          let results = results_1.concat(results_2);
          resp(results);
        },
        select: function (event, ui) {
          //console.log(ui.item.value);
        },
        minLength: 2,
        change: function () {
          let time = performance.now();
          let ind = $(this).parent().index();
          callback(ind, time);
        },
      })
    }

    async get_response() {
      // generates response dictionary using display_text values to find corresponding unique IDs
      const responses = {};
      await fetch("https://vab-recog.s3.us-west-2.amazonaws.com/things1854.json")
        .then(response => response.json())
        .then(data => {
          const thingsData = data.things1854;
          const unique_id = Object.values(thingsData.unique_id);
          const tags = Object.values(thingsData.displayed_text);
          const inputs = document.querySelectorAll("input");
          let key = 0;
          inputs.forEach(input => {
            let val = input.value;
            let index = tags.indexOf(val);
            responses[key] = unique_id[index];
            key++;
          })
        })
      return responses;
    }

    get_timestamps(dict, start) {
      // creates sequentially ordered dictionary for trial data results
      const timeDict = {};
      for (const [key, times] of Object.entries(dict)) {
        if (times === null || times === undefined) {
          continue;
        }
        const adjustedTimes = times.map(time => time - start);
        timeDict[key] = adjustedTimes;
      }
      return timeDict;
    }

    setup_event_listeners() {
      fetch("https://vab-recog.s3.us-west-2.amazonaws.com/things1854.json")
        .then(response => response.json())
        .then(data => {
          const thingsData = data.things1854;
          const tags = Object.values(thingsData.displayed_text);
          // Additional search bar feature
          this.display.querySelector("#plus-btn").addEventListener("click", () => {
            const searchContainer = document.getElementById("search-container");
            const newSearch = document.createElement("div");
            if ($("#search-container div").length > this.params.max_bar) {
              document.getElementById('error').innerText = "You've reached the maximum number of additional text boxes";
            } else {
              // Creating additional search bar ui
              const message = document.getElementById("message");
              const boxWidth = message.offsetWidth;
              let width = boxWidth + "px"
              searchContainer.appendChild(newSearch);
              newSearch.classList.add("ui-widget");
              newSearch.setAttribute("id", "search");
              newSearch.innerHTML = `<label for="tags"></label>
                                  <input id="tags1" placeholder="Enter your answer here" class="autoc" style="width:${width}; margin-left: 36px">
                                  <span class="jspsych-btn" id="minus-btn">&minus;</span>`;
              // Creating remove button for each additional search bar
              const minusButtons = document.querySelectorAll("#minus-btn");
              minusButtons.forEach((minus, i) => {
                const num_text_boxes = $("#search-container div").length;
                const ind = num_text_boxes - document.querySelectorAll("#minus-btn").length + i;
                minus.addEventListener("click", () => {
                  const text_box = minus.parentElement;
                  // removes time stamp if button clicked
                  let index = ind - 1;
                  delete this.time_stamp[index]
                  text_box.remove();
                })
              })
              this.add_autocomplete(tags, this.pushTime);
            }
          })

          // creating submit button event listener
          this.display.querySelector("#finish-button").addEventListener("click", () => {
            const error = document.getElementById("error");
            const inputs = document.querySelectorAll("input");
            let isTrialValid = true;
            const responseSet = new Set();
            inputs.forEach(input => {
              let val = input.value;

              if (val == "") {
                error.innerText = "Please fill in all textboxes";
                isTrialValid = false;
              } else if (!tags.includes(val)) {
                error.innerText = "Please make sure all of your guesses are from the drop-down menu";
                isTrialValid = false;
              } else if (responseSet.has(val)) {
                error.innerText = "All your guesses must be unique";
                isTrialValid = false;
              }
              responseSet.add(val);
            })
            if (isTrialValid) {
              this.end_trial();
            }
          }
          )
        })
    }


    set_trial_duration_timer() {
      if (this.params.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.end_trial();
        }, this.params.trial_duration);
        if (this.params.show_countdown_trial_duration) {
          this.timer_interval = setInterval(() => {
            const remaining = this.params.trial_duration - (performance.now() - this.start_time);
            if (remaining < (this.params.trial_duration / 2)) {
              document.getElementById("countdown-timer").style.color = "#FF0000";
            }
            let minutes = Math.floor(remaining / 1000 / 60);
            let seconds = Math.ceil((remaining - minutes * 1000 * 60) / 1000);
            if (seconds == 60) {
              seconds = 0;
              minutes++;
            }
            const minutes_str = minutes.toString();
            const seconds_str = seconds.toString().padStart(2, "0");
            const timer_span = this.display.querySelector("#sketchpad-timer");
            if (timer_span) {
              timer_span.innerHTML = `${minutes_str}:${seconds_str}`;
            }
            if (remaining <= 0) {
              if (timer_span) {
                timer_span.innerHTML = `0:00`;
              }
              clearInterval(this.timer_interval);
            }
          }, 250);
        };
      }
    } // close timer

    add_css() {
      document.querySelector("head").insertAdjacentHTML("beforeend", `<style id="sketchpad-styles">

      #question-trial {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #img-container {
        display: grid;
        justify-content: center;
      }

      #sketch {
        width: ${this.params.canvas_size};
        height: 100%;
        border: 2px solid black;
        border-radius: 5px
      }

      #question {
        margin-top: 0%;
        margin-bottom: 0px;
        padding-left: 30px;
      }

      .ui-autocomplete-input {
        height: 35 px; /* or any other value you prefer */
        font-size: 90%;
        max-width: 320px;
      }

      .ui-autocomplete.ui-menu {
        min-height: 130px; /* Set the min-height to the desired value */
      }

      .ui-autocomplete.ui-widget {
        border: 1px solid black;
        background-color: #fff;
        font-size: 90%;
        max-height: 100px;
        max-width: 50%;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 10px;
      }

      .ui-widget {
        font-size: 90%;
      }

      #tags1 {
        margin-bottom: 10px;
        width: 100%
      }

      #finish-button {
      }

      #countdown-timer {
        position: absolute;
        bottom: 1px;
        right: 15px;
      }

      #trial-counter {
      align-self: end;
      color: #000;
      color: rgba(0, 0, 0, 0.5);
      padding-left: 1rem;
      margin-bottom: 0;
      }

      #message {
        margin-block-start: 0px;
        margin-block-end: 0px;
      }

      #plus-btn {
        font-weight: bold;
        border-radius: 50%;
        font-size: 30px;
        width: 35px;
        line-height: 35px;
        padding: 0;
      }

      #minus-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 25px;
        height: 25px;
        width: 2%
      }

      .ui-helper-hidden-accessible {
        display: none;
      }

    </style>`);
    }

    dynamic_css() {
      // resizes ui elements depending on canvas size parameter
      const img = document.getElementById('sketch');
      const question = document.getElementById('question-trial');
      const trial_counter = document.getElementById('trial-counter');

      const width = img.offsetWidth;
      const area = width * width;

      const baseFontSize = 30;
      const minFontSize = 18;
      const maxFontSize = 50;
      const minImageSize = 200;
      const maxImageSize = 500;
      const ratio = (area - minImageSize * minImageSize) / (maxImageSize * maxImageSize - minImageSize * minImageSize);
      const fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize * ratio));

      question.style.fontSize = `${fontSize}px`;
      trial_counter.style.fontSize = `${fontSize * .9}px`

      const message = document.getElementById("message");
      const boxElement = document.getElementById("tags1");

      // Get the dimensions of the text
      const messageWidth = message.offsetWidth;

      // Set the size of the box to the dimensions of the text
      boxElement.style.width = messageWidth + "px";
    }

    async end_trial() {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      clearInterval(this.timer_interval);
      // creating trial data object
      const trial_data = {};
      const responses = await this.get_response()
      trial_data.rt = Math.round(performance.now() - this.start_time);
      trial_data.rt_change = this.get_timestamps(this.time_stamp, this.start_time);
      trial_data.response = responses;
      trial_data.concept = this.params.concept;
      trial_data.filename = this.params.filename;
      trial_data.uniqueID = this.params.uniqueID;
      trial_data.abstraction = this.params.abstraction;
      trial_data.num_strokes = this.params.num_strokes;
      trial_data.filename_recog = this.params.filename_recog;
      trial_data.eventType = 'sketch-label';
      trial_data.recogTrialNum = this.params.currentTrial;
      trial_data.gameID = this.params.gameID;
      this.display.innerHTML = "";
      this.jsPsych.finishTrial(trial_data);
      // console.log('trial_data', trial_data);
    } // close end_trial
  } // SketchLabelPlugin

  SketchLabelPlugin.info = info;

  return SketchLabelPlugin;

})(jsPsychModule);
