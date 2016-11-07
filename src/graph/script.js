/**
 *
 * config{
 *   "vertexsize": 5,
 *   "height": 500,
 *   "edgeorder": false
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

      vertexSize: 10

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
    this.view = new createjs.Shape();
    this.view.graphics.beginStroke("#46b8da");
    this.view.graphics.beginFill("#5bc0de");
    this.view.graphics.drawCircle(gui.vertexSize / 2, gui.vertexSize / 2, gui.vertexSize / 2);
    this.view.x = x;
    this.view.y = y;
    this.base = base;
    this.graph = graph;
    this.onBase = false;

    var vertex = this;
    var view = this.view;
    view.cursor = "pointer";

    view.on('mousedown', function (e) {
      if (vertex.onBase) {
        vertex.onBase = false;
        vertex.base.recoverVertex();
      }
      var posX = e.stageX;
      var posY = e.stageY;
      view.offset = {x: view.x - posX, y: view.y - posY};
      gui.stage.setChildIndex(view, gui.stage.numChildren - 1);
    });

    view.on("pressmove", function (evt) {
      view.x = evt.stageX + view.offset.x;
      view.y = evt.stageY + view.offset.y;
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

  }

  function Edge() {

  }

  return {
    magic: function () {
      return new Graph();
    }
  }


})
();


