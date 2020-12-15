function nodeColor(d){
    if(isRule(d))
        return 'yellow';
    return 'white';
}

function nodeRadius(d){
    if(isRule(d))
        return 10;
    return 10;
}

function nodeCharge(d){
    if(isRule(d))
        return -50;
    return -200;
}

function isRule(d){
    return (d.name.length < 4 && d.name[0] == 'R');
}

function clicked(d){
    if(d && isRule(d)){
        var str = "";
        var id = d.name.substring(1);
        var rdisp = document.getElementById("rule");
        d3.json("force/rules.json", function(error, rules) {
            rdisp.innerHTML = rules.antecedents[id] + " ---> " + rules.consequents[id];
            rdisp.appendChild(document.createElement("br"));
            rdisp.appendChild(document.createElement("br"));
            rdisp.appendChild(document.createTextNode("Support: "+ rules.support[id]));
            rdisp.appendChild(document.createElement("br"));
            rdisp.appendChild(document.createTextNode("Confidence: "+ rules.confidence[id]));
            rdisp.appendChild(document.createElement("br"));
            rdisp.appendChild(document.createTextNode("Lift: "+ rules.lift[id]));
            rdisp.appendChild(document.createElement("br"));
            rdisp.appendChild(document.createTextNode("Leverage: "+ rules.leverage[id]));
            rdisp.appendChild(document.createElement("br"));
            rdisp.appendChild(document.createTextNode("Conviction: "+ rules.conviction[id]));
        });
    }
    else{
        document.getElementById("rule").innerHTML = "Click on a yellow node to see the corresponding rule.";
    }
}

function filterForceData(data, clist){
  var fdata = data;
  var rules_to_delete = [];
  //console.log(clist);
  //delete links 
  for(var n = 0; n < fdata.links.length; n++){
    //console.log(fdata.links[n])
    if(!clist.includes(fdata.links[n].source) && fdata.links[n].source.length > 3){
      //console.log("deleted: " + fdata.links[n].source);
      if(fdata.links[n].target.length <= 3)
        rules_to_delete.push(fdata.links[n].target);
      fdata.links.splice(n, 1);
      n--;
    } 
    else if(!clist.includes(fdata.links[n].target) && fdata.links[n].target.length > 3){
      //console.log("deleted: " + fdata.links[n].target);
      if(fdata.links[n].source.length <= 3)
        rules_to_delete.push(fdata.links[n].source);
      fdata.links.splice(n, 1);
      
      n--;
    }
  }
  for(var n = 0; n < fdata.links.length; n++){
    if(rules_to_delete.includes(fdata.links[n].source)){
      fdata.links.splice(n, 1);
      n--;
    }
    else if(rules_to_delete.includes(fdata.links[n].target)){
      fdata.links.splice(n, 1);
      n--;
    }
  }
  //console.log(rules_to_delete);
  //delete nodes
  for(var n = 0; n < fdata.nodes.length; n++){
    if((!clist.includes(fdata.nodes[n].name) && fdata.nodes[n].name.length > 3)){
      //console.log(fdata.nodes[n].name);
      fdata.nodes.splice(n, 1);
      n--;
    }
    else if(rules_to_delete.includes(fdata.nodes[n].name)){
      fdata.nodes.splice(n, 1);
      n--;
    }
  }
  //console.log(fdata);
  return fdata;
}

// var radius = 10;

var svg1 = d3.select("#force").on("click", clicked),
    width = +svg1.attr("width"),
    height = +svg1.attr("height");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }).distance(100))
    .force("charge", d3.forceManyBody().strength(nodeCharge))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().strength(.01).radius(30).iterations(1))
    .force('attract', d3.forceRadial(0, width / 2, height / 2).strength(0.05));

d3.json("force/force.json", function (error, data) {
    var clist = checked_list();
    //var graph = data;
    //filterForceData(data, clist);
    var graph = (clist.length == 0) ? data : filterForceData(data, clist);
    //console.log(clist);
    //partial = filter(graph)
    if (error) throw error;

    var link = svg1.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("marker-end", "url(#end-arrow)")

    svg1.append("svg:defs").append("svg:marker")
        .attr("id", "end-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 30)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L20,0L0,5")
        .attr("fill", "#000")

    var node = svg1.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", nodeRadius)
        .style("fill", nodeColor)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", clicked);
        

    /*node.append("title")
        .text(function (d) {
            console.log(d.name)
            return d.id;
        });*/
    var texts = svg1.selectAll("text.label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("fill", "black")
        .text(function(d) {  
            if(isRule(d))
                return "";
            return d.name;  
        });
    /*var text = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.id });*/

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        node
            .attr("cx", function (d) {
                var r = nodeRadius(d);
                return d.x = Math.max(r, Math.min(width - r, d.x));
            })
            .attr("cy", function (d) {
                var r = nodeRadius(d);
                return d.y = Math.max(r, Math.min(height - r, d.y));
            });
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
        texts
            .attr("transform", function(d) {
                var c = this.getComputedTextLength();
                var x_pos = (d.x-c/2 < c/2) ? d.x-c/2 : Math.max(c/2, Math.min(width - c/2, d.x - c/2));
                return "translate(" + x_pos + "," + d.y + ")";
            });
    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

/*var width = 600;
var height = 400;
var border = 3;
var bordercolor = "black";
var color = d3.scaleOrdinal(d3.schemeCategory10); // coloring of nodes
//var graph

var label = {
  "nodes": [],
  "links": []
};
var graph;

d3.json("force/force.json", function (error, gr) {
    graph = gr;
});
graph.nodes.forEach(function(d, i) {
label.nodes.push({
    node: d
});
label.nodes.push({
    node: d
});
label.links.push({
    source: i * 2,
    target: i * 2 + 1
});
console.log(i);
});

var labelLayout = d3.forceSimulation(label.nodes)
.force("charge", d3.forceManyBody().strength(-50))
.force("link", d3.forceLink(label.links).distance(0).strength(2));

var graphLayout = d3.forceSimulation(graph.nodes)
.force("charge", d3.forceManyBody().strength(-3000))
.force("center", d3.forceCenter(width / 2, height / 2))
.force("x", d3.forceX(width / 2).strength(1))
.force("y", d3.forceY(height / 2).strength(1))
.force("link", d3.forceLink(graph.links).id(function(d) {
    return d.id;
}).distance(50).strength(1))
.on("tick", ticked);

var adjlist = [];

graph.links.forEach(function(d) {
adjlist[d.source.index + "-" + d.target.index] = true;
adjlist[d.target.index + "-" + d.source.index] = true;
});

function neigh(a, b) {
return a == b || adjlist[a + "-" + b];
}


var svg = d3.select("svg").attr("width", width).attr("height", height);

// define arrow markers for graph links
svg.append("svg:defs").append("svg:marker")
  .attr("id", "end-arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 10)
  .attr("markerWidth", 20)
  .attr("markerHeight", 20)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L20,0L0,5")
  .attr("fill", "#000");

// http://bl.ocks.org/AndrewStaroscik/5222370
var borderPath = svg.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", height)
  .attr("width", width)
  .style("stroke", bordercolor)
  .style("fill", "none")
  .style("stroke-width", border);

var container = svg.append("g");

svg.call(
  d3.zoom()
  .scaleExtent([.1, 4])
  .on("zoom", function() {
    container.attr("transform", d3.event.transform);
  })
);

var link = container.append("g").attr("class", "links")
  .selectAll("line")
  .data(graph.links)
  .enter()
  .append("line")
  .attr("stroke", "#aaa")
  .attr("marker-end", "url(#end-arrow)")
  .attr("stroke-width", "1px");

var node = container.append("g").attr("class", "nodes")
  .selectAll("g")
  .data(graph.nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("fill", function(d) {
    return color(d.group);
  })

node.on("mouseover", focus).on("mouseout", unfocus);

node.call(
  d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended)
);

var labelNode = container.append("g").attr("class", "labelNodes")
  .selectAll("text")
  .data(label.nodes)
  .enter()
  .append("image")
  // alternative option, unverified: https://stackoverflow.com/questions/39908583/d3-js-labeling-nodes-with-image-in-force-layout
  // I have no idea why the i%2 is needed; without it I get two images per node
  // switching between i%2==1 and i%2==0 produces different image locations (?)
  .attr("xlink:href", function(d, i) {
    return i % 2 == 1 ? "" : d.node.img;
  })
  .attr("x", 0)
  .attr("y", 0)
  // the following alter the image size
  .attr("width", function(d, i) {
    return d.node.width / 2;
  })
  .attr("height", function(d, i) {
    return d.node.height / 2;
  })
  //    .append("text")
  //    .text(function(d, i) { return i % 2 == 0 ? "" : d.node.id; })
  //    .style("fill", "#555")
  //    .style("font-family", "Arial")
  //    .style("font-size", 12)
  .style("pointer-events", "none"); // to prevent mouseover/drag capture

node.on("mouseover", focus).on("mouseout", unfocus);

function ticked() {

  node.call(updateNode);
  link.call(updateLink);

  labelLayout.alphaTarget(0.3).restart();
  labelNode.each(function(d, i) {
    if (i % 2 == 0) {
      d.x = d.node.x;
      d.y = d.node.y;
    } else {
      var b = this.getBBox();

      var diffX = d.x - d.node.x;
      var diffY = d.y - d.node.y;

      var dist = Math.sqrt(diffX * diffX + diffY * diffY);

      var shiftX = b.width * (diffX - dist) / (dist * 2);
      shiftX = Math.max(-b.width, Math.min(0, shiftX));
      var shiftY = 16;
      this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
    }
  });
  labelNode.call(updateNode);

}

function fixna(x) {
  if (isFinite(x)) return x;
  return 0;
}

function focus(d) {
  var index = d3.select(d3.event.target).datum().index;
  node.style("opacity", function(o) {
    return neigh(index, o.index) ? 1 : 0.1;
  });
  labelNode.attr("display", function(o) {
    return neigh(index, o.node.index) ? "block" : "none";
  });
  link.style("opacity", function(o) {
    return o.source.index == index || o.target.index == index ? 1 : 0.1;
  });
}

function unfocus() {
  labelNode.attr("display", "block");
  node.style("opacity", 1);
  link.style("opacity", 1);
}

function updateLink(link) {
  link.attr("x1", function(d) {
      return fixna(d.source.x);
    })
    .attr("y1", function(d) {
      return fixna(d.source.y);
    })
    .attr("x2", function(d) {
      return fixna(d.target.x);
    })
    .attr("y2", function(d) {
      return fixna(d.target.y);
    });
}

function updateNode(node) {
  node.attr("transform", function(d) {
    return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
  });
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) graphLayout.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}*/