var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('tryingSQLITETRIALRUN');

db.serialize(function() {
  db.run("CREATE TABLE transactions");

  var stmt = db.prepare("INSERT INTO transactions VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();
});

db.close();
