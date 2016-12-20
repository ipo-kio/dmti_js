/**
 *
 * //optional
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

    this.examples = [];

    this.contrexamples = [];

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
  RegularExp.prototype.layout = '<style>#divId .it-example{padding:8px;margin-bottom:12px;border:1px solid transparent;border-radius:4px}#divId .it-example .it-close{right:0}#divId .top-buffer{margin-top:20px}</style><div class="it-task well"><div class="row"><div class="col-sm-12"><div class="input-group input-group-lg"><span class="input-group-addon">RegExp</span> <input class="it-exp-input form-control" type="text" placeholder="Введите регулярное выражение"></div></div></div><div class="row top-buffer"><div class="col-sm-6"><p class="lead">Примеры</p><div class="it-examlpes"></div><div class="input-group"><input class="it-new-examlpe form-control" type="text"> <span class="input-group-btn"><button class="it-new-examlpe-btn btn btn-default" type="button">Добавить</button></span></div></div><div class="col-sm-6"><p class="lead">Контрпримеры</p><div class="it-contrexamlpes"></div><div class="input-group"><input class="it-new-contrexamlpe form-control" type="text"> <span class="input-group-btn"><button class="it-new-contrexamlpe-btn btn btn-default" type="button">Добавить</button></span></div></div></div></div>';//###layout

  RegularExp.prototype.init = function (divId, taskWidth, config) {
    $("#" + divId).html(this.layout.replace(new RegExp("#divId", 'g'), "#" + divId));
    this.divId = divId;
    this.config = config;
    //#!
    var regularExp = this;

    $('#' + divId + ' .it-new-examlpe-btn').click(function () {
      var $inputExample = $('#' + divId + ' .it-new-examlpe');
      if ($inputExample.val() != null && $inputExample.val().length > 0) {
        regularExp.examples.push($inputExample.val());
        $inputExample.val("");
        regularExp.rebuild();
      }
      return false;
    });

    $('#' + divId + ' .it-new-contrexamlpe-btn').click(function () {
      var $inputContrExample = $('#' + divId + ' .it-new-contrexamlpe');
      if ($inputContrExample.val() != null && $inputContrExample.val().length > 0) {
        regularExp.contrexamples.push($inputContrExample.val());
        $inputContrExample.val("");
        regularExp.rebuild();
      }
      return false;
    });

    $('#' + divId + ' .it-exp-input').keyup(function () {
      regularExp.regular = $(this).val();
      regularExp.rebuild();
      return false;
    });

    if (this.config) {
      this.loadExamples(config);
    }
  };

  /**
   * Rebuild examples and contrexamples and highlights correct and wrong
   */
  RegularExp.prototype.rebuild = function () {
    var $inputDiv = $('#' + this.divId + ' .it-exp-input').parent();
    var value = this.regular;
    //remove spaces
    value = value.replace(new RegExp(" ", 'g'), "");

    //replace + to |
    value = value.replace(new RegExp("\\+", 'g'), "|");

    //escape special symbols
    value = GuiUtils.escapeSpecialRegular(value);


    $inputDiv.removeClass('has-error');
    var parsed = value!='';
    try {
      regExp = new RegExp("^(" + value + ")$");
    }
    catch (e) {
      $inputDiv.addClass('has-error');
      parsed = false;
    }

    var $examples = $('#' + this.divId + ' .it-examlpes');
    $examples.empty();
    for (var i = 0; i < this.examples.length; i++) {
      this.appendExample(regExp, this.examples[i], $examples, parsed, this.examples, i);
    }

    var $contrexamples = $('#' + this.divId + ' .it-contrexamlpes');
    $contrexamples.empty();
    for (var j = 0; j < this.contrexamples.length; j++) {
      this.appendExample(regExp, this.contrexamples[j], $contrexamples, parsed, this.contrexamples, j);
    }

  };

  /**
   * Appends new example/contrexample
   * @param regExp - regular expression
   * @param value - testing value
   * @param $container - container for example
   * @param parsed - is expression parsing
   * @param array - array of examples
   * @param index - index example in the array
   */
  RegularExp.prototype.appendExample = function(regExp, value, $container, parsed, array, index){
    var clazz = "";
    if(!parsed){
      clazz =  "it-example alert-info alert-dismissible"
    }else {
      clazz = regExp.test(value) ? "it-example alert-success alert-dismissible" : "it-example alert-danger alert-dismissible";
    }

    var $delBtn = $('<button  type="button" title="удалить пример" class="it-close close"><span aria-hidden="true">&times;</span></button>');
    var $div = $('<div class="' + clazz + '"></div>');
    $div.append($delBtn);
    $div.append(value);
    $container.append($div);

    $delBtn.click(function () {
      array.splice(index, 1);
      $div.remove();
    });

    return $div;
  };

  /**
   * Load examples and contrexamples from objec
   * @param obj
   */
  RegularExp.prototype.loadExamples = function (obj) {
    for (var i = 0; i < obj.examples.length; i++) {
      this.examples.push(obj.examples[i]);
    }
    for (var j = 0; j < obj.contrexamples.length; j++) {
      this.contrexamples.push(obj.contrexamples[j]);
    }
    this.rebuild();
  };

  RegularExp.prototype.load = function (solution) {
    this.examples = [];
    this.contrexamples = [];
    this.regular = solution.regular;
    $('#' + this.divId + ' .it-exp-input').val(this.regular);
    this.loadExamples(solution);
  };

  RegularExp.prototype.solution = function () {
    var result = {examples: [], contrexamples: []};
    for (var i = 0; i < this.examples.length; i++) {
      result.examples.push(this.examples[i]);
    }
    for (var j = 0; j < this.contrexamples.length; j++) {
      result.contrexamples.push(this.contrexamples[j]);
    }
    result.regular = this.regular;
    return result;
  };

  RegularExp.prototype.reset = function () {
    this.regular="";
    $('#' + this.divId + '.it-exp-input').val("");
  };


  return {
    magic: function () {
      return new RegularExp();
    }
  }

})
();


