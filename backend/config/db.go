package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDB() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	var err error
	DB, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("DB connection failed:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("DB ping failed:", err)
	}

	log.Println("Connected to DB")
}
