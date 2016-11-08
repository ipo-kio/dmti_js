/**
 *
 * config{
 *   "vertexsize": 5,
 *   "height": 500,
 *   "edgeorder": false,
 *   "doubleedge": false,
 *   "loopedge": false
 *  }
 *
 *
 * solution{
 *   vertexes:[
 *    {id: "v1", x: 0, y: 0},
 *    {id: "v2", x: 10, y: 10}
 *   ],
 *   edges:[
 *    {id: "e1", from: v1, to: v2}
 *   ]
 * }
 *
 *
 * @constructor
 */
var qwerty00005 = (function () {

  /**
   * @constructor
   */
  function Graph() {

    this.gui = {
      stage: {},

      width: 0,

      height: 0,

      vertexMargin: 5,

      vertexSize: 10,

      vertexColor: "#5bc0de",

      vertexStrokeColor: "#46b8da",

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

    this.vertexes = [];

    this.edges = [];

    /**
     * vertex toolbox
     * @type {{}}
     */
    this.base = {};

  }

  //noinspection all
  Graph.prototype.layout = '<style>#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .top-buffer{margin-top:20px}#divId .it-logic-buttons button{margin:3px}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><canvas class="it-scene"></canvas></div></div><div class="row top-buffer it-tool-buttons"></div></div>';//###layout

  Graph.prototype.init = function (divId, taskWidth, config) {
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

    this.base = new Base(this, this.gui, this.gui.vertexMargin, this.gui.height + this.gui.vertexMargin);

    this.gui.stage.enableMouseOver(10);
    this.gui.stage.update();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.gui.stage);

    var graph = this;
    this.gui.bg.on('mousedown', function (e) {
      graph.deselectAllVertexes();
    });
  };

  Graph.prototype.addVertex = function (vertex) {
    for (var i = 0; i < 10000; i++) {
      if (this.getVertex("v" + i) == null) {
        vertex.id = "v" + i;
        this.vertexes.push(vertex);
        return;
      }
    }
    console.error("too many vertexes... ")
  };

  Graph.prototype.getEdge = function (v1, v2) {
    for (var i = 0; i < this.edges.length; i++) {
      var edge = this.edges[i];
      if(edge.v1==v1 && edge.v2==v2){
        return edge;
      }
    }
    return null;
  };

  Graph.prototype.addEdge = function (v1, v2) {
      var edge = new Edge(v1, v2, this.gui, this);
      this.edges.push(edge);
      v1.edges.push(edge);
      v2.edges.push(edge);
      edge.update();
  };

  Graph.prototype.canAddEdge = function(v1, v2){
    return this.getEdge(v1,v2)==null && this.getEdge(v2,v1)==null;
  };

  Graph.prototype.removeVertex = function (vertex) {
    var index = this.vertexes.indexOf(vertex);
    this.vertexes.splice(index, 1);
  };

  Graph.prototype.getVertex = function (id) {
    for (var i = 0; i < this.vertexes.length; i++) {
      var vertex = this.vertexes[i];
      if (vertex.id == id) {
        return vertex;
      }
    }
    return null;
  };

  Graph.prototype.getVertexByCoords = function (x, y) {
    for (var i = 0; i < this.vertexes.length; i++) {
      var vertex = this.vertexes[i];
      if (vertex.view.x<x && vertex.view.y<y &&
       vertex.view.x+this.gui.vertexSize>x &&
       vertex.view.y+this.gui.vertexSize>y ) {
        return vertex;
      }
    }
    return null;
  };
  
  Graph.prototype.deselectAllVertexes = function(){
    for (var i = 0; i < this.vertexes.length; i++) {
      this.vertexes[i].deselect();
    }
  };

  Graph.prototype.hideBordersExcept = function(vertex){
    for (var i = 0; i < this.vertexes.length; i++) {
      if(this.vertexes[i]!=vertex) {
        this.vertexes[i].hideBorder();
      }
    }
  };

  Graph.prototype.load = function (solution) {
    for (var i = 0; i < solution.vertexes.length; i++) {
      var v = solution.vertexes[i];
      var vertex = new Vertex(v.x * this.gui.width, v.y * this.gui.height, this.gui, this, null);
      vertex.id = v.id;
      this.vertexes.push(vertex);
      this.gui.stage.addChild(vertex.view);
    }
  };

  Graph.prototype.solution = function () {
    var result = {};
    result.vertexes = [];
    for (var i = 0; i < this.vertexes.length; i++) {
      var vertex = this.vertexes[i];
      result.vertexes.push({id: vertex.id, x: vertex.view.x / this.gui.width, y: vertex.view.y / this.gui.height});
    }
    return result;
  };

  function Base(graph, gui, x, y) {
    this.gui = gui;
    this.x = x;
    this.y = y;
    this.graph = graph;

    var base = this;
    this.vertexBase = new Vertex(x, y, gui, base);
    this.vertexBase.onBase = true;
    gui.stage.addChild(this.vertexBase.view);

    this.recoverVertex();
  }

  /**
   * recover draggable vertex with flag - onBase
   */
  Base.prototype.recoverVertex = function () {
    this.vertexBase = new Vertex(this.x, this.y, this.gui, this.graph, this);
    this.gui.stage.addChild(this.vertexBase.view);
    this.vertexBase.onBase = true;
  };

  function Vertex(x, y, gui, graph, base) {
    this.gui = gui;
    this.view = new createjs.Container();
    this.edges = [];

    this.border = new createjs.Shape();
    this.border.graphics.beginStroke(gui.vertexBorderColor);
    this.border.graphics.setStrokeDash([10,5], 0);
    this.border.graphics.drawCircle(gui.vertexSize / 2, gui.vertexSize / 2, gui.vertexSize);

    this.circle = new createjs.Shape();
    this.circle.graphics.beginStroke(gui.vertexStrokeColor);
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
      e.stopPropagation ();
    });

    view.on("pressmove", function (evt) {
      vertex.deselect();
      view.x = evt.stageX + view.offset.x;
      view.x = Math.max(0, view.x);
      view.x = Math.min(vertex.gui.width-vertex.gui.vertexSize, view.x);
      view.y = evt.stageY + view.offset.y;
      view.y = Math.max(0, view.y);
      for (var i = 0; i < vertex.edges.length; i++) {
        vertex.edges[i].update();
      }
      if (view.y > gui.height) {
        view.alpha=0.3;
      }else{
        view.alpha=1;
      }
    });

    view.on("pressup", function () {
      if (view.y > gui.height) {
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
          another.showBorder();
        }
      }else if(vertex.isMoverOutsideVertex()){
        mover.graphics.beginFill(vertex.gui.vertexColor);
        mover.graphics.drawCircle(0, 0, vertex.gui.vertexSize/4);
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
        var another = new Vertex(mover.x, mover.y, vertex.gui, vertex.graph, null);
        vertex.graph.addVertex(another);
        vertex.gui.stage.addChild(another.view);
        vertex.graph.addEdge(vertex, another);
      }
    });

  }

  Vertex.prototype.isMoverOutsideVertex = function(){
    var x = this.view.x+this.gui.vertexSize/2;
    var y = this.view.y+this.gui.vertexSize/2;
    var dist = Math.sqrt((x-this.mover.x)*(x-this.mover.x)+(y-this.mover.y)*(y-this.mover.y));
    return dist > this.gui.vertexSize;
  };

  Vertex.prototype.getMoverExistedVertex = function(){
    var another = this.graph.getVertexByCoords(this.mover.x, this.mover.y);
    if(another==this){
      another=null;
    }
    return another;
  };

  Vertex.prototype.showBorder = function(){
    this.view.addChild(this.border);
  };

  Vertex.prototype.hideBorder = function(){
    this.view.removeChild(this.border);
  };
  
  Vertex.prototype.select = function(){
    this.selected=true;
    this.view.addChild(this.border);
    this.mover.x=this.gui.vertexSize/2+this.gui.vertexSize/2*Math.sqrt(2)+this.view.x;
    this.mover.y=this.gui.vertexSize/2-this.gui.vertexSize/2*Math.sqrt(2)+this.view.y;
    this.gui.stage.addChild(this.mover);
  };

  Vertex.prototype.deselect = function(){
    this.selected=false;
    this.view.removeChild(this.border);
    this.gui.stage.removeChild(this.mover);
  };


  function Edge(v1, v2, gui, graph) {
    this.v1=v1;
    this.v2=v2;
    this.gui=gui;
    this.graph=graph;
    this.line = new createjs.Shape();
    this.line.graphics.clear();
    this.gui.stage.addChild(this.line);
    this.gui.stage.setChildIndex(this.line, 1);
  }

  Edge.prototype.update = function(){
    this.line.graphics.clear();
    this.line.graphics.beginStroke(this.gui.edgeColor);
    this.line.graphics.moveTo(this.v1.view.x+this.gui.vertexSize/2, this.v1.view.y+this.gui.vertexSize/2);
    this.line.graphics.lineTo(this.v2.view.x+this.gui.vertexSize/2, this.v2.view.y+this.gui.vertexSize/2);
  };

  return {
    magic: function () {
      return new Graph();
    }
  }


})
();


