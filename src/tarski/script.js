/**
 *
 * config{
 *  figures:[
 *    {"id": "bC", "props": {"color": "blue", "size": "big", "shape": "cube"},
 *    "draw": "g.beginFill(\\"blue\\"); g.drawRect(0, 0, w, h);"},
 *    {"id": "rC", "props": {"color": "red", "size": "big", "shape": "cube"},
 *    "draw": "g.beginFill(\\"red\\"); g.drawRect(0, 0, w, h);"},
 *    ],
 *    "quantors":["all", "exist"],
 *   "variables":["x", "y"],
 *   "predicated":[
 *    {"code": "small", "tip": "мальнького размера", "text": "малый _ ", "formal": "МАЛ(_)", "check": " return fig.size == \\"SMALL\\""},
 *    {"code": "big", "tip": "большого размера", "text": "большой _ ", "formal": "БОЛ(_)", "check": " return fig.size == \\"BIG\\""}
 *   ],
 *   "operations":["and", "or"],
 *   "configsize": 5,
 *   "smilers":[
 *    {"id": "bC", "x": 0, "y": 0}
 *   ],
 *   "saders":[
 *     {"id": "rC", "x": 3, "y": 3}
 *   ]
 *  }
 *
 *
 * solution{
 *   statementFormal: false,
 *   smilers:[
 *    {id: "bC", x: 0, y: 0}
 *   ],
 *   saders:[
 *    {id: "bC", x: 3, y: 3}
 *   ],
 *   formulas:[
 *    ["{code:upper, var1:x, var2:y}"],
 *    ["{code:upper, var1:x, var2:y}, {code:impl}, {code:and}"]
 *   ]
 * }
 *
 *
 * @constructor
 */

var qwerty00004 = (function () {

  /**
   * @constructor
   */
  function Tarski() {

    this.gui = {
      stage: {},

      width: 0,

      configMargin: 30,

      toolMargin: 20,

      activeHeight: 0,

      toolboxHeight: 0,

      cellSize: 0,

      statementHeight: 30,

      statementFontHeight: 18,

      statementPhWidth: 12,

      statementPhVarYShift: 6,

      statementPhVarHeight: 22,

      statementFormal: false
    };

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

    this.smilers = {};

    this.saders = {};

    this.bases = [];

    this.statements = [];

    this.activeStatement = null;

    this.lib = {
      all: {
        code: "all",
        tip: "ДЛЯ ВСЕХ",
        text: "ДЛЯ ВСЕХ _ ",
        formal: "∀_ "
      },
      exist: {
        code: "exist",
        tip: "СУЩЕСТВУЕТ ТАКОЙ, ЧТО",
        text: "СУЩЕСТВУЕТ _ ТАКОЙ, ЧТО",
        formal: "∃_ "
      },
      and: {
        code: "and",
        tip: "И",
        text: "И",
        formal: "&",
        priority: 4
      },
      or: {
        code: "or",
        tip: "ИЛИ",
        text: "ИЛИ",
        formal: "ИЛИ",
        priority: 3
      },
      impl: {
        code: "impl",
        tip: "СЛЕДОВАТЕЛЬНО",
        text: "СЛЕДОВАТЕЛЬНО",
        formal: "=>",
        priority: 2
      },
      eq: {
        code: "eq",
        tip: "ТОГДА И ТОЛЬКО ТОГДА, КОГДА",
        text: "ТОГДА И ТОЛЬКО ТОГДА, КОГДА",
        formal: "<=>",
        priority: 1
      },
      not: {
        code: "not",
        tip: "НЕ ВЕРНО, ЧТО",
        text: "НЕ ВЕРНО, ЧТО",
        formal: "¬",
        priority: 5
      },
      lb: {
        code: "lb",
        tip: "(",
        text: "(",
        formal: "("
      },
      rb: {
        code: "rb",
        tip: ")",
        text: ")",
        formal: ")"
      }
    }

  }

  //noinspection all
  Tarski.prototype.layout = '<style>#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .top-buffer{margin-top:20px}#divId .it-logic-buttons button{margin:3px}#divId .it-statement{border:1px solid #777;margin-bottom:10px;margin-top:10px}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row top-buffer it-logic-buttons"><div class="col-sm-4"><div class="it-quantors"><p class="lead">Кванторы</p></div><div class="it-variables top-buffer"><p class="lead">Переменные</p></div></div><div class="col-sm-4"><div class="it-predicates"><p class="lead">Предикаты</p></div></div><div class="col-sm-4"><div class="it-operations"><p class="lead">Операции</p></div></div></div><div class="row top-buffer"><div class="col-sm-8"><button title="Создать новую формулу" class="btn btn-default btn-sm it-createf"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>Создать формулу</button> <button title="Удалить активную формулу" class="btn btn-default btn-sm it-removef"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Удалить формулу</button> <button title="Стереть символ перед курсором" class="btn btn-default btn-sm it-clearf"><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span>Стереть символ</button></div><div class="col-sm-4"><div class="pull-right"><label><input type="checkbox" class="it-format-formal">&nbsp;формальная запись</label></div></div></div><div class="row top-buffer"><div class="col-sm-12 it-statements"></div></div></div>';//###layout

  Tarski.prototype.init = function (divId, taskWidth, config) {
    this.divId = divId;
    this.config = config;

    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
    var $scene = $("#" + divId + " .it-scene");
    $scene.attr("id", divId + "-it-scene");
    $scene.attr("width", taskWidth - 40);
    var $task = $("#" + divId + " .it-task");
    $task.css("max-width", taskWidth + "px");
    $task.css("min-width", taskWidth + "px");

    this.gui.width = taskWidth - 40;
    this.initHeight();

    $scene.attr("height", (this.gui.activeHeight + this.gui.toolboxHeight) + "px");

    this.gui.stage = new createjs.Stage(divId + "-it-scene");
    this.gui.stage.mouseMoveOutside = true;


    var delimiter = new createjs.Shape();
    delimiter.y = this.gui.activeHeight;
    delimiter.graphics.setStrokeStyle(2);
    delimiter.graphics.beginStroke("darkgray");
    delimiter.graphics.moveTo(0, 0);
    delimiter.graphics.lineTo(this.gui.width, 0);
    this.gui.stage.addChild(delimiter);

    this.gui.stage.enableMouseOver(10);
    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);

    for (var i = 0; i < config.figures.length; i++) {
      var figure = config.figures[i];
      this.bases.push(new Base(this, figure.id, figure.props, figure.draw, this.gui, this.gui.toolMargin + this.gui.cellSize * i, this.gui.toolMargin + this.gui.activeHeight));
    }

    this.smilers = new Configuration(this.gui, this.gui.cellSize, this.config.configsize, this.gui.configMargin, this.gui.configMargin);
    this.saders = new Configuration(this.gui, this.gui.cellSize, this.config.configsize, this.gui.configMargin * 3 + this.gui.cellSize * config.configsize, this.gui.configMargin);

    this.makeQuantors(config, divId);
    this.makeVariables(config, divId);
    this.makePredicates(config, divId);
    this.makeOperations(config, divId);

    tarski = this;
    $createf = $("#" + divId + " .it-createf");
    $createf.on('click', function () {
      tarski.addStatement();
    });

    $removef = $("#" + divId + " .it-removef");
    $removef.on('click', function () {
      tarski.removeStatement(tarski.activeStatement);
    });

    $clearf = $("#" + divId + " .it-clearf");
    $clearf.on('click', function () {
      tarski.removeLogic();
    });

    var tarski = this;
    var gui = this.gui;
    $("#" + divId+" .it-format-formal").on("change", function(){
      gui.statementFormal = $(this).is(":checked");
      tarski.updateStatements();
    });

  };


  Tarski.prototype.makeQuantors=function(config, divId) {
    var tarski=this;
    var $quantors = $("#" + divId + " .it-quantors");
    if(config.quantors.length==0){
      $quantors.hide();
    }
    for (var i = 0; i < config.quantors.length; i++) {
      var quantor = config.quantors[i];
      quantor = this.lib[quantor];
      var $btn = $("<button title='" + quantor.tip + "' class='btn btn-default'>" + quantor.text + "</button>");
      $quantors.append($btn);
      (function (quantor) {
        $btn.on('click', function () {
          tarski.addLogic(quantor);
        });
      })(quantor);
    }
  };

  Tarski.prototype.makeVariables=function(config, divId) {
    var tarski = this;
    var $variables = $("#" + divId + " .it-variables");
    for (var i = 0; i < config.variables.length; i++) {
      var variable = config.variables[i];
      var $btn = $("<button title='"+variable+"' class='btn btn-default'>"+variable+"</button>");
      $variables.append($btn);
      (function (variable) {
        $btn.on('click', function () {
          tarski.addLogic(variable);
        });
      })(variable);
    }
  };

  Tarski.prototype.makePredicates=function(config, divId) {
    var tarski = this;
    var $predicates = $("#" + divId + " .it-predicates");
    for (var i = 0; i < config.predicates.length; i++) {
      var predicate = config.predicates[i];
      var predicateLib = {
        code: predicate.code,
        tip: predicate.tip,
        text: predicate.text,
        formal: predicate.formal,
        check: predicate.check
      };
      this.lib[""+predicate.code] = predicateLib;
      var $btn = $("<button title='"+predicate.tip+"' class='btn btn-default'>"+predicate.text+"</button>");
      $predicates.append($btn);
      (function (predicateLib) {
        $btn.on('click', function () {
          tarski.addLogic(predicateLib);
        });
      })(predicateLib);
    }
  };

  Tarski.prototype.makeOperations=function(config, divId) {
    var tarski = this;
    var $operations = $("#" + divId + " .it-operations");
    for (var i = 0; i < config.operations.length; i++) {
      var oper = config.operations[i];
      oper = this.lib[oper];
      var $btn = $("<button title='"+oper.tip+"' class='btn btn-default'>"+oper.text+"</button>");
      $operations.append($btn);
      (function (oper) {
        $btn.on('click', function () {
          tarski.addLogic(oper);
        });
      })(oper);
    }
  };

  /**
   * Calculates height of active zone and toolbox
   */
  Tarski.prototype.initHeight = function (taskWidth) {
    var cellSize = (this.gui.width - this.gui.configMargin * 4) / 2 / this.config.configsize;
    this.gui.cellSize = cellSize;
    this.gui.activeHeight = cellSize * this.config.configsize + 2 * this.gui.configMargin;
    this.gui.toolboxHeight = cellSize + 2 * this.gui.toolMargin;
  };

  Tarski.prototype.addStatement = function () {
    var statement = new Statement(this, this.gui);
    var $div = $("<div></div>");
    var $canvas = $("<canvas>");
    $div.attr('class', "it-statement");
    $div.attr('id',  this.divId + "-statement-"+this.statements.length);
    $canvas.attr('id', this.divId + "-statement-scene"+this.statements.length);
    statement.container = $div;
    $div.append($canvas);

    $div.css("width", this.gui.width);
    $div.css("height", this.gui.statementHeight);

    var $statements = $("#" + this.divId + " .it-statements");
    $statements.append($div);

    $canvas.attr("height", this.gui.statementHeight);
    $canvas.attr("width", this.gui.width);
    statement.stage = new createjs.Stage(this.divId + "-statement-scene"+this.statements.length);
    statement.stage.enableMouseOver(10);
    statement.update();
    statement.stage.update();
    this.statements.push(statement);
    this.activateStatement(statement);
  };

  Tarski.prototype.updateStatements = function(){
    for (var i = 0; i < this.statements.length; i++) {
      var obj = this.statements[i];
      obj.update();
    }
  };
  
  Tarski.prototype.removeStatement = function (statement) {
    if(this.statements.length<=1){
      return;
    }
    var index = this.statements.indexOf(statement);
    if (index > -1) {
      this.statements.splice(index, 1);
      var elem = document.getElementById(this.divId + "-statement-"+index);
      elem.parentNode.removeChild(elem);
      var lastIndex = index - 1;
      if(lastIndex<0){
        lastIndex=0;
      }
      this.activeStatement = null;
      this.activateStatement(this.statements[lastIndex]);
    } else {
      console.error("there is not statement with id " + statement.id);
    }
  };

  Tarski.prototype.addLogic = function (oper) {
    if (this.activeStatement != null) {
      this.activeStatement.addLogic(oper);
    }
  };
  
  Tarski.prototype.removeLogic = function () {
    if (this.activeStatement != null) {
      if(this.activeStatement.items.length==0){
        this.removeStatement(this.activeStatement);
      }else if(this.activeStatement.items.length==1){
        this.activeStatement.removeLogic() ;
        this.removeStatement(this.activeStatement);
      }else {
        this.activeStatement.removeLogic();
      }
    }
  };

  Tarski.prototype.activateStatement = function(statement, holder){
    if(this.activeStatement!=null){
      this.activeStatement.deactivate();
    }
    statement.activate(holder);
    this.activeStatement=statement;
  };

  function Statement(tarski, gui){
    this.tarski=tarski;
    this.gui=gui;
    this.stage=null;
    this.items = [];
    this.lastHolder = null;
    this.activeHolder = null;
    this.lastAdded = null;
    this.active=false;
  }

  Statement.prototype.activate = function(holder){
    if(holder){
      if(this.activeHolder){
        this.activeHolder.deactivate();
      }
      this.activeHolder = holder;
      holder.active=true;
      holder.activate();
    }else{
      this.activeHolder = this.lastHolder;
      this.lastHolder.active=true;
      this.lastHolder.activate();
    }
    this.active=true;
    this.stage.update();
  };

  Statement.prototype.deactivate = function(){
    this.active=false;
    if(this.activeHolder!=null){
      this.activeHolder.deactivate();
      this.activeHolder.active=false;
      this.activeHolder = null;
    }
    this.stage.update();
  };

  Statement.prototype.removeLogic = function(){
    if(this.activeHolder!=null) {
      var index;
      if(this.activeHolder.item){
        index = this.items.indexOf(this.activeHolder.item);
      }else{
        index = this.activeHolder.index-1;
      }
      this.items.splice(index, 1);
      index--;
      this.lastAdded=null;
      if(index>=0){
        this.lastAdded=this.items[index];
      }
      this.update();
    }
  };

  Statement.prototype.addLogic = function(logic){
    var code = logic;
    if(logic.code){
      code=logic.code;
    }
    var item = new LogicItem(this, code, logic==code?null:logic);
    if(this.activeHolder!=null) {
      if(this.activeHolder.index!=null){
        var prevItem = null;
        if(this.activeHolder.index-1>=0){
          prevItem = this.items[this.activeHolder.index-1];
          if(prevItem.lib){
            prevItem=null;
          }
        }

        if(this.activeHolder.index>this.items.length) {
          this.items.push(item);
        }else{
          this.items.splice(this.activeHolder.index, 0, item);
        }
        if(prevItem && item.hasVar()){
          item.var1=prevItem.code;
          this.items.splice(this.activeHolder.index-1, 1);
        }
        this.lastAdded = item;
        this.update();
      }else if(this.activeHolder.index==null && logic==code){
        if(this.activeHolder.varNum==0) {
          this.activeHolder.item.var1=code;
        }else{
          this.activeHolder.item.var2=code;
        }
        this.update();
      }
    }
  };

  Statement.prototype.update = function(double){
    this.stage.removeAllChildren();

    var x = 0;

    var placeHolder = new PlaceHolder(this, this.items.length==0 && this.active);
    placeHolder.index=0;
    this.lastHolder=placeHolder;
    if(placeHolder.active){
      this.activeHolder=placeHolder;
    }
    this.stage.addChild(placeHolder.getView());
    x+=this.gui.statementPhWidth;

    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var itemView = item.getView(item==this.lastAdded);
      itemView.x=x;
      this.stage.addChild(itemView);
      x+=itemView.getBounds().width;
      if(itemView.tempActive){
        this.activeHolder=itemView.tempActive;
      }
      var placeHolder2 = new PlaceHolder(this, this.active && item==this.lastAdded && !itemView.tempActive);
      if(placeHolder2.active){
        this.activeHolder=placeHolder2;
      }
      placeHolder2.index=i+1;
      this.lastHolder=placeHolder2;
      var view = placeHolder2.getView();
      view.x=x;
      this.stage.addChild(view);
      x+=this.gui.statementPhWidth;
    }
    var currWidth = parseInt(this.container.css("width"));
    if(!double){
      if (x > currWidth) {
        this.container.css("width", x);
        this.container.find("canvas").attr("width", x);
        this.container.find("canvas").attr("height", this.tarski.gui.statementHeight);
        this.update(true);
      } else if (currWidth > this.tarski.gui.width) {
        var newX = Math.max(this.tarski.gui.width, x);
        this.container.css("width", newX);
        this.container.find("canvas").attr("width", newX);
        this.container.find("canvas").attr("height", this.tarski.gui.statementHeight);
        this.update(true);
      }
    }
    this.stage.update();

  };


  function PlaceHolder(statement, active){
    this.statement=statement;
    this.active=active;

    this.item=null;
    this.value=null;
    this.varNum=0;

    this.index=null;

  }

  PlaceHolder.prototype.getView = function(){
    var view = new createjs.Container();
    var ph = this;
    var gui = this.statement.gui;
    this.rect = new createjs.Shape();
    var rect = this.rect;
    rect.graphics.setStrokeStyle(1);
    if(this.active) {
      rect.graphics.beginFill("#afd9ee");
    }else{
      rect.graphics.beginFill("rgba(0, 0, 0, 0.01)");
    }
    rect.graphics.drawRect(0,ph.index!=null?0:gui.statementPhVarYShift,gui.statementPhWidth,ph.index!=null?gui.statementHeight-2:gui.statementPhVarHeight);
    view.addChild(rect);

    var stage = this.statement.stage;
    view.on('mouseover', function () {
      rect.graphics.clear();
      rect.graphics.beginFill("#afd9ee");
      rect.graphics.drawRect(0,ph.index!=null?0:gui.statementPhVarYShift,gui.statementPhWidth,ph.index!=null?gui.statementHeight-2:gui.statementPhVarHeight);
      stage.update();
    });

    view.on('mouseout', function () {
      if(ph.active){
        return;
      }
      rect.graphics.clear();
      rect.graphics.beginFill("rgba(0, 0, 0, 0.01)");
      rect.graphics.drawRect(0,ph.index!=null?0:gui.statementPhVarYShift,gui.statementPhWidth,ph.index!=null?gui.statementHeight-2:gui.statementPhVarHeight);
      stage.update();
    });

    view.on('click', function (evt) {
      ph.active=true;
      ph.statement.tarski.activateStatement(ph.statement, ph);
    });

    if (this.value) {
      var textView = new createjs.Text(this.value, (gui.statementFontHeight)+"px Arial", "#000");
      textView.textBaseline="hanging";
      textView.y= gui.statementPhVarYShift+gui.statementPhWidth/2;
      textView.x=(gui.statementPhWidth-textView.getBounds().width)/2;
      view.addChild(textView);
    }

    return view;
  };

  PlaceHolder.prototype.activate = function(){
    var ph = this;
    var gui = this.statement.gui;
    this.rect.graphics.clear();
    this.rect.graphics.beginFill("#afd9ee");
    this.rect.graphics.drawRect(0,this.index!=null?0:this.statement.gui.statementPhVarYShift,this.statement.gui.statementPhWidth,ph.index!=null?gui.statementHeight-2:gui.statementPhVarHeight);
  };

  PlaceHolder.prototype.deactivate = function(){
    var ph = this;
    var gui = this.statement.gui;
    this.rect.graphics.clear();
    this.rect.graphics.beginFill("rgba(0, 0, 0, 0.01)");
    this.rect.graphics.drawRect(0,this.index!=null?0:this.statement.gui.statementPhVarYShift,this.statement.gui.statementPhWidth,ph.index!=null?gui.statementHeight-2:gui.statementPhVarHeight);
  };

  function LogicItem(statement, code, lib){
    this.statement=statement;
    this.code=code;
    this.lib=lib;
    this.var1=null;
    this.var2=null;
  }

  LogicItem.prototype.hasVar = function(){
    if(this.lib){
      return this.lib.text.indexOf("_")>=0;
    }
    return false;
  };

  LogicItem.prototype.getView = function(lastAdded){
    var view = new createjs.Container();
    var text = this.lib? this.statement.gui.statementFormal?this.lib.formal:this.lib.text:this.code;
    var parts = text.split("_");
    var shiftX = 0;
    var varNum=0;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if(part==""){
        continue;
      }
      var textView = new createjs.Text(part, "normal "+(this.statement.gui.statementFontHeight)+"px Arial", "#000");
      textView.textBaseline="middle";
      view.addChild(textView);
      textView.y = this.statement.gui.statementHeight/2;
      textView.x=shiftX;
      shiftX+=textView.getBounds().width;
      if(i<parts.length-1){
        var phValue=(varNum==0?this.var1:this.var2);
        var ph = new PlaceHolder(this.statement, lastAdded && !phValue && !view.tempActive);
        if(ph.active){
          view.tempActive=ph;
        }
        ph.value=phValue;
        ph.item = this;
        ph.varNum = varNum;
        varNum++;
        var view2 = ph.getView();
        view2.x=shiftX;
        view.addChild(view2);
        shiftX+=this.statement.gui.statementPhWidth;
      }
    }
    return view;
  };

  //<editor-fold desc="Description">
  Tarski.prototype.getBase = function (code) {
    for (var i = 0; i < this.bases.length; i++) {
      var base = this.bases[i];
      if (base.id == code) {
        return base;
      }
    }
    return null;
  };

  Tarski.prototype.load = function (solution) {
    this.gui.statementFormal = solution.statementFormal;
    $("#" + this.divId+" .it-format-formal").prop('checked', solution.statementFormal);

    for (var i = 0; i < solution.smilers.length; i++) {
      var smiler = solution.smilers[i];
      var base = this.getBase(smiler.id);
      this.smilers.addFigure(base.figureBase, smiler.x, smiler.y);
      base.recoverFigure();
    }
    for (var j = 0; j < solution.saders.length; j++) {
      var sader = solution.saders[j];
      var base = this.getBase(sader.id);
      base.recoverFigure();
      this.saders.addFigure(base.figureBase, smiler.x, smiler.y);
    }
    for (var k = 0; k < solution.formulas.length; k++) {
      var formula = solution.formulas[k];
      this.addStatement();
      var st = this.statements[k];
      for (var m = 0; m < formula.length; m++) {
        var item = formula[m];
        var logicItem = new LogicItem(st, item.code, this.lib[item.code]);
        if(item.var1) {
          logicItem.var1=item.var1;
        }
        if(item.var2) {
          logicItem.var2=item.var2;
        }
        st.items.push(logicItem);
      }
      st.update();
    }
  };

  Tarski.prototype.solution = function () {
    var result = {};
    result.statementFormal = this.gui.statementFormal;
    result.smilers = [];
    result.saders = [];
    var holder;
    for (var i = 0; i < this.smilers.holders.length; i++) {
      holder = this.smilers.holders[i];
      if (holder.figure != null) {
        result.smilers.push(holder.toConf());
      }
    }
    for (var j = 0; j < this.saders.holders.length; j++) {
      holder = this.saders.holders[j];
      if (holder.figure != null) {
        result.saders.push(holder.toConf());
      }
    }
    result.formulas=[];
    for (var i = 0; i < this.statements.length; i++) {
      var statement = this.statements[i];
      var st = [];
      for (var j = 0; j < statement.items.length; j++) {
        var item = statement.items[j];
        var it = {};
        it.code = item.code;
        if (item.var1) {
          it.var1 = item.var1;
        }
        if (item.var2) {
          it.var2 = item.var2;
        }
        st.push(it);
      }
      result.formulas.push(st);
    }

    return result;
  };

  Tarski.prototype.reset = function () {
  };

  Tarski.prototype.deselectAllConfig = function () {
    this.smilers.deselectAll();
    this.saders.deselectAll();
  };

  Tarski.prototype.selectConfigHolder = function (x, y) {
    var holder = this.smilers.find(x, y);
    if (holder == null) {
      holder = this.saders.find(x, y);
    }
    if (holder != null) {
      holder.select();
      return holder;
    }
  };

  function Configuration(gui, cellSize, size, x, y) {
    this.holders = [];
    this.gui = gui;
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        this.holders.push(new ConfigHolder(gui, cellSize, x + i * cellSize, y + j * cellSize, i, j));
      }

    }
  }


  Configuration.prototype.addFigure = function (figure, i, j) {
    for (var k = 0; k < this.holders.length; k++) {
      var holder = this.holders[k];
      if (holder.i == i && holder.j == j) {
        figure.holder = holder;
        holder.figure = figure;
        figure.view.x = figure.holder.view.x + this.gui.cellSize * 0.1;
        figure.view.y = figure.holder.view.y + this.gui.cellSize * 0.1;
      }
    }
  };


  Configuration.prototype.deselectAll = function () {
    for (var i = 0; i < this.holders.length; i++) {
      var obj = this.holders[i];
      obj.deselect();
    }
  };

  Configuration.prototype.find = function (x, y) {
    for (var i = 0; i < this.holders.length; i++) {
      var obj = this.holders[i];
      if (obj.figure == null) {
        if (obj.view.x < x && obj.view.y < y
            && obj.view.x + obj.cellSize > x
            && obj.view.y + obj.cellSize > y) {
          return obj;
        }
      }
    }
    return null;
  };

  function ConfigHolder(gui, cellSize, x, y, i, j) {
    this.figure = null;
    this.cellSize = cellSize;
    this.i = i;
    this.j = j;
    this.view = new createjs.Shape();
    this.view.graphics.beginStroke("gray");
    this.view.graphics.drawRect(0, 0, cellSize, cellSize);
    this.view.x = x;
    this.view.y = y;
    gui.stage.addChild(this.view);

  }

  ConfigHolder.prototype.toConf = function () {
    var result = {};
    result.x = this.i;
    result.y = this.j;
    result.id = this.figure.base.id;
    return result;
  };

  ConfigHolder.prototype.deselect = function () {
    this.view.graphics.clear();
    this.view.graphics.beginStroke("gray");
    this.view.graphics.drawRect(0, 0, this.cellSize, this.cellSize);
  };


  ConfigHolder.prototype.select = function () {
    this.view.graphics.clear();
    this.view.graphics.beginStroke("gray");
    this.view.graphics.beginFill("#fcf8e3");
    this.view.graphics.drawRect(0, 0, this.cellSize, this.cellSize);
  };

  /**
   * Base for figure in toolbox
   * @param tarski
   * @param id
   * @param func
   * @param prop
   * @param gui
   * @param x
   * @param y
   * @constructor
   */
  function Base(tarski, id, prop, func, gui, x, y) {
    this.id = id;
    this.prop = prop;
    this.func = func;
    this.gui = gui;
    this.x = x;
    this.y = y;
    this.tarski = tarski;

    var base = this;
    this.figureBase = new Figure(base, x, y, base.gui);
    this.figureBase.onBase = true;
    gui.stage.addChild(this.figureBase.view);

    this.recoverFigure();
  }

  /**
   * recover draggable figure with flag - onBase
   */
  Base.prototype.recoverFigure = function () {
    this.figureBase = new Figure(this, this.x, this.y, this.gui);
    this.gui.stage.addChild(this.figureBase.view);
    this.figureBase.onBase = true;
  };


  /**
   * Figure
   * @param base - base element
   * @param x - x
   * @param y - y
   * @param gui - gui object
   * @constructor
   */
  function Figure(base, x, y, gui) {
    this.onBase = false;
    this.base = base;
    this.x = x;
    this.y = y;
    this.gui = gui;
    this.holder = null;

    this.view = new createjs.Shape();
    var f = Function("g", "w", "h", base.func);
    f(this.view.graphics, gui.cellSize * 0.8, gui.cellSize * 0.8);

    this.view.x = x + gui.cellSize * 0.1;
    this.view.y = y + gui.cellSize * 0.1;

    var figure = this;
    var view = this.view;
    view.cursor = "pointer";

    view.on('mousedown', function (e) {
      if (figure.onBase) {
        figure.onBase = false;
        figure.base.recoverFigure();
      }
      var posX = e.stageX;
      var posY = e.stageY;
      view.offset = {x: view.x - posX, y: view.y - posY};
      gui.stage.setChildIndex(view, gui.stage.numChildren - 1);
    });

    view.on("pressmove", function (evt) {
      if (figure.holder != null) {
        figure.holder.figure = null;
        figure.holder = null;
      }
      view.x = evt.stageX + view.offset.x;
      view.y = evt.stageY + view.offset.y;
      figure.base.tarski.deselectAllConfig();
      var holder = figure.base.tarski.selectConfigHolder(evt.stageX, evt.stageY);
      if (holder != null) {
        figure.holder = holder;
        holder.figure = figure;
      }
    });

    view.on("pressup", function () {
      if (view.y > gui.activeHeight || figure.holder == null) {
        gui.stage.removeChild(figure.view);
      } else {
        if (figure.holder != null) {
          figure.view.x = figure.holder.view.x + gui.cellSize * 0.1;
          figure.view.y = figure.holder.view.y + gui.cellSize * 0.1;
          figure.holder.deselect();
        }
      }

    });
  }
  //</editor-fold>

  return {
    magic: function () {
      return new Tarski();
    }
  }

})
();


