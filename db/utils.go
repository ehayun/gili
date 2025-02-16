package db

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"log"
)

type TimeStamp struct {
	CreatedAt sql.NullTime `gorm:"autoCreateTime:true" json:"-" form:"-"`
	UpdatedAt sql.NullTime `gorm:"autoCreateTime:true" json:"-" form:"-"`
}

func GetCurrUser(c *fiber.Ctx) User {
	var user User
	u := c.Cookies("CURR_USER")

	if u != "" {
		_ = json.Unmarshal([]byte(u), &user)
		user.Get(user.ID)
	}
	c.Locals("curr_user", user)
	return user
}

func DumpPrettyJson(inv interface{}, title ...string) {
	if len(title) > 0 {
		fmt.Println(title[0])
	}
	var prettyJSON bytes.Buffer
	jInv, _ := json.Marshal(inv)
	err := json.Indent(&prettyJSON, jInv, "", "  ")
	if err != nil {
		log.Println("JSON parse err: ", err)
	} else {
		fmt.Println(string(prettyJSON.Bytes()))
	}
}
