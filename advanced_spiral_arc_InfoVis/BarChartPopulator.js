let coarse_graph_data;
let center_positions_spiral;
let link_data;
let node_to_node_link_data


//for community size barchart
function showdata_count(data){
  //transform data
  data = data.map(d=> ({
    x : d.community,
    y : parseFloat(d.count)
  }))
  console.log(data)
  data.sort(function(a,b){return d3.ascending(a.x, b.x)})
  console.log(data)
  var svg = d3.select("#barchart-no_of_nodes")
  initializeChart(svg),
  draw(data, "Community", "Number_of_nodes", "Number of nodes in each community");
}

function showdata_spiral_community_chart(data){

  //define height and width of svg
  //let width = 700,
  //height = 700;

    //assign height and width of svg
    let svg = d3.select("#chart")
    let bounds = svg.node().getBoundingClientRect()
    let width = bounds.width
    let height = bounds.height
    console.log(width, height)
    initializeSpiralChart(svg, height, width)

  //coarse_graph_data
    coarse_graph_data = data[6]
    center_positions_spiral = string_to_numbers_graph_centers(coarse_graph_data)
    console.log(center_positions_spiral)
  //transforming the coordinates
    center_positions_spiral=transform_graph_centers(center_positions_spiral, height, width)
    center_positions_spiral.sort(function(a,b){return d3.ascending(a.community, b.community)})
    console.log(center_positions_spiral)
    //transform_link data
    link_data = transform_link_data(data[2])
    //connections list
    connections_list = data[4]
    extent_of_centralities_after_removing_outliers = data[5]
    //console.log(connections_list)
    //optimal_no_of_nodes = optimal_no_of_nodes(data[6]) //added by bhanu
    /*
    //all links read here
    node_to_node_link_data = transform_node_to_node_link_data(data[3])
    console.log(node_to_node_link_data)
    */
  //transform data from strings to integers
    data = transform_data(data[0])
    console.log(data)

  //calculate final x and y position for each point
    data = computing_spiral_positions(center_positions_spiral, data, height, width)
    // added one more variable optimal_no_of_nodes by bhanu in computing_spiral_positions function
    console.log(data)
    global_data = data //changes with interactions
    global_data_unchanged = data
    global_data_sorted = data
    global_data_sorted.sort(function(a,b){return d3.descending(a.node, b.node)})
    console.log(global_data_sorted)
    global_data = global_data_sorted

    let prepare_data = []
    unique_communities = new Set(global_data_unchanged.map(function(d){return d.community}))
    console.log("updated_version_degree")
    unique_communities.forEach(function(entry) {
      community_data = global_data_unchanged.filter(function(d){ return d.community == entry});
      community_data.sort(function(a,b){return d3.descending(a.centrality,b.centrality)})
      prepare_data.push.apply(prepare_data,community_data)
    })
    console.log(prepare_data)

    prepare_data = computing_spiral_positions(center_positions_spiral, prepare_data, height, width)
    global_data = prepare_data
    global_data_unchanged = prepare_data
    console.log(global_data)

  

  draw_spiral_community()
 
}





function uploadD3(community_id){
  
  d3.csv("commuity_count.csv").then(showdata_count)

  Promise.all([
    d3.csv("facebook_data_transformed_new.csv"),
    d3.csv("coarse_graph_pos.csv"),
    d3.csv("link_data.csv"),
    d3.csv("node_to_node_link_data.csv"),
    d3.json("connection_list.json"),
    d3.json("new_extent_without_outliers_for_colorcoding.json"), 
    d3.csv("commuity_count.csv")
    ]).then(showdata_spiral_community_chart)
}

console.log("bhanu bhanu populator")

uploadD3(1)

