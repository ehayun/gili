package homepage

import (
	"gishur/controllers/emails"
	"gishur/db"
	"gishur/translate"
	"github.com/gofiber/fiber/v2"
	"github.com/sujit-baniya/flash"
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
