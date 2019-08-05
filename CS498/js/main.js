const prefix = 'https://n2westman.github.io/CS498';
const baseball = 'baseballdatabank-2019.2';

const initFirstGraph = function(data) {
  console.log(data)

  var svg = d3.select('#first_canvs');

  var xValue = function(d) { return d.AverageCityMPG; },
      xScale = d3.scaleLog([ 10, 150 ], [ 0, 200 ]),
      xMap = function(d) { return xScale(xValue(d)); };

  var yValue = function(d) { return d.AverageHighwayMPG; },
      yScale = d3.scaleLog([ 10, 150 ], [ 200, 0 ]),
      yMap = function(d) { return yScale(yValue(d)); };

  svg.append('g')
      .attr('transform', 'translate(50,50)')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 2)

  svg.append('g')
      .attr('transform', 'translate(50,50)')
      .call(d3.axisLeft(yScale)
                .tickValues([ 10, 20, 50, 100 ])
                .tickFormat(d3.format("~s")));
  svg.append('g')
      .attr('transform', 'translate(50,250)')
      .call(d3.axisBottom(xScale)
                .tickValues([ 10, 20, 50, 100 ])
                .tickFormat(d3.format("~s")));


};

$(document).ready(() => {
  d3.csv(`${prefix}/${baseball}/core/Teams.csv`).then(initFirstGraph);

  $('#start_button').click(() => {
    const first = $('#first');
    const firstEl = first.get(0);
    first.height(firstEl.scrollHeight);
  })
});
