function filterCorr(data, clist){
    for(var i = 0; i < data.length; i++){
        if(!clist.includes(data[i].x) || !clist.includes(data[i].y)){
            data.splice(i, 1);
            i --;
        }
    }
    return data;
}

d3.csv("corr/corr.csv", function(error, rows) {
    if(error) throw error;
    var data = [];

    rows.forEach(function(d) {
      var x = d[""];
      delete d[""];
      for (prop in d) {
        var y = prop,
          value = d[prop];
        data.push({
          x: x,
          y: y,
          value: +value
        });
      }
    });
    //console.log(data);
    data = (checked_list().length == 0) ? data : filterCorr(data, checked_list());
    
    var margin = {
        top: 80,
        right: 100,
        bottom: 80,
        left: 80
      },
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      domain = d3.set(data.map(function(d) {
        return d.x
      })).values(),
      num = Math.sqrt(data.length),
           color = d3.scaleLinear()
              .domain([0, 0.3, 1])
              .range(["#fff", "#f5f107", "#07f53b"]);

           var x = d3.scalePoint()
          .range([0, width])
          .domain(domain),

          y = d3.scalePoint()
              .range([0, height])
              .domain(domain),
          xSpace = x.range()[1] - x.range()[0],
          ySpace = y.range()[1] - y.range()[0];
    ySpace = y.range()[1] - y.range()[0];

    var svg = d3.select("#corr")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      
    var cor = svg.selectAll(".cor")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "cor")
      .attr("transform", function(d) {
        //if(y(d.y))  
            return "translate(" + x(d.x) + "," + y(d.y) + ")";
        //else   return;
      });
    
    // it fits with v3  
    // cor.append("rect")
    //   .attr("width", xSpace)
    //   .attr("height", ySpace)
    //   .attr("x", -xSpace / 2)
    //   .attr("y", -ySpace / 2)  
    
    //edited to fit with v4 update  2/5/18
    cor.append("rect")
      .attr("width", xSpace/10)
      .attr("height", ySpace/10)
      .attr("x", -xSpace / 20)
      .attr("y", -ySpace / 20)

    cor.filter(function(d){
        var ypos = domain.indexOf(d.y);
        var xpos = domain.indexOf(d.x);
        for (var i = (ypos + 1); i < num; i++){
          if (i === xpos) return false;
        }
        return true;
      })
      .append("text")
      .attr("y", 5)
      .text(function(d) {
        if (d.x === d.y) {
          return d.x.substring(0, 10);
        } else {
          return d.value.toFixed(2);
        }
      })
      .style("fill", "000"/*function(d){
        if (d.value === 1) {
          return "#000";
        } else {
          return color(d.value);
        }
      }*/);

      cor.filter(function(d){
        var ypos = domain.indexOf(d.y);
        var xpos = domain.indexOf(d.x);
        for (var i = (ypos + 1); i < num; i++){
          if (i === xpos) return true;
        }
        return false;
      })
      .append("circle")
      .attr("r", function(d){
        return (width / (num * 2)) * (Math.abs(d.value) / 2 );
      })
      .style("fill", function(d){
        if (d.value === 1) {
          return "#000";
        } else {
          return color(d.value);
        }
      });
      
   var aS = d3.scaleLinear()
          .range([-margin.top + 5, height + margin.bottom - 5])
          .domain([1, 0]);
          
 var yA = d3.axisRight()
          .scale(aS)
          .tickPadding(7);

  var aG = svg.append("g")
    .attr("class", "y axis")
    .call(yA)
    .attr("transform", "translate(" + (width + margin.right / 2) + " , 0)")

  var iR = d3.range(-1, 1.01, 0.01);
  var h = height / iR.length + 3;
  iR.forEach(function(d){
      aG.append('rect')
        .style('fill',color(d))
        .style('stroke-width', 0)
        .style('stoke', 'none')
        .attr('height', h)
        .attr('width', 10)
        .attr('x', 0)
        .attr('y', aS(d))
    });
  });