/**
 *
 * config{
 *   "vertexsize": 5,
 *   "height": 500,
 *   "alphabet": abc,
 *  }
 *
 *
 * solution{
 *   states:[
 *    {id: "v1", x: 0, y: 0, start: true, finish: false},
 *    {id: "v2", x: 10, y: 10, start: false, finish: false}
 *   ],
 *   transitions:[
 *    {id: "e1", from: v1, to: v2, symbol: a}
 *   ]
 * }
 *
 *
 * @constructor
 */
var qwerty00006 = (function () {

  /**
   * @constructor
   */
  function Fsm() {

    this.gui = {
      stage: {},

      width: 0,

      height: 0,

      vertexMargin: 5,

      vertexSize: 10,

      vertexColor: "#5bc0de",

      vertexColorDark: "#1b6d85",

      vertexStrokeColor: "#46b8da",

      vertexStrokeColorDark: "#000",

      vertexBorderColor: "#bbbbbb",

      edgeColor: "#ababab"

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

    this.states = [];

    this.transitions = [];

    /**
     * vertex toolbox
     * @type {{}}
     */
    this.base = {};

    /**
     * vertex toolbox
     * @type {{}}
     */
    this.baseFinal = {};

    this.firstState = {};

  }

  //noinspection all
  Fsm.prototype.layout = '<style>#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .top-buffer{margin-top:20px}#divId .it-logic-buttons button{margin:3px}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene"></canvas></div></div><div class="row top-buffer it-tool-buttons"></div></div>';//###layout

  Fsm.prototype.init = function (divId, taskWidth, config) {
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
    this.gui.height = config.height;
    this.gui.vertexSize = config.vertexsize;
    this.gui.vertexMargin = Math.max(this.gui.vertexMargin, this.gui.vertexSize / 2);

    $scene.attr("height", (config.height + config.vertexsize + this.gui.vertexMargin * 2) + "px");

    this.gui.stage = new createjs.Stage(divId + "-it-scene");
    this.gui.stage.mouseMoveOutside = true;

    this.gui.bg = new createjs.Shape();
    this.gui.bg.graphics.beginFill("white");
    this.gui.bg.graphics.drawRect(0, 0, this.gui.width, this.gui.height);
    this.gui.stage.addChild(this.gui.bg);


    var delimiter = new createjs.Shape();
    delimiter.y = config.height;
    delimiter.graphics.setStrokeStyle(2);
    delimiter.graphics.beginStroke("darkgray");
    delimiter.graphics.moveTo(0, 0);
    delimiter.graphics.lineTo(this.gui.width, 0);
    this.gui.stage.addChild(delimiter);

    this.base = new Base(this, this.gui, this.gui.vertexMargin, this.gui.height + this.gui.vertexMargin, false);
    this.baseFinal = new Base(this, this.gui, this.gui.vertexMargin*2+this.gui.vertexSize, this.gui.height + this.gui.vertexMargin, true);

    this.gui.stage.enableMouseOver(10);
    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);

    var graph = this;
    this.gui.bg.on('mousedown', function (e) {
      graph.deselectAllVertexes();
    });

    this.firstState = new State(this.gui.width/10, this.gui.height/2, false, this.gui, this, null);
    this.firstState.updateLabel("S0");
    this.firstState.id = "v0";
    this.states.push(this.firstState);
    this.gui.stage.addChild(this.firstState.view);
  };

  Fsm.prototype.addVertex = function (vertex) {
    for (var i = 0; i < 10000; i++) {
      if (this.getVertex("v" + i) == null) {
        vertex.id = "v" + i;
        vertex.updateLabel("S"+i);
        this.states.push(vertex);
        return;
      }
    }
    console.error("too many states... ")
  };

  Fsm.prototype.getEdge = function (v1, v2) {
    for (var i = 0; i < this.transitions.length; i++) {
      var edge = this.transitions[i];
      if(edge.v1==v1 && edge.v2==v2){
        return edge;
      }
    }
    return null;
  };

  Fsm.prototype.getEdgeIndexForVertexes = function (e) {
    var count = 0;
    for (var i = 0; i < this.transitions.length; i++) {
      var edge = this.transitions[i];
      if(edge==e){
        return count;
      }
      if(edge.v1==e.v1 && edge.v2==e.v2 || edge.v2==e.v1 && edge.v1==e.v2){
        count++;
      }
    }
    return null;
  };

  Fsm.prototype.addEdge = function (v1, v2, label) {
      var edge = new Transition(v1, v2, this.gui, this);
      this.transitions.push(edge);
      v1.transitions.push(edge);
      if(v1!=v2) {
        v2.transitions.push(edge);
      }
      edge.update();
    if(label){
      edge.updateLabel(label);
    }else{
      var labels = this.config.alphabet.split("");
      for (var i = 0; i < v1.transitions.length; i++) {
        if(v1.transitions[i].v1==v1) {
          var label = v1.transitions[i].label;
          if (labels.indexOf(label) >= 0) {
            labels.splice(labels.indexOf(label), 1);
          }
        }
      }
      if(labels.length>0){
        edge.updateLabel(labels[0]);
      }
    }
  };

  Fsm.prototype.canAddEdge = function(v1){
    var count = 0;
    if(v1.final){
      return false;
    }
    for (var i = 0; i < v1.transitions.length; i++) {
      if(v1.transitions[i].v1==v1) {
          count++;
      }
    }
    return count<this.config.alphabet.split("").length;
  };

  Fsm.prototype.removeVertex = function (vertex) {
    for (var i = vertex.transitions.length-1; i >= 0; i--) {
      var edge = vertex.transitions[i];
      this.removeEdge(edge);
    }
    var index = this.states.indexOf(vertex);
    this.states.splice(index, 1);
  };

  Fsm.prototype.removeEdge = function (edge) {
    var edgeIndex = this.transitions.indexOf(edge);
    edge.v1.transitions.splice(edge.v1.transitions.indexOf(edge), 1);
    if(edge.v1!=edge.v2) {
      edge.v2.transitions.splice(edge.v2.transitions.indexOf(edge), 1);
    }
    this.gui.stage.removeChild(edge.line);
    this.gui.stage.removeChild(edge.backline);
    this.gui.stage.removeChild(edge.text);
    this.transitions.splice(edgeIndex, 1);
  };



  Fsm.prototype.getVertex = function (id) {
    for (var i = 0; i < this.states.length; i++) {
      var vertex = this.states[i];
      if (vertex.id == id) {
        return vertex;
      }
    }
    return null;
  };

  Fsm.prototype.getVertexByCoords = function (x, y) {
    for (var i = 0; i < this.states.length; i++) {
      var vertex = this.states[i];
      if (vertex.view.x<x && vertex.view.y<y &&
       vertex.view.x+this.gui.vertexSize>x &&
       vertex.view.y+this.gui.vertexSize>y ) {
        return vertex;
      }
    }
    return null;
  };
  
  Fsm.prototype.deselectAllVertexes = function(){
    for (var i = 0; i < this.states.length; i++) {
      this.states[i].deselect();
    }
  };

  Fsm.prototype.hideBordersExcept = function(vertex){
    for (var i = 0; i < this.states.length; i++) {
      if(this.states[i]!=vertex) {
        this.states[i].hideBorder();
      }
    }
  };

  Fsm.prototype.load = function (solution) {
    for (var i = 0; i < this.transitions.length; i++) {
      this.removeEdge(this.transitions[i]);
    }
    for (var i = 0; i < this.states.length; i++) {
      this.gui.stage.removeChild(this.states[i].view);
      this.removeVertex(this.states[i]);
    }

    for (var i = 0; i < solution.states.length; i++) {
      var v = solution.states[i];
      var vertex = new State(v.x * this.gui.width, v.y * this.gui.height, v.final, this.gui, this, null);
      if(v.first){
        this.firstState = vertex;
      }
      vertex.updateLabel(v.label);
      vertex.id = v.id;
      this.states.push(vertex);
      this.gui.stage.addChild(vertex.view);
    }
    for (var j = 0; j < solution.transitions.length; j++) {
      var e = solution.transitions[j];
      this.addEdge(this.getVertex(e.from), this.getVertex(e.to), e.label);
    }
  };

  Fsm.prototype.solution = function () {
    var result = {};
    result.states = [];
    result.transitions = [];
    for (var i = 0; i < this.states.length; i++) {
      var state = this.states[i];
      result.states.push({id: state.id, x: state.view.x / this.gui.width, y: state.view.y / this.gui.height,
        final: state.final, label: state.label, first: state==this.firstState});
    }
    for (var j = 0; j < this.transitions.length; j++) {
      var transition = this.transitions[j];
      result.transitions.push({from: transition.v1.id, to: transition.v2.id});
    }
    return result;
  };

  function Base(graph, gui, x, y, final) {
    this.gui = gui;
    this.x = x;
    this.y = y;
    this.graph = graph;
    this.final = final;

    var base = this;
    this.vertexBase = new State(x, y, this.final, gui, base.graph, base);
    this.vertexBase.onBase = true;
    gui.stage.addChild(this.vertexBase.view);

    this.recoverVertex();
  }

  /**
   * recover draggable vertex with flag - onBase
   */
  Base.prototype.recoverVertex = function () {
    this.vertexBase = new State(this.x, this.y, this.final, this.gui, this.graph, this);
    this.gui.stage.addChild(this.vertexBase.view);
    this.vertexBase.onBase = true;
  };

  function State(x, y, final, gui, graph, base) {
    this.gui = gui;
    this.view = new createjs.Container();
    this.transitions = [];
    this.label="";
    this.final = final;

    this.border = new createjs.Shape();
    this.border.graphics.beginStroke(gui.vertexBorderColor);
    this.border.graphics.setStrokeDash([10,5], 0);
    this.border.graphics.drawCircle(gui.vertexSize / 2, gui.vertexSize / 2, gui.vertexSize);

    this.circle = new createjs.Shape();
    if(this.final){
      this.circle.graphics.beginStroke(gui.vertexStrokeColorDark);
    }else{
      this.circle.graphics.beginStroke(gui.vertexStrokeColor);
    }
    this.circle.graphics.beginFill(gui.vertexColor);
    this.circle.graphics.drawCircle(gui.vertexSize / 2, gui.vertexSize / 2, gui.vertexSize / 2);

    this.mover = new createjs.Shape();
    this.mover.graphics.beginFill(gui.vertexBorderColor);
    this.mover.graphics.drawCircle(0, 0, gui.vertexSize/4);
    this.mover.cursor = "pointer";

    this.line = new createjs.Shape();
    this.line.graphics.clear();

    this.view.addChild(this.circle);



    this.view.x = x;
    this.view.y = y;
    this.base = base;
    this.graph = graph;
    this.onBase = false;
    this.selected = false;

    var vertex = this;
    var view = this.view;
    view.cursor = "pointer";

    view.on('mousedown', function (e) {
      if (vertex.onBase) {
        vertex.graph.deselectAllVertexes();
        vertex.onBase = false;
        vertex.base.recoverVertex();
      }else{
        vertex.graph.deselectAllVertexes();
        vertex.select();
      }
      var posX = e.stageX;
      var posY = e.stageY;
      view.offset = {x: view.x - posX, y: view.y - posY};
      gui.stage.setChildIndex(view, gui.stage.numChildren - 1);
      gui.stage.setChildIndex(mover, gui.stage.numChildren - 1);
      e.stopPropagation ();
    });

    view.on("pressmove", function (evt) {
      vertex.deselect();
      view.x = evt.stageX + view.offset.x;
      view.x = Math.max(0, view.x);
      view.x = Math.min(vertex.gui.width-vertex.gui.vertexSize, view.x);
      view.y = evt.stageY + view.offset.y;
      view.y = Math.max(0, view.y);
      for (var i = 0; i < vertex.transitions.length; i++) {
        vertex.transitions[i].update();
      }
      if (view.y > gui.height && vertex!=vertex.graph.firstState) {
        view.alpha=0.3;
      }else{
        view.alpha=1;
      }
    });

    view.on("pressup", function () {
      if (view.y > gui.height && vertex!=vertex.graph.firstState) {
        gui.stage.removeChild(vertex.view);
        vertex.graph.removeVertex(vertex);
      } else if (vertex.base) {
        vertex.graph.addVertex(vertex);
        vertex.base = null;
      }
    });

    var mover = this.mover;

    mover.on('mousedown', function (e) {
      var posX = e.stageX;
      var posY = e.stageY;
      mover.offset = {x: mover.x - posX, y: mover.y - posY};
      vertex.line.graphics.clear();
      vertex.gui.stage.addChild(vertex.line);
      e.stopPropagation ();
    });

    mover.on("pressmove", function (evt) {
      mover.x = evt.stageX + mover.offset.x;
      mover.y = evt.stageY + mover.offset.y;
      vertex.line.graphics.clear();
      vertex.line.graphics.beginStroke(vertex.gui.vertexBorderColor);
      vertex.line.graphics.setStrokeDash([10,5], 0);
      vertex.line.graphics.moveTo(vertex.view.x+vertex.gui.vertexSize/2, vertex.view.y+vertex.gui.vertexSize/2);
      vertex.line.graphics.lineTo(mover.x, mover.y);
      vertex.graph.hideBordersExcept(vertex);

      mover.graphics.clear();
      mover.graphics.beginFill(vertex.gui.vertexBorderColor);
      mover.graphics.drawCircle(0, 0, vertex.gui.vertexSize/4);

      var another = vertex.getMoverExistedVertex();
      if(another!=null){
        if(vertex.graph.canAddEdge(vertex, another)) {
          if(another!=vertex) {
            another.showBorder();
          }else{
            mover.graphics.beginFill(vertex.gui.vertexColorDark);
            mover.graphics.drawCircle(0, 0, vertex.gui.vertexSize/4);
          }
        }
      }else if(vertex.isMoverOutsideVertex()){
        if(vertex.graph.canAddEdge(vertex)) {
          mover.graphics.beginFill(vertex.gui.vertexColor);
          mover.graphics.drawCircle(0, 0, vertex.gui.vertexSize / 4);
        }
      }
    });

    mover.on("pressup", function () {
      vertex.gui.stage.removeChild(vertex.line);
      vertex.deselect();
      mover.graphics.clear();
      mover.graphics.beginFill(vertex.gui.vertexBorderColor);
      mover.graphics.drawCircle(0, 0, vertex.gui.vertexSize/4);
      vertex.graph.hideBordersExcept();
      var another = vertex.getMoverExistedVertex();
      if(another!=null){
        if(vertex.graph.canAddEdge(vertex, another)) {
          vertex.graph.addEdge(vertex, another);
        }
      }else if(vertex.isMoverOutsideVertex()){
        if(vertex.graph.canAddEdge(vertex)) {
          var another = new State(mover.x, mover.y, false, vertex.gui, vertex.graph, null);
          vertex.graph.addVertex(another);
          vertex.gui.stage.addChild(another.view);
          vertex.graph.addEdge(vertex, another);
        }
      }
    });

  }

  State.prototype.updateLabel = function(label){
    this.label=label;
    if(this.text){
      this.view.removeChild(this.text);
    }
    this.text = new createjs.Text(this.label, this.gui.vertexSize * 0.65 + "px Arial", "#111");
    this.text.x = (this.gui.vertexSize - this.text.getBounds().width) / 2;
    this.text.y = this.gui.vertexSize*0.15;
    this.view.addChild(this.text);
  };

  State.prototype.isMoverOutsideVertex = function(){
    var x = this.view.x+this.gui.vertexSize/2;
    var y = this.view.y+this.gui.vertexSize/2;
    var dist = Math.sqrt((x-this.mover.x)*(x-this.mover.x)+(y-this.mover.y)*(y-this.mover.y));
    return dist > this.gui.vertexSize;
  };

  State.prototype.getMoverExistedVertex = function(){
    var another = this.graph.getVertexByCoords(this.mover.x, this.mover.y);
    return another;
  };

  State.prototype.showBorder = function(){
    this.view.addChild(this.border);
  };

  State.prototype.hideBorder = function(){
    this.view.removeChild(this.border);
  };
  
  State.prototype.select = function(){
    this.selected=true;
    this.view.addChild(this.border);
    this.mover.x=this.gui.vertexSize/2+this.gui.vertexSize/2*Math.sqrt(2)+this.view.x;
    this.mover.y=this.gui.vertexSize/2-this.gui.vertexSize/2*Math.sqrt(2)+this.view.y;
    if(this.graph.canAddEdge(this)) {
      this.gui.stage.addChild(this.mover);
    }
    this.gui.stage.setChildIndex(this.view, this.gui.stage.numChildren - 1);
    this.gui.stage.setChildIndex(this.mover, this.gui.stage.numChildren - 1);
  };

  State.prototype.deselect = function(){
    this.selected=false;
    this.view.removeChild(this.border);
    this.gui.stage.removeChild(this.mover);
  };


  function Transition(v1, v2, gui, graph) {
    this.v1=v1;
    this.v2=v2;
    this.gui=gui;
    this.graph=graph;
    this.label="";

    var backline = new createjs.Shape();
    var line = new createjs.Shape();

    backline.alpha=0.05;
    this.line=line;
    this.backline=backline;
    this.gui.stage.addChild(backline);
    this.gui.stage.setChildIndex(backline, 1);
    this.gui.stage.addChild(line);
    this.gui.stage.setChildIndex(line, 1);
    backline.cursor="pointer";

    var stage = this.gui.stage;
    var edge = this;

    backline.on("mouseover", function(evt){
      var cross = new createjs.Shape();
      cross.graphics.setStrokeStyle(2);
      cross.graphics.beginStroke("darkred");
      cross.graphics.moveTo(evt.stageX-5, evt.stageY-5);
      cross.graphics.lineTo(evt.stageX+5, evt.stageY+5);
      cross.graphics.moveTo(evt.stageX+5, evt.stageY-5);
      cross.graphics.lineTo(evt.stageX-5, evt.stageY+5);
      stage.addChild(cross);
      edge.cross=cross;
    });

    backline.on("mouseout", function(){
      stage.removeChild(edge.cross);
    });

    backline.on("click", function(){
      edge.graph.removeEdge(edge);
    });
  }

  Transition.prototype.updateLabel = function(label){
    this.label=label;
    if(this.text){
      this.gui.stage.removeChild(this.text);
    }
    this.text = new createjs.Text(this.label, this.gui.vertexSize * 0.65 + "px Arial", "#111");
    
    this.text.x = (this.center.x - this.text.getBounds().width/2);
    this.text.y = this.center.y-this.gui.vertexSize * 0.65;
    
    this.gui.stage.addChild(this.text);
  };

  Transition.prototype.update = function(){
    var p1 = {
      x:this.v1.view.x+this.gui.vertexSize/2,
      y:this.v1.view.y+this.gui.vertexSize/2
    };
    var p2;
    if(this.v1==this.v2){
      p2=p1;
    }else {
      p2 = {
        x: this.v2.view.x + this.gui.vertexSize / 2,
        y: this.v2.view.y + this.gui.vertexSize / 2
      };
    }

    var index = this.graph.getEdgeIndexForVertexes(this);

    this.line.graphics.clear();
    this.line.graphics.beginStroke(this.gui.edgeColor);
    this.line.graphics.setStrokeStyle(1);
    this.drawLine(this.line.graphics, p1, p2, index);

    this.backline.graphics.clear();
    this.backline.graphics.beginStroke("darkgray");
    this.backline.graphics.setStrokeStyle(5);
    this.drawLine(this.backline.graphics, p1, p2, index);

    if(this.text) {
      this.updateLabel(this.label);
    }
  };

  Transition.prototype.drawLine = function(g, p1, p2, index){
    var bp1;
    var bp2;
    if(p1==p2){
      bp1 = {
        x: p1.x-(2*this.gui.vertexSize+1.5*this.gui.vertexSize*index),
        y: p1.y-(2*this.gui.vertexSize+1.5*this.gui.vertexSize*index)
      };
      bp2 = {
        x: p1.x+(2*this.gui.vertexSize+1.5*this.gui.vertexSize*index),
        y: p1.y-(2*this.gui.vertexSize+1.5*this.gui.vertexSize*index)
      };
    }else {
      var v = GuiUtils.vector(p1,p2);
      p1 = GuiUtils.movePoint(p1, v, this.gui.vertexSize/2);
      p2 = GuiUtils.movePoint(p2, GuiUtils.rotateVector(v, Math.PI), this.gui.vertexSize/2);
      v = GuiUtils.vector(p1,p2);
      var v1 = GuiUtils.rotateVector(v, p1.x<p2.x?Math.PI / 2:-Math.PI / 2);
      var indexShift  = (index%2==1?-1:1)*(Math.floor(index/2)+1)*v.length / 10;
      bp1 = GuiUtils.movePoint(p1, v, v.length / 4);
      bp1 = GuiUtils.movePoint(bp1, v1, indexShift);
      bp2 = GuiUtils.movePoint(p1, v, v.length * 3 / 4);
      bp2 = GuiUtils.movePoint(bp2, v1, indexShift);
    }
    g.moveTo(p1.x, p1.y);
    g.bezierCurveTo(bp1.x, bp1.y, bp2.x, bp2.y, p2.x, p2.y);

    this.center = GuiUtils.bezierPoint(p1, bp1, bp2, p2, 0.5);
    
    if(p1!=p2) {
      var part = 0.75;
      if(v.length>50&&v.length<=100){
        part = 0.75 + (v.length-50)*0.002;
      }else if(v.length>100&&v.length<=300){
        part = 0.85 + (v.length-100)*0.0005;
      }else if(v.length>300){
        part = 0.96;
      }
      var arv = GuiUtils.vector(GuiUtils.bezierPoint(p1, bp1, bp2, p2, part), p2);
      arv = GuiUtils.rotateVector(arv, Math.PI);
      var arv1 = GuiUtils.rotateVector(arv, Math.PI / 20);
      var arv2 = GuiUtils.rotateVector(arv, -Math.PI / 20);
      var arp1 = GuiUtils.movePoint(p2, arv1, this.gui.vertexSize / 2);
      var arp2 = GuiUtils.movePoint(p2, arv2, this.gui.vertexSize / 2);
      g.lineTo(arp1.x, arp1.y);
      g.moveTo(p2.x, p2.y);
      g.lineTo(arp2.x, arp2.y);
    }
  };

  return {
    magic: function () {
      return new Fsm();
    }
  }


})
();


