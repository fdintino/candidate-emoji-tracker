var express = require("express");
var app = express();
var mysql = require("mysql");

// Create pool of connections
var pool = mysql.createPool((process.env.CLEARDB_DATABASE_URL || "mysql://root@localhost/candidate-emoji-tracker") + "?debug=true&charset=utf8mb4");
pool.on("error", function(err){  
	console.log(err);
	pool.end;
});

// Endpoint to get full emoji list per candidate
app.get("/list", function(request, response){	
	pool.query('SELECT candidate, emoji, COUNT(emoji) as count FROM emoji_counts GROUP BY candidate, emoji ORDER BY candidate ASC, count DESC', function(err, rows){ 
		if(err) throw err; 
		
		var candidates = [];
		
		rows.forEach(function(row){
			var index = candidates.map(function(d){ return d.name }).indexOf(row.candidate);
			if( index == -1 ){
				candidates.push({ name: row.candidate, emojis: [] });
				index = candidates.length - 1;
			}
			candidates[index].emojis.push({ emoji: row.emoji, count: row.count })
			
		});
		response.status(200).json(candidates);
	});
});

// Get latest emoji
app.get("/latest", function(request, response){	
	pool.query('SELECT candidate, emoji, link FROM emoji_counts LIMIT 10', function(err, rows){ 
		response.status(200).json(rows);
	});
});

module.exports = app;