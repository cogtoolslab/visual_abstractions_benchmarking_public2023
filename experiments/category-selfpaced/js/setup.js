const iterationName = 'dbug'
const abstraction = '32 seconds'
const trial_duration = 32000

function sendData(data) {
  console.log('sending data');
  jsPsych.turk.submitToTurk({
    'score': 0 //this is a dummy placeholder
  });
}

// define trial object with boilerplate using global variables from above
// note that we make constructTrialParams later on...
function Trial() {
  this.dbname = 'thingsdraw128_16';
  this.colname = 'thingsdraw128_16';
  this.iterationName = iterationName;
};

function setupGame() {
  socket.on('onConnected', function(d) {

    // begin jsPsych
    jsPsych = initJsPsych({
      show_progress_bar: true,
      default_iti: 1000
    });

    /////////////////////////////////////
    // SET EXPERIMENT PARAMS
    // grab stims for mongoDB
    var meta = d.meta;
    var gameid = d.gameid;
    console.log('meta', meta);

    // grab PNGs used in our specific trial
    var png_filenames = _.map(meta[0], function(n, i) {
      return n['filename']
    });
    var png_paths = png_filenames.map(str => 'thingsdraw_images/' + str)

    var sampled_concepts = _.map(meta[0], 'Word');
    var sampled_pngs = _.map(meta[0], 'filename');
    var sampled_uniqueID = _.map(meta[0], 'uniqueID');

    // get PROLIFIC participantID
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var prolificID = urlParams.get('PROLIFIC_PID') // ID unique to the participant
    var studyID = urlParams.get('STUDY_ID') // ID unique to the study
    var sessionID = urlParams.get('SESSION_ID') // ID unique to the particular submission

    // these are flags to control which trial types are included in the experiment
    const includeIntro = true;
    const includeQuiz = true;
    const includePractice = true;
    const includeExitSurvey = true;
    const includeGoodbye = true;

    // which recruitment platform are we running our study on?
    const sona = false;
    if (sona) {
      var recruitmentPlatform = 'sona'
    } else {
      var recruitmentPlatform = 'prolific'
    };

    /////////////////////////////////////
    // function to save data locally and send data to server
    var main_on_finish = function(data) {
      socket.emit('currentData', data);
      console.log('emitting data');
    }

    jsPsych.data.addProperties({dbname:'thingsdraw128_16'});
    jsPsych.data.addProperties({colname: 'thingsdraw128_16'});
    jsPsych.data.addProperties({iterationName: iterationName});
    jsPsych.data.addProperties({recruitmentPlatform: recruitmentPlatform});
    jsPsych.data.addProperties({workerID: prolificID});
    jsPsych.data.addProperties({studyID: studyID});
    jsPsych.data.addProperties({sessionID: sessionID});

    var browserMeta = {
    type: jsPsychBrowserCheck,
    minimum_width: 1000,
    minimum_height: 500,
    window_resize_message:'<p>Your browser window is too small to complete this experiment. \
    Please maximize the size of your browser window or try a different device. \
    If your browser window is already maximized, we apologize but you will not be able to complete this experiment.</p>\
    <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>\
    <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>\
    <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>\
    <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>',
    inclusion_function: (data) => {
      return data.mobile === false
    },
    exclusion_message: (data) => {
      if (data.mobile) {
        return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>\
              <p> We thank you for your interest in our experiment. <br> If you wish to continue, please reconnect using a desktop or laptop computer.</p>\
              Click the button below to return to Prolific.'+

          '<p><button type="button" style= "border-radius: 10px; padding:15px 32px; background-color: #e7e7e7; text-decoration:none; font-size:15px" \
              onclick='+ '"location.href=' + "'https://www.prolific.co/';" + '">Prolific Homepage</button></p>'

      } else {
        return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>\
        <p> We thank you for your interest in our experiment. <br> If you wish to continue, please reconnect using a desktop or laptop computer with a larger screen.</p>\
        Click the button below to return to Prolific.'+

    '<p><button type="button" style= "border-radius: 10px; padding:15px 32px; background-color: #e7e7e7; text-decoration:none; font-size:15px" \
        onclick='+ '"location.href=' + "'https://www.prolific.co/';" + '">Prolific Homepage</button></p>'
      }
    }
  };

    // add additional boilerplate info
    var additionalInfo = {
      // add prolific info
      prolificID: prolificID,
      studyID: studyID,
      sessionID: sessionID,
      // add usual info
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
      // db stuff
      dbname: 'thingsdraw128_16',
      colname: 'thingsdraw128_16',
      iterationName: iterationName,
    }


    var sketchTrialconcepts = [
      _.map(sampled_concepts, function (i) { return { concept: i } })
    ]

    var sketchTrialuniqueID = [
      _.map(sampled_uniqueID, function (i) { return { uniqueID: i } })
    ]

    var sketchTrialnavpaths = [
      _.map(png_paths, function (i) { return { png_path: i } })
    ]

    var sketchTrialfilename = [
      _.map(sampled_pngs, function (i) { return { filename: i } })
    ]
  
    var trialNums = [
      _.map([...Array(sampled_concepts.length).keys()].map(v=> v+1),function (i) { return { trialNum: i }})
    ]
  
    var totalDrawings = sampled_concepts.length;

        // Define consent form language
        consentHTML = {
          'str1': '<p style="text-align:left"> Hello! In this study, you will make some drawings of objects.</p> \
          <p style="text-align:left"> We expect an average study session to last ~7 minutes, including the time \
          it takes to read these instructions. For your participation in this study, \
          you will be paid $1.81.</p><i> \
          <p style="text-align:left"> Note: We recommend using Chrome. We have not tested \
          this experiment in other browsers.</p></i>',
          'str2': ["<u><p id='legal'>Consenting to Participate</p></u>",
          "<p id='legal' style='text-align:left'>By completing this session, you are participating in a study being \
          performed by cognitive scientists at UC San Diego. If you have questions about this \
          research, please contact the <b>Cognitive Tools Lab</b> at <b> \
          <a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b>. \
          You must be at least 18 years old to participate. There are neither specific benefits \
          nor anticipated risks associated with participation in this study. \
          Your participation in this research is voluntary. You may decline to answer any \
          or all of the following questions. You may decline further participation, \
          at any time, without adverse consequences. Your anonymity is assured; the researchers \
          who have requested your participation will not reveal any personal information about \you.</p>"].join(' ')
        }
    
        // Define instructions language     
        instructionsHTML = { 
          'str1': '<p style="text-align:left">In this study, you will make drawings of 16 different object concepts. \
          For each object, you\'ll be shown a photograph as an example to help remind you of what it looks like. \
          On the blank canvas to the right, you will then make a drawing the object. \
          <b>Importantly, your goal is to draw the <i>concept</i> of the object.</b> \
          In other words, your drawing should help other people figure out what the object \
          looks like <i>beyond</i> what it specifically looks like in the provided example photograph.</p> \
          <p style="text-align:left">Please note that you will also be given a limited amount of time to produce each drawing. \
          <b>In your study session, you will have ' + '<i>'+ abstraction + ' </i>to make each drawing.</b> \
          If you are you satisfied with the drawing before the timer is done, click "Finished". \
          However, <b>please do your best to use the full amount of time allotted</b> \
          to produce a drawing that conveys the target object concept. </p> \
          <p style="text-align:left">Example drawing below:</p> \
          <video class="example_video" height="500" autoplay loop> \
          <source src="stims/intro_example.mp4" type="video/mp4"> \
          </video> \
          <p style="text-align:left"></p>',
          'str2': '<p style="text-align:left">What does it mean to draw an object <i>concept</i>? \
          For example, suppose we ask you to draw a "face". \
          Rather than drawing a specific person\'s face, you should try to draw a more \
          general looking face. In other words, <b>your drawing should help other people \
          figure out what this kind of object looks like in general</b>, \
          even if it does not looks exactly like the one in the provided example photograph. \
          Another example is that if you are shown multiple faces, \
          you only need to draw one face to convey what the concept of a "face" is.</p>\
          <img height = "300" src = "stims/categories_only.png">',
          'str3': '<p style="text-align:left">When making your drawing, please do not shade or add any words, \
           arrows, numbers, or surrounding context around your object drawing. \
          For example, if you are drawing a horse, please do not draw grass around it. \
          Also, although you will be allowed to undo strokes or \
          restart your drawing from scratch if you make a mistake, \
          you shouldn\’t be concerned about making them look pretty.</p> \
          <img height = "250" src = "stims/not_allowed_added_shading.png">',
          'str4': '<p style="text-align:left">Finally, please adjust your browser window to be as large as possible \
          so that your drawing space is not blocked in any way.</p> \
          <p style="text-align:left">Let\'s begin! On the next page, you\'ll first answer some questions about our study so far. </p>', 
          'str5': "<p style='text-align:left'>Great job! On the next page, you\'ll make a practice drawing.</p>", 
          'str6': "<p style='text-align:left'>Nice drawing! In the following part of the study, \
          you\'ll make " + totalDrawings + " drawings. \
          Before we get started, here are some important reminders:</p> \
          <p style='text-align:left'> • Your goal is to draw different <i>object concepts</i>. \
          Although you\'ll be shown a photograph of the object, remember that this is just an example of the object \
          to help remind you of what the object looks like.</p> \
          <p style='text-align:left'> • Do not shade or add any words, \
          arrows, numbers, or surrounding context around your object drawing.</p> \
          <p style='text-align:left'> • Remember that you will only have " + abstraction + " to make each drawing. \
          You can click 'Finished' if you are done drawing early, but please try to use as much \
          time as you are given as possible to make a drawing that \
          you believe accurately depicts the concept of the presented object.</p>", 
        }

    var draw = {
      timeline: [{
        type: jsPsychInstructions,
        pages: [
          "<p style='text-align:left'>When you are ready to draw, click the button below. \
          Remember that you will have " + "<b>" + abstraction + "</b>" + " to make your next drawing!</p>"
        ],
        force_wait: 1500,
        show_clickable_nav: true,
        allow_keys: false,
        allow_backward: false},
        {
        type: jsPsychSketchpad,
        stroke_width: 3,
        prompt: function () {
          var stim = "<p style='font-size: 25px'>Here\'s an example photo! \
          Please draw the <b>concept</b> of a " + 
          '<span style="text-transform:uppercase; color: #8F1B1B"><b>' + 
          jsPsych.timelineVariable('concept') + '</b></span>' + 
          " in the canvas below</p>";
          return stim;
        },
        gameID: gameid,
        concept: jsPsych.timelineVariable('concept'),
        png_path: jsPsych.timelineVariable('png_path'),
        filename: jsPsych.timelineVariable('filename'),
        uniqueID: jsPsych.timelineVariable('uniqueID'),
        trial_duration: trial_duration,
        show_countdown_trial_duration: true,
        canvas_width: 500,
        canvas_height: 500,
        show_clear_button: false,
        undo_button_label: 'Undo Stroke',
        redo_button_label: 'Redo Stroke',
        finished_button_label: 'Finished',
        canvas_border_width: 2,
        currentDrawing: jsPsych.timelineVariable('trialNum'),
        totalDrawings: totalDrawings,
        survey: 'not_survey',
        on_finish: main_on_finish
      }],
      timeline_variables: _.merge(_.flatten(sketchTrialnavpaths),_.flatten(sketchTrialfilename),_.flatten(sketchTrialconcepts),_.flatten(sketchTrialuniqueID),_.flatten(trialNums))
    }

    // make practice trial
    var practice_draw = {
        type: jsPsychSketchpad,
        stroke_width: 3,
        prompt: function () {
          var stim = "<p style='font-size: 25px'>Here\'s an example photo! \
          Please draw the <b>concept</b> of a " + 
          '<span style="text-transform:uppercase; color: #8F1B1B"><b>' + 
          'FISH' + '</b></span>' + 
          " in the canvas below</p>";
          return stim;
        },
        gameID: gameid,
        concept: 'fish',
        png_path: 'stims/practice_image.png',
        filename: 'practice_image.png',
        uniqueID: 'fish',
        trial_duration: trial_duration,
        show_countdown_trial_duration: true,
        canvas_width: 500,
        canvas_height: 500,
        show_clear_button: false,
        undo_button_label: 'Undo Stroke',
        redo_button_label: 'Redo Stroke',
        finished_button_label: 'Finished',
        canvas_border_width: 2,
        currentDrawing: '1',
        totalDrawings: '1',
        survey: 'not_survey',
        on_finish: main_on_finish
      }

      // var getip = function(){
      //   $.getJSON('https://ipinfo.io/json', function(d) {
      //     jsPsych.data.addProperties({ipInfo:JSON.stringify(d, null, 2) });
      //   })
      // };
      
      // var fetchIp = {
      //   type: jsPsychCallFunction,
      //   func: getip,
      //   on_finish: main_on_finish
      // }

    var browserMeta = {
      type: jsPsychBrowserCheck,
      minimum_width: 1000,
      minimum_height: 500,
      window_resize_message:'<p>Your browser window is too small to complete this experiment. Please maximize the size of your browser window or try a different device. \
      If your browser window is already maximized, we apologize but you will not be able to complete this experiment.</p>\
      <p>The minimum window width is <span id="browser-check-min-width"></span> px.</p>\
      <p>Your current window width is <span id="browser-check-actual-width"></span> px.</p>\
      <p>The minimum window height is <span id="browser-check-min-height"></span> px.</p>\
      <p>Your current window height is <span id="browser-check-actual-height"></span> px.</p>',
      inclusion_function: (data) => {
        return data.mobile === false
      },
      exclusion_message: (data) => {
        if (data.mobile) {
          return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>\
                <p> We thank you for your interest in our experiment. <br> If you wish to continue, please reconnect using a desktop or laptop computer.</p>\
                Click the button below to return to Prolific.'+
  
            '<p><button type="button" style= "border-radius: 10px; padding:15px 32px; background-color: #e7e7e7; text-decoration:none; font-size:15px" \
                onclick='+ '"location.href=' + "'https://www.prolific.co/';" + '">Prolific Homepage</button></p>'
  
        } else {
          return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>\
          <p> We thank you for your interest in our experiment. <br> If you wish to continue, please reconnect using a desktop or laptop computer with a larger screen.</p>\
          Click the button below to return to Prolific.'+
  
      '<p><button type="button" style= "border-radius: 10px; padding:15px 32px; background-color: #e7e7e7; text-decoration:none; font-size:15px" \
          onclick='+ '"location.href=' + "'https://www.prolific.co/';" + '">Prolific Homepage</button></p>'
        }
      }
    };


    // Create consent + instructions instructions trial
    let welcome = {
      type: jsPsychInstructions,
      pages: [
        consentHTML.str1,
        consentHTML.str2,
        instructionsHTML.str1,
        instructionsHTML.str2,
        instructionsHTML.str3,
        instructionsHTML.str4
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true
    }

    let prepractice_message = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str5
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true
    }

    let pretest_message = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str6
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true
    }

    // add comprehension check
    var quizTrial = {
      type: jsPsychSurveyMultiChoice,
      preamble: "<b><u>Quiz</u></b><p>Before we begin, please answer the following questions to \
      be sure you understand what you need to do in this study.</p>",
      questions: [{
          prompt: "<b>Question 1</b> - What should your goal be when making each drawing?",
          name: "quizPurpose",
          horizontal: false,
          options: [
            "To make a drawing that looks pretty!", 
            "To make a drawing that represents the object concept, even if it does not look exactly like the specific object in the photograph I am shown.", 
            "To make a drawing that can be matched to the example photograph I was shown."
          ],
          required: true
        },
        {
          prompt: "<b>Question 2</b> - Should you shade or add words, arrows, or any surrounding context to your drawing?",
          name: "quizBanned",
          horizontal: false,
          options: [
            "Yes",
            "No",
          ],
          required: true
        }, 
        {
          prompt: "<b>Question 3</b> - Can you undo or erase things you already drew?",
          name: "quizUndo",
          horizontal: false,
          options: [
            "Yes",
            "No",
          ],
          required: true
        }
      ]
    };

    // check whether comprehension check responses are correct
    var loopNode = {
      timeline: [quizTrial],
      loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        // console.log('data.values',resp);
        if (
          (resp['quizPurpose'] == "To make a drawing that represents the object concept, even if it does not look exactly like the specific object in the photograph I am shown.") &&
          (resp['quizBanned'] == "No") &&
          (resp['quizUndo'] == "Yes")
          ) {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    };

    // demographic survey trials
    var surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo));
    var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
      type: jsPsychSurvey,
      pages: [
        [          
          {
          type: 'drop-down',
          prompt: "Which of the following did you use to make your drawings?", 
          options: ["Mouse",
                  "Trackpad",
                  "Touch Screen",
                  "Stylus", 
                  "Other"],
          name: 'participant_inputDevice', 
          required: true,
        }, 
          {
            type: 'drop-down',
            prompt: "What is your gender?", 
            options: ["Male",
                    "Female",
                    "Other",
                    "Do Not Wish To Say"],
            name: 'participant_sex', 
            required: true,
          }, 
          {
            type: 'drop-down',
            prompt: "What is your ethnicity?", 
            options: ["Black or African American", 
            "American Indian or Alaska Native", 
            "Asian",
            "Native Hawaiian or Other Pacific Islander", 
            "White",
            "Hispanic or Latino", 
            "Other/More than One Race/Do Not Wish To Say"],
            name: 'participant_ethnicity', 
            required: true,
          }, 
          {
            type: 'drop-down',
            prompt: "What is your highest level of education (current or completed)?",
            options: ["Did not graduate high school",
            "High school graduate, diploma or equivalent",
            "Associate degree",
            "Bachelor's degree",
            "Master's degree",
            "Professional degree (e.g. M.D., J.D.)",
            "Doctoral degree (e.g., Ph.D.)"
          ],
            name: 'participant_ed', 
            required: true,
          }, 
          {
            type: 'drop-down',
            // Britanica 2023
            prompt: 'What is your country of residence? If you do not want to disclose this information, select "Do not wish to say".',
            options: ['Do not wish to say', 'Other', 
            'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
            'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 
            'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
            'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canaa', 'Central African Republic', 'Chad',
            'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Costa Rica', 
            'Côte d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
            'East Timor (Timor-Leste)', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
            'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
            'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 
            'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea', 'Kosovo', 'Kuwait',
            'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 
            'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Federated States of Micronesia',
            'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 
            'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 
            'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 
            'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 
            'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
            'South Africa', 'Spain', 'Sri Lanka', 'South Sudan', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 
            'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
            'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',' United States', 'Uruguay', 'Uzbekistan', 
            'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
          ],
            name: 'participant_country', 
            required: true,
          }, 
          {
            type: 'drop-down',
            prompt: 'If you live in the United States of America, what is your state of residence? If you do not want to disclose this information, select "Do not wish to say".',
            options: ['Do not wish to say', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 
            'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 
            'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
            'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
            'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 
            'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
            'West Virginia', 'Wisconsin', 'Wyoming',
          ],
            name: 'participant_USstate', 
            required: true,
          }, 
          // {
          //   type: 'drop-down',
          //   prompt: "If you pursued/are pursuing higher education, what is your major? If your major is not listed, please choose the major that is the most similar.",
          //   options: ['Not applicable', 'Other', 
          //   'Anthropology', 'Bioengineering', 'Biological Sciences', 
          //   'Black Diaspora & African American Studies', 'Chemistry/Biochemistry', 
          //   'Chinese Studies', 'Classical Studies', 'Cognitive Science', 'Communication', 
          //   'Computer Science & Engineering', 'Critical Gender Studies', 'Dance', 
          //   'Data Science', 'Economics', 'Education Studies', 'Electrical & Computer Engineering', 
          //   'Engineering', 'English', 'Environmental Systems Program', 'Ethnic Studies', 'German Studies', 
          //   'Global Health', 'Global South Studies', 
          //   'History', 'Human Developmental Sciences', 'International Studies', 'Italian Studies', 
          //   'Japanese Studies', 'Jewish Studies', 'Latin American Studies', 'Linguistics', 'Literature', 
          //   'Mathematics', 'Mechanical & Aerospace Engineering', 'Music', 'NanoEngineering', 'Oceanography', 'Philosophy', 
          //   'Physics', 'Political Science', 'Psychology', 'Public Health', 'Religion', 'Russian & Soviet Studies', 
          //   'Sociology', 'Structural Engineering', 'Theatre & Dance', 'Urban Studies & Planning', 'Visual Arts', 'Undeclared',
          // ],
          //   name: 'participant_major', 
          //   required: true,
          // }, 
          // {
          //   type: 'drop-down',
          //   prompt: "What is the general category of your occupation? If your occupation is not listed, please choose the occupation that is the most similar.",
          //   options: ['Not applicable', 'Other',
          //   'Management', 'Business & Financial Operations', 'Computer & Mathematical', 'Architecture & Engineering',
          //   'Life, Physical, & Social Science', 'Community & Social Service', 'Legal', 'Educational Instruction', 
          //   'Arts, Design, Entertainment, Sports, & Media', 'Healthcare Practioners & Technical', 'Healthcare Support', 
          //   'Protective Service', 'Food Preparation & Service', 'Building & Grounds Cleaning/Maintenance', 
          //   'Personal Care & Service', 'Sales', 'Office & Administration Support', 'Farming, Fishing, & Forestry',
          //   'Construction & Extraction', 'Installation, Maintenance, & Repair', 'Production', 'Transportation & Material Moving'
          // ],
          //   name: 'participant_occ', 
          //   required: true,
          // }, 
          {
            type: 'text',
            prompt: "How old are you?", 
            name: 'participant_age', 
            textbox_columns: 5,
            required: true,
          }, 
          {
            type: 'text',
            prompt: "What year were you born", 
            name: 'participant_birthyear', 
            textbox_columns: 5,
            required: true,
          }
        ],
        [
          {
            type: 'likert',
            prompt: 'How skilled do you consider yourself to be at drawing?',
            likert_scale_min_label: 'highly unskilled',
            likert_scale_max_label: 'highly skilled',
            likert_scale_values: [
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}, 
              {value: 6}, 
              {value: 7}
            ], 
            name: 'participant_subjectiveSkill', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'When you try to form a mental picture, it is usually',
            likert_scale_min_label: 'no image',
            likert_scale_max_label: 'very clear',
            likert_scale_values: [
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}, 
              {value: 6}, 
              {value: 7}
            ], 
            name: 'participant_subjectiveImagery', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'How difficult did you find this study?',
            likert_scale_min_label: 'Very Easy',
            likert_scale_max_label: 'Very Hard',
            likert_scale_values: [
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}
            ], 
            name: 'participant_difficulty', 
            required: true,
          }, 
          {
            type: 'likert',
            prompt: 'Which of the following best describes the amount of effort you put into the task?',
            likert_scale_min_label: "I did not try at all",
            likert_scale_max_label: 'I did my very best',
            likert_scale_values: [
              {value: 0},
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}
            ], 
            name: 'participant_effort', 
            required: true,
          }
        ], 
        [
          {
            type: 'multi-choice',
            prompt: "Did you encounter any technical difficulties while completing \
                     this study? This could include: images were glitchy (e.g., did not load) \
                     or sections of the study did not load properly.", 
          options: ["Yes", "No"],
          name: 'participant_technical', 
          required: true,
          }, 
          {
            type: 'text',
            prompt: "If you encountered any technical difficulties, please briefly \
                     describe the issue.", 
            // name: 'TechnicalDifficultiesFreeResp', 
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_technical_freeresponse', 
            required: false,
          },
          {
            type: 'text',
            prompt: "Thank you for participating in our study! Do you have any \
                     other comments or feedback \
                     to share with us about your experience?", 
            // name: 'participantComments', 
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_freeresponse', 
            required: false,
          }
        ]
      ],
      title: 'Exit Survey',
      button_label_next: 'Continue',
      button_label_finish: 'Submit',
      show_question_numbers: 'onPage'
    }
    );

    // add goodbye page
    var goodbye = {
      type: jsPsychInstructions,
      pages: [
        'Congrats! You are all done. Thanks for participating in our study! \
          Click NEXT to submit this study.'
      ],
      show_clickable_nav: true,
      allow_backward: false,
      // delay: false,
      on_finish: function() {
        sendData();
        // on prolific, you can copy-paste the below completion url
        window.open("https://app.prolific.co/submissions/complete?cc=CC6PX69D", "_self");
        // window.open('https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=2062&credit_token=1162d120a5c94af09a8e4e250bcc7ec0&survey_code=' + jsPsych.data.getURLVariable('survey_code'))
      }
    };
    /////////////////////////////////////
    // preload stims
    var intro_images = ['stims/categories_only.png', 
                        'stims/not_allowed_added_shading.png', 
                        'stims/practice_image.png'];
    var images = intro_images.concat(png_paths)
    var video = ['stims/intro_example.mp4'];

    var preload = {
      type: jsPsychPreload,
      images: images,
      video: video
  }

    /////////////////////////////////////
    // add all experiment variables to trials array
    // initialize array
    var setup = [];

    // add instructions and consent
    setup.push(preload);
    if (includeIntro) setup.push(browserMeta);
    if (includeIntro) setup.push(welcome);
    // add comprehension check
    if (includeQuiz) setup.push(loopNode);
    if (includeIntro) setup.push(prepractice_message);
    if (includePractice) setup.push(practice_draw);
    if (includeIntro) setup.push(pretest_message);
    setup.push(draw);
    if (includeExitSurvey) setup.push(exitSurveyChoice);
    if (includeGoodbye) setup.push(goodbye);

    console.log('experiment', setup);

    // run study
    jsPsych.run(setup);
  }); // close socket onConnected
}