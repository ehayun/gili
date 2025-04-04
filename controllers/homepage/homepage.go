package homepage

import (
	"gishur/controllers/emails"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
	"github.com/sujit-baniya/flash"
)

func Index(c *fiber.Ctx) error {
	var p db.MainPage
	var cs db.Carousel
	var cards db.Card
	p, _ = p.GetMainPage()

	carousels := cs.List()
	return c.Render("homepage/index", fiber.Map{"page": p.Page, "carousels": carousels, "hasCarousels": len(carousels) > 0, "cards": cards.List()})
}

func Send(ctx *fiber.Ctx) error {

	type sender struct {
		FirstName string
		LastName  string
		Email     string
		Subject   string
		Message   string
		CopyEmail string
	}

	var message sender
	_ = ctx.BodyParser(&message)
	mp := fiber.Map{
		"success": true,
		"message": "Message sent successfully",
		"sender":  message,
		"Title":   message.Subject,
	}

	_ = emails.SendEmail(ctx, "message", "giliben02@gmail.com", "New message", mp)
	return flash.WithSuccess(ctx, mp).Render("homepage/temp", mp)
}
