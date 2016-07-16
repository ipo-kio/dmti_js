/**
 *
 * config{
 *  bases:[
 *    {id: 1, "inputNum":"2","outputNum":"1","func":"output[0]=input[0]&input[1]","name":"AND"},
 *    {id: 2, "inputNum":"2","outputNum":"1","func":"output[0]=input[0]|input[1]","name":"OR"}
 *    ],
 *   level:"boolean",
 *   inputNum:"2",
 *   outputNum:"3"
 *  }
 *
 *
 * solution{
 *  elements: [{id:'1' x: '51%', y: '304', base: 1}],
 *  lines: [{from: 'output1', to: 'elem_1_input2'}]
 * }
 *
 *
 * @constructor
 */

var qwerty00003 = (function () {

  function Scheme() {

    this.gui = {
      stage: {},

      width: 0,
      /**
       * space between global connectors
       */
      connectorSpace: 100,
      /**
       * space between element connectors
       */
      elemConnectorSpace: 20,
      /**
       * space between connector and element
       */
      connectorFromElementSpace: 10,
      /**
       * width of element
       */
      elemWidth: 50,
      /**
       * Height of active scene without toolbox
       */
      activeHeight: 0,
      /**
       * Height of toolbox with elements
       */
      toolboxHeight: 0
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

    /**
     * array of elements
     * @type {Array}
     */
    this.elements = [];

    /**
     * Global input connectors
     * @type {Array}
     */
    this.inputs = [];

    /**
     * Global output connectors
     * @type {Array}
     */
    this.outputs = [];

    /**
     * Arrays of bases elements
     * @type {Array}
     */
    this.bases = [];

  }

  //noinspection all
  Scheme.prototype.layout = '<style>#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .top-buffer{margin-top:20px}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row top-buffer"><div class="col-sm-12"><div class="it-controls"><div class="btn-group" role="group"><button class="it-control-decrease" type="button" class="btn btn-default">Предыдущий входной набор</button> <button class="it-control-increase" type="button" class="btn btn-default">Следующий входной набор</button></div></div></div></div></div>';//###layout

  Scheme.prototype.init = function (divId, taskWidth, config) {
    this.divId = divId;
    this.config = config;

    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
    var $scene = $("#" + divId + " .it-scene");
    $scene.attr("id", divId + "-it-scene");
    $scene.attr("width", taskWidth - 40);
    var $task = $("#" + divId + " .it-task");
    $task.css("max-width", taskWidth + "px");
    $task.css("min-width", taskWidth + "px");

    this.initHeight();

    $scene.attr("height", (this.gui.activeHeight + this.gui.toolboxHeight) + "px");

    this.gui.stage = new createjs.Stage(divId + "-it-scene");
    this.gui.stage.mouseMoveOutside = true;
    this.gui.width = taskWidth - 40;

    var delimiter = new createjs.Shape();
    delimiter.y = this.gui.activeHeight;
    delimiter.graphics.setStrokeStyle(1);
    delimiter.graphics.beginStroke("black");
    delimiter.graphics.moveTo(0, 0);
    delimiter.graphics.lineTo(this.gui.width, 0);
    this.gui.stage.addChild(delimiter);

    this.initGlobalConnectors();
    this.initBases();

    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);
  };

  /**
   * Calculates height of active zone and toolbox
   * use gui.connectorSpace and gui.elemConnectorSpace
   */
  Scheme.prototype.initHeight = function () {
    var maxGlobalConnectors = Math.max(this.config.inputNum, this.config.outputNum);
    this.gui.activeHeight = ((maxGlobalConnectors) * this.gui.connectorSpace);

    var maxBaseConnectors = 0;
    for (var i = 0; i < this.config.bases.length; i++) {
      var base = this.config.bases[i];
      maxBaseConnectors = Math.max(maxBaseConnectors, Math.max(base.inputNum, base.outputNum));
    }
    this.gui.toolboxHeight = (maxBaseConnectors + 1) * this.gui.elemConnectorSpace;
  };

  /**
   * Creates global connectors and add to stage
   */
  Scheme.prototype.initGlobalConnectors = function () {
    var space = this.gui.activeHeight/this.config.inputNum;
    for (var i = 0; i < this.config.inputNum; i++) {
      var input = new Connector(i, 0, this.gui, this.gui.connectorFromElementSpace, i*(space)+space/2);
      this.inputs.push(input);
      this.gui.stage.addChild(input.view);
      this.gui.stage.addChild(makeConnectorLine(0, i*(space)+space/2, this.gui.connectorFromElementSpace));
    }

    space = this.gui.activeHeight/this.config.outputNum;
    for (var j = 0; j < this.config.outputNum; j++) {
      var output = new Connector(j, 0, this.gui, this.gui.width - this.gui.connectorFromElementSpace, j*(space)+space/2);
      this.outputs.push(output);
      this.gui.stage.addChild(output.view);
      this.gui.stage.addChild(makeConnectorLine(this.gui.width - this.gui.connectorFromElementSpace, j*(space)+space/2, this.gui.connectorFromElementSpace));
    }
  };

  /**
   * Creates bases
   */
  Scheme.prototype.initBases = function () {
    for (var i = 0; i < this.config.bases.length; i++) {
      var baseJson = this.config.bases[i];
      var base = new Base(baseJson.id, baseJson.inputNum, baseJson.outputNum, baseJson.func, baseJson.name, this.gui);
      this.bases.push(base);
      base.view.x = i*(this.gui.elemWidth*2)+this.gui.elemWidth/2;
      base.view.y = this.gui.activeHeight+this.gui.elemConnectorSpace/2;
      this.gui.stage.addChild(base.view);
    }
  };

  Scheme.prototype.load = function (solution) {
    this.groups = [];

  };

  Scheme.prototype.solution = function () {
    var result = {};

    return result;
  };

  Scheme.prototype.reset = function () {
  };


  function Connector(number, value, gui, x, y) {
    this.number = number;
    this.value = value;
    this.view = new createjs.Container();
    this.view.x = x;
    this.view.y = y;

    var shape = new createjs.Shape();
    shape.graphics.beginFill("darkgray");
    shape.graphics.drawCircle(0, 0, 5);
    this.view.addChild(shape);

  }

  /**
   * Basic elements
   * @param id - id
   * @param inputNum - amount of inputs
   * @param outputNum - amount of outputs
   * @param func - function
   * @param name - name of element
   * @param gui - global gui
   * @constructor
   */
  function Base(id, inputNum, outputNum, func, name, gui) {
    this.id = id;
    this.inputNum = inputNum;
    this.outputNum = outputNum;
    this.func = func;
    this.gui = gui;

    this.view = new createjs.Container();
    var height = Math.max(inputNum, outputNum)*gui.elemConnectorSpace;
    var shape = new createjs.Shape();
    shape.graphics.beginStroke("darkgray");
    shape.graphics.drawRect(0, 0, gui.elemWidth, height);
    shape.x = gui.connectorFromElementSpace;
    this.view.addChild(shape);

    var text = new createjs.Text(name, gui.elemConnectorSpace*0.75 + "px Arial", "#000");
    text.x = gui.connectorFromElementSpace+((gui.elemWidth-text.getBounds().width)/2);
    text.y = (height-(gui.elemConnectorSpace*0.87))/2;
    this.view.addChild(text);

    var space = height/inputNum;
    for (var i = 0; i < inputNum; i++) {
      var input = new Connector(i, 0, gui, 0, i*(space)+space/2);
      this.view.addChild(input.view);
      this.view.addChild(makeConnectorLine(0, i*(space)+space/2, gui.connectorFromElementSpace));
    }

    var space = height/outputNum;
    for (var j = 0; j < outputNum; j++) {
      var output = new Connector(j, 0, gui, gui.connectorFromElementSpace*2+gui.elemWidth, j*(space)+space/2);
      this.view.addChild(output.view);
      this.view.addChild(makeConnectorLine(gui.connectorFromElementSpace+gui.elemWidth, j*(space)+space/2, gui.connectorFromElementSpace));
    }


  }

  Base.prototype.toString = function () {
    return this.inputNum + "[" + this.outputNum + "]" + " > " + this.func;
  };

  /**
   * Creates line for connector in specific place
   * @param x
   * @param y
   */
  function makeConnectorLine (x, y, length){
    var line = new createjs.Shape();
    line.y = y;
    line.x = x;
    line.graphics.setStrokeStyle(1);
    line.graphics.beginStroke("darkgray");
    line.graphics.moveTo(0, 0);
    line.graphics.lineTo(length, 0);
    return line;
  }


  return {
    magic: function () {
      return new Scheme();
    }
  }

})
();


