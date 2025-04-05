package auth

import (
	"encoding/json"
	"errors"
	"gishur/config"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *fiber.Ctx) error {
	return c.Render("auth/login", fiber.Map{"title": "Login", "HideFooter": true})
}

type loginFields struct {
	Email    string `form:"email,required"`
	Password string `form:"password,required"`
}

func PostLogin(c *fiber.Ctx) error {
	login := new(loginFields)
	err := c.BodyParser(login)
	if err != nil {
		return c.Render("auth/login", fiber.Map{
			"errors": "Invalid user/pass",
		})
	}

	var user db.User

	loggedIn := false
	if config.Config.Mode == "production" {
		if user.GetUserByEmail(login.Email) != nil {
			return c.Render("auth/login", fiber.Map{
				"errors": "Invalid user/pass",
			})
		} else {
			loggedIn = CheckPasswordHash(login.Password, user.HashedPassword)
		}
	} else {
		if user.GetUserByEmail(login.Email) != nil {
			return c.Render("auth/login", fiber.Map{
				"errors": "Invalid user/pass",
			})
		}

		loggedIn = true // CheckPasswordHash(login.Password, user.HashedPassword)
	}

	if !loggedIn {
		return c.Render("auth/login", fiber.Map{
			"errors": "Invalid user/pass",
		})
	}

	ub, _ := json.Marshal(user)

	cookie := fiber.Cookie{
		Name:        "CURR_USER",
		Value:       string(ub),
		Path:        "/",
		HTTPOnly:    true,
		Secure:      false,
		SessionOnly: false,
		MaxAge:      86400 * 60, // 60 days in seconds
		SameSite:    "Strict",
	}
	c.Cookie(&cookie)
	return c.Redirect("/")
}

func Logout(c *fiber.Ctx) error {
	cookie := fiber.Cookie{
		Name:        "CURR_USER",
		Value:       "",
		Path:        "/",
		HTTPOnly:    true,
		Secure:      false,
		SessionOnly: false,
		MaxAge:      -1,
		SameSite:    "Strict",
	}
	c.Cookie(&cookie)
	return c.Redirect("/")
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func HashPassword(password string) (string, error) {
	if len(password) == 0 {
		return "", errors.New("password cannot be empty")
	}

	// Generate hash with default cost of 12
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedBytes), nil
}

func GetUser(c *fiber.Ctx) error {
	var user db.User
	user = db.GetCurrUser(c)
	return c.JSON(user)
}

func Relogin(c *fiber.Ctx) error {
	var user db.User
	email := c.Params("email")
	if user.GetUserByEmail(email) != nil {
		return c.Redirect("/")
	}
	ub, _ := json.Marshal(user)

	cookie := fiber.Cookie{
		Name:        "CURR_USER",
		Value:       string(ub),
		Path:        "/",
		HTTPOnly:    true,
		Secure:      false,
		SessionOnly: false,
		MaxAge:      86400 * 60, // 60 days in seconds
		SameSite:    "Strict",
	}
	c.Cookie(&cookie)
	return c.Redirect("/")
}
