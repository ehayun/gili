package pages

import (
	"fmt"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
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

	id := ctx.FormValue("id")
	slug := ctx.FormValue("slug")
	title := ctx.FormValue("title")
	image_url := ctx.FormValue("image_url")
	content := ctx.FormValue("content")
	menu_id := ctx.FormValue("menu_id")

	p.Page.ID, _ = strconv.Atoi(id)
	p.Page.Slug = slug
	p.Page.Title = title
	p.Page.ImageUrl = image_url
	p.Page.Content = content
	mnuId, _ := strconv.Atoi(menu_id)
	p.Page.MenuId = int64(mnuId)

	db.DumpPrettyJson(p, "mainpage")

	var oldPage db.Page
	db.MainDB.Where("id = ?", p.Page.ID).First(&oldPage)

	p.Page.UpdatedAt = time.Now()
	if oldPage.ID == 0 {
		p.Page.CreatedAt = time.Now()
	} else {
		p.Page.CreatedAt = oldPage.CreatedAt
	}
	if p.Page.Slug == "" {
		p.Page.Slug = fmt.Sprintf("%v", time.Now().Unix())
	}
	_ = p.Page.Update()

	return ctx.JSON(fiber.Map{"message": "Update"})
}

func List(ctx *fiber.Ctx) error {
	var p db.Page
	return ctx.JSON(fiber.Map{"rows": p.List()})
}
