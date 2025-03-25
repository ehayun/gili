package web

import (
	"gishur/controllers/auth"
	"gishur/controllers/cards"
	"gishur/controllers/carousels"
	"gishur/controllers/homepage"
	"gishur/controllers/menus"
	"gishur/controllers/pages"
	"gishur/controllers/params"
	"gishur/controllers/users"
	"github.com/gofiber/fiber/v2"
)

func routes(app *fiber.App) {
	app.Get("/", homepage.Index)
	app.Post("/message/send", homepage.Send)

	app.Get("/login", auth.Login)
	app.Post("/login", auth.PostLogin)
	app.Post("/logout", auth.Logout)

	app.Get("/:page", pages.Page)

	root := app.Group("/admin", mwIsManager)
	root.Get("/users", users.Index)
	root.Get("/params", params.Index)
	root.Get("/menus", menus.Index)
	root.Get("/pages", pages.Index)
	root.Get("/main-page", pages.MainPage)

	api := app.Group("/api", mwIsLogin)
	api.Get("/main-page", pages.GetMainPage)
	api.Put("/pages/:slug?", pages.Update)
	api.Get("/users", users.List)
	api.Get("/params", params.First)
	api.Put("/params", params.Update)

	api.Get("/menus", menus.List)
	api.Post("/menus", menus.Create)
	api.Put("/menus/:id", menus.Update)
	api.Delete("/menus/:id", menus.Delete)

	api.Get("/carousels", carousels.List)
	api.Post("/carousels", carousels.UpdateCarousel)
	api.Put("/carousels/:id", carousels.UpdateCarousel)

	api.Post("/cards", cards.UpdateCard)
	api.Put("/cards/:id", cards.UpdateCard)
	api.Delete("/cards/:id", cards.DeleteCard)
	api.Get("/cards", cards.GetCard)

	api.Get("/pages", pages.List)

}
