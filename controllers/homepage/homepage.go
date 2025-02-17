package homepage

import (
	"fmt"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func Index(c *fiber.Ctx) error {
	var p db.MainPage
	p, _ = p.GetMainPage()
	fmt.Printf("==> %#v\n", p)
	return c.Render("homepage/index", fiber.Map{"page": p.Page})
}
