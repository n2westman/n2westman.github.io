const prefix = 'https://n2westman.github.io/CS498';
const baseball = 'baseballdatabank-2019.2';
$(document).ready(() => {
  let teamsData;
  d3.csv(`${prefix}/${baseball}/core/Teams.csv`).then(data => teamsData = data);

  $('#start_button').click(() => {
    console.log(teamsData);
    const first = $('#first');
    const firstEl = first.get(0);
    first.height(firstEl.scrollHeight);
  })
});
