package cards

import (
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func UpdateCard(ctx *fiber.Ctx) error {

	var c db.Card
	_ = ctx.BodyParser(&c)
	db.DumpPrettyJson(c, "card")

	return ctx.JSON(fiber.Map{"message": "Update"})
}
