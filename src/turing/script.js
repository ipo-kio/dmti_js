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

var Turing = (function () {

  function Turing() {

    var player = {
      /**
       * 0 - stop
       * 1 - play
       * 2 - pause
       */
      state: 0,
      /**
       * millisecond
       */
      delay: 500,
      /**
       * animation is executed
       */
      blocked: false
    };

    var gui = {
      /**
       * size of strip cell
       */
      cellSize: 30,

      /**
       * height of scene
       */
      height: 200,

      /**
       * width of scene
       */
      width: 0,

      /**
       * createjs stage
       */
      stage: {},

    };


    this.player = player;

    this.gui = gui;

    this.strip = {};

    this.head = {};


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
     * edit command list (only in stop or pause mode)
     * @type {boolean}
     */
    this.editCommand = false;

    /**
     * edit strip (only in stop mode)
     * @type {boolean}
     */
    this.editStrip = false;

    /**
     * Symbols on the strip, can be edited
     * @type {string}
     */
    this.symbols = "";
  }

  Turing.prototype.layout = '<style>#divId .it-log,#divId .it-strip-input{font-family:monospace}#divId .it-scene{background-color:#fff}#divId .it-player-holder{text-align:center}#divId .it-player-holder .it-player{display:inline-block;padding:5px}#divId .it-player-warn,#divId .it-strip-warn{position:absolute;z-index:100;display:none}#divId .top-buffer{margin-top:20px}#divId .it-view .it-command-list{font-family:monospace;font-size:large}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row it-player-holder"><div class="it-player-warn alert alert-danger alert-dismissable">Нет подходящей команды</div><div class="it-player"><button class="it-stop" type="button" class="btn btn-default" title="Перевести МТ в начальное состояние и очистить журнал выполнения"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button> <button class="it-step" type="button" class="btn btn-default" title="Выполнить шаг"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button> <button class="it-play" type="button" class="btn btn-default" title="Запустить анимацию"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button> <button class="it-pause" type="button" class="btn btn-default" title="Пауза"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button></div></div><div class="row top-buffer"><p class="lead">Исходная лента</p><div class="col-sm-12"><div class="it-strip"><div class="it-strip-warn alert alert-danger alert-dismissable">Только символы алфавита</div><div class="input-group"><input class="it-strip-input form-control" type="text" class="form-control"> <span class="input-group-btn"><button class="btn btn-default it-strip-change" type="button">Изменить</button></span></div></div></div></div><div class="row top-buffer"><p class="lead">Журная выполнения</p><div class="col-sm-12"><div class="it-log">text</div></div></div><div class="row top-buffer"><p class="lead">Список команд <button class="btn btn-default it-commands-change" type="button">Изменить</button></p><div class="it-view"><div class="col-sm-6"><div class="it-command-list"></div></div><div class="col-sm-6"><div class="it-command-table"></div></div></div><div class="it-edit"><div class="col-sm-6"><div class="it-command-list"></div></div><div class="col-sm-6"><div class="it-command-table"></div></div></div></div></div>';//###layout


  Turing.prototype.init = function (divId, taskWidth, config) {

    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));

    $("#" + divId + " .it-scene").attr("id", divId + "-it-scene");
    $("#" + divId + " .it-scene").attr("width", taskWidth - 40);
    $("#" + divId + " .it-task").css("max-width", taskWidth + "px");
    $("#" + divId + " .it-task").css("min-width", taskWidth + "px");

    this.divId=divId;
    this.config = config;
    this.gui.stage = new createjs.Stage(divId + "-it-scene");
    this.gui.stage.mouseMoveOutside = true;
    this.gui.width = taskWidth - 40;

    this.strip = new Strip(this.gui, this.player);
    this.strip.init(config.strip, config.empty);
    $("#" + divId + " .it-strip-input").val(config.strip);
    $("#" + divId + " .it-strip-input").on("input", function(){
      var text = $(this).val();
      var regExp = new RegExp("[^"+config.alphabet+config.empty+"]", 'g');
      if(text.match(regExp)) {
        text = text.replace(regExp, '');
        if(!$("#" + divId + " .it-strip-warn").is(":visible")) {
          $("#" + divId + " .it-strip-warn").css("top", $("#" + divId + " .it-strip-warn").offset().top - 60);
          $("#" + divId + " .it-strip-warn").show();
          setTimeout(function(){
            $("#" + divId + " .it-strip-warn").fadeOut(2000, function () {
              $(this).css("opacity", 1);
              $(this).hide()
            });
          },3000)

          $("#" + divId + " .it-strip-warn").html("Допустимы только символы алфавита <b>" + config.alphabet + config.empty+"</b>");
        }
      }
      $(this).val(text);

    });

    this.head = new Head(this.gui, this.player);
    this.head.changeState(config.states[0]);

    this.symbols = config.strip;

    $("#" + divId + " .it-edit").hide();


    $("#" + divId + " .it-strip-input").attr("disabled", "true");
    $("#" + divId + " .it-strip-change").click(function () {
      if ($("#" + divId + " .it-strip-input").attr("disabled")) {
        $("#" + divId + " .it-strip-input").removeAttr("disabled");
        $(this).html("Принять");
      } else {
        $("#" + divId + " .it-strip-input").attr("disabled", "true");
        var text = $("#" + divId + " .it-strip-input").val();
        //TODO use regexp
        //text = text.replace(new RegExp("^"+config.empty+"+|"+config.empty+"+$", "gm"),'');
        $("#" + divId + " .it-strip-input").val(text);
        $(this).html("Изменить");
      }
    });

    this.player.state=-1;
    this.actualizeState(0);

    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);

    var strip = this.strip;
    var head = this.head;

    $("#" + divId + " .it-play").click(function () {

    });


    var player = this.player;
    var turing = this;
    $("#" + divId + " .it-step").click(function () {
      if(!player.blocked){
        turing.actualizeState(2);
        turing.step();
      };
    });

    $("#" + divId + " .it-stop").click(function () {
      turing.actualizeState(0);
      turing.strip.init(turing.symbols, turing.config.empty);
    });

  };


  Turing.prototype.step = function(){
    for(var i=0; i<this.commands.length; i++){
      var cmd = this.commands[i];
      if(cmd.from==this.head.state && cmd.inp==this.strip.symbol()){
        this.executeCommand(cmd);
        return;
      }
    }
    if(!$("#" + this.divId + " .it-player-warn").is(":visible")) {
      $("#" + this.divId + " .it-player-warn").css("top", $("#" + this.divId + " .it-player").offset().top-60);
      $("#" + this.divId + " .it-player-warn").show();
      var divId = this.divId;
      setTimeout(function(){
        $("#" + divId + " .it-player-warn").fadeOut(2000, function () {
          $(this).css("opacity", 1);
          $(this).hide()
        });
      },3000)

      $("#" + this.divId + " .it-player-warn").html("Нет подходящей команды ");
    }
  };

  Turing.prototype.executeCommand = function(cmd){
    this.player.blocked=true;
    var head = this.head;
    var strip = this.strip;
    var player = this.player;
    head.moveUp(function(){
      strip.changeCurrent(cmd.out);
      head.moveDown(function(){
        if(cmd.move=="R"){
          strip.moveLeft(function(){
            player.blocked=false;
            head.changeState(cmd.to);
          });
        }else if (cmd.move=="L"){
          strip.moveRight(function(){
            player.blocked=false;
            head.changeState(cmd.to);
          });
        }else{
          player.blocked=false;
          head.changeState(cmd.to);
        }
      });
    });

  }


  Turing.prototype.actualizeState = function (state) {
    if(this.player.state!=state) {
     this.player.state=state;
      if (this.player.state == 0) {
        $("#" + this.divId + " .it-pause").hide();
        $("#" + this.divId + " .it-play").show();
        $("#" + this.divId + " .it-play").removeAttr("disabled");
        $("#" + this.divId + " .it-step").show();
        $("#" + this.divId + " .it-step").removeAttr("disabled");
        $("#" + this.divId + " .it-stop").attr("disabled", 'true');
        $("#" + this.divId + " .it-strip-change").removeAttr("disabled");
      } else if (this.player.state == 1) {
        $("#" + this.divId + " .it-stop").removeAttr("disabled");
        $("#" + this.divId + " .it-strip-change").attr("disabled", 'true');


      }else if (this.player.state == 2) {
        $("#" + this.divId + " .it-stop").removeAttr("disabled");
        $("#" + this.divId + " .it-strip-change").attr("disabled", 'true');


      }
    }
  }


  Turing.prototype.load = function (solution) {
    this.commands=[];
    for(var i=0; i<solution.commands.length; i++){
      var cmd = solution.commands[i];
      var command = new Command(cmd.id, cmd.from, cmd.to, cmd.inp, cmd.out, cmd.move, cmd.group, cmd.comment);
      this.commands.push(command);
    }
    this.rebuildCommandView();
  };

  Turing.prototype.rebuildCommandView = function(){
    var $list = $("#" + this.divId + " .it-view .it-command-list");
    $list.html("");
    for(var i=0; i<this.commands.length; i++){
      var cmd = this.commands[i];
      var view = $("<div>"+cmd.toString()+"</div>");
      cmd.view=view;
      $list.append(view);
    }
  }

  Turing.prototype.solution = function () {
    return this.commands;
  };

  Turing.prototype.reset = function () {
    var c = new this.Command(1, 2, 3, 4, 5);
    return {a: 5, b: 6, c: this.alphabet};
  };


  function Strip(gui, player) {
    this.gui = gui;
    this.player = player;

    this.view = new createjs.Container();
    this.view.x = 0;
    this.view.y = (this.gui.height - this.gui.cellSize * 2) / 2;

    this.gui.stage.addChild(this.view);
    this.gui.stage.update();

    /**
     * array of create js text with stripe symbols
     * @type {Array}
     */
    this.symbols = [];

    /**
     * current position in symbols array
     * @type {number}
     */
    this.pos = 0;

    /**
     * empty symbol
     * @type {string}
     */
    this.empty = "";

    /**
     * positions of new cells
     */
    this.leftX = 0;
    this.rightX = 0;

    /**
     * amount of cells from center to corner necessary for animation
     * @type {number}
     */
    this.halfLength = 0;


    /**
     * initialize strip
     * @param symbols - symbols from center to right
     * @param empty - empty symbol
     */
    this.init = function (symbols, empty) {
      this.empty = empty;
      var size = this.gui.cellSize;
      var view = this.view;
      var cjs = createjs;
      var startX = (this.gui.width - size) / 2;
      var x = startX - size;

      view.removeAllChildren();

      while (x > -2 * size) {
        var cell = new cjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = x;
        cell.y = 0;
        view.addChild(cell);
        var text = new cjs.Text(empty, size + "px Arial", "#000");
        text.x = x + (size - text.getBounds().width) / 2;
        text.y = 0;
        text.initialX = x;
        this.symbols.splice(0, 0, text);
        view.addChild(text);
        x -= size;
        this.pos++;
      }

      this.halfLength = this.pos;
      this.leftX = x;
      x = startX
      for (var i = 0; x < this.gui.width + size || i < symbols.length; i++) {
        var cell = new cjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = x;
        cell.y = 0;
        view.addChild(cell);
        var text = new cjs.Text(i < symbols.length ? symbols[i] : empty, size + "px Arial", "#000");
        text.x = x + (size - text.getBounds().width) / 2;
        text.y = 0;
        text.initialX = x;
        this.symbols.push(text);
        view.addChild(text);
        x += size;
      }
      this.rightX = x;

    };

    /**
     * change current symbol
     * @param symbol
     */
    this.changeCurrent = function (symbol) {
      var text = this.symbols[this.pos];
      text.text = symbol;
      text.x = text.initialX + (this.gui.cellSize - text.getBounds().width) / 2;
    };

    this.symbol = function(){
      return this.symbols[this.pos].text;
    }

    this.moveRight = function (handler) {
      createjs.Tween.get(this.view)
          .to({x: this.view.x + this.gui.cellSize}, this.player.delay)
          .call(handleComplete);
      function handleComplete() {
        if (handler) {
          handler();
        }
      }

      if (this.pos < this.halfLength + 1) {
        var size = this.gui.cellSize;
        var cell = new createjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = this.leftX;
        cell.y = 0;
        this.view.addChild(cell);
        var text = new createjs.Text(this.empty, size + "px Arial", "#000");
        text.x = this.leftX + (size - text.getBounds().width) / 2;
        text.y = 0;
        text.initialX = this.leftX;
        this.symbols.splice(0, 0, text);
        this.view.addChild(text);
        this.leftX -= size;
      } else {
        this.pos--;
      }
    };

    this.moveLeft = function (handler) {
      createjs.Tween.get(this.view)
          .to({x: this.view.x - this.gui.cellSize}, this.player.delay)
          .call(handleComplete);
      function handleComplete() {
        if (handler) {
          handler();
        }
      }

      this.pos++;
      if (this.pos + this.halfLength + 1 > this.symbols.length) {
        var size = this.gui.cellSize;
        var cell = new createjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = this.rightX;
        cell.y = 0;
        this.view.addChild(cell);
        var text = new createjs.Text(this.empty, size + "px Arial", "#000");
        text.x = this.rightX + (size - text.getBounds().width) / 2;
        text.y = 0;
        text.initialX = this.rightX;
        this.symbols.push(text);
        this.view.addChild(text);
        this.rightX += size;
      }
    };


  }

  function Head(gui, player) {
    this.gui = gui;
    this.player = player;

    this.view = new createjs.Container();

    this.gui.stage.addChild(this.view);

    var head = new createjs.Shape();
    head.graphics.beginStroke("black").drawRect(0, this.gui.cellSize, this.gui.cellSize * 1.5, this.gui.cellSize);
    head.graphics.moveTo(0, this.gui.cellSize);
    head.graphics.lineTo(this.gui.cellSize * 0.75, 0);
    head.graphics.lineTo(this.gui.cellSize * 1.5, this.gui.cellSize);


    this.text = new createjs.Text("", this.gui.cellSize + "px Arial", "#000");
    this.text.y = this.gui.cellSize;

    this.view.addChild(head);
    this.view.addChild(this.text);


    this.view.x = (this.gui.width - gui.cellSize * 1.5) / 2;
    this.view.y = (this.gui.height - this.gui.cellSize * 2) / 2 + this.gui.cellSize;

    this.changeState = function (state) {
      this.state=state;
      this.text.text = state;
      this.text.x = (this.gui.cellSize * 1.5 - this.text.getBounds().width) / 2;
    };

    this.moveUp = function (handler) {
      createjs.Tween.get(this.view)
          .to({y: this.view.y - this.gui.cellSize}, this.player.delay)
          .call(handleComplete);
      function handleComplete() {
        if (handler) {
          handler();
        }
      }
    };

    this.moveDown = function (handler) {
      createjs.Tween.get(this.view)
          .to({y: this.view.y + this.gui.cellSize}, this.player.delay)
          .call(handleComplete);
      function handleComplete() {
        if (handler) {
          handler();
        }
      }
    };

  }


  function Command(id, from, to, inp, out, move, group, comment) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.inp = inp;
    this.out = out;
    this.move = move;
    this.group = group;
    this.comment = comment;
  };

  Command.prototype.toString = function(){
    return this.from+"["+this.inp+"]"+" > "+this.to+"["+this.out+"]"+this.move;
  }


  return {
    instance: function () {
      return new Turing();
    }
  }

})();


