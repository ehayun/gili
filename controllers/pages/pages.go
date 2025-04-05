package pages

import (
	"fmt"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"time"
)

func Index(ctx *fiber.Ctx) error {
	return ctx.Render("pages/index", nil)
}

func MainPage(ctx *fiber.Ctx) error {
	return ctx.Render("pages/main_page", nil)
}

func Page(ctx *fiber.Ctx) error {
	pageId := ctx.Params("page")
	fmt.Printf("==> %#v\n", pageId)
	var menu db.Menu
	if err := db.MainDB.Where("url = ?", pageId).First(&menu).Error; err != nil {
		return ctx.Render("pages/page", fiber.Map{"nopage": pageId})
	}

	var p db.Page
	db.MainDB.Where("menu_id = ?", menu.Id).First(&p)
	var pages []db.Page
	db.MainDB.Where("parent_id = ?", p.ID).Order("updated_at desc").Find(&pages)
	return ctx.Render("pages/page", fiber.Map{"page": p, "pages": pages, "footer": len(pages) == 0})

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
	var p db.Page
	if err := ctx.BodyParser(&p); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not Created"})
	}
	if err := p.Update(); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not Created"})
	}
	return ctx.JSON(p)
}

func List(ctx *fiber.Ctx) error {
	var p db.Page
	return ctx.JSON(fiber.Map{"rows": p.List()})
}

func Create(ctx *fiber.Ctx) error {
	var p db.Page
	if err := ctx.BodyParser(&p); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not Created"})
	}

	p.Slug = fmt.Sprintf("%v", time.Now().Unix())
	if err := p.Create(); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not Created"})
	}
	return ctx.JSON(p)
}

func Upload(ctx *fiber.Ctx) error {
	image, err := ctx.FormFile("image")
	var page db.Page
	pageId := ctx.FormValue("pageId")
	if pageId != "" {
		id, _ := strconv.Atoi(pageId)
		page.ID = int64(id)
		_ = page.Get(page.ID)
	} else {
		return ctx.Status(400).JSON(fiber.Map{"message": "not saved"})
	}
	if err == nil {
		outDir := "./uploads/pages/"
		_ = os.MkdirAll(outDir, 0755)
		ext := filepath.Ext(image.Filename)
		image.Filename = uuid.New().String() + ext
		fName := path.Join(outDir, image.Filename)
		if err := ctx.SaveFile(image, fName); err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
		}
		page.ImageURL = "/" + fName
		if page.ID > 0 {
			_ = page.Update()
		}
	}
	return ctx.JSON(fiber.Map{"status": "success"})
}

func ShowPage(ctx *fiber.Ctx) error {
	id, _ := ctx.ParamsInt("id", 0)
	var p db.Page
	var ps []db.Page
	if err := p.Get(int64(id)); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not Created"})
	}
	return ctx.Render("pages/page", fiber.Map{"page": p, "pages": ps})
}
