var qwertyfather = (function () {

  var modules = {};

  function createTask(divId, taskWidth, taskImpl, config, initialSolution) {
    if (modules.hasOwnProperty(divId)) {
      $("#"+divId).empty();
    }
    var task = new Task(divId, taskWidth, taskImpl, config, initialSolution);
    task.init();
    if(initialSolution!=undefined){
      task.load(initialSolution);
    }
    modules[divId] = task;
  }

  function resetTask(divId) {
    if (modules.hasOwnProperty(divId)) {
      modules[divId].reset();
    }else{
      throw new Error("There is no task with id "+divId);
    }
  }

  function getSolution(divId) {
    if (modules.hasOwnProperty(divId)) {
      return modules[divId].solution();
    }else {
      throw new Error("There is no task with id " + divId);
    }
  }

  function loadSolution(divId, solution) {
    if (modules.hasOwnProperty(divId)) {
      return modules[divId].load(solution);
    }else {
      throw new Error("There is no task with id " + divId);
    }
  }

  /**
   * Interactive task
   *
   * It has id which is the same as div id
   * It has a configuration json with parameters and initialSolution
   * It can load and return solution json
   * It can reset user solution and set initialSolution
   *
   */
  function Task(divId, taskWidth, taskImpl, config, initialSolution) {

    this.id = divId;

    this.taskWidth = taskWidth;

    this.task = taskImpl;

    this.config = config;

    this.initialSolution = initialSolution;

    this.init = function () {
      this.task.init(divId, taskWidth, config);
    };

    this.reset = function () {
      this.task.reset();
      if(this.initialSolution!=undefined){
        loadSolution(this.initialSolution);
      }
    };

    this.load = function (solution) {
      this.task.load(solution);
    };

    this.solution = function () {
      return this.task.solution();
    }
  }

  Task.prototype.pmethod = new function () {
    return this.alphabet + "p";
  };

  //public API
  return {
    /**
     * Create task in given div and load initial initialSolution if exist
     *
     * @param divId - id of div element
     * @param taskImpl - implementation of task
     * @param config - json-config for task
     * @param initialSolution - json-initialSolution
     */
    magic: function (divId, taskWidth, taskImpl, config, initialSolution) {
      createTask(divId, taskWidth, taskImpl, JSON.parse(config), initialSolution!=undefined?JSON.parse(initialSolution):initialSolution);
    },
    /**
     * Reset task, set initial solution
     *
     * @param divId - id of div element
     */
    magic3: function (divId) {
      resetTask(divId);
    },
    /**
     * Load concrete solution or get it
     *
     * @param divId - id of div element
     * @param solution - json-solution
     */
    magic2: function (divId, solution) {
      if(solution) {
        loadSolution(divId, JSON.parse(solution));
      }else{
        return JSON.stringify(getSolution(divId));
      }
    }
  }

})();

