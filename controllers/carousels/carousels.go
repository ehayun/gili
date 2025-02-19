package carousels

import (
	"fmt"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
)

func UpdateCarousel(ctx *fiber.Ctx) error {
	var c db.Carousel
	_ = ctx.BodyParser(&c)
	//db.DumpPrettyJson(c, "carousel")

	filePath, err := db.SaveFile(ctx, "image", "carousel")
	if err == nil {
		fmt.Printf("saved ==> %v\n", filePath)
	}
	c.ImageUrl = filePath
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
