package homepage

import (
	"encoding/xml"
	"fmt"
	"gishur/controllers/emails"
	"gishur/db"
	"gishur/translate"
	"github.com/gofiber/fiber/v2"
	"github.com/sujit-baniya/flash"
	"strings"
	"time"
)

func Index(c *fiber.Ctx) error {
	var p db.MainPage
	var cs db.Carousel
	var cards db.Card
	p, _ = p.GetMainPage()

	carousels := cs.List()
	return c.Render("homepage/index", fiber.Map{
		"footer": false,
		"page":   p.Page, "carousels": carousels, "hasCarousels": len(carousels) > 0, "cards": cards.List()})
}

func Send(ctx *fiber.Ctx) error {

	type sender struct {
		FirstName string
		LastName  string
		Email     string
		Phone     string
		Message   string
		CopyEmail string
	}

	var message sender
	_ = ctx.BodyParser(&message)
	mp := fiber.Map{
		"success": true,
		"message": "Message sent successfully",
		"sender":  message,
		"Phone":   message.Phone,
	}

	var p db.Param
	param, _ := p.Get()

	_ = emails.SendEmail(ctx, "message", param.Email, translate.Trans("New message"), mp)
	return flash.WithSuccess(ctx, mp).RedirectBack("/")
}

type UrlSet struct {
	XMLName xml.Name `xml:"urlset"`
	Xmlns   string   `xml:"xmlns,attr"`
	Urls    []Url    `xml:"url"`
}

type Url struct {
	Loc        string `xml:"loc"`
	LastMod    string `xml:"lastmod,omitempty"`
	ChangeFreq string `xml:"changefreq,omitempty"`
	Priority   string `xml:"priority,omitempty"`
}

func Sitemap(ctx *fiber.Ctx) error {
	var mnu db.Menu
	var page db.Page
	pages := page.List()

	urls := []Url{
		{
			Loc:        "https://gili-gishurim.com/",
			LastMod:    time.Now().Format("2006-01-02"),
			ChangeFreq: "daily",
			Priority:   "1.0",
		},
	}

	menues := mnu.List(true)
	for i := range menues {
		m := menues[i]
		if len(m.Url) > 0 {
			if !strings.Contains(m.Url, "/") {
				urls = append(urls, Url{
					Loc:        fmt.Sprintf("https://gili-gishurim.com/%s", m.Url),
					LastMod:    time.Now().Format("2006-01-02"),
					ChangeFreq: "weekly",
					Priority:   "0.8",
				})
			}
		}
	}

	for i := range pages {
		p := pages[i]
		if p.ParentID != nil {
			urls = append(urls, Url{
				Loc:        fmt.Sprintf("https://gili-gishurim.com/pages/%v", p.Slug),
				LastMod:    time.Now().Format("2006-01-02"),
				ChangeFreq: "weekly",
				Priority:   "0.6",
			})
		}
	}

	sitemap := UrlSet{
		Xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
		Urls:  urls,
	}

	ctx.Type("xml")
	return xml.NewEncoder(ctx).Encode(sitemap)
}

func Robots(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "text/plain")
	return ctx.SendFile("uploads/robots.txt")
}
