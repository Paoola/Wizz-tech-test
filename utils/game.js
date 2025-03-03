const getTop100Games = (os) => fetch(`https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/${os}.top100.json`)
    .then(res => res.json())
    .then(data => data.reduce((acc, group) => [...acc, ...group], []).slice(0, 100))

module.exports = { getTop100Games }