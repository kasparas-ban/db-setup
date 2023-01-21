// import * as mysql from "https://deno.land/x/mysql@v2.11.0/mod.ts";
// @deno-types="npm:types/mysql2#"
import mysql from "npm:mysql2";
import fs, { createReadStream } from "https://deno.land/std@0.153.0/node/fs.ts";

// === Helper functions ========================================================

function connectToDB(
  connection: any,
  dbName: string,
) {
  connection.query(`USE ${dbName};`, (err: any) => {
    if (err) throw Error(err);
    console.log("✔️ Selected appropriate DB");
  });

  connection.query(`SET GLOBAL local_infile = TRUE;`, (err: any) => {
    if (err) throw Error(err);
    console.log("✔️ Set local_infile variable");
  });
}

function clearDB(
  connection: any,
  tableName: string,
  callback: () => void,
) {
  connection.query({
    sql:
      `SET FOREIGN_KEY_CHECKS = 0; DELETE FROM ${tableName}; TRUNCATE ${tableName}; SET FOREIGN_KEY_CHECKS = 1;`,
  }, (err: any, result: any) => {
    if (err) throw Error(err);
    console.log(
      `✔️ Deleted all rows from the users table. Affected rows: ${result.affectedRows}`,
    );
    callback();
  });

  // connection.query(`TRUNCATE ${tableName};`, (err: any) => {
  //   if (err) throw Error(err);
  //   callback();
  // });
}

function populateDB(
  connection: any,
  fileName: string,
  tableName: string,
  callback: () => void,
) {
  connection.query({
    sql: `LOAD DATA LOCAL INFILE './${fileName}'
      INTO TABLE ${tableName}
      FIELDS TERMINATED by \',\'
      LINES TERMINATED BY \'\n\'
      IGNORE 1 LINES`,
    infileStreamFactory: () => createReadStream(`./${fileName}`),
  }, (err: any, result: any) => {
    if (err) throw err;
    console.log("Data successfully populated.");
    // callback();
  });

  connection.query({
    sql: `SHOW WARNINGS`,
  }, (err: any, result: any, fields: any) => {
    console.log(err, result, fields);
    if (err) throw err;
    callback();
  });
}

// === Running the program ====================================================

const mysql_host = "localhost";
const mysql_username = "root";
const mysql_password = "example";
const databaseName = "main_DB"; // 'mysql_bench_db';

const con = mysql.createConnection({
  host: mysql_host,
  user: mysql_username,
  password: mysql_password,
  flags: ["+LOCAL_FILES"],
});
connectToDB(con, databaseName);

// Check if we're clearing the database
const clearArg = Deno.args[0] === "clear";
if (clearArg) {
  clearDB(con, "users", () => {
    con.close();
    Deno.exit();
  });
} else {
  console.log(`=== Populating the database ===\n`);

  populateDB(con, "relations.csv", "friendships", () => {
    con.close();
    Deno.exit();
  });
}
