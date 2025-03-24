package db

import (
	"bytes"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
	"os"
	"path"
	"strconv"
	"strings"
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
		_ = user.Get(user.ID)
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
		log.Warningf("JSON parse err: ", err)
	} else {
		fmt.Println(string(prettyJSON.Bytes()))
	}
}

func GenerateUUID() (string, error) {
	// Generate 16 random bytes
	uuid := make([]byte, 16)
	_, err := rand.Read(uuid)
	if err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %v", err)
	}

	// Set version (4) and variant bits
	uuid[6] = (uuid[6] & 0x0f) | 0x40 // Version 4
	uuid[8] = (uuid[8] & 0x3f) | 0x80 // Variant 1

	// Convert to hex string with proper formatting
	buf := make([]byte, 36)
	hex.Encode(buf[0:8], uuid[0:4])
	buf[8] = '-'
	hex.Encode(buf[9:13], uuid[4:6])
	buf[13] = '-'
	hex.Encode(buf[14:18], uuid[6:8])
	buf[18] = '-'
	hex.Encode(buf[19:23], uuid[8:10])
	buf[23] = '-'
	hex.Encode(buf[24:], uuid[10:])

	split := strings.Split(string(buf), "-")

	return string(split[len(split)-1]), nil
}

func SaveFile(c *fiber.Ctx, fieldName string, dirName string) (string, error) {
	file, err := c.FormFile(fieldName)
	if err != nil {
		return "", err
	}

	outPath := "./uploads/" + dirName
	if err := os.MkdirAll(outPath, os.ModePerm); err != nil {
		log.Errorf("Mkdir ==> %v\n", err)
		return "", err
	}

	ext := path.Ext(file.Filename)
	uuid, _ := GenerateUUID()
	file.Filename = uuid + ext

	outName := path.Join(outPath, file.Filename)
	err = c.SaveFile(file, outName)
	if err != nil {
		log.Errorf("SaveFile ==> %v\n", err)
		return "", err
	}
	return outName, nil
}

func StrToInt64(on string) int64 {

	if on == "" {
		return 0
	}

	i, err := strconv.Atoi(on)
	if err != nil {
		return 0
	}

	return int64(i)
}

func StrToInt(on string) int {
	if on == "" {
		return 0
	}

	i, err := strconv.Atoi(on)
	if err != nil {
		return 0
	}
	return i
}
