// var p = d3.select('body').selectAll('p')
//           .data([4, 8, 15, 16, 23, 42])
//           .text(function(d) {return d})
//
// p.enter().append('p')
//           .text(function(d) {return d})
//
// p.exit().remove();

function changeColors() {
  d3.selectAll('p').style('background-color', function() {
    return 'hsl(' + Math.random() * 360 + ', 100%, 50%)'
  })
}

var isBlack = false

function fade() {
  d3.select('body').transition()
    .duration(1000)
    .style('background-color', function() {
      isBlack = !isBlack
      return isBlack ? 'black' : 'white'
    })
}

var typeArr = [];

var lookup = {}

d3.csv('./data/types.csv', function(data) {
  data.forEach(function(d, i, data) {
    typeArr.push({id: d.id, name: d.identifier, count: 0})
    if(i === data.length -1) {
      for(var i = 0; i < typeArr.length; i++) {
        lookup[typeArr[i].id] = typeArr[i]
      }
    }
  })
})

d3.csv('./data/pokemon_types.csv', function(data) {
  data.forEach(function(d, i, data) {
    d.type_id = +d.type_id
    lookup[d.type_id].count++
    if(i === data.length -1) {
      readPokemon();
    }
  })
})

function readPokemon() {
  var data = typeArr;
  var pieWidthHeight = 500;
  var radius = pieWidthHeight / 2;

  var color = d3.scale.ordinal()
    .range(['#CA98A6', '#EF6239', '#94B2C7', '#9B69DA', '#A8702D',
            '#8B3E22', '#3C9950', '#906791', '#60756E', '#FD4B5A',
            '#1552E1', '#27CB50', '#FAFA72', '#A52A6C', '#85D2F5',
            '#428792', '#595978', '#F71D92'])

  var div = d3.select('body')
    .append('div')
    .attr('class', 'tip')
    .style('opacity', 0);

  var svg = d3.select('#chart')
    .append('svg')
    .attr('width', pieWidthHeight)
    .attr('height', pieWidthHeight)
    .append('g')
    .attr('transform', 'translate(' + radius + ',' + radius + ')');

  var arc = d3.svg.arc()
    .outerRadius(radius)

  var labelArc = d3.svg.arc()
    .outerRadius(radius - 50)
    .innerRadius(radius - 50)

  var pie = d3.layout.pie()
    .value(function(d) {return d.count})
    .sort(null)


  var g = svg.selectAll('.arc')
  .data(pie(data))
  .enter().append('g')
  .attr('class', 'arc');

  g.append('path')
    .attr('d', arc)
    .style('fill', function(d) {return color(d.data.id)})
    .on('mouseover', function(d) {
      div.transition()
        .duration(200)
        .style('opacity', .9);
      div.html(d.data.count + '<br/>Pokemon')
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY) + 'px')
    })
    .on('mouseout', function(d) {
      div.transition()
        .duration(500)
        .style('opacity', 0);
    })

  g.append('text')
    .attr('transform', function(d) {return 'translate(' + labelArc.centroid(d) + ')'})
    .attr('dy', '.35em')
    .text(function(d) {return d.data.name})
}


// Sales time - s'do this


function readSales() {
  var productArr = []
  var productLookup = {};

  var salesData = d3.json('./data/salesData.json', function(err, data) {
    data.forEach(function(d, i, data) {
      var formatCurr = Number(d.Quote.replace(/[^0-9\.]+/g, ''))
      if(!productLookup.hasOwnProperty(d.Product)) {
        productArr.push({product: d.Product, total: formatCurr})
        productLookup[d.Product] = productArr[productArr.length -1]
      } else {
        productLookup[d.Product].total += formatCurr
      }

      if(i === data.length -1) {
        makeSalesChart()
      }
    })

    function makeSalesChart() {
      var margin = {top: 20, right: 20, bottom: 120, left: 60}
        , width = 1200 - margin.left - margin.right
        , height = 1000 - margin.top - margin.bottom

      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1)

      var y = d3.scale.linear()
          .range([height, 0])

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .ticks(10, '$')

      var svg = d3.select('body').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      var data = productArr

      x.domain(data.map(function(d) {return d.product}))
      y.domain([0, d3.max(data, function(d) {return d.total})])

      svg.append('g')
          .attr('class', 'xAxis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis)
        .selectAll('text')
          .attr('transform', 'rotate(90) translate(10,-15)')
          .style('text-anchor', 'start')

      svg.append('g')
          .attr('class', 'yAxis')
          .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Total')

      svg.selectAll('.bar')
          .data(data)
        .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', function(d) {return x(d.product)})
          .attr('width', x.rangeBand())
          .attr('y', function(d) {return y(d.total)})
          .attr('height', function(d) {return height - y(d.total)})
    }
  });
}

readSales()
