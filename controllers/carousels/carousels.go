package carousels

import (
	"fmt"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func UpdateCarousel(ctx *fiber.Ctx) error {
	var c db.Carousel
	_ = ctx.BodyParser(&c)

	on := ctx.FormValue("order_num")

	c.OrderNum = db.StrToInt(on)

	//db.DumpPrettyJson(c, "carousel")
	filePath, err := db.SaveFile(ctx, "image", "carousel")
	if err == nil {
		fmt.Printf("saved ==> %v\n", filePath)
	}
	if filePath > "" {
		c.ImageUrl = "/" + filePath
	}
	if c.ID == 0 {
		err = c.Create()
	} else {
		var oldC db.Carousel
		_ = oldC.Get(c.ID)
		if c.ImageUrl == "" {
			c.ImageUrl = oldC.ImageUrl
		}
		err = c.Update()
	}

	return ctx.JSON(fiber.Map{"message": "Update"})
}

func List(ctx *fiber.Ctx) error {
	var c db.Carousel
	return ctx.JSON(c.List())
}

func DeleteCarousel(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	var c db.Carousel
	c.ID = db.StrToInt(id)
	if err := c.Delete(); err != nil {
		return ctx.Status(401).JSON(fiber.Map{"error": err})
	}
	return ctx.JSON(fiber.Map{})

}
