package params

import (
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func Index(ctx *fiber.Ctx) error {
	var p db.Param
	p, _ = p.Get()
	return ctx.Render("params/index", fiber.Map{"param": p})
}

func First(ctx *fiber.Ctx) error {
	var p db.Param
	p, _ = p.Get()
	return ctx.JSON(p)
}

func Update(ctx *fiber.Ctx) error {
	var p db.Param
	if err := ctx.BodyParser(&p); err != nil {
		return ctx.JSON(fiber.Map{"error": err.Error()})
	}
	db.DumpPrettyJson(p)
	if err := p.Update(); err != nil {
		return ctx.JSON(fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(fiber.Map{"success": true})
}
