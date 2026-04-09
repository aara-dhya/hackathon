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

	if err = DB.Ping(); err != nil {
		log.Fatal("DB ping failed:", err)
	}

	log.Println("Connected to DB")

	// Auto-create tables if they don't exist
	_, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS materials (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            quantity INT,
            cost_per_unit NUMERIC
        );
        CREATE TABLE IF NOT EXISTS usages (
            id SERIAL PRIMARY KEY,
            material_id INT REFERENCES materials(id),
            quantity INT,
            phase TEXT,
            cost NUMERIC
        );
    `)
	if err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	log.Println("Tables ready")
}
