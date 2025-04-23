package pages

import (
	"fmt"
	"gishur/db"
	"math/rand"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func Index(ctx *fiber.Ctx) error {
	return ctx.Render("pages/index", nil)
}

func MainPage(ctx *fiber.Ctx) error {
	return ctx.Render("pages/main_page", nil)
}

func Page(ctx *fiber.Ctx) error {
	pageId := ctx.Params("page")
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

func UpdateOrCreate(ctx *fiber.Ctx) error {
	id, _ := strconv.ParseInt(ctx.Params("id"), 10, 64)

	var p db.SimplePage
	if err := ctx.BodyParser(&p); err != nil {
		return ctx.Status(400).JSON(
			fiber.Map{"message": "not Created"})
	}
	p.ID = id

	p.ImageURL = ctx.FormValue("image_url")

	mid, _ := strconv.ParseInt(ctx.FormValue("menu_id"), 10, 64)
	if mid > 0 {
		p.MenuID = &mid
	} else {
		p.MenuID = nil
	}
	pid, _ := strconv.ParseInt(ctx.FormValue("parent_id"), 10, 64)
	if pid > 0 {
		p.ParentID = &pid
	} else {
		p.ParentID = nil
	}

	p.Keywords = ctx.FormValue("keywords")

	image, err := ctx.FormFile("image")
	if err == nil {
		outDir := "./uploads/pages/"
		_ = os.MkdirAll(outDir, 0755)
		ext := filepath.Ext(image.Filename)
		image.Filename = uuid.New().String() + ext
		fName := path.Join(outDir, image.Filename)
		if err := ctx.SaveFile(image, fName); err != nil {
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
		}
		p.ImageURL = "/" + fName
	}
	if p.ID > 0 {
		err = p.Update()
	} else {
		p.Slug = randomString(10)
		err = p.Create()
	}

	if err != nil {
		return ctx.Status(400).JSON(
			fiber.Map{"message": "not Created"})
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
		return ctx.Status(400).JSON(
			fiber.Map{"message": "not Created"})
	}

	p.Slug = fmt.Sprintf("%v", time.Now().Unix())
	if err := p.Create(); err != nil {
		return ctx.Status(400).JSON(
			fiber.Map{"message": "not Created"})
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

func Delete(ctx *fiber.Ctx) error {
	id, _ := ctx.ParamsInt("id", 0)
	var p db.Page
	if err := p.Get(int64(id)); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not found"})
	}
	_ = p.Delete()
	return ctx.JSON(p)
}
func GetPage(ctx *fiber.Ctx) error {
	id, _ := ctx.ParamsInt("id", 0)
	var p db.Page
	if err := p.Get(int64(id)); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"message": "not found"})
	}
	return ctx.JSON(p)
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func randomString(length int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
