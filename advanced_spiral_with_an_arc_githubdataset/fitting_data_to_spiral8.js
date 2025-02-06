
//these variables are used to update the charts based on settings
var global_data;
var global_data_unchanged;
var global_data_sorted;//
let gBrush;
let brush;
let brushFlag =0
let densityColFlag = 1
let degreeColFlag = 0
let closenessColFlag = 0
let betweennessColFlag = 0
let eignColFlag = 0
let global_radius = 1.5
let new_data1;


let find_node_id = -1;
//let optimal_no_of_nodes =0;

var flag_most_connected_nodes = 0
var most_connected_nodes_data;
var connections_list;
var extent_of_centralities_after_removing_outliers;

var activeCommunity =200;

var     idleTimeout,
idleDelay = 350;

var highlight_table_node = -1;

var table = d3.select("#table-location")
	.append("table")
	.attr("class", "table table-condensed table-striped"),
	thead = table.append("thead"),
	tbody = table.append("tbody");


  function show_edge_tooltip(source, target, weight){
    //d3.select("#connection_tooltip").html("Community "+ source +" and " +target+ " share "+ weight + " links.")
  }

function draw_textbox(data, adjacent_nodes, activeNode, count, deg, bet, clo, eig){

  var centrality_data = data.map(function(d){return d.centrality})

  var margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 250 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  var inter_community_connections =adjacent_nodes.length - count;

  d3.select("#community_textbox").select("svg").remove()
  d3.select("#node_textbox").html("")

  console.log(data)

  // append the svg object to the body of the page
  var svg = d3.select("#community_textbox")
      .html("<b>Node of interest: </b>"+ activeNode +"<br/>" +"<b>Degree: </b>"+ deg +"<br/>" +"<br/>" + "<b>Community:</b> "+ data[0].community + "<br/>" + "<b>Number of Nodes in Community:</b> "+ data.length + "<br/>" + "<b>Edge-density in Community:</b> "+ data[0].density +"<br/>" +"<br/>" +
       "<b>Total edges:</b> " + adjacent_nodes.length + "<br/>" +
       "<b>Intra-community node-to-node edges:</b> " + count + "<br/>" +
       "<b>Inter-community node-to-node edges:</b> " + inter_community_connections + "<br/>" +
       "<b>List of Adjacent nodes:</b> " + adjacent_nodes)
       .style("font-size", "12px")

}


function draw_histogram(centrality_data, width, height){

console.log(centrality_data)

  // Generate a histogram using twenty uniformly-spaced bins.
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 40, bottom: 50, left: 50},
      width = 300 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  d3.select("#community_histogram").select("svg").remove()

  // append the svg object to the body of the page
  var svg = d3.select("#community_histogram")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // X axis: scale and draw:
    var max = d3.max(centrality_data);
    var min = d3.min(centrality_data);

    var x = d3.scaleLinear()
          .domain([min, max])
          .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .style("font-size", 14)
  .attr("transform", "rotate(-65)");

    // text label for the x axis
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.top + 40)
         .style("text-anchor", "middle")
         .attr("dx", "1em")
         .attr("fill", "black")
         .style("font-size", 14)
         .text("Degree-centrality");

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(10)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(centrality_data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    //label y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", 14)
        .call(g => g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .text("Number of Nodes"));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "teal")


  ////end of function

}


// the spiral is drawn in a seperate window on find node functionality
function find_node_draw_spiral(new_data1){

  var width = 400,
  height = 300;

let centerX = 150,
centerY = 150,
radius = 250,
sides = 1000,
coils = 20,
rotation = 0;
let count =0;
    let awayStep = radius/sides
    // How far to rotate around center for each side.
    let aroundStep = coils/sides
    // Convert aroundStep to radians.
    let aroundRadians = aroundStep * 2 * 3.14;
    // Convert rotation to radians.
     rotation *= 2 * 3.14;

     no_of_points_in_community = new_data1.length

     for (i=0; i<no_of_points_in_community;i++){
         //How far away from center
         away = i * awayStep;
         // How far around the center.


         around = i * aroundRadians + rotation;



         new_data1[i]['new_x'] = centerX + Math.cos(around) * (away );
         new_data1[i]['new_y'] = centerY + Math.sin(around) * (away);

         if (new_data1[i]['node']== find_node_id)
         {
          xCoordinateOfActiveNode_new = new_data1[i]['new_x']
          yCoordinateOfActiveNode_new = new_data1[i]['new_y']
          deg = new_data1[i]['centrality']
          clo = new_data1[i]['closeness']
          bet = new_data1[i]['betwness']
          eig = new_data1[i]['eign']
         }
     }

let adjacent_nodes_find_node = connections_list[find_node_id]
d3.select("#community_spiral").select("svg").remove()
d3.select("#node_spiral").select("svg").remove()
d3.select("#community_textbox").html("")

var svg_community = d3.select("#community_spiral").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g");



var circles = svg_community.selectAll("circle")
                .data(new_data1)
              .enter()
                .append("circle")
                .attr("cx", function (d) { return d.new_x; })
                .attr("cy", function (d) { return d.new_y; })
                .attr("r", function(d){
                  if (d.node == find_node_id)
                    return 5
                  else
                    return 2;})
                .style("fill", function(d){
                  if (d.node == find_node_id)
                    return "black"

                  if (adjacent_nodes_find_node.includes(d.node)){
                    count =count+1
                    svg_community.append('line')
                    //.attr("class", "adjacent_edges")
                          .style("stroke", "#253494" )
                          .style("strokeOpacity",.5)
                          .style("stroke-width",1.5)


                          .attr("x1",xCoordinateOfActiveNode_new)
                          .attr("y1", yCoordinateOfActiveNode_new)
                          .attr("x2", d.new_x)
                          .attr("y2", d.new_y)
                    return "#253494"}
                  
                  else
                  {
                    if (densityColFlag ==1)
                      return colorscaleDensity(d.density);

                    else if (degreeColFlag==1){
                      if (d.centrality>extent_of_centralities_after_removing_outliers.degree_range[1])
                        return "black"
                      else
                      return colorscaleDegree(d.centrality);
                    }

                    else if (closenessColFlag==1){
                      if (d.closeness > extent_of_centralities_after_removing_outliers.closeness_range[1])
                        return "black"
                      else
                        return colorscaleCloseness(d.closeness);
                      }

                    else if (betweennessColFlag==1){
                      if (d.betwness > extent_of_centralities_after_removing_outliers.betwness_range[1])
                        return "black"
                      else
                        return colorscaleBetwness(d.betwness);
                    }

                    else if (eignColFlag==1){
                      if (d.eign > extent_of_centralities_after_removing_outliers.eign_range[1])
                        return "black"
                      else
                        return (colorscaleEign(d.eign))
                    }

                  } });

//also draw histogram for centrality disrtibution
var centrality_data = new_data1.map(function(d){return d.centrality})

//draw_histogram(centrality_data, width,height)
//chage the draw textbox for findnode functionality
//draw_textbox(new_data1)
draw_textbox(new_data1, adjacent_nodes_find_node, find_node_id, count, deg, bet, clo, eig)
//console.log(adjacent_nodes_find_node)

}

// draw spiral in side window on click community
function draw_spiral(new_data1, adjacent_nodes, activeNode){

  var width = 400,
      height = 300;

  let centerX = 150,
    centerY = 150,
    radius = 150,
    sides = 1000,
    coils = 20,
    rotation = 0, 
    count =0;
    let awayStep = radius/sides
    // How far to rotate around center for each side.
    let aroundStep = coils/sides
    // Convert aroundStep to radians.
    let aroundRadians = aroundStep * 2 * 3.14;
    // Convert rotation to radians.
     rotation *= 2 * 3.14;

     no_of_points_in_community = new_data1.length

     for (i=0; i<no_of_points_in_community;i++){
         //How far away from center
         away = i * awayStep;
         // How far around the center.


         around = i * aroundRadians + rotation;



         new_data1[i]['new_x'] = centerX + Math.cos(around) * (away );
         new_data1[i]['new_y'] = centerY + Math.sin(around) * (away);
         if (new_data1[i]['node']== activeNode)
         {
          xCoordinateOfActiveNode_new = new_data1[i]['new_x']
          yCoordinateOfActiveNode_new = new_data1[i]['new_y']
          deg = new_data1[i]['centrality']
          clo = new_data1[i]['closeness']
          bet = new_data1[i]['betwness']
          eig = new_data1[i]['eign']
          
         }

     }


d3.select("#community_spiral").select("svg").remove()
d3.select("#node_spiral").select("svg").remove()

var svg_community = d3.select("#community_spiral").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g");



var circles = svg_community.selectAll("circle")
                .data(new_data1)
              .enter()
                .append("circle")
                .attr("cx", function (d) { return d.new_x; })
                .attr("cy", function (d) { return d.new_y; })
                .attr("r", function(d){
                  if (d.node == find_node_id)
                    return 6
                  else
                    return 1.5;})
                    .style("fill", function(d){
                      if (d.node == find_node_id)
                        return "black"
                      if (adjacent_nodes.includes(d.node)){

                        count=count+1
                        svg_community.append('line')
                        //.attr("class", "adjacent_edges")
                              .style("stroke", "#253494" )
                              .style("strokeOpacity",.5)
                              .style("stroke-width",1.5)


                              .attr("x1",xCoordinateOfActiveNode_new)
                              .attr("y1", yCoordinateOfActiveNode_new)
                              .attr("x2", d.new_x)
                              .attr("y2", d.new_y)
                        return "#253494"}
                      else
                      {
                        if (densityColFlag ==1)
                          return colorscaleDensity(d.density);
  
                        else if (degreeColFlag==1){
                          if (d.centrality>extent_of_centralities_after_removing_outliers.degree_range[1])
                            return "black"
                          else
                          return colorscaleDegree(d.centrality);
                        }
  
                        else if (closenessColFlag==1){
                          if (d.closeness > extent_of_centralities_after_removing_outliers.closeness_range[1])
                            return "black"
                          else
                            return colorscaleCloseness(d.closeness);
                          }
  
                        else if (betweennessColFlag==1){
                          if (d.betwness > extent_of_centralities_after_removing_outliers.betwness_range[1])
                            return "black"
                          else
                            return colorscaleBetwness(d.betwness);
                        }
  
                        else if (eignColFlag==1){
                          if (d.eign > extent_of_centralities_after_removing_outliers.eign_range[1])
                            return "black"
                          else
                            return (colorscaleEign(d.eign))
                        }
  
                      }
                         })
//also draw histogram for centrality disrtibution
var centrality_data = new_data1.map(function(d){return d.centrality})
//for time being
//draw_histogram(centrality_data, width,height)
draw_textbox(new_data1, adjacent_nodes, activeNode, count, deg, bet, clo, eig)
console.log(adjacent_nodes)

}


//convert node data from string to integers
function transform_data(data){
  data = data.map(d=> ({
    node : +d.node,
    centrality : +d.centrality,
    community : +d.community,
    density : parseFloat(d.density),
    //eign : parseFloat(d.eign),
    //closeness : parseFloat(d.closeness),
    //betwness: parseFloat(d.betwness),
    x : +d.x,
    y: +d.y
  }))
  return data
}

//convert node data from string to integers
function transform_link_data(data){
  data = data.map(d=> ({
    source : +d.source,
    target: +d.target,
    weight: +d.weight
  }))
  return data
}

//convert node data from string to integers
function transform_node_to_node_link_data(data){
  data = data.map(d=> ({
    source : +d.source,
    target: +d.target
  }))
  return data
}

//convert coarse graph center points from string to integers
function string_to_numbers_graph_centers(data){
  data = data.map(d=> ({
    community : +d.community,
    size : +d.count
  }))
  return data
}

function transform_graph_centers(data, height, width){
  console.log(height, width)


  let radius = 300,
  coils = 4,
  rotation = 0;
  sides = 50
  let awayStep = radius/sides
  // How far to rotate around center for each side.
  let aroundStep = coils/sides
  // Convert aroundStep to radians.
  let aroundRadians = aroundStep * 2 * 3.14;
  // Convert rotation to radians.
   rotation *= 2 * 3.14;

  let waveangle = 0.314;


newdata1=[]



 
  no_of_points_in_community = data.length
  for (i=0; i<no_of_points_in_community;i++){
      //How far away from center
      away = i * awayStep;
      // How far around the center.


      //console.log("hey bahnu")


      around = i * aroundRadians + rotation;

      let no_of_waves_completed = Math.floor(around/waveangle);

      let current_part_of_waveangle = around - (no_of_waves_completed * waveangle);

      let twopie_mapped_current_part_of_waveangle = ((2 * 3.14)/waveangle) * current_part_of_waveangle;

      //let wave_coff =  * Math.sin(twopie_mapped_current_part_of_waveangle)



      data[i]['cx'] = 500 + Math.cos(around) * (away );
      data[i]['cy'] = 250 + Math.sin(around) * (away);
  }
 
    return data
}




function computing_spiral_positions(center_positions_spiral, data_points, height, width) {

  //let centerX = 50,
//  centerY = 50,
  let radius = 40,
  coils = 7,
  rotation = 0;
  sides = 500
  let awayStep = radius/sides
  // How far to rotate around center for each side.
  let aroundStep = coils/sides
  // Convert aroundStep to radians.
  let aroundRadians = aroundStep * 2 * 3.14;
  // Convert rotation to radians.
   rotation *= 2 * 3.14;

  let waveangle = 0.314;
  let new_sides = 30000
  let new_awayStep = radius/new_sides
 
 let new_aroundStep = coils/new_sides
let new_aroundRadians = new_aroundStep * 2 * 3.14


newdata1=[]

center_positions_spiral.forEach(function(community_data){
  filtered_community= data_points.filter(function(d){return d.community===community_data.community})
  //console.log(filtered_community)
  no_of_points_in_community = filtered_community.length

 

  for (i=0; i<no_of_points_in_community; i++){
    //How far away from center
    if (i<300){
    away = (i+200) * awayStep;
    around = (i+200) * aroundRadians + rotation;
   

    filtered_community[i]['x'] = community_data.cx + Math.cos(around) * (away );
    filtered_community[i]['y'] = community_data.cy + Math.sin(around) * (away);//}
}
else{
  new_away = (away) + ((i-299) * new_awayStep);
  new_around = around + ((i-299) * new_aroundRadians + rotation);
  
  filtered_community[i]['x'] = community_data.cx + Math.cos(new_around) * (new_away );
  filtered_community[i]['y'] = community_data.cy + Math.sin(new_around) * (new_away);
}
}



newdata1=newdata1.concat(filtered_community)
//console.log(newdata1.concat(filtered_community))
//console.log(newdata1)

})
return newdata1
/*
for j in unique_communities:
    x_list=[]
    y_list=[]
    #no. of points of community
    no_of_points_in_community = df.loc[df["community"]==j].shape[0]
    for i in range(1, no_of_points_in_community+1):
        #How far away from center
        away = i * awayStep;
        #// How far around the center.
        around = i * aroundRadians + rotation;

        x = centerX +(j+1)*50 + math.cos(around) * away;
        y = centerY + (j+1)*50+math.sin(around) * away;
        x_list.append(x)
        y_list.append(y)
    full_x_list.extend(x_list)
    full_y_list.extend(y_list)
df["x"]= full_x_list
df["y"]= full_y_list
*/
}

// Define the div for the tooltip
var div = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);


count = 0
function draw_spiral_community(){




  //find_node_id does not work with most connected node data functonality
  if (most_connected_nodes_data)
    find_node_id =-1
  console.log(find_node_id)
/*if (count!=0){
  console.log("I am in brush_clear")
  g.select(".brush").call(brush.move, null);}
 */
  g.selectAll(".brush").remove()
  count =count +1
  g.selectAll("circle").remove()
//define scale
  let xExtent = d3.extent(global_data, d=>d.x)
  let xScale = d3.scaleLinear()
                  .domain(xExtent)
                  .range(xExtent)


  let yExtent = d3.extent(global_data, d=>d.y)
  let yScale = d3.scaleLinear()
                  .domain(yExtent)
                  .range(yExtent)

  let max_density = d3.max(global_data, d=>d.density)


//define colorscale
colorscaleDensity = d3.scaleSequential(d3.interpolateRdYlBu)
                .domain([max_density,0]);
console.log([extent_of_centralities_after_removing_outliers.degree_range[1], extent_of_centralities_after_removing_outliers.degree_range[0] -10])
colorscaleDegree = d3.scaleSequential(d3.interpolateRdYlBu)
//.domain(extent_of_centralities_after_removing_outliers.degree_range)
.domain([extent_of_centralities_after_removing_outliers.degree_range[1], extent_of_centralities_after_removing_outliers.degree_range[0]-3]);


gBrush = g.append("g")
.attr("class", "brush")

//define brush
brush = d3.brush().on("end", function() {
  brushFlag=1
  var s = d3.brushSelection(this);
  if (!s) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
    xScale.domain(xExtent);
    yScale.domain(yExtent);
  } else {
    console.log([s[0][0], s[1][0]].map(xScale.invert, xScale))
    xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
    yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
    g.select(".brush").call(brush.move, null);
  }
  var t = g.transition().duration(750);
  g.selectAll("circle").transition(t)
      .attr("cx", function(d) {  return xScale(d.x); })
      .attr("cy", function(d) { return yScale(d.y); });;
  d3.selectAll(".spiral_edges").style("stroke-opacity", 0)



})

//g.addEventListener("dblclick", function(){brushFlag=0
  //d3.selectAll(".spiral_edges").style("stroke-opacity", 1)});


//call brush

gBrush.call(brush);


// scale based on strength and draw:
var max_edge_strength = d3.max(link_data, function(d){return d.weight});
console.log(max_edge_strength )


var edge_strength_scale = d3.scaleLinear()
      .domain([0, max_edge_strength])
      .range([.4, 10]);
console.log(link_data)

g.selectAll("line")


for (let link in link_data){
 console.log("this is new file")
 g.append('line')//..data(link_data[link]).enter()
 .attr("class", "spiral_edges")
      .style("stroke", "#DCDCDC")
      .style("strokeOpacity",0)
      .style("stroke-width", edge_strength_scale(link_data[link].weight))
      .attr("x1",center_positions_spiral[link_data[link].source].cx)
      .attr("y1", center_positions_spiral[link_data[link].source].cy)
      .attr("x2", center_positions_spiral[link_data[link].target].cx)
      .attr("y2", center_positions_spiral[link_data[link].target].cy)
      //.append("text")
 //.text("hello")

      //.enter()
      //.attr("cursor", "pointer")
      //.attr("pointer-events", "all")
      //.on("click", function(){console.log("hello")})
      //.style("stroke-opacity", 0)
      //.style('cursor', 'pointer')
      //.attr("pointer-events", "all")
      .on("mouseover", function(event, d){show_edge_tooltip(d.source, d.target, d.weight)})

}
g.selectAll(".spiral_edges").data(link_data).enter()

//g.selectAll(".spiral_edges")
  //.on("mouseover", function(event, d){console.log(d)
  //console.log(event)})


//draw nodes
  var node = g.selectAll("circle")
                  .data(global_data)
console.log(global_data)
  var newElements = node.enter()
                  .append("circle")
                  .attr("class", "happy")
                  .attr("r", function(d){

                    if (d.node == find_node_id)
                      return 4
                    else
                      return global_radius
                  })
                  .style("fill", function(d){
                    if (d.node == find_node_id)
                      return "black"
                    else
                    {
                      if (densityColFlag ==1)
                        return colorscaleDensity(d.density);

                      else if (degreeColFlag==1){
                        if (d.centrality>extent_of_centralities_after_removing_outliers.degree_range[1])
                          return "black"
                          //return "#5e3c99"
                          //return "#d7301f"
                          //return "#d7301f"
                         // return "#253494"
                        else
                        return colorscaleDegree(d.centrality);
                      }

                      else if (closenessColFlag==1){
                        if (d.closeness > extent_of_centralities_after_removing_outliers.closeness_range[1])
                          return "black"
                        else
                          return colorscaleCloseness(d.closeness);
                        }

                      else if (betweennessColFlag==1){
                        if (d.betwness > extent_of_centralities_after_removing_outliers.betwness_range[1])
                          return "black"
                        else
                          return colorscaleBetwness(d.betwness);
                      }

                      else if (eignColFlag==1){
                        if (d.eign > extent_of_centralities_after_removing_outliers.eign_range[1])
                          return "black"
                        else
                          return (colorscaleEign(d.eign))
                      }

                    }
                       })
                  .attr("pointer-events", "all")
                  .on("mouseover", function(event,d) {
                                      console.log(event)
                                      console.log(d)
                                      div.transition()
                                          .duration(200)
                                          .style("opacity", .9);

                                      if (flag_most_connected_nodes){
                                        div.html("<b>Community:</b> " +d.community)
                                        .style("left", (event.pageX) + "px")
                                        .style("top", (event.pageY - 28) + "px");

                                      }
                                      else{
                                        div.html("<b>Node:</b> "+ d.node +"<br/>" +"<b>Community:</b> " +d.community+ "<br/>"+"<b>Degree:</b> "+ d.centrality )
                                        .style("left", (event.pageX) + "px")
                                        .style("top", (event.pageY - 28) + "px")
                                        .style("text-align", "left");

                                      }



                                          activeCommunity = d.community
                                          activeNode = d.node
                                          xCoordinateOfActiveNode = d.x
                                          yCoordinateOfActiveNode = d.y

                                          //code to show adjacent node
                                          let adjacent_nodes = connections_list[activeNode]



                                          d3.selectAll("circle")
                                          .attr("r", function(d){
                                            if (adjacent_nodes.includes(d.node))
                                              return global_radius
                                            else
                                              return global_radius
                                          })
                                          .style("fill", function(d){
                                            if (adjacent_nodes.includes(d.node)){
                                              let edgecolor;
                                              if (d.community==activeCommunity)
                                                edgecolor ="#253494"
                                              else 
                                                edgecolor = "#253494"
                                                console.log(activeNode)
                                                console.log(d.node)
                                                console.log(new_data1)

                                              g.append('line')
                                              .attr("class", "adjacent_edges")
                                                   .style("stroke", edgecolor)
                                                   .style("strokeOpacity",.5)
                                                   .style("stroke-width",1)


                                                   .attr("x1",function(){
                                                                if(brushFlag==1)
                                                                  return xScale(xCoordinateOfActiveNode)
                                                                else 
                                                                  return xCoordinateOfActiveNode})
                                                   .attr("y1", function(){
                                                    if(brushFlag==1)
                                                      return yScale(yCoordinateOfActiveNode)
                                                    else 
                                                      return yCoordinateOfActiveNode})
                                                   .attr("x2", function(){
                                                    if(brushFlag==1)
                                                      return xScale(d.x)
                                                    else 
                                                      return d.x})
                                                   .attr("y2", function(){
                                                    if(brushFlag==1)
                                                      return yScale(d.y)
                                                    else 
                                                      return d.y})
                                              return "#253494"}
                                            else
                                              {
                                                if (densityColFlag ==1)
                                                return colorscaleDensity(d.density);

                                              else if (degreeColFlag==1){
                                                if (d.centrality>extent_of_centralities_after_removing_outliers.degree_range[1])
                                                  return "black"
                                                else
                                                return colorscaleDegree(d.centrality);
                                              }

                                              else if (closenessColFlag==1){
                                                if (d.closeness > extent_of_centralities_after_removing_outliers.closeness_range[1])
                                                  return "black"
                                                else
                                                  return colorscaleCloseness(d.closeness);
                                                }

                                              else if (betweennessColFlag==1){
                                                if (d.betwness > extent_of_centralities_after_removing_outliers.betwness_range[1])
                                                  return "black"
                                                else
                                                  return colorscaleBetwness(d.betwness);
                                              }

                                              else if (eignColFlag==1){
                                                if (d.eign > extent_of_centralities_after_removing_outliers.eign_range[1])
                                                  return "black"
                                                else
                                                  return (colorscaleEign(d.eign))
                                              }

                                              }
                                          })
                                          console.log(global_data)
                                          new_data1 = global_data.filter(function(client){return client.community==d.community}) 
                                          //sort this data based on flag  
                                          console.log(new_data1)                                    
                                          draw_spiral(new_data1, adjacent_nodes, activeNode)
                                          


                                          d3.selectAll("rect")
                                           .classed("strokechange", function(d) {
                                              if ( d.target == activeCommunity) return true;
                                              else return false;
                                           })

                                           d3.selectAll("rect")
                                           .classed("barLight", function(d) {
                                              if ( d.x == activeCommunity) return true;
                                              else return false;
                                           })

                                          //highlight table column on hover
                                            d3.selectAll("tr").style("background-color", function(dat,i){
                                              if (dat!== undefined)
                                               {
                                                if(dat.node == find_node_id)
                                                  return "blue";
                                                else if (dat.node == activeNode)
                                                  return "orange";
                                                else
                                                  return "transparent"
                                                }})


                                          if (!flag_most_connected_nodes){
                                           d3.selectAll("circle")
                                           .attr("opacity", function(d){
                                             if(d.community == activeCommunity) return 1
                                             else return .1} )}


                                          if(brushFlag==0){
                                             all_lines = d3.selectAll(".spiral_edges")
                                             .nodes()
                                             for (each in all_lines){
                                             if(
                                             parseInt(all_lines[each].x1.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cx) &&
                                             parseInt(all_lines[each].y1.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cy) ||
                                             parseInt(all_lines[each].x2.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cx )&&
                                             parseInt(all_lines[each].y2.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cy))
                                             all_lines[each].style.strokeOpacity = 1
                                             else
                                             all_lines[each].style.strokeOpacity = 0;
                                             }}
                                            else {
                                              d3.selectAll(".spiral_edges").style("stroke-opacity", 0)
                                            }

                                            /*for (let link in adjacent_nodes){
                                              //console.log("I am in line code")
                                              console.log(global_data[link])
                                              if (global_data_unchanged[activeNode].community != global_data_unchanged[link].community)
                                              console.log("yes")
                                              g.append('line')
                                              .attr("class", "adjacent_edges")
                                                   .style("stroke", "yellow")
                                                   .style("strokeOpacity",.5)
                                                   .style("stroke-width",1)

                                                   .attr("x1",global_data_unchanged[activeNode].x)
                                                   .attr("y1", global_data_unchanged[activeNode].y)
                                                   .attr("x2", global_data_unchanged[link].x)
                                                   .attr("y2", global_data_unchanged[link].y)

                                                   //.style("stroke-opacity", .5);
                                            }*/

                                      })

                  .on("mouseout", function(d) {
                                      div.transition()
                                          .duration(500)
                                          .style("opacity", 0);

                                      d3.selectAll(".adjacent_edges")
                                      .remove()

                                      d3.selectAll(".barLight")
                                      .attr("class", "bar");

                                      d3.selectAll(".strokechange")
                                      .attr("class", "heat_map")

                                      if(!flag_most_connected_nodes){
                                      d3.selectAll("circle")
                                      .attr("opacity", 1)}

                                      d3.select("table").selectAll("tr").style("background-color", function(d,i){
                                        if (d!== undefined)
                                          {
                                            if (d.node == find_node_id)
                                              return "blue";
                                            else
                                              return "transparent"

                                          }})

                                      if (brushFlag==0)
                                      {
                                        d3.selectAll(".spiral_edges").style("stroke-opacity", 1)
                                      }
                                      else
                                      {
                                        d3.selectAll(".spiral_edges").style("stroke-opacity", 0)
                                      }
                                      console.log(d3.selectAll(".spiral_edges").style("stroke-opacity"))

                                  })
                    .on("click", function(d){
                      
                      
                    console.log("hello")
                    prepare_data = computing_spiral_positions(center_positions_spiral, global_data,700, 1200)
  global_data = prepare_data
  global_data_unchanged = prepare_data


  d3.select("#chart").select("svg").remove()


  //assign height and width of svg
  let svg = d3.select("#chart")
  initializeSpiralChart(svg, 700, 1200)
  draw_spiral_community()
                  
                  })/*
                  on("click", function(event,d) {
                    console.log("inside click")

  //calculate final x and y position for each point
  //computing_spiral_positions(center_positions_spiral, data, optimal_no_of_nodes, height, width)
  //prepare_data = computing_spiral_positions(center_positions_spiral, prepare_data, height, width)
  prepare_data = computing_spiral_positions(center_positions_spiral, global_data,700, 1200)
  global_data = prepare_data
  global_data_unchanged = prepare_data


  d3.select("#chart").select("svg").remove()


  //assign height and width of svg
  let svg = d3.select("#chart")
  initializeSpiralChart(svg, height, width)
  draw_spiral_community()
  





                                                    //console.log(d.community)
                                                    new_data1 = global_data_unchanged.filter(function(client){return client.community==d.community})                                       
                                                    draw_spiral(new_data1)
 
                                                    //links_to_highlight = link_data.filter(function(client){return client.source==d.community || client.source==d.community})
                                                    
                                                    d3.selectAll("line")
                                                    .style("stroke", "#DCDCDC")

                                                    
                                                    //show only selected community in table
                                                    table.selectAll("tr").remove()
                                                    show_table_data(new_data1)


                                                  });
*/

   node.merge(newElements).transition()
                  .attr("cx", function (d) { return xScale(d.x); })
                  .attr("cy", function (d) { return yScale(d.y); })




//zoom functionality
    /*g.call(d3.zoom().on("zoom", function(event){
      let newXScale = event.transform.rescaleX(xScale)
      let newYScale = event.transform.rescaleY(yScale)


      node.merge(newElements)
          .attr("cx", d=> newXScale(d.x) )
          .attr("cy", d=> newYScale(d.y) )

    }))*/
//comenting legend till line

    //legend attaching
 //commentig till 565

 g.selectAll(".axis").remove()
 g.selectAll(".text_for_legend").remove()
var legendheight = 200,
    legendwidth = 80,
    margin = {top: 10, right: 60, bottom: 10, left: 2};

var canvas = d3.select("#legend1")
  .style("height", legendheight + "px")
  .style("width", legendwidth + "px")
  .style("position", "relative")
  .append("canvas")
  .attr("height", legendheight - margin.top - margin.bottom)
  .attr("width", 1)
  .style("height", (legendheight - margin.top - margin.bottom) + "px")
  .style("width", (legendwidth - margin.left - margin.right) + "px")
  .style("border", "1px solid #000")
  .style("position", "absolute")
  .style("top",  (margin.top) +"px")
  .style("left", (margin.left) + "px")
  .node();

var ctx = canvas.getContext("2d");

// to change legend according to selected centrality
let domain_used_for_legend;
if (densityColFlag ==1)
domain_used_for_legend= colorscaleDensity.domain();
else if (degreeColFlag==1)
domain_used_for_legend=  colorscaleDegree.domain();
else if (closenessColFlag==1)
domain_used_for_legend=  colorscaleCloseness.domain();
else if (betweennessColFlag==1)
domain_used_for_legend =  colorscaleBetwness.domain();
else if (eignColFlag==1)
domain_used_for_legend= colorscaleEign.domain()

var legendscale = d3.scaleLinear()
  .range([1, legendheight - margin.top - margin.bottom])
  .domain(domain_used_for_legend);
 // .domain(colorscaleDensity.domain());

// image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
var image = ctx.createImageData(1, legendheight);
d3.range(legendheight).forEach(function(i) {
var c;
if (densityColFlag ==1)
c = d3.rgb(colorscaleDensity(legendscale.invert(i)));
else if (degreeColFlag==1)
c =  d3.rgb(colorscaleDegree(legendscale.invert(i)));
else if (closenessColFlag==1)
c =  d3.rgb(colorscaleCloseness(legendscale.invert(i)));
else if (betweennessColFlag==1)
c =  d3.rgb(colorscaleBetwness(legendscale.invert(i)));
else if (eignColFlag==1)
c = d3.rgb(colorscaleEign(legendscale.invert(i)));

  image.data[4*i] = c.r;
  image.data[4*i + 1] = c.g;
  image.data[4*i + 2] = c.b;
  image.data[4*i + 3] = 255;
});
ctx.putImageData(image, 0, 0);



var legendaxis = d3.axisRight()
  .scale(legendscale)
  .tickSize(6)
  .ticks(8);

   d3.select("#legend1")
    .attr("height", (legendheight) + "px")
    .attr("width", (legendwidth) + "px")
    .style("position", "absolute")
    .style("left", "15px")
    .style("top", margin.top )

  /*d3.select("#legend1")
  .attr("x", width/2)
  .attr("y", margin.top +40)
   .style("text-anchor", "middle")
   .attr("dx", "1em")
   //.attr("fill", "black")
   .style("font-size", 14)
    .append("text")
    .text("hello")*/


g
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
  .call(legendaxis);

  var text_for_legend;
  if (densityColFlag ==1)
  text_for_legend = "Density";
  else if (degreeColFlag==1)
  text_for_legend =  "Degree";
  else if (closenessColFlag==1)
  text_for_legend=  "Closeness";
  else if (betweennessColFlag==1)
  text_for_legend =  "Betweeness";
  else if (eignColFlag==1)
  text_for_legend = "Eigen";

  g
  .append("g")
  .attr("class", "text_for_legend")
  .append("text")
  .text(text_for_legend)
  //.attr("class", "axis")
  .attr("transform", "translate( 0 ," + (legendheight+10) + ")")
  //.call(legendaxis);

//g.append









/*for (let link in node_to_node_link_data){
  console.log("I am in line code")

  g.append('line')
  .attr("class", "node_edges")
       .style("stroke", "#DCDCDC")
       .style("strokeOpacity",0)
       .style("stroke-width", 3)
       .attr("x1",global_data_sorted[node_to_node_link_data[link].source].x)
       .attr("y1", global_data_sorted[node_to_node_link_data[link].source].y)
       .attr("x2", global_data_sorted[node_to_node_link_data[link].target].x)
       .attr("y2", global_data_sorted[node_to_node_link_data[link].target].y)

       .style("stroke-opacity", 1);
}*/






}



function idled() {
  idleTimeout = null;
}



console.log("bhanu bhanu spiral")

/*function draw_most_connected_communities(){

  g.selectAll(".brush").remove()
  count =count +1
  g.selectAll("circle").remove()
//define scale
  let xExtent = d3.extent(global_data, d=>d.x)
  let xScale = d3.scaleLinear()
                  .domain(xExtent)
                  .range(xExtent)


  let yExtent = d3.extent(global_data, d=>d.y)
  let yScale = d3.scaleLinear()
                  .domain(yExtent)
                  .range(yExtent)


//define colorscale
colorscale = d3.scaleSequential(d3.interpolateRdYlGn)
                .domain([0,1]);

gBrush = g.append("g")
.attr("class", "brush")

//define brush
brush = d3.brush().on("end", function() {
  var s = d3.brushSelection(this);
  if (!s) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
    xScale.domain(xExtent);
    yScale.domain(yExtent);
  } else {
    console.log([s[0][0], s[1][0]].map(xScale.invert, xScale))
    xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
    yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
    g.select(".brush").call(brush.move, null);
  }
  var t = g.transition().duration(750);
  g.selectAll("circle").transition(t)
      .attr("cx", function(d) {  return xScale(d.x); })
      .attr("cy", function(d) { return yScale(d.y); });;
  d3.selectAll(".spiral_edges").style("stroke-opacity", 0)
})



//call brush

gBrush.call(brush);



//draw nodes
  var node = g.selectAll("circle")
                  .data(global_data)
console.log(find_node_id)
  var newElements = node.enter()
                  .append("circle")
                  .attr("r", function(d){

                    if (d.node == find_node_id)
                      return 10
                    else
                      return global_radius
                  })
                  .style("fill", function(d){
                    if (d.node == find_node_id)
                      return "black"
                    else
                      return colorscale(d.density); })
                  .attr("pointer-events", "all")
                  .on("mouseover", function(event,d) {
                                      console.log(event)
                                      console.log(d)
                                      div.transition()
                                          .duration(200)
                                          .style("opacity", .9);

                                      div.html("<b>Community:</b> " +d.community)
                                          .style("left", (event.pageX) + "px")
                                          .style("top", (event.pageY - 28) + "px");

                                          activeCommunity = d.community
                                          activeNode = d.node
                                          d3.selectAll("rect")
                                           .classed("strokechange", function(d) {
                                              if ( d.target == activeCommunity) return true;
                                              else return false;
                                           })

                                           d3.selectAll("rect")
                                           .classed("barLight", function(d) {
                                              if ( d.x == activeCommunity) return true;
                                              else return false;
                                           })

                                          //highlight table column on hover
                                            d3.selectAll("tr").style("background-color", function(dat,i){
                                              if (dat!== undefined)
                                               {
                                                if(dat.node == find_node_id)
                                                  return "blue";
                                                else if (dat.node == activeNode)
                                                  return "orange";
                                                else
                                                  return "transparent"
                                                }})



                                          /* d3.selectAll("circle")
                                           .attr("opacity", function(d){
                                             if(d.community == activeCommunity) return 1
                                             else return .1} )

                                             all_lines = d3.selectAll("line")
                                             .nodes()
                                             for (each in all_lines){
                                             if(
                                             parseInt(all_lines[each].x1.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cx) &&
                                             parseInt(all_lines[each].y1.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cy) ||
                                             parseInt(all_lines[each].x2.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cx )&&
                                             parseInt(all_lines[each].y2.baseVal.value) == parseInt(center_positions_spiral[activeCommunity].cy))
                                             all_lines[each].style.strokeOpacity = 1
                                             else
                                             all_lines[each].style.strokeOpacity = 0;
                                             }

                                      })

                  .on("mouseout", function(d) {
                                      div.transition()
                                          .duration(500)
                                          .style("opacity", 0);

                                      d3.selectAll(".barLight")
                                      .attr("class", "bar");

                                      d3.selectAll(".strokechange")
                                      .attr("class", "heat_map")

                                      /*d3.selectAll("circle")
                                      .attr("opacity", 1)

                                      d3.select("table").selectAll("tr").style("background-color", function(d,i){
                                        if (d!== undefined)
                                          {
                                            if (d.node == find_node_id)
                                              return "blue";
                                            else
                                              return "transparent"

                                          }})


                                      d3.selectAll(".spiral_edges").style("stroke-opacity", 0)
                                      console.log(d3.selectAll(".spiral_edges").style("stroke-opacity"))

                                  })
                  .on("click", function(event,d) {
                                                    //console.log(d.community)
                                                    new_data1 = global_data_unchanged.filter(function(client){return client.community==d.community})
                                                    console.log(new_data1)
                                                    draw_spiral(new_data1, colorscale(d.density))
                                                    console.log("in click function_now")
                                                    console.log(link_data)
                                                    links_to_highlight = link_data.filter(function(client){return client.source==d.community || client.source==d.community})
                                                    console.log(links_to_highlight)
                                                    d3.selectAll("line")
                                                    .style("stroke", "#DCDCDC")

                                                    console.log(d3.selectAll("line").attr("stroke-opacity"))
                                                    //show only selected community in table
                                                    table.selectAll("tr").remove()
                                                    show_table_data(new_data1)


                                                  });

   node.merge(newElements).transition()
                  .attr("cx", function (d) { return xScale(d.x); })
                  .attr("cy", function (d) { return yScale(d.y); })




//zoom functionality
    /*g.call(d3.zoom().on("zoom", function(event){
      let newXScale = event.transform.rescaleX(xScale)
      let newYScale = event.transform.rescaleY(yScale)


      node.merge(newElements)
          .attr("cx", d=> newXScale(d.x) )
          .attr("cy", d=> newYScale(d.y) )

    }))*/
//comenting legend till line

    //legend attaching
 /*//commentig till 565
var legendheight = 200,
    legendwidth = 80,
    margin = {top: 10, right: 60, bottom: 10, left: 2};

var canvas = d3.select("#legend1")
  .style("height", legendheight + "px")
  .style("width", legendwidth + "px")
  .style("position", "relative")
  .append("canvas")
  .attr("height", legendheight - margin.top - margin.bottom)
  .attr("width", 1)
  .style("height", (legendheight - margin.top - margin.bottom) + "px")
  .style("width", (legendwidth - margin.left - margin.right) + "px")
  .style("border", "1px solid #000")
  .style("position", "absolute")
  .style("top", (margin.top) + "px")
  .style("left", (margin.left) + "px")
  .node();

var ctx = canvas.getContext("2d");

var legendscale = d3.scaleLinear()
  .range([1, legendheight - margin.top - margin.bottom])
  .domain(colorscale.domain());

// image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
var image = ctx.createImageData(1, legendheight);
d3.range(legendheight).forEach(function(i) {
  var c = d3.rgb(colorscale(legendscale.invert(i)));
  image.data[4*i] = c.r;
  image.data[4*i + 1] = c.g;
  image.data[4*i + 2] = c.b;
  image.data[4*i + 3] = 255;
});
ctx.putImageData(image, 0, 0);



var legendaxis = d3.axisRight()
  .scale(legendscale)
  .tickSize(6)
  .ticks(8);

   d3.select("#legend1")
    .attr("height", (legendheight) + "px")
    .attr("width", (legendwidth) + "px")
    .style("position", "absolute")
    .style("left", "15px")
    .style("top", "55px")

g
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
  .call(legendaxis);



g.selectAll("line")

for (let link in link_data){
  console.log("this is new file")
  g.append('line')
  .attr("class", "spiral_edges")
       .style("stroke", "#DCDCDC")
       .style("strokeOpacity",0)
       .style("stroke-width", 3)
       .attr("x1",center_positions_spiral[link_data[link].source].cx)
       .attr("y1", center_positions_spiral[link_data[link].source].cy)
       .attr("x2", center_positions_spiral[link_data[link].target].cx)
       .attr("y2", center_positions_spiral[link_data[link].target].cy)

       .style("stroke-opacity", 0);
}



}*/
