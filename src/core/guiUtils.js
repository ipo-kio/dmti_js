var GuiUtils = (function ($) {

  var special = "\\ . + * ? [ ^ ] $ ( ) { } = ! < > | : - /".split(" ");

  return {
    sum: function (a, b) {
      return a+b;
    },

    /**
     * make special characters escaped
     * @param str
     * @returns {string}
     */
    escapeSpecial: function(str){
      var symbols = str.split("");
      var result = ""
      for(var i=0; i< symbols.length; i++){
        if(~special.indexOf(symbols[i])){
          result+="\\"+symbols[i];
        }else{
          result+=symbols[i];
        }
      }
      return result;
    }

  }

})(jQuery);