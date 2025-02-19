package pages

import (
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func MainPage(ctx *fiber.Ctx) error {
	return ctx.Render("pages/main_page", nil)
}

func Page(ctx *fiber.Ctx) error {
	page := ctx.Params("page")

	return ctx.Render("pages/page", fiber.Map{"page": page})
}

func GetMainPage(ctx *fiber.Ctx) error {
	var p db.MainPage
	result, err := p.GetMainPage()
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return ctx.JSON(result)
}

func Update(ctx *fiber.Ctx) error {
	var m db.Menu
	db.MainDB.Table(m.TableName()).Where("url = ''").First(&m)
	var p db.MainPage
	err := ctx.BodyParser(&p.Page)
	if err != nil {
		return ctx.JSON(fiber.Map{"error": err.Error()})
	}
	db.DumpPrettyJson(p, "mainpage")

	var oldPage db.Page
	db.MainDB.Where("slug = ?", "main").First(&oldPage)

	p.Page.ID = oldPage.ID
	p.Page.Slug = "main"
	p.Page.MenuId = m.Id

	err = p.Page.Update()

	return ctx.JSON(fiber.Map{"message": "Update"})
}
