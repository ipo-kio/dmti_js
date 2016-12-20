/**
 *
 * config{
 *  alphabet: 'abcd' // list of available symbols
 *  empty: '*' // empty symbol
 *  strip: 'ab**cd**c***c***c**' // initial state of strip
 *  shift: -1 // shift to the first not empty symbol
 *  states: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] // states
 *  usefinal: true
 * }
 *
 *
 * solution{
 *  commands: [{id:'1' from: 'q1', to: 'q2', inp: 'a', out: 'b', move: 'L', g:'1'},
 *  {id: '2' from: 'q1', to: 'q2', inp: 'c', out: 'b', move: 'N' g:'2'}],
 *  groups: [{id: '1', comment: 'tra-ta-ta'}, {id: '2', comment: ''}],
 *  strip: '10100101'
 * }
 *
 *
 * @constructor
 */

var qwerty00001 = (function () {

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
      waitStop: false,

      /**
       * Executed steps
       */
      steps: 0

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

    this.editCommand = null;

    this.player = player;

    this.gui = gui;

    this.strip = {};

    this.head = {};

    this.logger = {};

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
     * array of command groups
     * @type {Array}
     */
    this.groups = [];

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

  //noinspection all
  Turing.prototype.layout = '<style>#divId .it-log,#divId .it-strip-input,#divId .it-strip-view,#divId .it-view-command .it-command-list .it-command{font-family:monospace}#divId .it-log,#divId .it-view-command{max-width:500px}#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .it-player-holder{text-align:center}#divId .it-player-holder .it-player{display:inline-block;padding:5px}#divId .it-warn{position:absolute;z-index:100;top:-60px;display:none}#divId .it-speed{display:inline-block;float:right}#divId .it-speed .it-slider{border-radius:5px;width:100px;height:10px;margin-right:5px;margin-left:5px;display:inline-block}#divId .it-speed .it-thumb{width:10px;height:20px;border-radius:3px;position:relative;left:50px;top:-5px;cursor:pointer}#divId .it-view-command .dropdown .dropdown-menu{min-width:10px}#divId .it-view-command .dropdown .dropdown-menu li a{cursor:pointer;padding:2px 10px}#divId .it-view-command .it-command-list .it-drag-holder{min-height:3px}#divId .it-view-command .it-command-list .it-command .mover{cursor:move;font-size:x-small;color:#a9a9a9;margin-right:3px}#divId .it-view-command .it-command-list .it-command .it-command-item-edit{cursor:pointer;font-weight:700}#divId .it-view-command .it-command-list .it-command .it-cmd-del{padding:0;margin-left:5px}#divId .it-view-command .it-command-list .it-group .it-group-cmd{float:left;width:auto;border-right:solid 2px #d3d3d3}#divId .it-view-command .it-command-list .it-group .it-group-comment{margin-left:150px;min-width:100px}#divId .it-view-command .it-command-add{padding:15px;margin-top:20px;border-top:solid 2px #d3d3d3}#divId .it-view-command .it-command-add .it-command-add-btn{float:right}#divId .it-log{overflow-y:scroll;background-color:#fff;padding:10px;border:1px solid #a9a9a9}#divId .it-log .it-log-strip{letter-spacing:2px;padding-left:10px}#divId .it-log .it-log-cmd{text-align:right}#divId .top-buffer{margin-top:20px}</style><div class="it-task well"><div class="row"><h4>Исходная лента <button class="it-strip-change btn btn-sm btn-link" type="button" title="Изменить начальное состояние ленты"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button></h4><div class="col-sm-12"><div class="it-strip"><div class="it-strip-warn it-warn alert alert-danger alert-dismissable">Только символы алфавита</div><div class="it-strip-view"></div><div class="it-strip-edit input-group"><input class="it-strip-input form-control" type="text" class="form-control"> <span class="input-group-btn"><button class="btn btn-default it-strip-apply" type="button">Принять</button></span></div></div></div></div><div class="row top-buffer"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row it-player-holder"><div class="col-sm-12"><div class="it-player-warn it-warn alert alert-danger alert-dismissable">Нет подходящей команды</div><div class="it-player-info it-warn alert alert-info alert-dismissable">Произошел останов машины, нет подходящей команды</div><div class="it-player"><button class="it-stop" type="button" class="btn btn-default" title="Перевести МТ в начальное состояние и очистить журнал выполнения"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button> <button class="it-step" type="button" class="btn btn-default" title="Выполнить шаг"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button> <button class="it-play" type="button" class="btn btn-default" title="Запустить анимацию"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button> <button class="it-pause" type="button" class="btn btn-default" title="Пауза"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button></div><div class="it-speed"><label>скорость:</label><div class="it-slider bg-info"><div class="it-thumb bg-primary"></div></div></div></div></div><div class="row top-buffer"><div class="col-lg-6"><h4>Список команд</h4><div class="it-view-command"><div class="it-command-editor"><div class="dropdown it-command-editor-move"><ul class="dropdown-menu"><li><a>L</a></li><li><a>R</a></li><li><a>N</a></li></ul></div><div class="dropdown it-command-editor-to"><ul class="dropdown-menu"></ul></div><div class="dropdown it-command-editor-out"><ul class="dropdown-menu"></ul></div><div class="dropdown it-command-editor-inp"><ul class="dropdown-menu"></ul></div><div class="dropdown it-command-editor-from"><ul class="dropdown-menu"></ul></div></div><div class="it-command-list"></div><div class="it-command-add"><div class="it-command-add-warn it-warn alert alert-danger alert-dismissable">Не заполнены параметры/ Команда с таким состоянием и символом уже существует</div><form class="form-horizontal" role="form"><div class="form-group"><select class="selectpicker it-from" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select><select class="selectpicker it-inp" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select>&nbsp;>&nbsp;<select class="selectpicker it-to" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select><select class="selectpicker it-out" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select><select class="selectpicker it-move" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option><option value="L">L</option><option value="R">R</option><option value="N">N</option></select><button class="it-command-add-btn btn btn-default btn-xs" type="button" title="Добавить команду">Создать</button></div></form></div></div></div><div class="col-lg-6"><h4>Журная выполнения: <span class="it-log-counter"></span> <button class="it-log-expand btn btn-sm btn-link" type="button" title="Развернуть"><span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span></button> <button class="it-log-small btn btn-sm btn-link" type="button" title="Свернуть"><span class="glyphicon glyphicon-resize-small" aria-hidden="true"></span></button></h4><div class="it-log"></div></div></div></div>';//###layout

  Turing.prototype.init = function (divId, taskWidth, config) {
    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
    var $scene = $("#" + divId + " .it-scene");
    $scene.attr("id", divId + "-it-scene");
    $scene.attr("width", taskWidth - 40);
    var $task = $("#" + divId + " .it-task");
    $task.css("max-width", taskWidth + "px");
    $task.css("min-width", taskWidth + "px");

    //#!
    
    this.divId = divId;
    this.config = config;
    this.gui.stage = new createjs.Stage(divId + "-it-scene");
    this.gui.stage.mouseMoveOutside = true;
    this.gui.width = taskWidth - 40;

    this.strip = new Strip(this.gui, this.player);
    this.head = new Head(this.gui, this.player);
    this.symbols = config.strip;
    this.logger = new Logger(divId, config.empty);

    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);

    this.player.state = -1;
    this.stop();

    $("#" + divId + " .it-player").css("padding-left", $("#" + divId + " .it-speed").width());

    this.initStripEdit();
    this.initPlayer();
    this.initSpeed();
    this.initAddCommand();
    this.initEditCommand();
    $('.selectpicker').selectpicker('refresh');
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
      var thumbCoords = GuiUtils.getCoords(thumbElem);
      var shiftX = e.pageX - thumbCoords.left;
      var sliderCoords = GuiUtils.getCoords(sliderElem);
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
        var width = $sliderElem.width() - 10;
        player.delay = 500 * (1 - newLeft / width) + 10;
      };
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
      };
      return false;
    };

    thumbElem.ondragstart = function () {
      return false;
    };
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
      var escapedSpecial = GuiUtils.escapeSpecial(turing.config.empty);
      var regExp = new RegExp("[^" + escapedAlphabed + "" + escapedSpecial + "]", 'g');
      if (text.match(regExp)) {
        text = text.replace(regExp, '');
        var $stripWarn = $("#" + turing.divId + " .it-strip-warn");
        turing.warning($stripWarn,
            "Допустимы только символы алфавита:  <mark><b>" + (turing.config.alphabet + turing.config.empty).split("").join(" ") + "</b></mark> "
        );
        $(this).val(text);
      }
    });
  };

  /**
   * Applies strip changes
   */
  Turing.prototype.applyStrip = function (text) {
    var $stripView = $("#" + this.divId + " .it-strip-view");
    var $stripEdit = $("#" + this.divId + " .it-strip-edit");
    var $stripInput = $("#" + this.divId + " .it-strip-input");
    $stripView.show();
    $stripEdit.hide();
    this.editStrip = false;
    var enteredText = $stripInput.val();
    if(text) {
      enteredText = text;
    }
    var escapedSpecial = GuiUtils.escapeSpecial(this.config.empty);
    enteredText = enteredText.replace(new RegExp("^" + escapedSpecial + "+|" + escapedSpecial + "+$", "gm"), '');
    $stripInput.val(enteredText);
    $stripView.html(enteredText);
    this.symbols = enteredText;
    this.strip.init(this.symbols, this.config.empty, this.config.shift);
  };

  /**
   * Initialize add command div
   */
  Turing.prototype.initAddCommand = function(){
    var turing = this;
    var config = this.config;
    var $from = $("#" + this.divId + " .it-from");
    var $to = $("#" + this.divId + " .it-to");
    var $move = $("#" + this.divId + " .it-move");
    var $inp = $("#" + this.divId + " .it-inp");
    var $out = $("#" + this.divId + " .it-out");
    var $addBtn = $("#" + this.divId + " .it-command-add-btn");

    //noinspection JSUnresolvedVariable
    for (var i = 0; i < config.states.length; i++) {
      //noinspection JSUnresolvedVariable
      var state = config.states[i];
      $from.append("<option value='"+state+"'>"+state+"</option>");
      $to.append("<option value='"+state+"'>"+state+"</option>");
    }

    for (var j = 0; j < config.alphabet.length; j++) {
      var symbol = config.alphabet[j];
      $inp.append("<option value='"+symbol+"'>"+symbol+"</option>");
      $out.append("<option value='"+symbol+"'>"+symbol+"</option>");
    }

    $inp.append("<option value='"+config.empty+"'>"+config.empty+"</option>");
    $out.append("<option value='"+config.empty+"'>"+config.empty+"</option>");

    $addBtn.click(function(){
      var $addWarn = $("#" + turing.divId + " .it-command-add-warn");
      var $addCommandDiv = $addWarn.parent();
      var cmd = new Command(++Command.counter, $from.val(), $to.val(), $inp.val(), $out.val(), $move.val());
      if(!cmd.filled()){
        turing.warning($addWarn,
            "Необходимо заполнить все параметры", $addCommandDiv.position().top-60
        );
      }else if(turing.checkCommandAndSelect(cmd.from, cmd.inp)){
        turing.warning($addWarn,
            "Команда для указанного состояния и входного символа уже есть", $addCommandDiv.position().top-60
        );
      }else{
        turing.addNewCommand(cmd);
      }
    });
  };

  /**
   * Initialize editor dropdowns
   */
  Turing.prototype.initEditCommand = function(){
    var turing = this;
    var config = this.config;

    var $editTo = $(".it-command-editor-to .dropdown-menu");
    var $editFrom = $(".it-command-editor-from .dropdown-menu");
    var $editInp = $(".it-command-editor-inp .dropdown-menu");
    var $editOut = $(".it-command-editor-out .dropdown-menu");

    //noinspection JSUnresolvedVariable
    for (var i = 0; i < config.states.length; i++) {
      //noinspection JSUnresolvedVariable
      var state = config.states[i];
      $editTo.append("<li><a>"+state+"</a></li>");
      $editFrom.append("<li><a>"+state+"</a></li>");
    }

    for (var j = 0; j < config.alphabet.length; j++) {
      var symbol = config.alphabet[j];
      $editInp.append("<li><a>"+symbol+"</a></li>");
      $editOut.append("<li><a>"+symbol+"</a></li>");
    }

    $editInp.append("<li><a>"+config.empty+"</a></li>");
    $editOut.append("<li><a>"+config.empty+"</a></li>");

    $(".it-command-editor-move li a").click(function(){
      if(turing.editCommand==null){
        return;
      }
      var selText = $(this).text();
      $(this).parent().parent().parent().removeClass("open");
      turing.editCommand.$move.html(selText);
      turing.editCommand.move=selText;
      turing.editCommand = null;
    });

    $(".it-command-editor-out li a").click(function(){
      if(turing.editCommand==null){
        return;
      }
      var selText = $(this).text();
      $(this).parent().parent().parent().removeClass("open");
      turing.editCommand.$out.html(selText);
      turing.editCommand.out=selText;
      turing.editCommand = null;
    });

    $(".it-command-editor-to li a").click(function(){
      if(turing.editCommand==null){
        return;
      }
      var selText = $(this).text();
      $(this).parent().parent().parent().removeClass("open");
      turing.editCommand.$to.html(GuiUtils.beforeSpace(selText,1));
      turing.editCommand.to=selText;
      turing.editCommand = null;
    });


    $(".it-command-editor-inp li a").click(function() {
      if (turing.editCommand == null) {
        return;
      }
      var selText = $(this).text();
      $(this).parent().parent().parent().removeClass("open");

      if (turing.checkCommandAndSelect(turing.editCommand.from, selText, turing.editCommand)) {
        var $addWarn = $("#" + turing.divId + " .it-command-add-warn");
        turing.warning($addWarn,
            "Команда для указанного состояния и входного символа уже есть", turing.editCommand.view.position().top-80);
      } else {
        turing.editCommand.$inp.html(selText);
        turing.editCommand.inp = selText;
      }


      turing.editCommand = null;
    });

    $(".it-command-editor-from li a").click(function(){
      if(turing.editCommand==null){
        return;
      }
      var selText = $(this).text();
      $(this).parent().parent().parent().removeClass("open");


      if (turing.checkCommandAndSelect(selText, turing.editCommand.inp, turing.editCommand)) {
        var $addWarn = $("#" + turing.divId + " .it-command-add-warn");
        turing.warning($addWarn,
            "Команда для указанного состояния и входного символа уже есть", turing.editCommand.view.position().top-80);
      } else {
        turing.editCommand.$from.html(GuiUtils.beforeSpace(selText,1));
        turing.editCommand.from = selText;
      }

      turing.editCommand = null;
    });


    $("#"+turing.divId).click(function(evt){
      var $target = $(evt.target);
      if(!$target.hasClass("it-command-item")) {
        $("div[class*='it-command-editor-']").removeClass("open");
        turing.editCommand = null;
      }
      if(!$target.parents('.it-group-comment').length) {
        for (var i = 0; i < turing.groups.length; i++) {
          var group = turing.groups[i];
          if (group.edit) {
            group.cancelEdit();
          }
        }
      }
      return true;
    });
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
    this.strip.init(this.symbols, this.config.empty, this.config.shift);
    //noinspection JSUnresolvedVariable
    if(this.config.states.length>0) {
      this.head.changeState(this.config.states[0]);
    }
    this.logger.clear();
    this.player.steps = 0;
  };

  /**
   * Change availability of buttons when player state changes
   * @param state
   */
  Turing.prototype.actualizeGuiState = function (state) {
    if (this.player.state != state) {
      var lastState = this.player.state;
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
        if (lastState == 0) {
          this.logger.appendStrip(this.strip.toString(), this.strip.pos);
        }
      } else if (this.player.state == 2) {
        $stop.removeAttr("disabled");
        if (this.editStrip) {
          this.applyStrip();
        }
        $stripChange.hide();
        $pause.hide();
        $play.show();
        if (lastState == 0) {
          this.logger.appendStrip(this.strip.toString(), this.strip.pos);
        }
      }
    }
  };

  /**
   * Show warning
   * $warn - warning element
   */
  Turing.prototype.warning = function ($warn, text, offsetTop, offsetLeft) {
    if ($warn.is(":visible")) {
      $warn.stop();
      $warn.css('opacity', 1);
    }

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
  };


  /**
   * Executes step if possible, if no, return to pause state
   * If no command has been actually executed, return to stop
   */
  Turing.prototype.makeStep = function () {
    var finalState = false;
    if(this.config.usefinal && this.config.states[this.config.states.length-1]==this.head.state){
      finalState=true;
    }else {
      for (var i = 0; i < this.commands.length; i++) {
        var cmd = this.commands[i];
        if (cmd.from == this.head.state && cmd.inp == this.strip.current()) {
          this.executeCommand(cmd);
          return;
        }
      }
    }

    var $player_warn = $("#" + this.divId + " .it-player-warn");
    var $player_info = $("#" + this.divId + " .it-player-info");

    if (this.player.steps == 0) {
      this.warning($player_warn, "Нет команды для состояния <mark><b>" + this.head.state + "</b></mark> и символа <mark><b>" + this.strip.current() + "</b></mark>");
    } else {
      if(finalState) {
        this.warning($player_info, "Произошел останов машины. Машина перешла в конечное состояние <mark><b>" + this.head.state + "</b></mark>");
      }else{
        this.warning($player_info, "Произошел останов машины. Нет команды для состояния <mark><b>" + this.head.state + "</b></mark> и символа <mark><b>" + this.strip.current() + "</b></mark>");
      }
    }
    this.actualizeGuiState(2);

    //if no command has been executed return to stop state
    if (this.player.steps == 0) {
      this.actualizeGuiState(0);
      this.logger.clear();
    }
  };


  /**
   * Executes selected command
   * @param cmd
   */
  Turing.prototype.executeCommand = function (cmd) {
    this.player.steps++;
    this.logger.appendCommand(cmd, this.player.steps);
    this.player.animated = true;
    var head = this.head;
    var strip = this.strip;
    var player = this.player;
    var turing = this;

    cmd.select();

    function finish() {
      head.changeState(cmd.to);
      cmd.deselect();
      turing.logger.appendStrip(strip.toString(), strip.pos);
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

  /**
   * Gets command by id
   * @param id
   * @returns {*}
   */
  Turing.prototype.command = function (id) {
    for (var i = 0; i < this.commands.length; i++) {
      if (this.commands[i].id == id) {
        return this.commands[i];
      }
    }
  };

  /**
   * Gets group by id
   * @param id
   * @returns {*}
   */
  Turing.prototype.group = function (id) {
    for (var i = 0; i < this.groups.length; i++) {
      if (this.groups[i].id == id) {
        return this.groups[i];
      }
    }
  };

  /**
   * Remove command
   * @param command
   */
  Turing.prototype.removeCommand = function (command) {
    var index = this.commands.indexOf(command);
    if (~index) {
      this.commands.splice(index, 1);
    }
  };

  /**
   * Remove group
   * @param group
   */
  Turing.prototype.removeGroup = function (group) {
    var index = this.groups.indexOf(group);
    if (~index) {
      this.groups.splice(index, 1);
    }
  };

  /**
   * Check if there is command for input state/symbol
   * @param from
   * @param inp
   * @param except
   */
  Turing.prototype.checkCommandAndSelect = function(from, inp, except){
    for (var i = 0; i < this.commands.length; i++) {
      var cmd = this.commands[i];
      if (except && cmd == except) {
        continue;
      }
      if (cmd.from == from && cmd.inp == inp) {
        cmd.view.addClass('bg-danger');

        (function(cmd) {
          setTimeout(function () {
            cmd.view.removeClass('bg-danger');
          }, 2000);
        })(cmd);

        return true;
      }
    }
    return false;
  };

  Turing.prototype.load = function (solution) {
    this.groups = [];
    for (var i = 0; i < solution.groups.length; i++) {
      var grp = solution.groups[i];
      var group = new Group(grp.id, grp.comment);
      group.turing = this;
      this.groups.push(group);
    }
    this.commands = [];
    for (var j = 0; j < solution.commands.length; j++) {
      var cmd = solution.commands[j];
      var command = new Command(cmd.id, cmd.from, cmd.to, cmd.inp, cmd.out, cmd.move);
      this.commands.push(command);
      var commandGroup = this.group(cmd.g);
      command.group = commandGroup;
      command.turing = this;
      commandGroup.commands.push(command);
    }
    this.initCommandView();
    this.applyStrip(solution.strip);
  };

  Turing.prototype.solution = function () {
    var result = {};
    var commands = [];
    var groups = [];
    for (var i = 0; i < this.groups.length; i++) {
      var g = this.groups[i];
      groups.push({id: g.id, comment: g.comment});
      for (var j = 0; j < g.commands.length; j++) {
        var cmd = g.commands[j];
        commands.push({
          id: cmd.id,
          from: cmd.from,
          to: cmd.to,
          inp: cmd.inp,
          out: cmd.out,
          move: cmd.move,
          g: cmd.group.id
        });
      }
    }

    result.commands = commands;
    result.groups = groups;
    result.strip = this.symbols;
    return result;
  };

  Turing.prototype.reset = function () {
    this.stop();
  };

  /**
   * Create commands view
   */
  Turing.prototype.initCommandView = function () {
    var $list = $("#" + this.divId + " .it-view-command .it-command-list");
    $list.empty();

    for (var i = 0; i < this.groups.length; i++) {
      var group = this.groups[i];
      group.view=null;
      group.makeView();
      for (var j = 0; j < group.commands.length; j++) {
        var command = group.commands[j];
        command.view=null;
        command.makeView();
        group.addCommandView(command);
      }
      $list.append(group.view);
    }
  };

  /**
   * Moves draggable command to its own group
   * @param group - near this group
   * @param before - is before
   */
  Turing.prototype.moveCommandToNewGroup = function(group, before){
    var cmd = this.dragCmd;
    var leftGroup = cmd.group;
    leftGroup.removeCommand(cmd);

    var newGroup = new Group(++Group.counter, "");
    newGroup.turing = this;

    var index = cmd.turing.groups.indexOf(group);
    cmd.turing.groups.splice(before?index:index+1, 0, newGroup);
    newGroup.commands.push(cmd);
    cmd.group = newGroup;

    if (leftGroup.commands.length == 0) {
      newGroup.comment = leftGroup.comment;
      cmd.turing.removeGroup(leftGroup);
    }

    cmd.turing.dragCmd = null;
    cmd.turing.initCommandView();
  };

  /**
   * Moves command to existed group
   * @param command - near this command
   * @param before - is before
   */
  Turing.prototype.moveCommandToExistGroup = function(command, before){
    var cmd = this.dragCmd;
    var leftGroup = cmd.group;
    leftGroup.removeCommand(cmd);

    var newGroup = command.group;

    var index = newGroup.commands.indexOf(command);
    newGroup.commands.splice(before?index:index+1, 0, cmd);
    cmd.group = newGroup;

    if (leftGroup.commands.length == 0) {
      newGroup.comment = newGroup.comment+" "+leftGroup.comment;
      cmd.turing.removeGroup(leftGroup);
    }

    cmd.turing.dragCmd = null;
    cmd.turing.initCommandView();
  };

  /**
   * Add new command with group
   * @param command
   */
  Turing.prototype.addNewCommand = function(command){
    var $list = $("#" + this.divId + " .it-view-command .it-command-list");
    var group = new Group(++Group.counter, "");
    group.turing = this;
    group.commands.push(command);
    this.commands.push(command);
    this.groups.push(group);
    command.group=group;
    command.turing = this;
    group.makeView();
    command.makeView();
    group.addCommandView(command);
    $list.append(group.view);

  };

  /**
   * Logger manages writing to log
   * @param divId
   * @param empty
   * @constructor
   */
  function Logger(divId, empty) {

    var $log = $("#" + divId + " .it-log");

    var $logCounter = $("#" + divId + " .it-log-counter");

    var $small = $("#" + divId + " .it-log-small");

    var $expand = $("#" + divId + " .it-log-expand");

    var count = 0;

    var expanded = false;

    $small.hide();

    $expand.hide();

    $log.css({'max-height': '200px'});
    $log.css({'min-height': '200px'});

    $expand.click(function () {
      $small.show();
      $expand.hide();
      $log.css({'max-height': ''});
      expanded = true;
    });

    $small.click(function () {
      $expand.show();
      $small.hide();
      $log.css({'max-height': '200px'});
      var objDiv = $log[0];
      objDiv.scrollTop = objDiv.scrollHeight;
      expanded = false;
    });

    this.appendStrip = function (strip, pos) {
      var escapedSpecial = GuiUtils.escapeSpecial(empty);

      var left = strip.substring(0, pos);
      var right = strip.substring(pos + 1);

      left = left.replace(new RegExp("^" + escapedSpecial + "+", "gm"), '');
      right = right.replace(new RegExp(escapedSpecial + "+$", "gm"), '');

      //shrink left
      //max length is 24
      //if less add star to the start, but no more 5
      if (left.length > 24) {
        left = "~" + left.substr(left.length - 23);
      } else if (left.length > 19) {
        left = new Array(25 - left.length).join(empty) + left;
      } else {
        left = new Array(6).join(empty) + left;
      }

      //shrink right
      var endsLength = (left.length + right.length);
      if (endsLength > 29) {
        right = right.substr(0, 28 - left.length) + "~";
      }

      endsLength = (left.length + right.length);
      //add right empty symbols to get 30-length strip
      if (endsLength < 29) {
        right = right + new Array(30 - (endsLength)).join(empty);
      }

      strip = left + "<span class='bg-primary'>" + strip.charAt(pos) + "</span>" + right;


      count++;
      var strCount = count;
      if (count < 10) {
        strCount = "&nbsp;" + count;
      }

      $log.append("<div><label>" + strCount + ":</label><span class='it-log-strip'>" + strip + "</span></div>");
      var objDiv = $log[0];
      objDiv.scrollTop = objDiv.scrollHeight;
      if (count > 4) {
        if (expanded) {
          $small.show();
        } else {
          $expand.show();
        }
      }
    };

    this.appendCommand = function (command, count) {
      $log.append("<div class='it-log-cmd'>" + command.toString() + "</div>");
      var objDiv = $log[0];
      objDiv.scrollTop = objDiv.scrollHeight;
      if (count) {
        $logCounter.html(count);
      }
    };

    this.clear = function () {
      $log.html("");
      count = 0;
      $small.hide();
      $expand.hide();
      $logCounter.html("");
    };

  }


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
     * @param shift - shift from first not empty symbol
     */
    this.init = function (symbols, empty, shift) {
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
      
      var delay = this.player.delay;
      this.player.delay=0;
      for (var k = 0; k < shift; k++) {
        this.moveLeft();
      }
      for (var j = 0; j > shift; j--) {
        this.moveRight();
      }
      this.player.delay = delay;
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
    this.head.graphics.lineTo(this.gui.cellSize, this.gui.cellSize);

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


  function Command(id, from, to, inp, out, move) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.inp = inp;
    this.out = out;
    this.move = move;
    Command.counter = Math.max(id, Command.counter);
    this.group = {};
    this.view = {};
    this.turing = {};

    /**
     * Check of all parameters determined
     */
    this.filled = function(){
      return this.to != "---" && this.from != "---" && this.inp != "---" && this.out != "---" && this.move != "---";
    };

    this.makeView = function () {
      this.view = $("<div class='it-command' draggable='true'></div>");

      var $delBtn = $("<button class='it-cmd-del btn btn-sm btn-link' type='button' " +
          "title='Удалить'><span class='glyphicon glyphicon-remove' " +
          "aria-hidden='true'></span></button>");
      $delBtn.css('opacity', '0.0');

      var $mover = $("<span class='mover'><span class='glyphicon glyphicon-arrow-up'></span><span class='glyphicon glyphicon-arrow-down'></span></span>");
      $mover.css('opacity', '0.0');

      this.$from = $("<span class='it-command-item'>"+GuiUtils.beforeSpace(this.from,1)+"</span>");
      this.$inp = $("<span class='it-command-item'>"+this.inp+"</span>");
      this.$to = $("<span class='it-command-item'>"+GuiUtils.beforeSpace(this.to,1)+"</span>");
      this.$out = $("<span class='it-command-item'>"+this.out+"</span>");
      this.$move = $("<span class='it-command-item'>"+this.move+"</span>");

      var cmd = this;

      this.view.on("dragstart", function(e){
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          e.preventDefault();
          return;
        }
        cmd.turing.dragCmd = cmd;
        e.originalEvent.dataTransfer.setData('text/plain', 'anything');
      });

      var $upHolder = $("<div class='it-drag-holder' ondragover=''></div>");
      var $downHolder = $("<div class='it-drag-holder' ondragover=''></div>");

      this.view.on("dragover", function(e){
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          return;
        }
          if (cmd.turing.dragCmd != cmd) {
            $upHolder.removeClass("bg-primary");
            $downHolder.removeClass("bg-primary");
            var y = e.originalEvent.clientY;
            //noinspection JSValidateTypes
            var offset = (y - (cmd.view.offset().top - ($(window).scrollTop())));
            if (offset < cmd.view.height() / 2) {
              $upHolder.addClass("bg-primary");
            } else {
              $downHolder.addClass("bg-primary");
            }
            cmd.group.view.addClass("bg-info");
            e.preventDefault();
          }
      });

      this.view.on("drop", function(e){
        e.preventDefault();
        $upHolder.removeClass("bg-primary");
        $downHolder.removeClass("bg-primary");
        cmd.group.view.removeClass("bg-info");
        var y = e.originalEvent.clientY;
        //noinspection JSValidateTypes
        var offset = (y-(cmd.view.offset().top-($(window).scrollTop())));
        cmd.turing.moveCommandToExistGroup(cmd, offset<cmd.view.height()/2);
      });

      this.view.on("dragleave", function(e){
        e.preventDefault();
        $upHolder.removeClass("bg-primary");
        $downHolder.removeClass("bg-primary");
        cmd.group.view.removeClass("bg-info");
      });



      this.view.append($upHolder);
      this.view.append($mover);
      this.view.append(this.$from);
      this.view.append("[");
      this.view.append(this.$inp);
      this.view.append("]");
      var $arrow = $("<span>></span>");
      this.view.append($arrow);
      this.view.append(this.$to);
      this.view.append("[");
      this.view.append(this.$out);
      this.view.append("]");
      this.view.append(this.$move);

      this.view.append($delBtn);
      this.view.append($downHolder);

      this.$move.click(function () {
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          return;
        }
        $("div[class*='it-command-editor-']").removeClass("open");
        var $moveEditor = $(".it-command-editor-move");
        $moveEditor.addClass("open");
        cmd.turing.editCommand = cmd;
        $moveEditor.find(".dropdown-menu").css('top', (cmd.view.position().top-20)+'px');
        $moveEditor.find(".dropdown-menu").css('left', ($(this).position().left-20)+'px');
      });

      this.$out.click(function () {
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          return;
        }
        $("div[class*='it-command-editor-']").removeClass("open");
        var $outEditor = $(".it-command-editor-out");
        $outEditor.addClass("open");
        cmd.turing.editCommand = cmd;
        $outEditor.find(".dropdown-menu").css('top', (cmd.view.position().top-20)+'px');
        $outEditor.find(".dropdown-menu").css('left', ($(this).position().left-20)+'px');
      });

      this.$to.click(function () {
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          return;
        }
        $("div[class*='it-command-editor-']").removeClass("open");
        var $toEditor = $(".it-command-editor-to");
        $toEditor.addClass("open");
        cmd.turing.editCommand = cmd;
        $toEditor.find(".dropdown-menu").css('top', (cmd.view.position().top-20)+'px');
        $toEditor.find(".dropdown-menu").css('left', ($(this).position().left-20)+'px');
      });

      this.$from.click(function () {
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          return;
        }
        $("div[class*='it-command-editor-']").removeClass("open");
        var $fromEditor = $(".it-command-editor-from");
        $fromEditor.addClass("open");
        cmd.turing.editCommand = cmd;
        $fromEditor.find(".dropdown-menu").css('top', (cmd.view.position().top-20)+'px');
        $fromEditor.find(".dropdown-menu").css('left', ($(this).position().left-20)+'px');
      });

      this.$inp.click(function () {
        if (cmd.turing.player.animated || cmd.turing.player.state == 1) {
          return;
        }
        $("div[class*='it-command-editor-']").removeClass("open");
        var $inpEditor = $(".it-command-editor-inp");
        $inpEditor.addClass("open");
        cmd.turing.editCommand = cmd;
        $inpEditor.find(".dropdown-menu").css('top', (cmd.view.position().top-20)+'px');
        $inpEditor.find(".dropdown-menu").css('left', ($(this).position().left-20)+'px');
      });


      //noinspection JSUnresolvedFunction
      this.view.mouseover(function () {
        if (!cmd.turing.player.animated && cmd.turing.player.state != 1) {
          $delBtn.css('opacity', '1.0');
          $mover.css('opacity', '1.0');
          cmd.$from.addClass('it-command-item-edit');
          cmd.$to.addClass('it-command-item-edit');
          cmd.$inp.addClass('it-command-item-edit');
          cmd.$out.addClass('it-command-item-edit');
          cmd.$move.addClass('it-command-item-edit');
        }
      });

      //noinspection JSUnresolvedFunction
      this.view.mouseout(function () {
        $delBtn.css('opacity', '0.0');
        $mover.css('opacity', '0.0');
        cmd.$from.removeClass('it-command-item-edit');
        cmd.$to.removeClass('it-command-item-edit');
        cmd.$inp.removeClass('it-command-item-edit');
        cmd.$out.removeClass('it-command-item-edit');
        cmd.$move.removeClass('it-command-item-edit');
      });

      $delBtn.click(function () {
        cmd.turing.removeCommand(cmd);
        cmd.view.remove();
        cmd.group.removeCommand(cmd);
        //remove empty group
        if (cmd.group.commands.length == 0) {
          cmd.turing.removeGroup(cmd.group);
          cmd.group.view.remove();
        }
      });
    };

    this.select = function () {
      this.view.addClass("bg-info");
    };

    this.deselect = function () {
      this.view.removeClass("bg-info");
    }
  }

  Command.counter = 0;

  Command.prototype.toString = function () {
    return this.from + "[" + this.inp + "]" + " > " + this.to + "[" + this.out + "]" + this.move;
  };


  function Group(id, comment) {
    this.id = id;
    this.comment = comment;
    Group.counter = Math.max(id, Group.counter);
    this.view = {};
    this.$groupCmdView = {};
    this.commands = [];
    this.edit = false;
    this.turing = {};
  }

  Group.counter = 0;

  //noinspection JSUnresolvedFunction
  /**
   * Make view for group
   */
  Group.prototype.makeView = function(){
    this.$groupCmdView = $("<div class='it-group-cmd'></div>");
    var $groupCommentText = $("<span>" + GuiUtils.beforeSpace(this.comment, -1).replace("\n", "<br/>") + "</span>");
    this.$groupCommentText=$groupCommentText;
    var $groupCommentView = $("<div class='it-group-comment'></div>");
    var $groupView = $("<div class='it-group'></div>");
    var $editBtn = $("<button class='ibtn btn-sm btn-link' type='button'" +
        " title='Изменить комментарий'><span class='glyphicon glyphicon-pencil' aria-hidden='true'></span></button>");
    $editBtn.css('opacity', '0');
    this.$editBtn =$editBtn;

    var $upHolder = $("<div class='it-drag-holder' ondragover=''></div>");
    var $downHolder = $("<div class='it-drag-holder' ondragover=''></div>");



    $upHolder.on("dragover", function(e){
      e.preventDefault();
      $(this).addClass("bg-primary");
    });

    $upHolder.on("dragleave", function(e){
      e.preventDefault();
      $(this).removeClass("bg-primary");
    });

    $downHolder.on("dragover", function(e){
      e.preventDefault();
      $(this).addClass("bg-primary");
    });

    $downHolder.on("dragleave", function(e){
      e.preventDefault();
      $(this).removeClass("bg-primary");

    });

    var turing = this.turing;
    var group = this;

    $upHolder.on("drop", function(e){
      e.preventDefault();
      $(this).removeClass("bg-primary");
      turing.moveCommandToNewGroup(group, true);
    });

    $downHolder.on("drop", function(e){
      e.preventDefault();
      $(this).removeClass("bg-primary");
      turing.moveCommandToNewGroup(group, false);
    });

    $groupView.append($upHolder);
    $groupView.append(this.$groupCmdView);
    $groupView.append($groupCommentView);
    $groupCommentView.append($groupCommentText);
    $groupCommentView.append($editBtn);
    $groupView.append("<div class='clearfix'></div>");
    $groupView.append($downHolder);

    //noinspection JSUnresolvedFunction
    $groupCommentView.mouseover(function () {
      if(!group.edit) {
        $editBtn.css('opacity', '1');
      }
    });


    //noinspection JSUnresolvedFunction
    $groupCommentView.mouseout(function () {
      $editBtn.css('opacity', '0');
    });

    $editBtn.click(function(){
      if(!group.edit) {
        for (var i = 0; i < group.turing.groups.length; i++) {
          var grp = group.turing.groups[i];
          if (grp.edit) {
            grp.cancelEdit();
          }
        }
        group.edit = true;
        $editBtn.css('opacity', '0');
        $editBtn.hide();
        var $area = $("<textarea>" + group.comment + "</textarea>");
        $area.css('width', '99%');
        $area.css('height', group.view.height()+"px");
        $groupCommentText.html("");
        $groupCommentText.append($area);

        $area.keyup(function (evt) {
          if ( evt.which == 13 && !evt.ctrlKey) {
            evt.preventDefault();
            group.applyEdit();
          }else if (evt.keyCode == 27){
            group.cancelEdit();
          }
        });

        $area.keypress(function(evt){
          if (event.keyCode === 13 && !evt.ctrlKey)
            event.preventDefault();

        });
      }
    });

    Group.prototype.cancelEdit = function(){
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.edit=false;
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.$groupCommentText.html(GuiUtils.beforeSpace(this.comment, -1).replace("\n", "<br/>"));
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.$editBtn.show();
    };

    Group.prototype.applyEdit = function(){
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.edit=false;
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.comment = this.$groupCommentText.find("textarea").val();
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.$groupCommentText.html(GuiUtils.beforeSpace(this.comment, -1).replace("\n", "<br/>"));
      //noinspection JSPotentiallyInvalidUsageOfThis
      this.$editBtn.show();
    };

    this.view = $groupView;
  };


  /**
   * Add command to group
   * @param command
   */
  Group.prototype.addCommandView = function(command){
    this.$groupCmdView.append(command.view);
  };

  /**
   * Remove command
   * @param command
   */
  Group.prototype.removeCommand = function (command) {
    var index = this.commands.indexOf(command);
    if (~index) {
      this.commands.splice(index, 1);
    }
  };

  return {
    magic: function () {
      return new Turing();
    }
  }

})
();


