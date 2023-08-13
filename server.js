const mysql = require('mysql');
const express = require('express');
const dotenv = require("dotenv");
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const res = require('express/lib/response');

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



app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());



// app.use(express.static('public/frontz page'));


//allowing css,js and images to be accessible to public using static function

app.get('/', function(request, response) {
    
    
	app.use(express.static('public/frontz page'));
	//does not work for some reason, page loads as if css and images were not allowed access
	
	// app.use(express.static('public'));
		
		response.sendFile(path.join(__dirname + '/public/frontz page/index.html'));
		

    
	
});

app.post('/auth', function(request, response) {
	const username = request.body.username;
	const password = request.body.password;
    
    
	if (username && password) {
		connection.query('SELECT * FROM trader WHERE `userName` = ? AND `password` = ?', [username, password], function(error, results, fields) {
            //console.log(results);
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/dashboard');
			} 
            else {
				
				response.send(`<h1>Incorrect Username and/or Password!</h1> <a href="/login">Click here to go login page</a>`);
			}			
			response.end();
		});
	} else {
		response.send(`<h1>Please Enter the login credentials!</h1> <a href="/login">Click here to go to login page</a>`);
		response.end();
	}
});


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
		console.log(live);
	  }, 800)
  
	res.on('close', () => {
	  console.log('Client closed connection');
	  clearInterval(intervalId);
	  res.end();
	})
});

app.post('/reg', function(request, response) {
	const username = request.body.fname;
	// console.log(username);
	const password = request.body.fpass;
	const email = request.body.femail;
	const name = request.body.fullname;
	console.log(name);
	const phone = request.body.fphone;
	console.log(phone);
	
	let tID = 0;
	//console.log(request.body.fname);
    // console.log("use" , request.body.username);
    // console.log(request.body.password);
    
	if (username && password && email) {
		connection.query('SELECT * FROM trader WHERE `userName` = ?', [username], function(error, results, fields) {
            //console.log(results);
			if (results.length > 0) {
				response.send(`<h1>user named ${request.body.fname} already exists, please signin</h1> <a href="/login">Click here to go to login page</a>`);
				
			} 
            else {
				connection.query('INSERT INTO `trader`(`userName`, `password`, `email`, `name`, `phone`) VALUES (?,?,?,?,?)', [username, password, email,name,phone], function(error, results, fields) {
					//console.log(results);
					//response.send(results);
					
					});
				
				connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
						//console.log(results[0]["traderID"]);
						// console.log(results);
						// console.log(fields);
						
						tID = results[0]["traderID"];
						connection.query('CREATE TABLE `mock-trade`.`trades?` ( `tradeID` INT UNSIGNED NOT NULL AUTO_INCREMENT , `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP, `equityName` VARCHAR(40) NOT NULL , `equitySymbol` VARCHAR(20) NOT NULL , `buyPrice` FLOAT UNSIGNED NOT NULL , `sellPrice` FLOAT UNSIGNED NULL DEFAULT NULL , `isSettled` BOOLEAN NOT NULL DEFAULT FALSE , `quantity` INT UNSIGNED NOT NULL, `totalBuyPrice` FLOAT NULL DEFAULT NULL, `totalSellPrice` FLOAT NULL DEFAULT NULL, PRIMARY KEY (`tradeID`)) ENGINE = InnoDB', [tID], function(error, results, fields) {
							//let tID = results[0]["traderID"];
							console.log(results);
							console.log(tID);
							// console.log(fields);
							//response.send(results);
							// response.send('User register, login now');
							});
				});
							response.send(`<h1>User registered, login now</h1> <a href="/login">Click here to go to login page</a>`);
							
							response.end();

						}		
					});	
				}
						
			
		
	
	else {
		response.send(`<h1>Please enter Username and Password!</h1> <a href="/login">Click here to go to login page</a>`);
		// response.end();
	}
	});


app.get('/logout', function(request, response) {
				// request.session.loggedin = false;
				// request.session.username = undefined;
				request.session.destroy();
				response.redirect('/');
	}
);

app.get('/dashboard', function(request, response) {
	if (request.session.loggedin)
	 {
		
		
		app.use(express.static('private/jschart/'));
		response.sendFile(path.join(__dirname + '/private/jschart/index.html'));
		
	} else {
		response.send(`<h1>Please login to access this page!</h1> <a href="/login">Click here to go to login page</a>`);
		
		
	}
	//response.end();
});

app.get('/profitloss', function(request, response) {
	if (request.session.loggedin)
	 {
		
		app.use(express.static('private/pl final'));
		
		response.sendFile(path.join(__dirname + '/private/pl final/index.html'));
		
	} else {
		response.send(`<h1>Please login to access this page!</h1> <a href="/login">Click here to go to login page</a>`);
		
		
	}
	//response.end();
});

app.get('/register', function(request, response) {
    //console.log(request.session.loggedin);
    if(request.session.loggedin === false || request.session.loggedin === undefined)
    {
	
	//does not work for some reason, page loads as if css and images were not allowed access
	
	app.use(express.static('public/register'));
		response.sendFile(path.join(__dirname + '/public/register/index.html'));

	
    }
    else {
        response.redirect('/dashboard');
    }
});


app.get('/login', function(request, response) {
    //console.log("hello");
    //console.log(request.session.loggedin);
    if(request.session.loggedin === false || request.session.loggedin === undefined)
    {
	
	//does not work for some reason, page loads as if css and images were not allowed access
	app.use(express.static('public/login'));
		// app.use(express.static('public'));
		// app.use(express.static('/'));
		// app.use(express.static('public/login/'));
		// app.use(express.static(path.join(__dirname , '/public/login'), { cacheControl: false }));
		// app.use("/public/login/", express.static(__dirname + '/public/login'));
		response.sendFile(path.join(__dirname + '/public/login/index.html'));
		// response.end();

	
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
		let quantity = request.body.bQuantity;
		
		console.log(quantity);
		let totalPrice = (buyPrice * quantity).toFixed(2); 
		console.log(totalPrice);

		connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
			console.log("inside buy select block");
			traderID = results[0]["traderID"];
			console.log(traderID);
			connection.query('INSERT INTO `trades?`(`equityName`, `equitySymbol`, `buyPrice`, `quantity`, `totalBuyPrice`) VALUES (?,?,?,?,?)', [traderID, equityName, equitySymbol,buyPrice,quantity,totalPrice], function(error, results, fields) {
				console.log("inside buy insert block");
				console.log(results);
				if(results !== undefined)
				{
					response.setHeader('Content-type','text/html');
					// response.send(<h1></h1>quantity + " Equity Shares of " + equityName + " bought successfully!");
					response.send(`<h1>${quantity} Equity Shares of ${equityName} bought successfully!</h1> <a href="/dashboard">Click here to go dashboard</a>`); 
					// response.write('<h1>${quantity} Equity Shares of ${equityName} bought successfully!"</h1>, <a href="/dashboard">Click here to go dashboard</a>');
					response.end();
				}
				else {
					response.send("500 : Internal Server Error");
				}
				//response.send(results);
				//response.send('User registered, login now');
				});
			});	
	
	// 	response.sendFile(path.join(__dirname + '/private/apexchart/index.html'));
	// 	//response.send('Welcome back, ' + request.session.username + '!');
	// } else {
	// 	response.send('Please login to view this page!');
	// }
	//response.end();

	// console.log(request.session.username);
	}
	else {
			response.send(`<h1>Please login to view this page!</h1> <a href="/login">Click here to go to login page</a>`);
			
	}
});

app.post('/sell', function(request, response) {
	if (request.session.loggedin)
	{	
		let username = request.session.username;
		let equityName = request.body.equityName;
		// console.log(request);
		//.equityName;
		console.log(equityName);

		let equitySymbol = request.body.equitySymbol;
		console.log(equitySymbol);
		let sellPrice = request.body.buyPrice;
		console.log(sellPrice);
		let squantity = request.body.bQuantity;
		
		console.log(squantity);
		let totalPrice = (sellPrice * squantity).toFixed(2); 
		console.log(totalPrice);


		// let username = request.session.username;
		// let equityName = request.body.equityName;
		// let equitySymbol = request.body.equitySymbol;
		// let sellPrice = request.body.buyPrice;
		// let squantity = request.body.bQuantity;
		// let totalPrice = (buyPrice * squantity).toFixed(2); 
		let traderID = -1;
		let tradeID = -1;

		connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
			traderID = results[0]["traderID"];
			console.log(traderID);
			connection.query('SELECT `tradeID`, `quantity` FROM `trades?` WHERE `equityName` = ? AND `quantity` = ?', [traderID, equityName,squantity], function(error, results, fields) {
				// console.log(results[0]["tradeID"]);
				// console.log(results[0]["quantity"]);
				if(results[0] != undefined)
				{
				tradeID = results[0]["tradeID"];
				bquantity = results[0]["quantity"];
				// console.log(tradeID);
				console.log(bquantity);

					if(bquantity == squantity) {
						let totalPrice = (sellPrice * squantity).toFixed(2);
						connection.query('UPDATE `trades?` SET `sellPrice`=?,`isSettled`=1,`totalSellPrice`=? WHERE tradeID = ?', [traderID, sellPrice, totalPrice,tradeID], function(error, results, fields) {
						//console.log(results[0]["tradeID"]);
						//tradeID = results[0]["tradeID"];
						console.log("Inside sell insert query");
						console.log(results);
						response.setHeader('Content-type','text/html');
					// response.send(<h1></h1>quantity + " Equity Shares of " + equityName + " bought successfully!");
					    response.send(`<h1>${squantity} Equity Shares of ${equityName} sold successfully!</h1> <a href="/dashboard">Click here to go dashboard</a>`); 
						});
					}
				}

				else{
					response.send(`<h1>Quantity mismatch between holdings and sell order</h1> <a href="/dashboard">Click here to go to dashboard</a>`);
					
				}
			});
			
			// else {
			// 	response.send("You do not have any shares of " + equityName);
			// }
				//response.send(results);
				//response.send('User registered, login now');
				});
			}
			else {
				response.send(`<h1>Please login to access this page!</h1> <a href="/login">Click here to go to login page</a>`);
			}
			
});	

app.get('/tradePL', function(request, response) {
	// if (request.session.loggedin)
	if(1)
	{	
		let username = request.session.username;
		let tradeData,traderID;
		connection.query('SELECT `traderID` FROM `trader` WHERE `userName` = ?', [username], function(error, results, fields) {
			console.log("inside pl select block");
			console.log(results[0]["traderID"]);
			traderID = results[0]["traderID"];
			console.log(traderID);
			connection.query('SELECT * FROM `trades?` WHERE 1', [traderID], function(error, results, fields) {
				console.log("inside pl 2nd select block");
				// console.log(results);
				if(results)
				{
					// tradeData = results;
					console.log(results);
					// response.end();
					response.send(results);
					
				}
				else {
					response.send(0);
				}
				//response.send(results);
				//response.send('User registered, login now');
				});
			});	
	
	// 	response.sendFile(path.join(__dirname + '/private/apexchart/index.html'));
	// 	//response.send('Welcome back, ' + request.session.username + '!');
	// } else {
	// 	response.send('Please login to view this page!');
	// }
	//response.end();

	// console.log(request.session.username);
	}
	else {
			response.send('Access Denied');
	}
});
	


app.listen(5001, () => {
    console.log("server on 5001");
});