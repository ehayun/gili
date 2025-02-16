package web

import (
	"gishur/controllers/auth"
	"gishur/controllers/homepage"
	"gishur/controllers/menus"
	"gishur/controllers/pages"
	"gishur/controllers/params"
	"gishur/controllers/users"
	"github.com/gofiber/fiber/v2"
)

func routes(app *fiber.App) {
	app.Get("/", homepage.Index)

	app.Get("/login", auth.Login)
	app.Post("/login", auth.PostLogin)
	app.Post("/logout", auth.Logout)

	app.Get("/:page", pages.Page)

	root := app.Group("/admin", mwIsManager)
	root.Get("/users", users.Index)
	root.Get("/params", params.Index)
	root.Get("/menus", menus.Index)

	api := app.Group("/api", mwIsLogin)
	api.Get("/users", users.List)
	api.Get("/params", params.First)
	api.Put("/params", params.Update)
	api.Get("/menus", menus.List)
	api.Post("/menus", menus.Create)
	api.Put("/menus/:id", menus.Update)

}
