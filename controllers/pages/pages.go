package pages

import "github.com/gofiber/fiber/v2"

func MainPage(ctx *fiber.Ctx) error {
	return ctx.Render("pages/main_page", nil)
}

func Page(ctx *fiber.Ctx) error {
	page := ctx.Params("page")

	return ctx.Render("pages/page", fiber.Map{"page": page})
}
