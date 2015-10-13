describe("Math", function() {

  var getValue = function(d){
    return d.value;
  };
  var getWeight = function(d){
    return d.weight;
  };

  describe("Mean", function(){
    it("it should calculate mean.", function(){
      expect(d2b.MATH.mean([1,2,3,4,5,6])).toBe(3.5);
    });
    it("it should calculate weighted mean.", function(){
      var arr = [
        {value: 1,weight: 2},
        {value: 2,weight: 1},
        {value: 3,weight: 3},
        {value: 4,weight: 5},
        {value: 5,weight: 2},
        {value: 6,weight: 1}
      ];
      expect(d2b.MATH.mean(arr, getValue, getWeight)).toBe(3.5);
    });
  });

  describe("Median", function(){
    it("it should calculate median.", function(){
      expect(d2b.MATH.median([1,2,1,3,3,6,8,4,8,5,6])).toBe(4);
      expect(d2b.MATH.median([1,2,1,3,3,6,8,4,8,5])).toBe(3.5);
    });
    it("it should calculate weighted median.", function(){
      var arr = [
        {value: 1,weight: 2},
        {value: 2,weight: 1},
        {value: 3,weight: 3.3},
        {value: 4,weight: 5.5},
        {value: 5,weight: 2.5},
        {value: 6,weight: 1.8}
      ];
      expect(d2b.MATH.median(arr, getValue, getWeight)).toBe(4);

      var arr = [
        {value: 1,weight: 2},
        {value: 2,weight: 1},
        {value: 3,weight: 3.3},
        {value: 4,weight: 2},
        {value: 5,weight: 2.5},
        {value: 6,weight: 1.8}
      ];
      expect(d2b.MATH.median(arr, getValue, getWeight)).toBe(3.5);
    });
  });

  describe("Mode", function(){
    it("it should calculate mode.", function(){
      expect(d2b.MATH.mode([1,2,1,3,3,3,6,8,4,8,5,6])).toBe(3);
      expect(d2b.MATH.mode([1,2,1,3,3,6,8,4,8,5])).toBe(4);
    });
    it("it should calculate weighted mode.", function(){
      var arr = [
        {value: 1,weight: 2},
        {value: 2,weight: 1},
        {value: 3,weight: 8.3},
        {value: 4,weight: 5.5},
        {value: 5,weight: 2.5},
        {value: 6,weight: 1.8}
      ];
      expect(d2b.MATH.mode(arr, getValue, getWeight)).toBe(3);

      var arr = [
        {value: 1,weight: 2},
        {value: 2,weight: 1},
        {value: 3,weight: 3.3},
        {value: 4,weight: 3.3},
        {value: 5,weight: 2.5},
        {value: 6,weight: 1.8}
      ];
      expect(d2b.MATH.mode(arr, getValue, getWeight)).toBe(3.5);
    });
  });

  describe("Midpoint", function(){
    it("it should calculate midpoint.", function(){
      expect(d2b.MATH.midpoint([1,2,1,3,3,3,6,8,4,8,5,6])).toBe(4.5);
    });
  });

  describe("Range", function(){
    it("it should calculate midpoint.", function(){
      expect(d2b.MATH.range([1,2,1,3,3,3,6,8,4,8,5,6])).toBe(7);
    });
  });

  describe("Angle", function(){
    it("it should convert degrees to radians.", function(){
      expect(d2b.MATH.toRadians(180)).toBe(Math.PI);
    });
    it("it should convert radians to degrees.", function(){
      expect(d2b.MATH.toDegrees(Math.PI)).toBe(180);
    });
  });

});
