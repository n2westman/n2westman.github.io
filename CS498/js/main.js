const prefix = 'https://n2westman.github.io/CS498';
const baseball = 'baseballdatabank-2019.2';

const addFirstAnnotations =
    function(svg, xScale, yScale, margin) {
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
}

const initFirstGraph = function(data) {
  console.log(data)

  var height = 300;
  var margin = 50;
  var canvas_id = '#first_canvas';
  var svgHtml = document.querySelector(canvas_id);
  svgHtml.style.height = `${height}px`;
  const naturalWidth = svgHtml.clientWidth - 2 * margin;
  const naturalHeight = height - 2 * margin;

  var svg = d3.select(canvas_id);

  var xProp = 'yearID';
  var xMax = Math.max(...data.map((d) => d[xProp]));
  var xMin = Math.min(...data.map((d) => d[xProp]));
  var xValue = function(d) { return d[xProp]; };
  var xScale = d3.scaleLinear([ xMin, xMax ], [ 0, naturalWidth ]);
  var xMap = function(d) { return xScale(xValue(d)); };

  var yProp = 'HR';
  var yMax = Math.max(...data.map((d) => d[yProp]));
  var yMin = Math.min(...data.map((d) => d[yProp]));
  var yValue = function(d) { return d[yProp]; };
  var yScale = d3.scaleLinear([ yMin, yMax ], [ naturalHeight, 0 ]);
  var yMap = function(d) { return yScale(yValue(d)); };

  svg.append('g')
      .attr('transform', `translate(${margin},${margin})`)
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 2);

  svg.append('g')
      .attr('transform', `translate(${margin},${margin})`)
      .call(d3.axisLeft(yScale));

  svg.append('g')
      .attr('transform', `translate(${margin},${height - margin})`)
      .call(d3.axisBottom(xScale));

  addFirstAnnotations(svg, xScale, yScale, margin);
};

$(document).ready(() => {
  d3.csv(`${prefix}/${baseball}/core/Teams.csv`).then(initFirstGraph);

  $('#start_button').click(() => {
    const first = $('#first');
    const firstEl = first.get(0);
    first.height(firstEl.scrollHeight);
  })
});
