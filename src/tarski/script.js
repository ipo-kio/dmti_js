/**
 *
 * config{
 *  figures:[
 *    {"id": "bC", "props": {"color": "blue", "size": "big", "shape": "cube"},
 *    "draw": "g.beginFill(\\"blue\\"); g.drawRect(0, 0, w, h);"},
 *    {"id": "rC", "props": {"color": "red", "size": "big", "shape": "cube"},
 *    "draw": "g.beginFill(\\"red\\"); g.drawRect(0, 0, w, h);"},
 *    ],
 *   "variables":[
 *    {}
 *   ],
 *   "predicated":[
 *    {}
 *   ],
 *   "operations":[
 *    {}
 *   ],
 *   "configsize": 5,
 *   "smilers":[
 *    {"id": "bC", "x": 0, "y": 0}
 *   ],
 *   "saders":[
      {"id": "rC", "x": 3, "y": 3}
 *   ]
 *  }
 *
 *
 * solution{
 *   smilers:[
 *    {id: "bC", x: 0, y: 0}
 *   ],
 *   saders:[
      {id: "bC", x: 3, y: 3}
 *   ],
 *   formulas:[
 *    "upper(x,y)",
 *    "upper(x,z)"
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

      cellSize: 0
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

    this.smilers={};

    this.saders={};

    this.bases=[];

  }

  //noinspection all
  Tarski.prototype.layout = '<style>#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .top-buffer{margin-top:20px}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row"><div id="buttons_container"><div class="row"><div class="col-sm-12"><button data-toggle="tooltip" data-placement="top" title="Создать новую формулу" class="btn btn-default" id="Tarski_createf"><span class="glyphicon glyphicon-plus" aria-hidden="true">Добавить формулу</span></button> <button data-toggle="tooltip" data-placement="top" title="Стереть символ перед курсором" class="btn btn-default" id="Tarski_clearf"><span class="glyphicon glyphicon-arrow-left" aria-hidden="true">Стереть символ</span></button> <button data-toggle="tooltip" data-placement="top" title="Удалить активную формулу" class="btn btn-default" id="Tarski_clearfor"><span class="glyphicon glyphicon-remove" aria-hidden="true">Удалить формулу</span></button><div class="btn-group" role="group" aria-label="Форма записи"><button data-toggle="tooltip" data-placement="top" title="Отобразить формулы, используя простую запись" class="btn btn-default" id="Tarski_formats">Простая запись</button> <button data-toggle="tooltip" data-placement="top" title="Отобразить формулы, используя формальную запись" class="btn btn-default" id="Tarski_formatf">Формальная запись</button></div></div></div><br><div class="row"><div class="col-sm-2"><p class="lead">Кванторы</p><button data-toggle="tooltip" data-placement="top" title="ДЛЯ ВСЕХ" class="btn btn-default" id="Tarski_all">ДЛЯ ВСЕХ</button><br><button data-toggle="tooltip" data-placement="top" title="СУЩЕСТВУЕТ ТАКОЙ, ЧТО" class="btn btn-default" id="Tarski_exist">СУЩЕСТВУЕТ</button></div><div class="col-sm-2"><p class="lead">Переменные</p><button data-toggle="tooltip" data-placement="top" title="X" class="btn btn-default" id="Tarski_x">X</button> <button data-toggle="tooltip" data-placement="top" title="Y" class="btn btn-default" id="Tarski_y">Y</button> <button data-toggle="tooltip" data-placement="top" title="Z" class="btn btn-default" id="Tarski_z">Z</button></div><div class="col-sm-4"><p class="lead">Предикаты</p><button data-toggle="tooltip" data-placement="top" title="мальнького размера" class="btn btn-default" id="Tarski_small">малый _</button> <button data-toggle="tooltip" data-placement="top" title="большого размера" class="btn btn-default" id="Tarski_big">большой _</button><br><button data-toggle="tooltip" data-placement="top" title="красного цвета" class="btn btn-default" id="Tarski_red">красный _</button> <button data-toggle="tooltip" data-placement="top" title="синего цвета" class="btn btn-default" id="Tarski_blue">синий _</button><br><button data-toggle="tooltip" data-placement="top" title="имеет форму шара" class="btn btn-default" id="Tarski_sphere">шар _</button> <button data-toggle="tooltip" data-placement="top" title="имеет форму куба" class="btn btn-default" id="Tarski_cube">куб _</button><br><button data-toggle="tooltip" data-placement="top" title="стоит левее, чем" class="btn btn-default" id="Tarski_lefter">_ левее _</button> <button data-toggle="tooltip" data-placement="top" title="стоит выше, чем" class="btn btn-default" id="Tarski_upper">_ выше _</button><br><button data-toggle="tooltip" data-placement="top" title="стоит рядом с" class="btn btn-default" id="Tarski_near">_ рядом _</button></div><div class="col-sm-4"><p class="lead">Операции</p><button data-toggle="tooltip" data-placement="top" title="И" class="btn btn-default" id="Tarski_and">И</button> <button data-toggle="tooltip" data-placement="top" title="ИЛИ" class="btn btn-default" id="Tarski_or">ИЛИ</button> <button data-toggle="tooltip" data-placement="top" title="СЛЕДОВАТЕЛЬНО" class="btn btn-default" id="Tarski_impl">=></button> <button data-toggle="tooltip" data-placement="top" title="ТОГДА И ТОЛЬКО ТОГДА, КОГДА" class="btn btn-default" id="Tarski_eq">=</button> <button data-toggle="tooltip" data-placement="top" title="НЕ ВЕРНО, ЧТО" class="btn btn-default" id="Tarski_not">НЕ ВЕРНО, ЧТО</button> <button data-toggle="tooltip" data-placement="top" title="(" class="btn btn-default" id="Tarski_lb">(</button> <button data-toggle="tooltip" data-placement="top" title=")" class="btn btn-default" id="Tarski_rb">)</button></div></div></div><div id="statement_container"></div></div></div>';//###layout

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
      this.bases.push(new Base(this, figure.id, figure.props, figure.draw, this.gui, this.gui.toolMargin+this.gui.cellSize*i, this.gui.toolMargin+this.gui.activeHeight));
    }

    this.smilers=new Configuration(this.gui, this.gui.cellSize, this.config.configsize, this.gui.configMargin, this.gui.configMargin);
    this.saders=new Configuration(this.gui, this.gui.cellSize, this.config.configsize, this.gui.configMargin*3+this.gui.cellSize*config.configsize, this.gui.configMargin);

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


  Tarski.prototype.getBase = function (code) {
    for (var i = 0; i < this.bases.length; i++) {
      var base = this.bases[i];
      if(base.id==code){
        return base;
      }
    }
    return null;
  };

  Tarski.prototype.load = function (solution) {
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
  };

  Tarski.prototype.solution = function () {
    var result = {};
    result.smilers=[];
    result.saders=[];
    var holder;
    for (var i = 0; i < this.smilers.holders.length; i++) {
      holder = this.smilers.holders[i];
      if(holder.figure!=null){
        result.smilers.push(holder.toConf());
      }
    }
    for (var j = 0; j < this.saders.holders.length; j++) {
      holder = this.saders.holders[j];
      if(holder.figure!=null){
        result.saders.push(holder.toConf());
      }
    }
    return result;
  };

  Tarski.prototype.reset = function () {
  };

  Tarski.prototype.deselectAllConfig = function(){
    this.smilers.deselectAll();
    this.saders.deselectAll();
  };

  Tarski.prototype.selectConfigHolder = function(x, y){
    var holder = this.smilers.find(x, y);
    if(holder==null){
      holder = this.saders.find(x,y);
    }
    if(holder!=null){
      holder.select();
      return holder;
    }
  };

  function Configuration(gui, cellSize, size, x, y){
    this.holders=[];
    this.gui=gui;
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        this.holders.push(new ConfigHolder(gui, cellSize, x+i*cellSize, y+j*cellSize, i, j));
      }

    }
  }


  Configuration.prototype.addFigure = function(figure, i, j){
    for (var k = 0; k < this.holders.length; k++) {
      var holder = this.holders[k];
      if(holder.i==i && holder.j==j){
        figure.holder=holder;
        holder.figure=figure;
        figure.view.x=figure.holder.view.x+this.gui.cellSize*0.1;
        figure.view.y=figure.holder.view.y+this.gui.cellSize*0.1;
      }
    }
  };


  Configuration.prototype.deselectAll = function(){
    for (var i = 0; i < this.holders.length; i++) {
      var obj = this.holders[i];
      obj.deselect();
    }
  };

  Configuration.prototype.find = function(x, y){
    for (var i = 0; i < this.holders.length; i++) {
      var obj = this.holders[i];
      if(obj.figure==null){
        if(obj.view.x<x && obj.view.y<y
            && obj.view.x+obj.cellSize>x
            && obj.view.y+obj.cellSize>y) {
          return obj;
        }
      }
    }
    return null;
  };

  function ConfigHolder(gui, cellSize, x, y, i, j){
    this.figure=null;
    this.cellSize=cellSize;
    this.i=i;
    this.j=j;
    this.view = new createjs.Shape();
    this.view.graphics.beginStroke("gray");
    this.view.graphics.drawRect(0,0,cellSize, cellSize);
    this.view.x=x;
    this.view.y=y;
    gui.stage.addChild(this.view);

  }

  ConfigHolder.prototype.toConf = function(){
    var result = {};
    result.x=this.i;
    result.y=this.j;
    result.id=this.figure.base.id;
    return result;
  };

  ConfigHolder.prototype.deselect = function(){
    this.view.graphics.clear();
    this.view.graphics.beginStroke("gray");
    this.view.graphics.drawRect(0,0,this.cellSize, this.cellSize);
  };


  ConfigHolder.prototype.select = function(){
    this.view.graphics.clear();
    this.view.graphics.beginStroke("gray");
    this.view.graphics.beginFill("#fcf8e3");
    this.view.graphics.drawRect(0,0,this.cellSize, this.cellSize);
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
    this.prop=prop;
    this.func = func;
    this.gui = gui;
    this.x=x;
    this.y=y;
    this.tarski=tarski;

    var base = this;
    this.figureBase = new Figure(base, x, y, base.gui);
    this.figureBase.onBase=true;
    gui.stage.addChild(this.figureBase.view);

    this.recoverFigure();
  }

  /**
   * recover draggable figure with flag - onBase
   */
  Base.prototype.recoverFigure = function(){
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
  function Figure(base, x, y, gui){
    this.onBase = false;
    this.base=base;
    this.x=x;
    this.y=y;
    this.gui=gui;
    this.holder=null;

    this.view = new createjs.Shape();
    var f = Function("g","w","h",base.func);
    f(this.view.graphics, gui.cellSize*0.8, gui.cellSize*0.8);

    this.view.x=x+gui.cellSize*0.1;
    this.view.y=y+gui.cellSize*0.1;

    var figure = this;
    var view = this.view;
    view.cursor = "pointer";

    view.on('mousedown', function(e){
      if(figure.onBase){
        figure.onBase=false;
        figure.base.recoverFigure();
      }
      var posX = e.stageX;
      var posY = e.stageY;
      view.offset = {x: view.x - posX, y: view.y - posY};
      gui.stage.setChildIndex(view, gui.stage.numChildren-1);
    });

    view.on("pressmove", function(evt) {
      if(figure.holder!=null){
        figure.holder.figure=null;
        figure.holder=null;
      }
      view.x = evt.stageX + view.offset.x;
      view.y = evt.stageY + view.offset.y;
      figure.base.tarski.deselectAllConfig();
      var holder = figure.base.tarski.selectConfigHolder(evt.stageX,evt.stageY);
      if(holder!=null){
        figure.holder=holder;
        holder.figure=figure;
      }
    });

    view.on("pressup", function() {
      if(view.y>gui.activeHeight || figure.holder==null){
        gui.stage.removeChild(figure.view);
      }else{
        if(figure.holder!=null){
          figure.view.x=figure.holder.view.x+gui.cellSize*0.1;
          figure.view.y=figure.holder.view.y+gui.cellSize*0.1;
          figure.holder.deselect();
        }
      }

    });
  }



  return {
    magic: function () {
      return new Tarski();
    }
  }

})
();


