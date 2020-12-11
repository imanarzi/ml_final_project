function filterSankey(g, clist){
  var fdata = JSON.parse(JSON.stringify(g));
  //console.log(fdata[8]);
  console.log(fdata);
  var links_to_remove = [];
  for(var i = 0; i < fdata.nodes.length; i++){
    if(!clist.includes(fdata.nodes[i].name)){
      links_to_remove.push(fdata.nodes[i].node);
      fdata.nodes.splice(i, 1);
      i--;
    }
  }
  var nodez = JSON.parse(JSON.stringify(fdata.nodes));
  console.log(links_to_remove);
  var linkz = fdata.links;
  for(var i = 0; i < linkz.length; i++){
    if(links_to_remove.includes(linkz[i].source) || links_to_remove.includes(linkz[i].target) 
        || linkz[i].source === undefined || linkz[i].target === undefined){
      linkz.splice(i, 1);
      i--;
    }
  }
  //localStorage.setItem("linkdata", JSON.stringify(linkz));
  fdata.links = JSON.parse(JSON.stringify(linkz));
  fdata.nodes = nodez;
  //localStorage.setItem("nodedata", JSON.stringify(nodez));
  console.log(fdata);

  return fdata;
}

// set the dimensions and margins of the graph22
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#sankey").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);



// load the data

d3.json("sankey/sankey.json", function(error, gdata) {
  var filtered = filterSankey(gdata, checked_list());
  //console.log(filtered);
  var chlist = checked_list();
  var graph2 = gdata;
  if(chlist.length != 0){
    graph2 = JSON.parse(JSON.stringify(filtered));
  }
  
  console.log(graph2);

  // Constructs a new Sankey generator with the default settings.
  sankey
      .nodes(graph2.nodes)
      .links(graph2.links)
      .layout(1);

  // add in the links
  var link = svg.append("g")
    .selectAll(".link")
    .data(graph2.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", sankey.link() )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; })
    // Add hover text
    .append("title")
      .text(function(d) { return "Support: " + d.value ; });

  // add in the nodes
  var node = svg.append("g")
    .selectAll(".node")
    .data(graph2.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        dx = d.x;
        if(!d.x) dx = 0;
        return "translate(" + dx + "," + d.y + ")"; })
      .call(d3.drag()
        .subject(function(d) { return d; })
        .on("start", function() { this.parentNode.appendChild(this); })
        .on("drag", dragmove));
  // add the rectangles for the nodes
  node
    .append("rect")
      .attr("height", function(d) { dy = d.dy; if(!d.dy) dy = 0; return dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = "blue" })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); });
    

  // add in the title for the nodes
    node
      .append("text")
        .attr("x", -6)
        .attr("y", function(d) { dy = d.dy; if(!d.dy) dy = 0; return dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this)
      .attr("transform",
            "translate("
               + d.x + ","
               + (d.y = Math.max(
                  0, Math.min(height - d.dy, d3.event.y))
                 ) + ")");
    sankey.relayout();
    link.attr("d", sankey.link() );
  }

});


