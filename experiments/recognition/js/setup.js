const iterationName = 'testing'

// function Experiment() {
//   this.type = 'jspsych-sketch-label';
//   this.dbname = 'dbname';
//   this.colname = 'colname';
//   this.iterationName = 'testing';
//   //this.devMode = true;
// }

function setupGame() {




  var socket = io.connect();
  socket.on('onConnected', function(d) {

    const devMode =false; 
    const mTurk = false;


    if (mTurk) {
      var recruitmentPlatform = 'mturk'
    } else {
      // IMPORTANT! Change to either SONA or PROLIFIC! 
      var recruitmentPlatform = 'prolific'
    };
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var prolificID = urlParams.get('PROLIFIC_PID')   // ID unique to the participant
    var studyID = urlParams.get('STUDY_ID')          // ID unique to the study
    var sessionID = urlParams.get('SESSION_ID')      // ID unique to the particular submission


    var id = d.gameid;

    if (devMode==true){
      socket.emit("getStim", {gameID:id});
    }else if(devMode==false){
      socket.emit("getStim", {gameID:sessionID});

    }

  
    socket.on("stimulus", (server_trials) => {
   
      stim_keys = Object.keys(server_trials.stims)


  const jsPsych = initJsPsych({
    show_progress_bar: true,
    default_iti: 300
  });
      


      var main_on_finish = function(data) {
        socket.emit('currentData', data);
        console.log('emitting data');
      }

  jsPsych.data.addProperties({dbname:'visual-abstraction-benchmarking'});
  jsPsych.data.addProperties({colname: 'things-128_recognition_human'});
  jsPsych.data.addProperties({iterationName:iterationName});
  jsPsych.data.addProperties({recruitmentPlatform:recruitmentPlatform});
  jsPsych.data.addProperties({workerID:prolificID});
  jsPsych.data.addProperties({studyID:studyID});
  jsPsych.data.addProperties({sessionID:sessionID});





 
  let total_trials = _.map(server_trials.stims, 'concept').length+1;

  let browserMeta = {
    type: jsPsychBrowserCheck,
    minimum_width: 1000,
    minimum_height: 500,
    window_resize_message: '<p>Your browser window is too small to complete this experiment. \
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


  /// don't think we're using this dict in this version, but keep around in case we want to change things!
  let additionalInfo = {
    // add prolific info
    prolificID: prolificID,
    studyID: studyID,
    sessionID: sessionID,
    // add usual info
    // gameID: null,
    recruitmentPlatform: recruitmentPlatform,
    // db stuff
    dbname: 'dbname',
    colname: 'colname',
    iterationName: iterationName,
  }

  let sketch_paths = [];
  const includeIntro = true;
  const includeQuiz = false;
  const includePractice = true;
  const includeExitSurvey = true;
  const includeGoodbye = true;

  

  consentHTML = {
    'str1': '<p style="text-align:left"> Hello! In this study, you will be presented with a series \
    of drawings and asked to guess the object that each drawing represents.</p> \
    <p style="text-align:left"> We expect an average study session to last 8 minutes, including the time \
    it takes to read these instructions. For your participation in this study, \
    you will be paid $XX.XX.</p><i> \
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

  instructionsHTML = {

    'str1':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"><p>We are researchers interested in how people communicate ideas using drawings.\
     In a previous study, we asked people to make drawings of various everyday objects.\
    In this study, we will show you some of those drawings and ask you to tell us which label you think best applies to the drawing.</p>\
    <p>Please enter your best guess into the textbox below the drawing. As you begin typing, different suggestions will appear in a drop-down menu.\
     Please choose a label from among the suggestions. If you think that more than one label applies to a drawing, please click on the + button to enter additional labels,\
      starting with your second-best guess</p>\
      <p>See below for an example trial.</p><img  height="280px" src="stimuli/vab-recog-demo.gif" style="margin-left: 25%;text-align:center; border:2px solid black"></img>\
      <p>On the next page, you will be able to try out the interface by completing a practice trial. Please press Next when you are ready.</div>',
      'str2':'<div style = "width:800px; font-size:25px; line-height:1.2">Great job! You have completed the practice trial.<br> When you are ready, please press Next to begin the study. Good luck!</div>'
  }


  // Create consent + instructions instructions trial
  let welcome = {
    type: jsPsychInstructions,
    pages: [
      consentHTML.str1,
      consentHTML.str2,
      instructionsHTML.str1,
    ],
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: true,
    force_wait: 1500,
 

  }
  let practice_complete = {
    type: jsPsychInstructions,
    pages: [
      instructionsHTML.str2
    ],
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: false,
    force_wait: 1500,
 

  }



  let fullscreentrial = {
    type: jsPsychFullscreen,
    
    fullscreen_mode: true
  }



  // let surveyChoiceInfo = _.omit(_.extend({}, new Experiment, additionalInfo));
  // let exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
    let exitSurveyChoice = {
    type: jsPsychSurvey,
    pages: [
      [
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
            'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', ' United States', 'Uruguay', 'Uzbekistan',
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
        {
          type: 'text',
          prompt: "How old are you?",
          name: 'participant_age',
          textbox_columns: 5,
          required: true,
        },
        {
          type: 'text',
          prompt: "What year were you born?",
          name: 'participant_birthyear',
          textbox_columns: 5,
          required: true,
        }
      ],
      [
        {
          type: 'likert',
          prompt: 'When you try to form a mental picture, it is usually',
          likert_scale_min_label: 'no image',
          likert_scale_max_label: 'very clear',
          likert_scale_values: [
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
            { value: 6 },
            { value: 7 }
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
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 }
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
            { value: 0 },
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 }
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
    show_question_numbers: 'onPage',
    on_finish: main_on_finish
  }
  // );

  // add goodbye page
  let goodbye = {
    type: jsPsychInstructions,
    pages: [
      'Congrats! You are all done. Thanks for participating in our study! \
          Click NEXT to submit this study.'
    ],
    show_clickable_nav: true,
    allow_backward: false,
    // delay: false,
    /*on_finish: function() {
      sendData();
      // on prolific, you can copy-paste the below completion url
      window.open("https://app.prolific.co/submissions/complete?cc=CC6PX69D", "_self");
    }*/
  }

  let practice = {
    type: jsPsychSketchLabel,
    concept: 'cat',
    png_path: './stimuli/cat.png',
    currentTrial: '0',
    totalTrials: '0',
    min_bar:1,
    show_trial_count: false,
    on_finish: main_on_finish
  };

  let label_drawing = {
    type: jsPsychSketchLabel,
    concept: jsPsych.timelineVariable('concept'),
    png_path: jsPsych.timelineVariable('png_path'),
    uniqueID: jsPsych.timelineVariable('uniqueID'),
    filename: jsPsych.timelineVariable('filename'),
    currentTrial: jsPsych.timelineVariable('trial_num'),
    abstraction: jsPsych.timelineVariable('abstraction'),
    num_strokes: jsPsych.timelineVariable('num_strokes'),
    filename_recog:jsPsych.timelineVariable('filename_recog'),
    
    min_bar:1,
    canvas_size:'300px',
    totalTrials: total_trials,
    show_trial_count: true,
    on_finish: main_on_finish
  };

  // console.log('serverstims',server_trials.stims);

  /// create arrays of the info we'll need for each trial
  var sampled_concepts = _.map(server_trials.stims, 'concept');
  var sampled_uids = _.map(server_trials.stims, 'uniqueID');
  var sampled_filenames= _.map(server_trials.stims, 'filename');
  var sampled_concept_urls = _.map(server_trials.stims, 'stim_url');
  var sampled_abstractions = _.map(server_trials.stims, 'abstraction');
  var sampled_num_strokes = _.map(server_trials.stims, 'num_strokes');
  var sampled_filename_recogs = _.map(server_trials.stims, 'filename_recog');
  
  

  var recogTrialConcepts = [
    _.map(sampled_concepts, function (i) { return { concept: i } })
  ]
  var recogTrialUids = [
    _.map(sampled_uids, function (i) { return { uniqueID: i } })
  ]
  var recogTrialFilenames = [
    _.map(sampled_filenames, function (i) { return { filename: i } })
  ]
  var recogTrialUrls = [
    _.map(sampled_concept_urls, function (i) { return { png_path: i } })
  ]
  var recogTrialAbstractions = [
    _.map(sampled_abstractions, function (i) { return { abstraction: i } })
  ]
  var recogTrialNumStrokes = [
    _.map(sampled_num_strokes, function (i) { return { num_strokes: i } })
  ]
  var recogTrialExtendedFilenames = [
    _.map(sampled_filename_recogs, function (i) { return { filename_recog: i } })
  ]


  ///really ugly way of inserting the catch trial for now. Should be ways to refactor this bit


  const tmp_concept = recogTrialConcepts[0].splice(32,1)[0]
  const tmp_uid =  recogTrialUids[0].splice(32,1)[0]
  const tmp_filename = recogTrialFilenames[0].splice(32,1)[0]
  const tmp_url = recogTrialUrls[0].splice(32,1)[0]
  const tmp_abstraction =recogTrialAbstractions[0].splice(32,1)[0]
  const tmp_num_strokes = recogTrialNumStrokes[0].splice(32,1)[0]
  const tmp_recog_filename = recogTrialExtendedFilenames[0].splice(32,1)[0]


  recogTrialConcepts[0].push(tmp_concept)
  recogTrialUids[0].push(tmp_uid)
  recogTrialFilenames[0].push(tmp_filename)
  recogTrialUrls[0].push(tmp_url)
  recogTrialAbstractions[0].push(tmp_abstraction)
  recogTrialNumStrokes[0].push(tmp_num_strokes)
  recogTrialExtendedFilenames[0].push(tmp_recog_filename)


  const newConcept= { concept: 'cat' } 
  const newUniquedID ={uniqueID: 'cat'}
  const newFilename = {filename: 'cat'}
  const newUrl = {png_path: './stimuli/cat.png'}
  const newAbstraction ={abstraction: null}
  const newNumStrokes = {num_strokes: 0}
  const newExtendedFilename = {filename_recog: null}

  recogTrialConcepts[0].splice(32, 0, newConcept);
  recogTrialUids[0].splice(32, 0, newUniquedID);
  recogTrialFilenames[0].splice(32, 0, newFilename);
  recogTrialUrls[0].splice(32, 0, newUrl);
  recogTrialAbstractions[0].splice(32, 0, newAbstraction);
  recogTrialNumStrokes[0].splice(32, 0, newNumStrokes);
  recogTrialExtendedFilenames[0].splice(32, 0, newExtendedFilename);
 

  // list of total trial nums!
  var recogTrialNums = _.range(1, total_trials+1).map(function(num) {
    return { trial_num: num };
  });


  _.merge(_.flatten(recogTrialConcepts), _.flatten(recogTrialUrls), _.flatten(recogTrialUids), _.flatten(recogTrialFilenames),_.flatten(recogTrialNums))


  let trial = {
    timeline: [label_drawing],
    timeline_variables: _.merge(_.flatten(recogTrialConcepts), _.flatten(recogTrialUrls), _.flatten(recogTrialUids), _.flatten(recogTrialFilenames),_.flatten(recogTrialNums),
    _.flatten(recogTrialAbstractions), _.flatten(recogTrialNumStrokes),_.flatten(recogTrialExtendedFilenames))

  };

    sketch_paths.push("./stimuli/cat.png");
    sketch_paths.push("./stimuli/vab-recog-demo.gif");
    // sketch_paths.push("./stimuli/add_remove.gif");
    // sketch_paths.push("./stimuli/intro.gif");
    // sketch_paths.push("./stimuli/sketch-label.gif");
    // sketch_paths.push("./stimuli/custom_dupe.gif");
    // sketch_paths.push("./stimuli/typo.gif");

  let preload = {
    type: jsPsychPreload,
    auto_preload:true,
    images: sampled_concept_urls,

    // images: sketch_paths,
  }
  let preload_local = {
    type: jsPsychPreload,

    images: sketch_paths,
  }

  let timeline = [];

  timeline.push(preload);
  timeline.push(preload_local);

  
  timeline.push(fullscreentrial);
  // if (includeIntro) timeline.push(browserMeta);
  if (includeIntro) timeline.push(welcome);
  // if (includeQuiz) timeline.push(loopNode);
  // if (includeIntro) timeline.push(prepractice_message);
  if (includePractice) timeline.push(practice)
  // if (includeIntro) timeline.push(pretest_message);
  timeline.push(practice_complete);
  timeline.push(trial);

  if (includeExitSurvey) timeline.push(exitSurveyChoice);
  //if (includeExitSurvey) timeline.push(exitSurveyText);
  if (includeGoodbye) timeline.push(goodbye);

  

  jsPsych.run(timeline);

}); ///stim socket


}); ///socket
}