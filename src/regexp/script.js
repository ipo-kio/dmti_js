/**
 *
 * config{
 *  examples: ['ab','abb','aabb'],
 *  contrexamples: ['a','aaa','aaaaa']
 * }
 *
 *
 * solution{
 *  examples: ['ab','abb','aabb'],
 *  contrexamples: ['a','aaa','aaaaa'],
 *  regular: 'a+b+c'
 * }
 *
 *
 * @constructor
 */

var qwerty00002 = (function () {

  function RegularExp() {

    this.examples=[];

    this.contrexamples=[];

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
     * current regular expression
     * @type {string}
     */
    this.regular = "";
  }

  //noinspection all
  RegularExp.prototype.layout = '<style>#divId .it-log,#divId .it-strip-input,#divId .it-strip-view,#divId .it-view-command .it-command-list .it-command{font-family:monospace}#divId .it-log,#divId .it-view-command{max-width:500px}#divId .it-scene{background-color:#fff;border:1px solid #a9a9a9}#divId .it-player-holder{text-align:center}#divId .it-player-holder .it-player{display:inline-block;padding:5px}#divId .it-warn{position:absolute;z-index:100;top:-60px;display:none}#divId .it-speed{display:inline-block;float:right}#divId .it-speed .it-slider{border-radius:5px;width:100px;height:10px;margin-right:5px;margin-left:5px;display:inline-block}#divId .it-speed .it-thumb{width:10px;height:20px;border-radius:3px;position:relative;left:50px;top:-5px;cursor:pointer}#divId .it-view-command .dropdown .dropdown-menu{min-width:10px}#divId .it-view-command .dropdown .dropdown-menu li a{cursor:pointer;padding:2px 10px}#divId .it-view-command .it-command-list .it-drag-holder{min-height:3px}#divId .it-view-command .it-command-list .it-command .mover{cursor:move;font-size:x-small;color:#a9a9a9;margin-right:3px}#divId .it-view-command .it-command-list .it-command .it-command-item-edit{cursor:pointer;font-weight:700}#divId .it-view-command .it-command-list .it-command .it-cmd-del{padding:0;margin-left:5px}#divId .it-view-command .it-command-list .it-group .it-group-cmd{float:left;width:auto;border-right:solid 2px #d3d3d3}#divId .it-view-command .it-command-list .it-group .it-group-comment{margin-left:150px;min-width:100px}#divId .it-view-command .it-command-add{padding:15px;margin-top:20px;border-top:solid 2px #d3d3d3}#divId .it-view-command .it-command-add .it-command-add-btn{float:right}#divId .it-log{overflow-y:scroll;background-color:#fff;padding:10px;border:1px solid #a9a9a9}#divId .it-log .it-log-strip{letter-spacing:2px;padding-left:10px}#divId .it-log .it-log-cmd{text-align:right}#divId .top-buffer{margin-top:20px}</style><div class="it-task well"><div class="row"><h4>Исходная лента <button class="it-strip-change btn btn-sm btn-link" type="button" title="Изменить начальное состояние ленты"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button></h4><div class="col-sm-12"><div class="it-strip"><div class="it-strip-warn it-warn alert alert-danger alert-dismissable">Только символы алфавита</div><div class="it-strip-view"></div><div class="it-strip-edit input-group"><input class="it-strip-input form-control" type="text" class="form-control"> <span class="input-group-btn"><button class="btn btn-default it-strip-apply" type="button">Принять</button></span></div></div></div></div><div class="row top-buffer"><div class="col-sm-12"><canvas class="it-scene" height="200px"></canvas></div></div><div class="row it-player-holder"><div class="col-sm-12"><div class="it-player-warn it-warn alert alert-danger alert-dismissable">Нет подходящей команды</div><div class="it-player-info it-warn alert alert-info alert-dismissable">Произошел останов машины, нет подходящей команды</div><div class="it-player"><button class="it-stop" type="button" class="btn btn-default" title="Перевести МТ в начальное состояние и очистить журнал выполнения"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></button> <button class="it-step" type="button" class="btn btn-default" title="Выполнить шаг"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button> <button class="it-play" type="button" class="btn btn-default" title="Запустить анимацию"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button> <button class="it-pause" type="button" class="btn btn-default" title="Пауза"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button></div><div class="it-speed"><label>скорость:</label><div class="it-slider bg-info"><div class="it-thumb bg-primary"></div></div></div></div></div><div class="row top-buffer"><div class="col-lg-6"><h4>Список команд</h4><div class="it-view-command"><div class="it-command-editor"><div class="dropdown it-command-editor-move"><ul class="dropdown-menu"><li><a>L</a></li><li><a>R</a></li><li><a>N</a></li></ul></div><div class="dropdown it-command-editor-to"><ul class="dropdown-menu"></ul></div><div class="dropdown it-command-editor-out"><ul class="dropdown-menu"></ul></div><div class="dropdown it-command-editor-inp"><ul class="dropdown-menu"></ul></div><div class="dropdown it-command-editor-from"><ul class="dropdown-menu"></ul></div></div><div class="it-command-list"></div><div class="it-command-add"><div class="it-command-add-warn it-warn alert alert-danger alert-dismissable">Не заполнены параметры/ Команда с таким состоянием и символом уже существует</div><form class="form-horizontal" role="form"><div class="form-group"><select class="selectpicker it-from" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select><select class="selectpicker it-inp" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select>&nbsp;>&nbsp;<select class="selectpicker it-to" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select><select class="selectpicker it-out" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option></select><select class="selectpicker it-move" data-width="auto" data-style="btn-default btn-xs"><option value="---">---</option><option value="L">L</option><option value="R">R</option><option value="N">N</option></select><button class="it-command-add-btn btn btn-default btn-xs" type="button" title="Добавить команду">Создать</button></div></form></div></div></div><div class="col-lg-6"><h4>Журная выполнения: <span class="it-log-counter"></span> <button class="it-log-expand btn btn-sm btn-link" type="button" title="Развернуть"><span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span></button> <button class="it-log-small btn btn-sm btn-link" type="button" title="Свернуть"><span class="glyphicon glyphicon-resize-small" aria-hidden="true"></span></button></h4><div class="it-log"></div></div></div></div>';//###layout

  RegularExp.prototype.init = function (divId, taskWidth, config) {
    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
    this.divId = divId;
    this.config = config;

    var regularExp = this;

    $('#'+divId+'.it-new-examlpe-btn').click(function(){
      var $inputExample = $('#'+divId+'.it-new-examlpe');
      if($inputExample.val()!=null && $inputExample.val().length>0){
        regularExp.examples.push($inputExample.val());
        $inputExample.val("");
        regularExp.rebuild();
      }
      return false;
    });

    $('#'+divId+'.it-new-contrexamlpe-btn').click(function(){
      var $inputContrExample = $('#'+divId+'.it-new-contrexamlpe');
      if($inputContrExample.val()!=null && $inputContrExample.val().length>0){
        regularExp.contrexamples.push($inputContrExample.val());
        $inputContrExample.val("");
        regularExp.rebuild();
      }
      return false;
    });

    $('#'+divId+'.it-exp-input').keyup(function(){
      regularExp.regular=$(this).val();
      regularExp.rebuild();
      return false;
    });

    if(this.config){
      this.loadExamples(config);
    }
  };

  /**
   * Rebuild examples and contrexamples and highlights correct and wrong
   */
  RegularExp.prototype.rebuild = function (){

  };

  /**
   * Load examples and contrexamples from objec
   * @param obj
   */
  RegularExp.prototype.loadExamples = function(obj){
    for(var i=0; i<obj.examples.length; i++){
      this.examples.push(this.config.examples[i]);
    }
    for(var j=0; j<obj.contrexamples.length; j++){
      this.examples.push(this.config.contrexamples[j]);
    }
    this.rebuild();
  };

  RegularExp.prototype.load = function (solution) {
    this.examples = [];
    this.contrexamples = [];
    this.regular = solution.regular;
    $('#'+this.divId+'.it-exp-input').val(this.regular);
    this.loadExamples(solution);
  };

  RegularExp.prototype.solution = function () {
    var result = {examples:[], contrexamples:[]};
    for(var i=0; i<this.examples.length; i++){
      result.examples.push(this.examples[i]);
    }
    for(var j=0; j<this.contrexamples.length; j++){
      result.contrexamples.push(this.contrexamples[j]);
    }
    result.regular=this.regular;
    return result;
  };

  Turing.prototype.reset = function () {
    $('#'+this.divId+'.it-exp-input').val("");
  };


  return {
    magic: function () {
      return new RegularExp();
    }
  }

})
();


