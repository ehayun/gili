package users

import (
	"gishur/controllers/auth"
	"gishur/db"
	"github.com/gofiber/fiber/v2"
	"time"
)

func Index(ctx *fiber.Ctx) error {
	return ctx.Render("users/index", fiber.Map{})
}

func List(ctx *fiber.Ctx) error {
	var users []db.User
	db.MainDB.Find(&users)
	for i, user := range users {
		users[i].IsAdmin = user.Role == "admin"
	}
	return ctx.JSON(users)
}

func CreateOrUpdate(ctx *fiber.Ctx) error {
	var user db.User
	if err := ctx.BodyParser(&user); err != nil {
		return err
	}

	var u db.User

	if user.ID > 0 {
		db.MainDB.Where("id = ?", user.ID).First(&u)
		user.HashedPassword = u.HashedPassword
	}
	if user.UpdatedPassword != "" {
		user.HashedPassword, _ = auth.HashPassword(user.UpdatedPassword)
	}

	user.Role = "user"
	if user.IsAdmin {
		user.Role = "admin"
	}

	if user.ID == 0 {
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		err := user.Create()
		if err != nil {
			return ctx.SendStatus(fiber.StatusConflict)
		}
	} else {
		user.CreatedAt = u.CreatedAt
		user.UpdatedAt = time.Now()
		err := user.Update()
		if err != nil {
			return ctx.SendStatus(fiber.StatusConflict)
		}
	}

	return ctx.JSON(user)
}

func DeleteUser(ctx *fiber.Ctx) error {
	id, _ := ctx.ParamsInt("id", -1)
	var user db.User
	user.ID = int64(id)
	db.MainDB.Where("id = ?", id).First(&user)
	db.MainDB.Where("id = ?", id).Delete(&user)
	return ctx.SendStatus(fiber.StatusOK)
}

func Update(ctx *fiber.Ctx) error {
	id, _ := ctx.ParamsInt("id", -1)
	var user db.User
	user.ID = int64(id)
	db.MainDB.Where("id = ?", id).First(&user)
	_ = ctx.BodyParser(&user)
	if user.UpdatedPassword > "" {
		user.HashedPassword, _ = auth.HashPassword(user.UpdatedPassword)
	}
	user.UpdatedAt = time.Now()
	if err := user.Update(); err != nil {
		return ctx.SendStatus(fiber.StatusConflict)
	}
	return ctx.JSON(user)
}
