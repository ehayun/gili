package web

import (
	"gishur/config"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
	"github.com/sujit-baniya/flash"
	"strings"
	"sync"
)

var mutex sync.Mutex

func AppSetup(c *fiber.Ctx) error {
	mutex.Lock()
	defer mutex.Unlock()
	if isBinding {
		return c.Next()
	}
	isBinding = true
	CurrURL = c.Path()

	defer func() {
		isBinding = false
	}()

	user := db.GetCurrUser(c)

	var params db.Param
	db.MainDB.Table("params").First(&params)

	m := flash.Get(c)
	m["HideFooter"] = false
	if m["AppName"] == nil {
		m["AppName"] = "App"
		if m["title"] == nil {
			m["title"] = config.Config.AppName
		}
	}
	m["siteParams"] = params
	m["curr_user"] = user
	if m["keywords"] == nil || m["keywords"] == "" {
		m["keywords"] = params.MainTitle
	}

	if m["errors"] == nil {
		m["message"] = ""
		m["success"] = true
	}
	m["is_production"] = strings.ToLower(config.Config.Mode) == "production"
	m["is_development"] = strings.ToLower(config.Config.Mode) != "production"
	m["login_service"] = "/login"
	m["logout_service"] = "/logout"

	_ = c.Bind(m)

	return c.Next()
}

func mwIsLogin(c *fiber.Ctx) error {
	// check if the user logged in
	var user db.User
	user = db.GetCurrUser(c)
	if user.Email > "" {
		return c.Next()
	}

	return c.Redirect("/login")

}

func mwIsManager(c *fiber.Ctx) error {

	// check if the user logged in
	var user db.User
	user = db.GetCurrUser(c)
	if user.Role == "admin" {
		return c.Next()
	}

	return c.Redirect("/login")
}
