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

  /**
   * Consider global connectors as connectors of big element
   * so, on the left is output and on the right is input (as for normal elements)
   *
   * but in config - inputs are on the left and outputs are on the right
   * @constructor
   */
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
       * Radius of connectors
       */
      connectorRadius: 5,
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
    delimiter.graphics.setStrokeStyle(2);
    delimiter.graphics.beginStroke("darkgray");
    delimiter.graphics.moveTo(0, 0);
    delimiter.graphics.lineTo(this.gui.width, 0);
    this.gui.stage.addChild(delimiter);

    this.initGlobalConnectors();
    this.initBases();

    this.gui.stage.enableMouseOver(10);
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
      var output = new Connector(i, 0, this.gui, this.gui.connectorFromElementSpace, i*(space)+space/2, false, null);
      this.outputs.push(output);
      this.gui.stage.addChild(makeConnectorLine(0, i*(space)+space/2, this.gui.connectorFromElementSpace));
      this.gui.stage.addChild(output.view);
    }

    space = this.gui.activeHeight/this.config.outputNum;
    for (var j = 0; j < this.config.outputNum; j++) {
      var input = new Connector(j, 0, this.gui, this.gui.width - this.gui.connectorFromElementSpace, j*(space)+space/2, true, null);
      this.inputs.push(input);
      this.gui.stage.addChild(makeConnectorLine(this.gui.width - this.gui.connectorFromElementSpace, j*(space)+space/2, this.gui.connectorFromElementSpace));
      this.gui.stage.addChild(input.view);
    }
  };

  /**
   * Creates bases
   */
  Scheme.prototype.initBases = function () {
    for (var i = 0; i < this.config.bases.length; i++) {
      var baseJson = this.config.bases[i];
      var base = new Base(baseJson.id, baseJson.inputNum, baseJson.outputNum, baseJson.func, baseJson.name, this.gui,
          i*(this.gui.elemWidth*2)+this.gui.elemWidth/2, this.gui.activeHeight+this.gui.elemConnectorSpace/2, this);
      this.bases.push(base);
    }
  };

  /**
   * Returns base by id
   * @param id
   * @returns {*}
   */
  Scheme.prototype.getBaseById = function(id){
    for (var i = 0; i < this.bases.length; i++) {
      var base = this.bases[i];
      if(base.id==id){
        return base;
      }
    }
    return null;
  };

  /**
   * Removes element from scheme
   * @param element
   */
  Scheme.prototype.removeElement = function(element){
    var index = this.elements.indexOf(element);
    this.elements.splice(index, 1);
    this.gui.stage.removeChild(element.view);
    element.removeConnectors();
  };

  /**
   * Deselects all connectors
   */
  Scheme.prototype.deselectAllConnectors = function (connector) {
    var scheme = this;
    for (var i = 0; i < scheme.elements.length; i++) {
      var element = scheme.elements[i];
      for (var j = 0; j < element.outputs.length; j++) {
        if(!connector || element.outputs[j]!=connector) {
          element.outputs[j].deselect();
        }
      }
      for (var k = 0; k < element.inputs.length; k++) {
        if(!connector || element.inputs[k]!=connector) {
          element.inputs[k].deselect();
        }
      }
    }


    for (var l = 0; l < this.inputs.length; l++) {
      this.inputs[l].deselect();
    }
    for (var m = 0; m < this.outputs.length; m++) {
      this.outputs[m].deselect();
    }

  };

  Scheme.prototype.load = function (solution) {
    for (var i = 0; i < this.elements.length; i++) {
      var oldElement = this.elements[i];
      this.gui.stage.removeChild(oldElement.view);
    }
    this.elements = [];
    for (var j = 0; j < solution.elements.length; j++) {
      var elementJson = solution.elements[j];
      var element = new Element(elementJson.id, this.getBaseById(elementJson.base), elementJson.x*this.gui.width, elementJson.y, this.gui);
      this.elements.push(element);
      this.gui.stage.addChild(element.view);
      element.makeConnectors();
      element.makeConnectorsInteractive();
    }

  };

  Scheme.prototype.solution = function () {
    var result = {};

    return result;
  };

  Scheme.prototype.reset = function () {
  };


  /**
   * Basic element
   * Contains recoverable element for drag'n'drop
   * And element just for background
   *
   * @param id - id
   * @param inputNum - amount of inputs
   * @param outputNum - amount of outputs
   * @param func - function
   * @param name - name of element
   * @param gui - global gui
   * @param x - x position on the scene
   * @param y - y position on the scene
   * @param scheme - scheme module
   * @constructor
   */
  function Base(id, inputNum, outputNum, func, name, gui, x, y, scheme) {
    this.id = id;
    this.inputNum = inputNum;
    this.outputNum = outputNum;
    this.func = func;
    this.name=name;
    this.gui = gui;
    this.x=x;
    this.y=y;
    this.scheme =scheme;

    var base = this;
    var elementBase = new Element(Element.counter+1, base, x, y, base.gui);
    elementBase.makeConnectors();
    elementBase.onBase=true;
    gui.stage.addChild(elementBase.view);

    this.recoverElement();
  }

  /**
   * recover draggable element with flag - onBase
   */
  Base.prototype.recoverElement = function(){
    var element = new Element(Element.counter+1, this, this.x, this.y, this.gui);
    element.makeConnectors();
    this.gui.stage.addChild(element.view);
    element.onBase = true;
  };


  /**
   * Scheme element
   * @param id - id
   * @param base - base element
   * @param x - x
   * @param y - y
   * @param gui - gui object
   * @constructor
   */
  function Element(id, base, x, y, gui){
    this.id=id;
    this.onBase = false;
    Element.counter = Math.max(this.id, Element.counter);
    this.base=base;
    this.x=x;
    this.y=y;
    this.inputs = [];
    this.outputs = [];
    this.gui=gui;

    this.view = new createjs.Container();
    var height = Math.max(base.inputNum, base.outputNum)*gui.elemConnectorSpace;
    var shape = new createjs.Shape();
    shape.graphics.beginStroke("darkgray");
    shape.graphics.beginFill("white");
    shape.graphics.drawRect(0, 0, gui.elemWidth, height);
    shape.x = gui.connectorFromElementSpace;
    this.view.addChild(shape);

    var text = new createjs.Text(base.name, gui.elemConnectorSpace*0.75 + "px Arial", "#000");
    text.x = gui.connectorFromElementSpace+((gui.elemWidth-text.getBounds().width)/2);
    text.y = (height-(gui.elemConnectorSpace*0.87))/2;
    this.view.addChild(text);

    this.view.x=x;
    this.view.y=y;

    var elem = this;
    var view = this.view;
    view.cursor = "pointer";

    view.on('mousedown', function(e){
      if(elem.onBase){
        elem.onBase=false;
        elem.base.recoverElement();
        elem.makeConnectorsInteractive();
        elem.base.scheme.elements.push(elem);
      }
      var posX = e.stageX;
      var posY = e.stageY;
      view.offset = {x: this.x - posX, y: this.y - posY};
      gui.stage.setChildIndex(view, gui.stage.numChildren-1);
      elem.makeConnectorsInFront();
    });

    view.on("pressmove", function(evt) {
      view.x = evt.stageX + view.offset.x;
      view.y = evt.stageY + view.offset.y;
      for (var i = 0; i < elem.inputs.length; i++) {
        var input = elem.inputs[i];
        input.view.x = input.relativeX+view.x;
        input.view.y = input.relativeY+view.y;
      }
      for (var j = 0; j < elem.outputs.length; j++) {
        var output = elem.outputs[j];
        output.view.x = output.relativeX+view.x;
        output.view.y = output.relativeY+view.y;
      }
    });

    view.on("pressup", function(evt) {
      if(view.y>gui.activeHeight){
        base.scheme.removeElement(elem);
      }
    });
  }

  /**
   * Make connectors and add to the stage
   */
  Element.prototype.makeConnectors = function(){
    var height = Math.max(this.base.inputNum, this.base.outputNum)*this.gui.elemConnectorSpace;

    var space = height/this.base.inputNum;
    for (var i = 0; i < this.base.inputNum; i++) {
      var input = new Connector(i, 0, this.gui, this.view.x, i*(space)+space/2+this.view.y,  true, this);
      input.relativeX = 0;
      input.relativeY = i*(space)+space/2;
      this.gui.stage.addChild(input.view);
      this.view.addChild(makeConnectorLine(this.gui.connectorRadius, i*(space)+space/2, this.gui.connectorFromElementSpace-this.gui.connectorRadius));
      this.inputs.push(input);
    }

    space = height/this.base.outputNum;
    for (var j = 0; j < this.base.outputNum; j++) {
      var output = new Connector(j, 0, this.gui, this.gui.connectorFromElementSpace*2+this.gui.elemWidth+this.view.x, j*(space)+space/2+this.view.y, false, this);
      output.relativeX=this.gui.connectorFromElementSpace*2+this.gui.elemWidth;
      output.relativeY = j*(space)+space/2;
      this.gui.stage.addChild(output.view);
      this.view.addChild(makeConnectorLine(this.gui.connectorFromElementSpace+this.gui.elemWidth, j*(space)+space/2, this.gui.connectorFromElementSpace-this.gui.connectorRadius));
      this.outputs.push(output);
    }
  };

  /**
   * Removes connectors from the stage
   */
  Element.prototype.removeConnectors = function(){
    for (var i = 0; i < this.inputs.length; i++) {
      var input = this.inputs[i];
      this.gui.stage.removeChild(input.view);
    }
    for (var j = 0; j < this.outputs.length; j++) {
      var output = this.outputs[j];
      this.gui.stage.removeChild(output.view);
    }
  };

  /**
   * Make all connectors interactive
   */
  Element.prototype.makeConnectorsInteractive=function(){
    for (var i = 0; i < this.inputs.length; i++) {
      var input = this.inputs[i];
      input.makeInteractive();
    }
    for (var j = 0; j < this.outputs.length; j++) {
      var output = this.outputs[j];
      output.makeInteractive();
    }
  };

  /**
   * Move connectors in front of stage
   */
  Element.prototype.makeConnectorsInFront=function(){
    for (var i = 0; i < this.inputs.length; i++) {
      var input = this.inputs[i];
      this.gui.stage.setChildIndex(input.view, this.gui.stage.numChildren-1);
    }
    for (var j = 0; j < this.outputs.length; j++) {
      var output = this.outputs[j];
      this.gui.stage.setChildIndex(output.view, this.gui.stage.numChildren-1);
    }
  };

  Element.counter = 0;


  /**
   * Connector
   * Can be global or element
   * @param number
   * @param value
   * @param gui
   * @param x
   * @param y
   * @param input
   * @param element
   * @constructor
   */
  function Connector(number, value, gui, x, y, input, element) {
    this.number = number;
    this.value = value;
    this.view = new createjs.Container();
    this.view.x = x;
    this.view.y = y;
    this.input=input;
    this.element=element;
    this.gui=gui;
    //positions from element
    this.relativeX = 0;
    this.relativeY = 0;
    //positions before drag
    this.initilaX = 0;
    this.initialY = 0;
    //line while dragging
    this.line = null;

    // link to connected connectors
    this.linkInput = null;
    this.linkOutputs = [];

    // connection line
    this.inputLine=null;

    this.deselect();

  }

  Connector.prototype.select = function(){
    if(this.shape){
      this.view.removeChild(this.shape);
    }
    var shape = new createjs.Shape();
    if(this.input) {
      shape.graphics.beginStroke("#337ab7");
      shape.graphics.beginFill("white");
    }else{
      shape.graphics.beginFill("#337ab7");
    }
    shape.graphics.drawCircle(0, 0, this.gui.connectorRadius*1.25);
    this.view.addChild(shape);
    this.shape=shape;
  };

  Connector.prototype.deselect = function(){
    if(this.shape){
      this.view.removeChild(this.shape);
    }
    var shape = new createjs.Shape();
    if(this.input) {
      shape.graphics.beginStroke("darkgray");
      shape.graphics.beginFill("white");
    }else{
      shape.graphics.beginFill("darkgray");
    }
    shape.graphics.drawCircle(0, 0, this.gui.connectorRadius);
    this.view.addChild(shape);
    this.shape=shape;
  };

  /**
   * Make connector interactive
   */
  Connector.prototype.makeInteractive = function(){
    var view = this.view;
    view.cursor = 'pointer';

    var gui = this.gui;
    var connector = this;
    var line = this.line;

    view.on('mousedown', function (e) {
      var posX = e.stageX;
      var posY = e.stageY;
      view.offset = {x: this.x - posX, y: this.y - posY};
      gui.stage.setChildIndex(view, gui.stage.numChildren - 1);
      connector.initialX = view.x;
      connector.initialY = view.y;
    });

    view.on("pressmove", function (evt) {
      view.x = evt.stageX + view.offset.x;
      view.y = evt.stageY + view.offset.y;
      if(line!=null){
        gui.stage.removeChild(line);
      }

      line = new createjs.Shape();
      line.graphics.setStrokeStyle(1);
      line.graphics.beginStroke("darkgray");

      line.graphics.moveTo(view.x, view.y);
      line.graphics.lineTo(connector.input?connector.initialX+gui.connectorRadius:connector.initialX-gui.connectorRadius, connector.initialY);
      connector.line = line;

      gui.stage.addChild(line);
      gui.stage.setChildIndex(view, gui.stage.numChildren - 1);

      connector.element.base.scheme.deselectAllConnectors(connector);
      var linking = connector.getLinking();
      if(linking!=null){
        linking.select();
      }
    });

    view.on("pressup", function(evt) {
      connector.element.base.scheme.deselectAllConnectors();
      view.x=connector.initialX;
      view.y=connector.initialY;
      if(connector.line!=null){
        gui.stage.removeChild(connector.line);
      }
    });
  };

  /**
   * Get linked connector near current
   */
  Connector.prototype.getLinking = function(){
    var scheme = this.element.base.scheme;
    for (var i = 0; i < scheme.elements.length; i++) {
      var element = scheme.elements[i];
      if(this.input){
        for (var j = 0; j < element.outputs.length; j++) {
          var output = element.outputs[j];
          if(this.isNear(output)){
            return output;
          }
        }
      }else{
        for (var k = 0; k < element.inputs.length; k++) {
          var input = element.inputs[k];
          if(this.isNear(input)){
            return input;
          }
        }
      }
    }
    if(this.input) {
      for (var m = 0; m < scheme.outputs.length; m++) {
        var globalOutput = scheme.outputs[m];
        if (this.isNear(globalOutput)) {
          return globalOutput;
        }
      }
    }
      for (var n = 0; n < scheme.inputs.length; n++) {
        var globalInput = scheme.inputs[n];
        if(this.isNear(globalInput)){
          return globalInput;
        }
      }
    return null;
  };

  /**
   * Is connector near to another
   * @param another
   */
  Connector.prototype.isNear = function(another){
    var x1 = this.view.x;
    var y1 = this.view.y;
    var x2 = another.view.x;
    var y2 = another.view.y;
    return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))<this.gui.connectorRadius;
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


