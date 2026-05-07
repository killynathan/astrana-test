package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func Init(path string) {
	var err error
	DB, err = sql.Open("sqlite3", path)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
}
