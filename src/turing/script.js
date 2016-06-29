/**
 *
 * config{
 *  alphabet: 'abcd' // list of available symbols
 *  empty: '*' // empty symbol
 *  strip: 'ab**cd**c***c***c**' // initial state of strip
 *  position: -1 // shift to the first not empty symbol
 *  states: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] // states
 * }
 *
 *
 * solution{
 *  commands: [{id:'1' from: 'q1', to: 'q2', inp: 'a', out: 'b', move: 'L', g:'1', comment: 'тра-та-та'},
 *  {id: '2' from: 'q1', to: 'q2', inp: 'c', out: 'b', move: 'N' g:'2'}]
 * }
 *
 *
 * @constructor
 */
function Turing() {
  /**
   * to generate unique id
   * @type {number}
   */
  this.counter = 0;

  /**
   * initial task config
   * @type {{}}
   */
  this.config = {}

  /**
   * array of available alphabet symbols (first - empty symbol)
   * @type {Array}
   */
  this.alphabet = [];

  /**
   * array of states
   * @type {Array}
   */
  this.states = [];

  /**
   * array of commands
   * @type {Array}
   */
  this.commands = [];

  /**
   * 0 - stop
   * 1 - play
   * 2 - pause
   * @type {number}
   */
  this.play = 0;

  /**
   * edit command list (only in stop mode)
   * @type {boolean}
   */
  this.editCommand = false;

  /**
   * edit strip (only in stop mode)
   * @type {boolean}
   */
  this.editStrip = false;

  /**
   * initial strip state
   * @type {string}
   */
  this.initialStrip = "";


  /**
   * current strip state
   * @type {string}
   */
  this.strip = "";

  /**
   * create js stage
   * @type {{}}
   */
  this.stage = {};
}

Turing.prototype.layout = '<style>#divId .it-scene{background-color:#fff}#divId .it-player-holder{text-align:center}#divId .it-player-holder .it-player{display:inline-block;padding:5px}#divId .it-strip-input{font-family:monospace}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row it-player-holder"><div class="it-player"><button class="it-stop" type="button" class="btn btn-default" title="Перевести МТ в начальное состояние и очистить журнал выполнения"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button> <button class="it-step" type="button" class="btn btn-default" title="Выполнить шаг"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button> <button class="it-play" type="button" class="btn btn-default" title="Запустить анимацию"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button> <button class="it-pause" type="button" class="btn btn-default" title="Пауза"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button></div></div><div class="row"><p class="lead">Исходная лента</p><div class="col-sm-12"><div class="it-strip"><div class="input-group"><input class="it-strip-input form-control" type="text" class="form-control"> <span class="input-group-btn"><button class="btn btn-default it-strip-change" type="button">Изменить</button></span></div></div></div></div><div class="row"><p class="lead">Журная выполнения</p><div class="col-sm-12"><div class="it-log"></div></div></div><div class="row"><p class="lead">Список команд <button class="btn btn-default it-commands-change" type="button">Изменить</button></p><div class="it-view"><div class="col-sm-6"><div class="it-command-list"></div></div><div class="col-sm-6"><div class="it-command-table"></div></div></div><div class="it-edit"><div class="col-sm-6"><div class="it-command-list"></div></div><div class="col-sm-6"><div class="it-command-table"></div></div></div></div></div>';//###layout



Turing.prototype.init = function ($, cjs, divId, taskWidth, config) {
  this.$ = $;
  this.cjs = cjs;
  this.config = config;

  $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
  $("#" + divId + " .it-edit").hide();


  this.strip = config.strip;
  $("#" + divId + " .it-strip-input").attr("disabled", "true");
  $("#" + divId + " .it-strip-input").val(this.strip);

  $("#" + divId + " .it-strip-change").click(function () {
    if ($("#" + divId + " .it-strip-input").attr("disabled")) {
      $("#" + divId + " .it-strip-input").removeAttr("disabled");
      $(this).html("Принять");
    } else {
      $("#" + divId + " .it-strip-input").attr("disabled", "true");
      $(this).html("Изменить");
    }
  });

  $("#" + divId + " .it-scene").attr("id", divId + "-it-scene");
  $("#" + divId + " .it-scene").attr("width", taskWidth - 40);
  $("#" + divId + " .it-task").css("max-width", taskWidth + "px");
  $("#" + divId + " .it-task").css("min-width", taskWidth + "px");

  var stage = new cjs.Stage(divId + "-it-scene");
  stage.mouseMoveOutside = true;

  const cellSize = 30;
  var stripView = new createjs.Container();
  for(var i=0; i<100; i++) {
    var circle = new createjs.Shape();
    circle.graphics.beginStroke("black").drawRect(0, 0, cellSize, cellSize);
    circle.x=+i*cellSize;
    stripView.addChild(circle);
  }

  stripView.x=0;
  stripView.y=0;

  stage.addChild(stripView);


  var headView = new createjs.Container();
  var head = new createjs.Shape();
  head.graphics.beginStroke("black").drawRect(0, 0, cellSize, cellSize);
  headView.addChild(head);

  headView.x=50;
  headView.y=50;


  stage.addChild(headView);

  stage.update();

  this.stage=stage;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  $("#" + divId + " .it-stop").click(function () {


    createjs.Tween.get(stripView)
        // .wait(500)
        .to({x: -100}, 500);
        // .call(handleComplete);
    // function handleComplete() {
      //Tween complete
    // }

  });

};

Turing.prototype.load = function (solution) {
 this.commands=solution.commands;
};

Turing.prototype.solution = function () {
  return this.commands;
};

Turing.prototype.reset = function () {
  var c = new this.Command(1, 2, 3, 4, 5);
  return {a: 5, b: 6, c: this.alphabet};
};

Turing.prototype.Command = function (id, from, to, inp, out, move) {
  this.id = id;
  this.from = from;
  this.to = to;
  this.inp = inp;
  this.out = out;
  this.move = move;
}

Turing.prototype.Command.prototype.toString = function () {
  var txt = ""
  txt += this.from + " [";
  txt += this.inp;
  txt += "] -> " + this.to + " [";
  txt += this.out;
  txt += "] ";
  txt += " " + this.move;
};


