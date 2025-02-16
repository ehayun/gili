package menus

import (
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func Index(ctx *fiber.Ctx) error {
	return ctx.Render("menus/index", fiber.Map{})
}

func List(ctx *fiber.Ctx) error {
	var m db.Menu
	db.DumpPrettyJson(m.List())
	return ctx.JSON(m.List())
}

func Create(ctx *fiber.Ctx) error {
	var m db.Menu
	if err := ctx.BodyParser(&m); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{})
	}
	if err := m.Create(); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{})
	}
	return ctx.JSON(fiber.Map{"status": "success"})
}

func Update(ctx *fiber.Ctx) error {
	var m db.Menu
	if err := ctx.BodyParser(&m); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{})
	}
	if err := m.Update(); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{})
	}
	return ctx.JSON(fiber.Map{"status": "success"})
}
