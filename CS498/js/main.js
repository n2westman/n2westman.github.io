const prefix = 'https://n2westman.github.io/CS498';
const baseball = 'baseballdatabank-2019.2';
const canvas_id = '#first_canvas';
const margin = 50;
const height = 300;
const x_axis = 'x_axis';
const y_axis = 'y_axis';

let timeout;

const id = function(d) { return d.yearID + d.teamID; };

const removeAnnotations = function() {
  const svg = d3.select(canvas_id);
  svg.selectAll('.annotation-group').remove();
};

const getNaturalWidth = function() {
  const svgHtml = document.querySelector(canvas_id);
  return svgHtml.clientWidth - 2 * margin;
};

const getNaturalHeight = function() { return height - 2 * margin; };

const setXAxis = function(xScale) {
  d3.select(canvas_id)
      .append('g')
      .attr('transform', `translate(${margin},${height - margin})`)
      .attr('id', x_axis)
      .call(d3.axisBottom(xScale));
};

const removeXAxis = function() { d3.select(`#${x_axis}`).remove(); };

const setYAxis = function(yScale) {
  d3.select(canvas_id)
      .append('g')
      .attr('transform', `translate(${margin},${margin})`)
      .attr('id', y_axis)
      .call(d3.axisLeft(yScale));
};

const removeYAxis = function() { d3.select(`#${y_axis}`).remove(); };

const addFirstAnnotations = function(xScale, yScale) {
  const svg = d3.select(canvas_id);
  const annotations = [
    {
      note : {
        label : "Babe Ruth hits 29 home runs in 1919",
        title : "End of Dead Ball Era",
      },
      connector : {
        end : "arrow" // 'dot' also available
      },
      x : xScale(1919),
      y : yScale(45),
      dy : -100,
      dx : -50,
    },
    {
      note : {
        label : "Teams play 8 more games",
        title : "MLB Schedule Expands",
      },
      connector : {
        end : "arrow" // 'dot' also available
      },
      x : xScale(1960),
      y : yScale(193),
      dy : -30,
      dx : -10,
    },
  ].map(function(d) {
    d.color = "#E8336D";
    return d;
  });
  const makeAnnotations =
      d3.annotation().type(d3.annotationLabel).annotations(annotations);

  svg.append('g')
      .attr('transform', `translate(${margin},${margin})`)
      .attr("class", "annotation-group")
      .call(makeAnnotations);
};

const addSecondAnnotations = function(xScale, yScale) {
  const svg = d3.select(canvas_id);
  const annotations = [
    {
      note : {
        label : "Teams are limited to ~100 games",
        title : "1981 Baseball Strike",
      },
      connector : {
        end : "arrow" // 'dot' also available
      },
      x : xScale(1981),
      y : yScale(104),
      dy : -100,
      dx : -50,
    },
  ].map(function(d) {
    d.color = "#E8336D";
    return d;
  });
  const makeAnnotations =
      d3.annotation().type(d3.annotationLabel).annotations(annotations);

  svg.append('g')
      .attr('transform', `translate(${margin},${margin})`)
      .attr("class", "annotation-group")
      .call(makeAnnotations);
};

const addThirdAnnotations = function(xScale, yScale) {
  const svg = d3.select(canvas_id);
  const annotations = [
    {
      note : {
        label : "All-time leader in home runs",
        title : "Barry Bonds Retires",
      },
      connector : {
        end : "arrow" // 'dot' also available
      },
      x : xScale(2007),
      y : yScale(138),
      dy : -100,
      dx : 50,
    },
    {
      note : {
        label : "Most HR by a team in a season (NYY)",
        title : "MLB HR Record",
      },
      connector : {
        end : "arrow" // 'dot' also available
      },
      x : xScale(2018),
      y : yScale(267),
      dy : -1,
      dx : -70,
    },
  ].map(function(d) {
    d.color = "#E8336D";
    return d;
  });
  const makeAnnotations =
      d3.annotation().type(d3.annotationLabel).annotations(annotations);

  svg.append('g')
      .attr('transform', `translate(${margin},${margin})`)
      .attr("class", "annotation-group")
      .call(makeAnnotations);
};

const createDataPoints = function(sel, div, xMap, yMap) {
  return sel.append('circle')
      .attr("class", "data-point")
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 2)
      .on("mouseover",
          (d) => {
            div.transition().duration(200).style("opacity", .9);
            div.html(d.name + "<br/>" + d.HR)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
          })
      .on("mouseout",
          (d) => { div.transition().duration(500).style("opacity", 0); });
};

const initFirstGraph = function(data) {
  const svgHtml = document.querySelector(canvas_id);
  svgHtml.style.height = `${height}px`;

  const svg = d3.select(canvas_id);
  svg.html("");

  var xProp = 'yearID';
  var xMax = Math.max(...data.map((d) => d[xProp]));
  var xMin = Math.min(...data.map((d) => d[xProp]));
  var xValue = function(d) { return d[xProp]; };
  var xScale = d3.scaleLinear([ xMin, xMax ], [ 0, getNaturalWidth() ]);
  var xMap = function(d) { return xScale(xValue(d)); };

  var yProp = 'HR';
  var yMax = Math.max(...data.map((d) => d[yProp]));
  var yMin = Math.min(...data.map((d) => d[yProp]));
  var yValue = function(d) { return d[yProp]; };
  var yScale = d3.scaleLinear([ yMin, yMax ], [ getNaturalHeight(), 0 ]);
  var yMap = function(d) { return yScale(yValue(d)); };

  // Define the div for the tooltip
  const div = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip bs-tooltip-top")
                  .style("opacity", 0);
  const sel = svg.append('g')
                  .attr('transform', `translate(${margin},${margin})`)
                  .selectAll('circle')
                  .data(data, id);
  createDataPoints(sel.enter(), div, xMap, yMap);

  setXAxis(xScale);
  setYAxis(yScale);

  addFirstAnnotations(xScale, yScale);
};

const firstToSecond = (data) => {
  const dataToKeep = data.filter((d) => +d.yearID >= 1961);
  const svg = d3.select(canvas_id);

  // Remove annotations
  removeAnnotations();

  // Remove data points
  const sel = svg.selectAll('circle').data(dataToKeep, id);

  sel.exit().style('opacity', 0).transition().delay(1000).remove();

  // Re-scale x axis
  var xProp = 'yearID';
  var xMax = Math.max(...dataToKeep.map((d) => d[xProp]));
  var xMin = Math.min(...dataToKeep.map((d) => d[xProp]));
  var xValue = function(d) { return d[xProp]; };
  var xScale = d3.scaleLinear([ xMin, xMax ], [ 0, getNaturalWidth() ]);
  var xMap = function(d) { return xScale(xValue(d)); };

  var yProp = 'HR';
  var yMax = Math.max(...data.map((d) => d[yProp]));
  var yMin = Math.min(...data.map((d) => d[yProp]));
  var yValue = function(d) { return d[yProp]; };
  var yScale = d3.scaleLinear([ yMin, yMax ], [ getNaturalHeight(), 0 ]);
  var yMap = function(d) { return yScale(yValue(d)); };

  sel.transition().delay(1000).attr('cx', xMap);

  removeXAxis();
  timeout = setTimeout(() => {
    addSecondAnnotations(xScale, yScale);
    setXAxis(xScale);
  }, 1500);
};

const secondToThird = (data) => {
  const dataToKeep = data.filter((d) => +d.yearID >= 2000);
  const svg = d3.select(canvas_id);

  // Remove annotations
  removeAnnotations();

  // Remove data points
  const sel = svg.selectAll('circle').data(dataToKeep, id);

  sel.exit().style('opacity', 0).transition().delay(1000).remove();

  // Re-scale x axis
  var xProp = 'yearID';
  var xMax = Math.max(...dataToKeep.map((d) => d[xProp]));
  var xMin = Math.min(...dataToKeep.map((d) => d[xProp]));
  var xValue = function(d) { return d[xProp]; };
  var xScale = d3.scaleLinear([ xMin, xMax ], [ 0, getNaturalWidth() ]);
  var xMap = function(d) { return xScale(xValue(d)); };

  var yProp = 'HR';
  var yMax = Math.max(...data.map((d) => d[yProp]));
  var yMin = Math.min(...data.map((d) => d[yProp]));
  var yValue = function(d) { return d[yProp]; };
  var yScale = d3.scaleLinear([ yMin, yMax ], [ getNaturalHeight(), 0 ]);
  var yMap = function(d) { return yScale(yValue(d)); };

  sel.transition().delay(1000).attr('cx', xMap);

  removeXAxis();
  timeout = setTimeout(() => {
    addThirdAnnotations(xScale, yScale);
    setXAxis(xScale);
  }, 1500);
};

thirdToSecond = (data) => {
  const dataToKeep = data.filter((d) => +d.yearID >= 1961);
  const svg = d3.select(canvas_id);

  // Remove annotations
  removeAnnotations();

  // Remove data points
  const sel = svg.select('g').selectAll('circle').data(dataToKeep, id);

  // Re-scale x axis
  var xProp = 'yearID';
  var xMax = Math.max(...dataToKeep.map((d) => d[xProp]));
  var xMin = Math.min(...dataToKeep.map((d) => d[xProp]));
  var xValue = function(d) { return d[xProp]; };
  var xScale = d3.scaleLinear([ xMin, xMax ], [ 0, getNaturalWidth() ]);
  var xMap = function(d) { return xScale(xValue(d)); };

  var yProp = 'HR';
  var yMax = Math.max(...data.map((d) => d[yProp]));
  var yMin = Math.min(...data.map((d) => d[yProp]));
  var yValue = function(d) { return d[yProp]; };
  var yScale = d3.scaleLinear([ yMin, yMax ], [ getNaturalHeight(), 0 ]);
  var yMap = function(d) { return yScale(yValue(d)); };

  sel.exit().style('opacity', 0).transition().delay(1000).remove();

  sel.transition().delay(1000).attr('cx', xMap);

  removeXAxis();
  timeout = setTimeout(() => {
    addSecondAnnotations(xScale, yScale);
    createDataPoints(sel.enter(), d3.select(".tooltip"), xMap, yMap);
    setXAxis(xScale);
  }, 1500);
};

// Exactly like above with different annotations.
secondToFirst = (data) => {
  const dataToKeep = data;
  const svg = d3.select(canvas_id);

  // Remove annotations
  removeAnnotations();

  // Remove data points
  const sel = svg.select('g').selectAll('circle').data(dataToKeep, id);

  // Re-scale x axis
  var xProp = 'yearID';
  var xMax = Math.max(...dataToKeep.map((d) => d[xProp]));
  var xMin = Math.min(...dataToKeep.map((d) => d[xProp]));
  var xValue = function(d) { return d[xProp]; };
  var xScale = d3.scaleLinear([ xMin, xMax ], [ 0, getNaturalWidth() ]);
  var xMap = function(d) { return xScale(xValue(d)); };

  var yProp = 'HR';
  var yMax = Math.max(...data.map((d) => d[yProp]));
  var yMin = Math.min(...data.map((d) => d[yProp]));
  var yValue = function(d) { return d[yProp]; };
  var yScale = d3.scaleLinear([ yMin, yMax ], [ getNaturalHeight(), 0 ]);
  var yMap = function(d) { return yScale(yValue(d)); };

  sel.exit().style('opacity', 0).transition().delay(1000).remove();

  sel.transition().delay(1000).attr('cx', xMap);

  removeXAxis();
  timeout = setTimeout(() => {
    addFirstAnnotations(xScale, yScale);
    createDataPoints(sel.enter(), d3.select(".tooltip"), xMap, yMap);
    setXAxis(xScale);
  }, 1500);
};

const setStateOneText = () => {
  $('#text').html(
      "Number Home Runs by each team according to year. You'll see that in general, the number has been increasing over time. What happens if we focus in on only 162-game seasons?");
};

const setStateTwoText = () => {
  $('#text').html(
      "Excluding years before 1960 shows us a clearer picture. There's still a positive trend, but not as noticable.");
};

const setStateThreeText = () => {
  $('#text').html(
      "Zooming in closer, we can see the end of the steroids era in comparison to the most recent decade. It looks like there was a slight decline in home runs in the mid 2010's, but otherwise flat. Maybe pitchers are suffering from recency bias!");
};

const adjustHeight = () => {
  const first = $('#first');
  const firstEl = first.get(0);
  first.height(firstEl.scrollHeight);
};

$(document).ready(() => {
  const dataPromise = d3.csv(`${prefix}/${baseball}/core/Teams.csv`);
  dataPromise.then(initFirstGraph);
  let state = 1;

  $('#start_button').click(() => {
    setStateOneText();
    adjustHeight();
  });

  $('#next_button').click(async () => {
    clearTimeout(timeout);
    // Go to next state
    if (state == 1) {
      firstToSecond(await dataPromise);
      $('#prev_button').removeClass('disabled');
      $('#next_button').removeClass('disabled');
      setStateTwoText();
      adjustHeight();
      state = 2;
    } else if (state == 2) {
      secondToThird(await dataPromise);
      $('#next_button').addClass('disabled');
      setStateThreeText();
      adjustHeight();
      state = 3;
    }
  });

  $('#prev_button').click(async () => {
    clearTimeout(timeout);

    if (state == 2) {
      secondToFirst(await dataPromise);
      $('#next_button').removeClass('disabled');
      $('#prev_button').addClass('disabled');
      setStateOneText();
      adjustHeight();
      state = 1;
    } else if (state == 3) {
      thirdToSecond(await dataPromise);
      $('#prev_button').removeClass('disabled');
      $('#next_button').removeClass('disabled');
      setStateTwoText();
      adjustHeight();
      state = 2;
    }
  });
});
