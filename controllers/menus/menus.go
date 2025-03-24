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
	return ctx.JSON(m.List(false))
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

func Delete(ctx *fiber.Ctx) error {
	id, _ := ctx.ParamsInt("id", 0)
	if id > 0 {
		var m db.Menu
		m.Id = int64(id)
		db.MainDB.Table("menus").Where("id=?", id).Delete(&m)
	}

	return ctx.JSON(fiber.Map{"status": "success"})
}
