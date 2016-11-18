var GuiUtils = (function () {

  var special = "\\ . + * ? [ ^ ] $ ( ) { } = ! < > | : - /".split(" ");

  var specialRegular = "\\ . + ? [ ^ ] $ { } = ! < > : - /".split(" ");

  return {

    bezierPoint: function(p1, p2, p3, p4, t){
      return{
        x: (1-t)*(1-t)*(1-t)*p1.x+3*(1-t)*(1-t)*t*p2.x+3*(1-t)*t*t*p3.x+t*t*t*p4.x,
        y: (1-t)*(1-t)*(1-t)*p1.y+3*(1-t)*(1-t)*t*p2.y+3*(1-t)*t*t*p3.y+t*t*t*p4.y
      };
    },
    
    vector: function(p1,p2){
      var x = p2.x-p1.x;
      var y = p2.y-p1.y;
      var length = Math.sqrt(x*x+y*y);
      return {
        x: x/length,
        y: y/length,
        length: length
      };
    },

    movePoint: function(point, vector, length){
      return {
        x: point.x+vector.x*length,
        y: point.y+vector.y*length
      };
    },

    rotateVector: function(v, alpha){
      return{
        x: v.x*Math.cos(alpha)+v.y*Math.sin(alpha),
        y: -v.x*Math.sin(alpha)+v.y*Math.cos(alpha),
        length: v.length
      }
    },

    getCoords: function (elem) {
      var box = elem.getBoundingClientRect();
      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
      };
    },


    beforeSpace: function (str, length) {
      if (!length || (length && str.length <= length)) {
        return "&nbsp;" + str;
      } else {
        return str;
      }
    },

    /**
     * make special characters escaped
     * @param str
     * @returns {string}
     */
    escapeSpecial: function (str) {
      var symbols = str.split("");
      var result = "";
      for (var i = 0; i < symbols.length; i++) {
        if (~special.indexOf(symbols[i])) {
          result += "\\" + symbols[i];
        } else {
          result += symbols[i];
        }
      }
      return result;
    },

    /**
     * make special characters escaped
     * @param str
     * @returns {string}
     */
    escapeSpecialRegular: function (str) {
      var symbols = str.split("");
      var result = "";
      for (var i = 0; i < symbols.length; i++) {
        if (~specialRegular.indexOf(symbols[i])) {
          result += "\\" + symbols[i];
        } else {
          result += symbols[i];
        }
      }
      return result;
    }

  }

})();