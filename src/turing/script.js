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
      delay: 250,
      /**
       * animation is executed
       */
      animated: false,

      /**
       * have to stop after animation
       */
      waitStop: false
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
      stage: {}

    };

    this.player = player;

    this.gui = gui;

    this.strip = {};

    this.head = {};

    /**
     * to generate unique id for commands
     * @type {number}
     */
    this.counter = 0;

    /**
     * Id of main div
     * @type {string}
     */
    this.divId = "";

    /**
     * initial task config
     * @type {{}}
     */
    this.config = {};

    /**
     * array of commands
     * @type {Array}
     */
    this.commands = [];

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

  Turing.prototype.layout = '<style>#divId .it-log,#divId .it-strip-input,#divId .it-strip-view{font-family:monospace}#divId .it-scene{background-color:#fff;border:1px solid #8e8e8e}#divId .it-strip-warn{position:absolute;z-index:100;display:none}#divId .it-player-holder{text-align:center}#divId .it-player-holder .it-player{display:inline-block;padding:5px}#divId .it-player-warn{position:absolute;z-index:100;display:none}#divId .it-speed{display:inline-block;float:right}#divId .it-speed .it-slider{border-radius:5px;width:100px;height:10px;margin-right:5px;margin-left:5px;display:inline-block}#divId .it-speed .it-thumb{width:10px;height:20px;border-radius:3px;position:relative;left:50px;top:-5px;cursor:pointer}#divId .it-view .it-command-list{font-family:monospace;font-size:large}#divId .top-buffer{margin-top:20px}</style><div class="it-task well"><div class="row"><h4>Исходная лента <button class="it-strip-change btn btn-sm btn-link" type="button" title="Изменить начальное состояние ленты"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button></h4><div class="col-sm-12"><div class="it-strip"><div class="it-strip-warn alert alert-danger alert-dismissable">Только символы алфавита</div><div class="it-strip-view"></div><div class="it-strip-edit input-group"><input class="it-strip-input form-control" type="text" class="form-control"> <span class="input-group-btn"><button class="btn btn-default it-strip-apply" type="button">Принять</button></span></div></div></div></div><div class="row top-buffer"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row it-player-holder"><div class="col-sm-12"><div class="it-player-warn alert alert-danger alert-dismissable">Нет подходящей команды</div><div class="it-player"><button class="it-stop" type="button" class="btn btn-default" title="Перевести МТ в начальное состояние и очистить журнал выполнения"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button> <button class="it-step" type="button" class="btn btn-default" title="Выполнить шаг"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button> <button class="it-play" type="button" class="btn btn-default" title="Запустить анимацию"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button> <button class="it-pause" type="button" class="btn btn-default" title="Пауза"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button></div><div class="it-speed"><label>скорость:</label><div class="it-slider bg-info"><div class="it-thumb bg-primary"></div></div></div></div></div><div class="row top-buffer"><h4>Список команд</h4><div class="it-view"><div class="col-sm-6"><div class="it-command-list"></div></div><div class="col-sm-6"><div class="it-command-table"></div></div></div><div class="it-edit"><div class="col-sm-6"><div class="it-command-list"></div></div><div class="col-sm-6"><div class="it-command-table"></div></div></div></div><div class="row top-buffer"><h4>Журная выполнения: <span class="it-log-counter"></span></h4><div class="col-sm-12"><div class="it-log"></div></div></div></div>';//###layout

  Turing.prototype.init = function (divId, taskWidth, config) {

    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
    var $scene = $("#" + divId + " .it-scene");
    $scene.attr("id", divId + "-it-scene");
    $scene.attr("width", taskWidth - 40);
    var $task = $("#" + divId + " .it-task");
    $task.css("max-width", taskWidth + "px");
    $task.css("min-width", taskWidth + "px");

    this.divId = divId;
    this.config = config;
    this.gui.stage = new createjs.Stage(divId + "-it-scene");
    this.gui.stage.mouseMoveOutside = true;
    this.gui.width = taskWidth - 40;

    this.strip = new Strip(this.gui, this.player);
    this.head = new Head(this.gui, this.player);
    this.symbols = config.strip;

    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);

    this.player.state = -1;
    this.stop();

    $("#" + divId + " .it-edit").hide();

    
    $("#" + divId + " .it-player").css("padding-left", $("#" + divId + " .it-speed").width());
    this.initStripEdit();
    this.initPlayer();
    this.initSpeed();
  };

  /**
   * Initialize speed manipulator
   */
  Turing.prototype.initSpeed = function () {
    var player = this.player;

    var $sliderElem = $("#" + this.divId + " .it-slider");
    var sliderElem = $sliderElem.get(0);
    var $thumbElem = $("#" + this.divId + " .it-thumb");
    var thumbElem = $thumbElem.get(0);

    thumbElem.onmousedown = function (e) {
      var thumbCoords = getCoords(thumbElem);
      var shiftX = e.pageX - thumbCoords.left;
      var sliderCoords = getCoords(sliderElem);
      document.onmousemove = function (e) {
        var newLeft = e.pageX - shiftX - sliderCoords.left;
        if (newLeft < 0) {
          newLeft = 0;
        }
        var rightEdge = sliderElem.offsetWidth - thumbElem.offsetWidth;
        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }
        thumbElem.style.left = newLeft + 'px';
        var width = $sliderElem.width()-10;
        player.delay = 500*(1-newLeft/width)+10;
      }
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
      };
      return false;
    };

    thumbElem.ondragstart = function () {
      return false;
    };

    function getCoords(elem) {
      var box = elem.getBoundingClientRect();
      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
      };
    }
  };

  /**
   * Initialize strip editing
   */
  Turing.prototype.initStripEdit = function () {
    var turing = this;

    var $stripView = $("#" + this.divId + " .it-strip-view");
    var $stripEdit = $("#" + this.divId + " .it-strip-edit");
    var $stripInput = $("#" + this.divId + " .it-strip-input");
    $stripView.html(this.config.strip);
    $stripEdit.hide();
    $stripInput.val(this.config.strip);

    $("#" + this.divId + " .it-strip-change").click(function () {
      turing.editStrip = true;
      $stripView.hide();
      $stripEdit.show();
    });

    $("#" + this.divId + " .it-strip-apply").click(function () {
      turing.applyStrip();
    });

    $stripInput.on("input", function () {
      var text = $(this).val();
      var escapedAlphabed = GuiUtils.escapeSpecial(turing.config.alphabet);
      var regExp = new RegExp("[^" + escapedAlphabed + "\\" + turing.config.empty + "]", 'g');
      if (text.match(regExp)) {
        text = text.replace(regExp, '');
        var $stripWarn = $("#" + turing.divId + " .it-strip-warn");
        turing.warning($stripWarn,
            "Допустимы только символы алфавита:  <mark><b>" + (turing.config.alphabet + turing.config.empty).split("").join(" ") + "</b></mark> ",
            $stripWarn.offset().top - 60
        )
        $(this).val(text);
      }
    });
  };

  /**
   * Applies strip changes
   */
  Turing.prototype.applyStrip = function () {
    var $stripView = $("#" + this.divId + " .it-strip-view");
    var $stripEdit = $("#" + this.divId + " .it-strip-edit");
    var $stripInput = $("#" + this.divId + " .it-strip-input");
    $stripView.show();
    $stripEdit.hide();
    this.editStrip = false;
    var text = $stripInput.val();
    var escapedSpecial = GuiUtils.escapeSpecial(this.config.empty);
    text = text.replace(new RegExp("^" + escapedSpecial + "+|" + escapedSpecial + "+$", "gm"), '');
    $stripInput.val(text);
    $stripView.html(text);
    this.symbols = text;
    this.strip.init(this.symbols, this.config.empty);
  };

  /**
   * Init player button handlers
   */
  Turing.prototype.initPlayer = function () {
    var player = this.player;
    var turing = this;
    var divId = this.divId;

    $("#" + divId + " .it-step").click(function () {
      turing.step();
    });

    $("#" + divId + " .it-stop").click(function () {
      if (player.animated) {
        player.waitStop = true;
      } else {
        turing.stop();
      }
    });

    $("#" + divId + " .it-play").click(function () {
      turing.play();
    });

    $("#" + divId + " .it-pause").click(function () {
      turing.pause();
    });
  };

  /**
   * Run play of MT
   */
  Turing.prototype.play = function () {
    if (!this.player.animated) {
      this.actualizeGuiState(1);
      this.makeStep();
    }
  };

  /**
   * Pause MT
   */
  Turing.prototype.pause = function () {
    this.actualizeGuiState(2);
  };

  /**
   * Make next step of MT
   */
  Turing.prototype.step = function () {
    if (!this.player.animated && this.player.state != 1) {
      this.actualizeGuiState(2);
      this.makeStep();
    }
  };

  /**
   * Stop MT return strip and head to initial states
   */
  Turing.prototype.stop = function () {
    this.actualizeGuiState(0);
    this.strip.init(this.symbols, this.config.empty);
    //noinspection JSUnresolvedVariable
    this.head.changeState(this.config.states[0]);
    $("#" + this.divId + " .it-log").html("");
    $("#" + this.divId + " .it-log-counter").html("");
  };

  /**
   * Change availability of buttons when player state changes
   * @param state
   */
  Turing.prototype.actualizeGuiState = function (state) {
    if (this.player.state != state) {
      this.player.state = state;
      var $play = $("#" + this.divId + " .it-play");
      var $step = $("#" + this.divId + " .it-step");
      var $pause = $("#" + this.divId + " .it-pause");
      var $stop = $("#" + this.divId + " .it-stop");
      var $stripChange = $("#" + this.divId + " .it-strip-change");
      if (this.player.state == 0) {
        $pause.hide();
        $play.show();
        $play.removeAttr("disabled");
        $step.show();
        $step.removeAttr("disabled");
        $stop.attr("disabled", 'true');
        $stripChange.show();
      } else if (this.player.state == 1) {
        $stop.removeAttr("disabled");
        if (this.editStrip) {
          this.applyStrip();
        }
        $stripChange.hide();
        $pause.show();
        $play.hide();
      } else if (this.player.state == 2) {
        $stop.removeAttr("disabled");
        if (this.editStrip) {
          this.applyStrip();
        }
        $stripChange.hide();
        $pause.hide();
        $play.show();
      }
    }
  };

  /**
   * Show warning
   * $warn - warning element
   */
  Turing.prototype.warning = function ($warn, text, offsetTop, offsetLeft) {
    var divId = this.divId;
    if (!$warn.is(":visible")) {
      if (offsetTop) {
        $warn.css("top", offsetTop);
      }
      if (offsetLeft) {
        $warn.css("left", offsetLeft);
      }
      $warn.show();
      setTimeout(function () {
        $warn.fadeOut(2000, function () {
          $(this).css("opacity", 1);
          $(this).hide()
        });
      }, 2000);
      $warn.html(text);
    }
  }


  Turing.prototype.makeStep = function () {

    for (var i = 0; i < this.commands.length; i++) {
      var cmd = this.commands[i];
      if (cmd.from == this.head.state && cmd.inp == this.strip.current()) {
        this.executeCommand(cmd);
        return;
      }
    }

    var $player_warn = $("#" + this.divId + " .it-player-warn");
    this.warning($player_warn, "Нет команды для состояния <mark><b>"+this.head.state+"</b></mark> и символа <mark><b>"+this.strip.current()+"</b></mark>",
        $player_warn.offset().top - 60);

    this.actualizeGuiState(2);

    //if no command has been executed return to stop state
    var $logCounter = $("#" + this.divId + " .it-log-counter");
    var counter = $logCounter.html();
    if (counter === "") {
      this.actualizeGuiState(0);
    }
  };


  /**
   * Executes selected command
   * @param cmd
   */
  Turing.prototype.executeCommand = function (cmd) {
    this.player.animated = true;
    var head = this.head;
    var strip = this.strip;
    var player = this.player;
    var divId = this.divId;
    var turing = this;

    function finish() {
      head.changeState(cmd.to);
      $("#" + divId + " .it-log").append("<p>" + strip.toString() + "</p>");
      var $logCounter = $("#" + divId + " .it-log-counter");
      var counter = $logCounter.html();
      if (counter === "") {
        $logCounter.html("1");
      } else {
        $logCounter.html("" + (parseInt(counter) + 1));
      }
      player.animated = false;
      if (player.waitStop) {
        player.waitStop = false;
        turing.stop();
      } else if (player.state == 1) {
        turing.makeStep();
      }
    }

    head.moveUp(function () {
      strip.current(cmd.out);
      head.moveDown(function () {
        if (cmd.move == "R") {
          strip.moveLeft(function () {
            finish();
          });
        } else if (cmd.move == "L") {
          strip.moveRight(function () {
            finish();
          });
        } else {
          finish();
        }
      });
    });
  };


  Turing.prototype.load = function (solution) {
    this.commands = [];
    for (var i = 0; i < solution.commands.length; i++) {
      var cmd = solution.commands[i];
      var command = new Command(cmd.id, cmd.from, cmd.to, cmd.inp, cmd.out, cmd.move, cmd.group, cmd.comment);
      this.commands.push(command);
    }
    this.rebuildCommandView();
  };

  Turing.prototype.rebuildCommandView = function () {
    var $list = $("#" + this.divId + " .it-view .it-command-list");
    $list.html("");
    for (var i = 0; i < this.commands.length; i++) {
      var cmd = this.commands[i];
      var view = $("<div>" + cmd.toString() + "</div>");
      cmd.view = view;
      $list.append(view);
    }
  };

  Turing.prototype.solution = function () {
    return this.commands;
  };

  Turing.prototype.reset = function () {
  };


  /**
   * Stripe incapsulate array of cells
   * It can move left and right for one cell
   * Can change current symbol and return it
   * Can return string symbols
   *
   * @param gui
   * @param player
   * @constructor
   */
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
      this.symbols = [];
      this.pos = 0;
      this.view.x = 0;
      this.view.y = (this.gui.height - this.gui.cellSize * 2) / 2;

      var cell;
      var text;
      while (x > -2 * size) {
        cell = new cjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = x;
        cell.y = 0;
        view.addChild(cell);
        text = new cjs.Text(empty, size * 0.75 + "px Arial", "#000");
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
      x = startX;
      for (var i = 0; x < this.gui.width + size || i < symbols.length; i++) {
        cell = new cjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = x;
        cell.y = 0;
        view.addChild(cell);
        text = new cjs.Text(i < symbols.length ? symbols[i] : empty, size * 0.75 + "px Arial", "#000");
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
     * Change current symbol or return it
     * @param symbol
     */
    this.current = function (symbol) {
      if (symbol) {
        var text = this.symbols[this.pos];
        text.text = symbol;
        text.x = text.initialX + (this.gui.cellSize - text.getBounds().width) / 2;
      } else {
        return this.symbols[this.pos].text;
      }
    };

    /**
     * Returns symbols on the string
     * @returns {*}
     */
    this.toString = function () {
      var result = "";
      for (var i = 0; i < this.symbols.length; i++) {
        result += this.symbols[i].text;
      }
      return result;
    };

    /**
     * Move strip to the right
     * If it's necessary, add cell to the left after motion
     * @param handler
     */
    this.moveRight = function (handler) {
      if (this.pos < this.halfLength + 1) {
        var size = this.gui.cellSize;
        var cell = new createjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = this.leftX;
        cell.y = 0;
        this.view.addChild(cell);
        var text = new createjs.Text(this.empty, size * 0.75 + "px Arial", "#000");
        text.x = this.leftX + (size - text.getBounds().width) / 2;
        text.y = 0;
        text.initialX = this.leftX;
        this.symbols.splice(0, 0, text);
        this.view.addChild(text);
        this.leftX -= size;
      } else {
        this.pos--;
      }

      if (this.player.delay > 0 && !this.player.waitStop) {
        createjs.Tween.get(this.view)
            .to({x: this.view.x + this.gui.cellSize}, this.player.delay)
            .call(handleComplete);
        function handleComplete() {
          if (handler) {
            handler();
          }
        }
      } else {
        this.view.x += this.gui.cellSize;
        if (handler) {
          handler();
        }
      }
    };

    /**
     * Move strip to the left for one cell
     * If it's necessary, add cell to the right after motion
     * @param handler
     */
    this.moveLeft = function (handler) {
      this.pos++;
      if (this.pos + this.halfLength + 1 > this.symbols.length) {
        var size = this.gui.cellSize;
        var cell = new createjs.Shape();
        cell.graphics.beginStroke("black").drawRect(0, 0, size, size);
        cell.x = this.rightX;
        cell.y = 0;
        this.view.addChild(cell);
        var text = new createjs.Text(this.empty, size * 0.75 + "px Arial", "#000");
        text.x = this.rightX + (size - text.getBounds().width) / 2;
        text.y = 0;
        text.initialX = this.rightX;
        this.symbols.push(text);
        this.view.addChild(text);
        this.rightX += size;
      }

      if (this.player.delay > 0 && !this.player.waitStop) {
        createjs.Tween.get(this.view)
            .to({x: this.view.x - this.gui.cellSize}, this.player.delay)
            .call(handleComplete);
        function handleComplete() {
          if (handler) {
            handler();
          }
        }
      } else {
        this.view.x -= this.gui.cellSize;
        if (handler) {
          handler();
        }
      }
    };


  }

  /**
   * Head incapsulates state
   * Can move up and down
   *
   * @param gui
   * @param player
   * @constructor
   */
  function Head(gui, player) {
    this.gui = gui;
    this.player = player;

    this.state = "";

    this.view = new createjs.Container();
    this.gui.stage.addChild(this.view);

    this.head = new createjs.Shape();
    this.head.graphics.beginStroke("black").drawRect(0, this.gui.cellSize, this.gui.cellSize, this.gui.cellSize);
    this.head.graphics.moveTo(0, this.gui.cellSize);
    this.head.graphics.lineTo(this.gui.cellSize * 0.5, 0);
    this.head.graphics.lineTo(this.gui.cellSize * 1, this.gui.cellSize);

    this.text = new createjs.Text("", this.gui.cellSize * 0.75 + "px Arial", "#000");
    this.text.y = this.gui.cellSize;

    this.view.addChild(this.head);
    this.view.addChild(this.text);
    this.view.x = (this.gui.width - gui.cellSize) / 2;
    this.view.y = (this.gui.height - this.gui.cellSize * 2) / 2 + this.gui.cellSize;
    this.initialViewY = this.view.y;

    /**
     * change current state
     * @param state
     */
    this.changeState = function (state) {
      this.state = state;
      this.text.text = state;
      this.text.x = (this.gui.cellSize - this.text.getBounds().width) / 2;
    };

    /**
     * move to the strip
     * @param handler
     */
    this.moveUp = function (handler) {
      if (this.player.delay > 0 && !this.player.waitStop) {
        createjs.Tween.get(this.view)
            .to({y: this.view.y - this.gui.cellSize}, this.player.delay)
            .call(handleComplete);
        function handleComplete() {
          if (handler) {
            handler();
          }
        }
      } else {
        if (handler) {
          handler();
        }
      }
    };

    /**
     * move away from the strip
     * @param handler
     */
    this.moveDown = function (handler) {
      if (this.player.delay > 0 && !this.player.waitStop) {
        createjs.Tween.get(this.view)
            .to({y: this.view.y + this.gui.cellSize}, this.player.delay)
            .call(handleComplete);
        function handleComplete() {
          if (handler) {
            handler();
          }
        }
      } else {
        this.view.y = this.initialViewY;
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
  }

  Command.prototype.toString = function () {
    return this.from + "[" + this.inp + "]" + " > " + this.to + "[" + this.out + "]" + this.move;
  };


  return {
    instance: function () {
      return new Turing();
    }
  }

})
();


