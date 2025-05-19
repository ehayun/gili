package homepage

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"gishur/controllers/emails"
	"gishur/db"
	"gishur/translate"
	"github.com/gofiber/fiber/v2"
	"github.com/sujit-baniya/flash"
	"io"
	"net/http"
	"net/url"
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
		"footer": true,
		"page":   p.Page, "carousels": carousels, "hasCarousels": len(carousels) > 0, "cards": cards.List()})
}

type RecaptchaResponse struct {
	Success     bool     `json:"success"`
	Score       float64  `json:"score"`
	Action      string   `json:"action"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
	ErrorCodes  []string `json:"error-codes,omitempty"`
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

	recaptchaToken := ctx.FormValue("g-recaptcha-response")
	if recaptchaToken == "" {
		return ctx.Redirect("/")
	}

	// Verify reCAPTCHA
	recaptchaSecret := "6Lfn9z8rAAAAAA6tMnhUJsNU335kuMmgT40uCKjT" // Use your secret key here
	resp, err := http.PostForm("https://www.google.com/recaptcha/api/siteverify",
		url.Values{
			"secret":   {recaptchaSecret},
			"response": {recaptchaToken},
		})

	mp := fiber.Map{
		"success": false,
		"message": "Message sent successfully",
		"sender":  "",
		"Phone":   "",
	}

	if err != nil {
		return flash.WithSuccess(ctx, mp).RedirectBack("/")
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {

		}
	}(resp.Body)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("1==> %#v\n", err)
		return flash.WithSuccess(ctx, mp).RedirectBack("/")
	}

	var recaptchaResp RecaptchaResponse
	err = json.Unmarshal(body, &recaptchaResp)
	if err != nil {
		fmt.Printf("2==> %#v\n", err)
		return flash.WithSuccess(ctx, mp).RedirectBack("/")
	}

	var message sender
	_ = ctx.BodyParser(&message)

	var p db.Param
	param, _ := p.Get()

	if len(message.Email) == 0 {
		return ctx.Redirect("/")
	}

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
	fmt.Printf("==> %#v\n", "robots")
	ctx.Response().Header.Set("Content-Type", "text/plain")
	return ctx.SendFile("uploads/robots.txt")
}
