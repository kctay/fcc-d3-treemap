/********************************************************
**  Guides and reading materials
**  https://d3indepth.com/layouts/
**  https://bl.ocks.org/d3indepth/96649ce5ef72d53386790908fe785a6a
**  https://github.com/d3/d3-hierarchy/blob/master/README.md
**  https://beta.observablehq.com/@mbostock/d3-treemap
**  https://strongriley.github.io/d3/ex/treemap.html
**  https://wizardace.com/d3-treemap/
*********************************************************/
var DATASETS = {
  kickstarter: {
    Title: "Kickstarter Pledges",
    Description: "Top 100 Most Pledged Kickstarter Campaigns (By Category)",
    JSONURL: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
  },
  movies: {
    Title: "Movie Sales",
    Description: "Top 100 Highest Grossing Movies (By Genre)",
    JSONURL: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  },
  videogames: {
    Title: "Video Game Sales",
    Description: "Top 100 Most Sold Video Games (by Platform)",
    JSONURL: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
  }
};


  /*********************
  **  window.location.search - returns a string portion of the current url
  **  https://webplatform.github.io/docs/apis/location/search/
  **  https://www.w3schools.com/js/js_window_location.asp
  ***********************
  ** URLSearchParams()  - Constructor returning a URLSearchParams object.
  ** URLSearchParams.get()  - Returns the first value associated to the given search parameter.
  **  https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  **************************/


var urlParams = new URLSearchParams(window.location.search);
var DEFAULT_DATASET = "movies";
var DATASET = DATASETS[urlParams.get("data") || DEFAULT_DATASET];
// on load will be default_dataset, which is kickstarter data page

document.getElementById("title").innerHTML = DATASET.Title;
document.getElementById("description").innerHTML = DATASET.Description;


var w = 1080;
var h = 640;

// d3 v4.0 color scales - ordinal
// https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
// d3 v5 no longer support d3.schemeCategory20*
// for this exercise we generate our list of 20 colors with
//  https://stackoverflow.com/questions/20847161/how-can-i-generate-as-many-colors-as-i-want-using-d3
//  https://jnnnnn.blogspot.com/2017/02/distinct-colours-2.html
var color = ["#525c72", "#21ce03", "#fe3302", "#fa46ff", "#876d0d", "#a24568", "#159bfc", "#14926d", "#9149f8", "#fd5a93", "#85706a", "#ad4d1e", "#4a8b00", "#a96bb1", "#04859b", "#4d6643", "#e2770f", "#4567c6", "#d517a9", "#76527b"];

var tooltip = d3.select("#treemap")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0.0);

var svg = d3.select("#treemap")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var treemapLayout = d3.treemap()
                      .size([w, h])
                //    .paddingOuter(2)
                      .paddingTop(19);
                //    .paddingInner(10)

/*****************************************************************/


/*****************************************************************/

d3.json(DATASET.JSONURL).then(function (data) {


  /**************************************************************
  legend

  https://stackoverflow.com/questions/51520596/spread-d3-js-legend-on-two-columns

  https://stackoverflow.com/questions/20363970/d3-js-charts-show-legend-in-two-rows

  compare with official fcc example
  check var legend part

  **************************************************************/

  var categories = data.children.map(function (item) {
    return item.name;
  });
  // example in movies data, categories would be =
  // ["Action", "Drama", "Adventure", "Family", "Animation", "Comedy", "Biography"]



  var rootNode = d3.hierarchy(data);

  rootNode.sum(function (d) {
    return d.value;
  });


  treemapLayout(rootNode);

  var nodes = d3.select("svg")
                .selectAll("g")
                .data(rootNode.descendants())
                .enter()
                .append("g")
                .attr("transform", function (d) {return "translate(" + [d.x0, d.y0] + ")";})
  // have to tooltip here instead of at cell or foreignObject. else test will not pass
                .on("mousemove", function (d) {//** mousemove instead of mouseover
                  tooltip.transition()
                         .duration(0)
                         .style("opacity", 0.92);
                  tooltip.html("Name: " + d.data.name + "<br/>" + "Category: " + d.data.category + " <br/>" + "Value: " + d.data.value)
                         .attr("data-value", d.data.value)
                         .style("left", d3.event.pageX + 12 + "px")
                         .style("top", d3.event.pageY + "px");
                })
                .on("mouseout", function (d) {
                  tooltip.transition()
                         .duration(0)
                         .style("opacity", 0);
                });



  nodes.append("rect")
       .attr("class", "tile")
       .attr("fill", function (d) {
         var rectCol = "darkgrey"; // set default map rect color
         categories.forEach(function (item, index) {// forEach() to map categories to data.category
           if (item == d.data.category || item == d.data.name) // (and return color via index)
           {rectCol = color[index];} // set rect color for data children (category/subcategory)
         });
         return rectCol;
       })
       .attr("width", function (d) {return d.x1 - d.x0;})
       .attr("height", function (d) {return d.y1 - d.y0;})
       .attr("data-name", function (d) {return d.data.name;})
       .attr("data-category", function (d) {return d.data.category;})
       .attr("data-value", function (d) {return d.data.value;});




  text = d3.selectAll('text');

  nodes.append("foreignObject") // wrap text with "foreignObject" instead of "text"
       .attr("width", function (d) {return d.x1 - d.x0;})
       .attr("height", function (d) {return d.y1 - d.y0;})
       .attr("dx", 4) // doesnt work becos using foreignObject
       .attr("dy", 14) // doesnt work becos using foreignObject
       .attr("font-size", 9)
       .style("color", function (d) {
         var textCol = "black"; // set default map text color
         categories.forEach(function (item) {
           if (item == d.data.category || item == d.data.name)
           {textCol = "white";} // set text color for data children (category/subcategory)
         });
         return textCol;
       })
       .text(function (d) {
         return d.data.name;
       });



  // legend
  //  https://stackoverflow.com/questions/51520596/spread-d3-js-legend-on-two-columns

  var c = 4; // number of columns
  var h_legend = 20; // legend entry height
  var w_legend = 160; // legend entry width (& to position next column)
  var tx = 10; // tx/ty are margin values
  var ty = 10;
  function position(d, i) {
    var x = i % c * w_legend + tx;
    var y = Math.floor(i / c) * h_legend + ty;
    return "translate(" + x + "," + y + ")";
  }


  var legend = d3.select(".legend") // div class legend
                 .append("svg") // create another svg
                 .attr("width", c * w_legend + tx + tx) // legend svg length
                 .attr("height", Math.ceil(categories.length / c) * h_legend + ty + ty) // legend svg height. Math.ceil to round up rows needed
                 .attr("id", "legend")
                 .selectAll("g")
                 .data(categories) // data(["Action", "Drama", "Adventure", "Family", "Animation", "Comedy", "Biography"])
                 .enter()
                 .append("g")
                 .attr("transform", position);


  legend.append("rect")
        .attr("class", "legend-item")
        .attr("width", 20)
        .attr("height", 15)
        .style("stroke", "black") // outline the legend rect
        .attr("fill", function (d, i) {return color[i];});


  legend.append("text")
        .attr("x", 28)
        .attr("y", 12)
        .text(function (d) {return d;});


}, function (error) {
  throw error;
});


//  https://bl.ocks.org/d3indepth/96649ce5ef72d53386790908fe785a6a
