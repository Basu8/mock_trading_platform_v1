const mysql = require('mysql');
const express = require('express');
const dotenv = require("dotenv");
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');


// const e = require('express');

// const connection = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE
// });
dotenv.config();
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

connection.connect( (error) => {
    if(error) {
        console.log(error);
    }
    else {
        console.log("MYSQL Connected");
    }
}) 



const app = express();

//app.set('view engine', 'ejs');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.static('private'));

//app.use(express.static('public/login'));
//allowing css,js and images to be accessible to public using static function

app.post('/auth', function(request, response) {
	const username = request.body.username;
	const password = request.body.password;
    // console.log("use" , request.body.username);
    // console.log(request.body.password);
    
	if (username && password) {
		connection.query('SELECT * FROM trader WHERE `userName` = ? AND `password` = ?', [username, password], function(error, results, fields) {
            //console.log(results);
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/dashboard');
			} 
            else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// app.get('/stock', (req, res) => {
// 	console.log('Client requested for live stock data - dataClient connected')
// 	res.setHeader('Content-Type', 'text/event-stream')
// 	res.setHeader('Access-Control-Allow-Origin', '*')
  
// 	const intervalId = setInterval(() => {
// 	  const date = new Date().toLocaleString()
// 	  let price = 10;
// 	  res.write(`data: ${price}\n\n`)
// 	}, 500)
  
// 	res.on('close', () => {
// 	  console.log('Client closed connection')
// 	  clearInterval(intervalId)
// 	  res.end()
// 	})
//   })

app.get('/stock/:price', (req, res) => {
	console.log('Client connected')
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Access-Control-Allow-Origin', '*');


	let lastPrice = parseFloat(req.params.price);
	console.log(lastPrice);

	const intervalId = setInterval(() => {
		let live = 0;
		//console.log(lastPrice);
		live = (lastPrice + ((Math.random()*lastPrice)%(0.01*lastPrice))).toFixed(2);
		res.write(`data: ${live}\n\n`);
		// console.log(live);
	  }, 800)
  
	res.on('close', () => {
	  console.log('Client closed connection')
	  clearInterval(intervalId)
	  res.end()
	})
});

app.post('/reg', function(request, response) {
	const username = request.body.fname;
	const password = request.body.fpass;
	const email = request.body.femail;
	let tID = 0;
	//console.log(request.body.fname);
    // console.log("use" , request.body.username);
    // console.log(request.body.password);
    
	if (username && password && email) {
		connection.query('SELECT * FROM trader WHERE `userName` = ?', [username], function(error, results, fields) {
            //console.log(results);
			if (results.length > 0) {
				response.send('user named ' + request.body.fname + ' already exists, please signin');
			} 
            else {
				connection.query('INSERT INTO `trader`(`userName`, `password`, `email`) VALUES (?,?,?)', [username, password, email], function(error, results, fields) {
					//console.log(results);
					//response.send(results);
					//response.send('User registered, login now');
					});
				
				connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
						//console.log(results[0]["traderID"]);
						// console.log(results);
						// console.log(fields);
						//response.send(results);
						// response.send('User register, login now');
						tID = results[0]["traderID"];
						connection.query('CREATE TABLE `mock-trade`.`trades?` ( `tradeID` INT UNSIGNED NOT NULL AUTO_INCREMENT , `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP, `equityName` VARCHAR(40) NOT NULL , `equitySymbol` VARCHAR(20) NOT NULL , `buyPrice` FLOAT UNSIGNED NOT NULL , `sellPrice` FLOAT UNSIGNED NULL DEFAULT NULL , `isSettled` BOOLEAN NOT NULL DEFAULT FALSE , `quantity` INT UNSIGNED NOT NULL, `totalPrice` FLOAT NULL DEFAULT NULL, PRIMARY KEY (`tradeID`)) ENGINE = InnoDB', [tID], function(error, results, fields) {
							//let tID = results[0]["traderID"];
							console.log(results);
							console.log(tID);
							// console.log(fields);
							//response.send(results);
							// response.send('User register, login now');
							});
				});
							response.send('User register, login now');
							response.end();

						}		
					});	
				}
						
			
		
	
	else {
		response.send('Please enter Username and Password!');
		response.end();
	}
	});


app.get('/logout', function(request, response) {
				request.session.loggedin = false;
				request.session.username = undefined;
				response.redirect('/login');
	}
);

app.get('/dashboard', function(request, response) {
	// if (request.session.loggedin)
	if(1) {
		app.use(express.static('private/chart'));
		//app.use(express.static('public'));
		response.sendFile(path.join(__dirname + '/private/chart/index.html'));
		//response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});

app.get('/register', function(request, response) {
    //console.log(request.session.loggedin);
    if(request.session.loggedin === false || request.session.loggedin === undefined)
    {
	//app.use(express.static('public/login'));
	//does not work for some reason, page loads as if css and images were not allowed access
	
		//app.use(express.static('public'));
		response.sendFile(path.join(__dirname + '/public/register/index.html'));

	//app.use(express.static(''));
    }
    else {
        response.redirect('/dashboard');
    }
});

//app.use(express.static('/public/login'));
app.get('/login', function(request, response) {
    //console.log("hello");
    //console.log(request.session.loggedin);
    if(request.session.loggedin === false || request.session.loggedin === undefined)
    {
	//app.use(express.static('public/login'));
	//does not work for some reason, page loads as if css and images were not allowed access
	
		app.use(express.static('public'));
		response.sendFile(path.join(__dirname + '/public/login/index.html'));
		response.end();

	//app.use(express.static(''));
    }
    else {
        response.redirect('/dashboard');
    }
	
});

// app.get('/buy', function(request, response) {
// 	if (request.session.loggedin)
// 	{	
// 		let username = request.session.username;
// 		let equityName = request.body.equityName;
// 		let equitySymbol = request.body.equitySymbol;
// 		let buyPrice = request.body.buyPrice;
// 		let quantity = request.body.quantity;
// 		let totalPrice = (buyPrice * quantity).toFixed(2); 

// 		connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
// 			traderID = results[0]["traderID"];
// 			console.log(traderID);
// 			connection.query('INSERT INTO `trades?`(`equityName`, `equitySymbol`, `buyPrice`, `quantity`, `totalPrice`) VALUES (?,?,?,?,?)', [traderID, equityName, equitySymbol,buyPrice,quantity,totalPrice], function(error, results, fields) {
// 				console.log(results);
// 				//response.send(results);
// 				//response.send('User registered, login now');
// 				});
// 			});	

app.post('/buy', function(request, response) {
	if (request.session.loggedin)
	{	
		let username = request.session.username;
		//console.log(username);
		let equityName = request.body.equityName;
		// console.log(request);
		//.equityName;
		console.log(equityName);

		let equitySymbol = request.body.equitySymbol;
		console.log(equitySymbol);
		let buyPrice = request.body.buyPrice;
		console.log(buyPrice);
		let quantity = request.body.quantity;
		console.log(quantity);
		let totalPrice = (buyPrice * quantity).toFixed(2); 
		console.log(totalPrice);

		connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
			console.log("inside buy select block");
			traderID = results[0]["traderID"];
			console.log(traderID);
			connection.query('INSERT INTO `trades?`(`equityName`, `equitySymbol`, `buyPrice`, `quantity`, `totalPrice`) VALUES (?,?,?,?,?)', [traderID, equityName, equitySymbol,buyPrice,quantity,totalPrice], function(error, results, fields) {
				console.log("inside buy insert block");
				console.log(results);
				//response.send(results);
				//response.send('User registered, login now');
				});
			});	
	// 	app.use(express.static('/private'));
	// 	response.sendFile(path.join(__dirname + '/private/apexchart/index.html'));
	// 	//response.send('Welcome back, ' + request.session.username + '!');
	// } else {
	// 	response.send('Please login to view this page!');
	// }
	//response.end();

	// console.log(request.session.username);
	}
	else {
			response.send('Please login to view this page!');
	}
});

app.get('/sell', function(request, response) {
	if (request.session.loggedin)
	{	
		let username = request.session.username;
		let equityName = request.body.equityName;
		let equitySymbol = request.body.equitySymbol;
		let sellPrice = request.body.buyPrice;
		let squantity = request.body.quantity;
		let totalPrice = (buyPrice * quantity).toFixed(2); 
		let tradeID = -1;

		connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
			traderID = results[0]["traderID"];
			console.log(traderID);
			connection.query('SELECT `tradeID`, `quantity` FROM `trades?` WHERE `equityName` = ?', [traderID, equityName], function(error, results, fields) {
				console.log(results[0]["tradeID"]);
				tradeID = results[0]["tradeID"];
				if(results[0]["tradeID"]) {
					bquantity = results[0]["quantity"];
					if(bquantity === squantity) {
						let totalPrice = (sellPrice * squantity).toFixed(2);
						connection.query('INSERT INTO `trades?`(`sellPrice`, `isSettled`,  `totalPrice`) VALUES (?,?,?,?) WHERE `tradeID` = ?', [traderID, sellPrice, 1, totalPrice], function(error, results, fields) {
						//console.log(results[0]["tradeID"]);
						//tradeID = results[0]["tradeID"];
						console.log("Inside sell insert query");
						console.log(result);
						});
					}

				else{
					response.send("Quantity mismatch between holdings and sell order");
				}
			}
			else {
				response.send("You do not have any shares of " + equityName);
			}
				//response.send(results);
				//response.send('User registered, login now');
				});
			});	
	}
	else {
			response.send('Please login to view this page!');
	}
});


app.listen(5001, () => {
    console.log("server on 5001");
});