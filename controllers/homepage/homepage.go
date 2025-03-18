package homepage

import (
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func Index(c *fiber.Ctx) error {
	var p db.MainPage
	var cs db.Carousel
	p, _ = p.GetMainPage()

	return c.Render("homepage/index", fiber.Map{"page": p.Page, "carousels": cs.List()})
}
