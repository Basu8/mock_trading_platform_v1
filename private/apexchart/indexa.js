//Pseudo code
//Step 1: Define chart properties.
//Step 2: Create the chart with defined properties and bind it to the DOM element.
//Step 3: Add the CandleStick Series.
//Step 4: Set the data and render.
//Step5 : Plug the socket to the chart


//Code
const log = console.log;

const chartProperties = {
  width:1500,
  height:600,
  timeScale:{
    timeVisible:true,
    secondsVisible:false,
  }
}

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement,chartProperties);
const candleSeries = chart.addCandlestickSeries();

let final = [];

setTicks=(symbol,api)=>{
  let queryURL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${api}`;
  console.log(queryURL);
  fetch(queryURL)
   .then(res => res.json())
  .then(data => {
    // console.log(data);
      let keys = Object.keys(data["Time Series (Daily)"]);
      //let final = [];
      keys.map((currDate) => {
          // console.log((parseFloat(data["Time Series (Daily)"][currDate]["1. open"])).toFixed(2));
          // console.log(data["Time Series (Daily)"][currDate]["1. open"]);
          let singleCandle = {
              time: currDate,
              open: parseFloat(data["Time Series (Daily)"][currDate]["1. open"]).toFixed(2),
              high: parseFloat(data["Time Series (Daily)"][currDate]["2. high"]).toFixed(2),
              low: parseFloat(data["Time Series (Daily)"][currDate]["3. low"]).toFixed(2),
              close: parseFloat(data["Time Series (Daily)"][currDate]["4. close"]).toFixed(2),
          }
          final.push(singleCandle);
      });
    // const cdata = data.map(d => {
    //   return {time:d[0]/1000,open:parseFloat(d[1]),high:parseFloat(d[2]),low:parseFloat(d[3]),close:parseFloat(d[4])}
    // });
    //console.log(final);
    candleSeries.setData(final.reverse());
  })
  .catch(err => log(err))
  // final.reverse();
  console.log(final);
  // return final;
}
setTicks("IBM","demo")


	

const eventSource = new EventSource('http://localhost:5001/stock/100')

function updateMessage (message) {
  // const list = document.getElementById('messages')
  // const item = document.createElement('p')
  // item.textContent = message
  // list.appendChild(item)
  console.log(message);
}

eventSource.onmessage = function (event) {
  // console.log("event dataa: " + event.data);
  let newCandle = {
              time: final[length-1][time],
              open: final[length-1][open],
              high: final[length-1][high],
              low: final[length-1][low],
              close: parseFloat(event.Data),
          }
  
  console.log(newCandle);
  candleSeries.update(newCandle);

}

eventSource.onerror = function () {
  console.log('Server closed connection')
  eventSource.close()
}


//Dynamic Chart
// const socket = io.connect('http://127.0.0.1:4000/');

// socket.on('KLINE',(pl)=>{
//   //log(pl);
//   candleSeries.update(pl);
// });
