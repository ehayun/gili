package cards

import (
	"gishur/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"os"
	"path"
	"path/filepath"
	"strconv"
)

func UpdateCard(ctx *fiber.Ctx) error {

	var c db.Card
	_ = ctx.BodyParser(&c)

	on, _ := strconv.Atoi(ctx.FormValue("order_num", "1"))
	c.OrderNum = int64(on)

	id, err := ctx.ParamsInt("id", 0)
	if err == nil {
		c.Id = int64(id)
	}
	//db.DumpPrettyJson(c)

	image, err := ctx.FormFile("image")
	if err == nil {
		outDir := "./uploads/cards/"
		_ = os.MkdirAll(outDir, 0755)
		ext := filepath.Ext(image.Filename)
		image.Filename = uuid.New().String() + ext
		fName := path.Join(outDir, image.Filename)
		if err := ctx.SaveFile(image, fName); err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
		}
		c.ImageUrl = "/" + fName
	} else {
		if c.Id > 0 {
			var old = db.Card{Id: c.Id}
			old, _ = old.Get(c.Id)
			c.ImageUrl = old.ImageUrl
		}
	}

	if c.Id == 0 {
		if err := c.Create(); err != nil {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		}
	} else {
		if err := c.Update(); err != nil {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		}
	}
	return ctx.JSON(fiber.Map{"message": "Update"})
}

func GetCard(ctx *fiber.Ctx) error {

	var c db.Card
	return ctx.JSON(fiber.Map{"rows": c.List(),
		"page":        1,
		"total_rows":  len(c.List()),
		"total_pages": 1,
		"prev_page":   1,
		"next_page":   1,
	})
}

func DeleteCard(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	i, _ := strconv.Atoi(id)
	c := db.Card{Id: int64(i)}
	if err := c.Delete(); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}
	return ctx.JSON(fiber.Map{"message": "Delete"})
}
