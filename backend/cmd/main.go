package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"hackathon/config"

	"github.com/gin-gonic/gin"
)

type Material struct {
	Name        string  `json:"name"`
	Quantity    int     `json:"quantity"`
	CostPerUnit float64 `json:"cost_per_unit"`
}

func main() {
	// 🔴 Connect DB
	config.ConnectDB()

	r := gin.Default()

	// 🔴 CORS (so frontend works)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "server running"})
	})

	// ✅ ADD MATERIAL
	r.POST("/materials/add", func(c *gin.Context) {
		var input Material

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "invalid input"})
			return
		}

		if strings.TrimSpace(input.Name) == "" || input.Quantity <= 0 || input.CostPerUnit <= 0 {
			c.JSON(400, gin.H{"error": "invalid input"})
			return
		}

		_, err := config.DB.Exec(
			`INSERT INTO materials (name, quantity, cost_per_unit)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (name)
			 DO UPDATE SET quantity = materials.quantity + EXCLUDED.quantity`,
			input.Name, input.Quantity, input.CostPerUnit,
		)

		if err != nil {
			log.Println("DB ERROR:", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "material added"})
	})

	// ✅ USE MATERIAL
	r.POST("/materials/use", func(c *gin.Context) {
		var input struct {
			MaterialName string `json:"material_name"`
			Quantity     int    `json:"quantity"`
			Phase        string `json:"phase"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": "invalid input"})
			return
		}

		var id int
		var currentQty int
		var costPerUnit float64

		err := config.DB.QueryRow(
			"SELECT id, quantity, cost_per_unit FROM materials WHERE name=$1",
			input.MaterialName,
		).Scan(&id, &currentQty, &costPerUnit)

		if err != nil {
			c.JSON(404, gin.H{"error": "material not found"})
			return
		}

		if currentQty < input.Quantity {
			c.JSON(400, gin.H{"error": "not enough stock"})
			return
		}

		newQty := currentQty - input.Quantity
		cost := float64(input.Quantity) * costPerUnit

		// update inventory
		_, err = config.DB.Exec(
			"UPDATE materials SET quantity=$1 WHERE id=$2",
			newQty, id,
		)

		if err != nil {
			c.JSON(500, gin.H{"error": "update failed"})
			return
		}

		// insert usage log
		_, err = config.DB.Exec(
			"INSERT INTO usages (material_id, quantity, phase, cost) VALUES ($1, $2, $3, $4)",
			id, input.Quantity, input.Phase, cost,
		)

		if err != nil {
			c.JSON(500, gin.H{"error": "usage insert failed"})
			return
		}

		c.JSON(200, gin.H{"message": "material used"})
	})

	// ✅ DASHBOARD
	r.GET("/dashboard", func(c *gin.Context) {

		rows, err := config.DB.Query("SELECT name, quantity FROM materials")
		if err != nil {
			c.JSON(500, gin.H{"error": "db error"})
			return
		}
		defer rows.Close()

		var inventory []map[string]interface{}

		for rows.Next() {
			var name string
			var qty int
			rows.Scan(&name, &qty)

			inventory = append(inventory, gin.H{
				"material": name,
				"quantity": qty,
			})
		}

		rows2, err := config.DB.Query("SELECT phase, SUM(cost) FROM usages GROUP BY phase")
		if err != nil {
			c.JSON(500, gin.H{"error": "db error"})
			return
		}
		defer rows2.Close()

		phaseCost := map[string]float64{}
		totalSpent := 0.0

		for rows2.Next() {
			var phase string
			var cost float64
			rows2.Scan(&phase, &cost)

			phaseCost[phase] = cost
			totalSpent += cost
		}

		c.JSON(200, gin.H{
			"total_budget": 100000,
			"total_spent":  totalSpent,
			"inventory":    inventory,
			"phase_cost":   phaseCost,
		})
	})

	r.GET("/invoice/:phase", func(c *gin.Context) {
		phase := c.Param("phase")

		rows, err := config.DB.Query(`
			SELECT m.name, u.quantity, u.cost
			FROM usages u
			JOIN materials m ON u.material_id = m.id
			WHERE u.phase = $1
		`, phase)

		if err != nil {
			c.JSON(500, gin.H{"error": "db error"})
			return
		}
		defer rows.Close()

		var items []gin.H
		total := 0.0

		for rows.Next() {
			var name string
			var qty int
			var cost float64

			rows.Scan(&name, &qty, &cost)

			items = append(items, gin.H{
				"material": name,
				"quantity": qty,
				"cost":     cost,
			})

			total += cost
		}

		c.JSON(200, gin.H{
			"phase": phase,
			"items": items,
			"total": total,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}
	log.Println("Server running on port", port)
	r.Run(":" + port)
}
