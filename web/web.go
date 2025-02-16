package web

import (
	"database/sql"
	"fmt"
	"gishur/cmd"
	"gishur/config"
	"gishur/db"
	"gishur/translate"
	"github.com/Rhymond/go-money"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/template/html/v2"
	"github.com/sujit-baniya/flash"
	"html/template"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var (
	CurrURL   string
	isBinding = false
)

const version = "1.5.3"

var cssVersion = "1.0.0"

func init() {
	cssVersion = generateNewVersion()
}

func generateNewVersion() string {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	major := r.Intn(10) // 0-9
	minor := r.Intn(10) // 0-9
	patch := r.Intn(10) // 0-9

	return fmt.Sprintf("%d.%d.%d", major, minor, patch)
}

func Web() {

	// setup scheduler to run daily tasks
	go cmd.Daily()

	// setup templates
	engine := generateEngine("./views", ".html.tmpl")

	// setup web server
	app := fiber.New(fiber.Config{
		Views:       engine,
		ViewsLayout: "layouts/main",
		BodyLimit:   100 * 1024 * 1024, // 100MB in byte
	})
	// setup middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{Next: func(c *fiber.Ctx) bool {
		if c.Response().StatusCode() == fiber.StatusOK {
			return strings.ToLower(config.Config.Mode) == "production"
		} else {
			return false
		}
	}}))

	app.Use(AppSetup)

	app.Use(func(ctx *fiber.Ctx) error {

		var p db.Param
		param, _ := p.Get()
		var mnu db.Menu
		menus := mnu.List()
		//mutex.Lock()
		//defer mutex.Unlock()

		// Save current URL path
		CurrURL = ctx.Path()

		// Set flash message variables
		m := flash.Get(ctx)
		user := db.GetCurrUser(ctx)
		m["curr_user"] = user

		m["params"] = param
		m["menus"] = menus
		// Bind flash message variables to context
		_ = ctx.Bind(m)

		return ctx.Next()
	})

	// setup static files
	app.Static("/public", "./public")
	app.Static("/uploads", "./uploads")

	// setup routes
	routes(app)

	// Handle 404 errors
	app.Use(notFound)

	// start web server
	log.Fatal(app.Listen(fmt.Sprintf(":%s", config.Config.Port)))

}

func notFound(c *fiber.Ctx) error {
	return c.Status(404).Render("404", fiber.Map{})
}

func generateEngine(viewsDir string, fileExtension string) *html.Engine {
	engine := html.New(viewsDir, fileExtension)

	templateFunc := map[string]interface{}{
		"getCssAsset":      getCssAsset,
		"getJsAsset":       getJsAsset,
		"_":                trans,
		"tr":               trans,
		"activeMenu":       activeMenu,
		"is_admin":         isAdmin,
		"hasNewError":      hasNewError,
		"setInvalidError":  setInvalidError,
		"isNotEmpty":       isNotEmpty,
		"topBG":            topBG,
		"asDate":           AsDate,
		"asHtml":           toHtml,
		"dispDate":         dispDate,
		"isTrue":           isTrue,
		"asPhone":          AsPhone,
		"asMoney":          AsMoney,
		"asInputMoney":     AsInputMoney,
		"toHtml":           toHtml,
		"IsSameStr":        IsSameStr,
		"isProduction":     func() bool { return strings.ToLower(config.Config.Mode) == "production" },
		"hideInProduction": hideInProduction,
		"hideNotActive":    hideNotActive,
		"safe":             safe,
	}

	engine.AddFuncMap(templateFunc)

	return engine
}

func trans(s interface{}) string {
	v := fmt.Sprintf("%v", s)
	if v == "" {
		return ""
	}
	return translate.Trans(v) // translate
}

func getJsAsset(name string) template.HTML {
	var res template.HTML
	_ = filepath.Walk("public/js", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Name() == name {
			res = template.HTML("<script src=\"/" + path + "?ver=" + cssVersion + "\">")
		}
		return nil
	})
	return res
}

// getCssAsset returns the HTML for a CSS asset
func getCssAsset(name string) template.HTML {
	var res template.HTML
	_ = filepath.Walk("public/css", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Name() == name {
			path = path + "?ver=" + cssVersion
			res = template.HTML("<link rel=\"stylesheet\" href=\"/" + path + "\">")
		}
		return nil
	})
	return res
}

// activeMenu returns the "active" class if the current URL path contains the specified string
func activeMenu(m string) string {
	if m == "" && CurrURL == "/" {
		return "active"
	}
	if m != "" && strings.Contains(CurrURL, m) {
		return "active"
	}
	return ""
}

func isTrue(b interface{}) bool {
	s := fmt.Sprintf("%v", b)
	if s == "" || s == "false" {
		return false
	}
	return true
}

func isNotEmpty(b interface{}) bool {
	s := fmt.Sprintf("%v", b)
	if s == "" {
		return false
	}
	if strings.Contains(s, "nil") {
		return false
	}
	return true
}

func topBG() string {
	if strings.ToLower(config.Config.Mode) == "production" {
		return "bg-dark"
	}
	//return "bg-danger	"
	return "bg-dark	"
}

func hasNewError(errs interface{}, fld string) string {

	if errs == nil {
		return ""
	}

	if _, ok := errs.(string); ok {
		if strings.Contains(errs.(string), fld) {
			return "required"
		}
	} else {
		return "is Error"
	}
	return ""
}

func setInvalidError(errs []db.ErrorResponse, fld string) string {
	if errs == nil {
		return ""
	}
	for _, e := range errs {
		flds := strings.Split(e.FailedField, ".")
		if strings.ToLower(flds[len(flds)-1]) == strings.ToLower(fld) {
			return "is-invalid"
		}
	}

	return ""
}

func AsDate(dt sql.NullTime, pattern ...string) string {

	if dt.Time.IsZero() {
		return ""
	}
	if !dt.Valid {
		return ""
	}

	layout := "2006-01-02"
	if len(pattern) > 0 {
		layout = pattern[0]
	}
	// Format the time using the layout
	timeString := dt.Time.Format(layout)
	return timeString
}

func dispDate(dt time.Time, pattern ...string) string {
	layout := "02/01/2006"
	if len(pattern) > 0 {
		layout = pattern[0]
	}
	// Format the time using the layout
	timeString := dt.Format(layout)
	return timeString
}

func isAdmin(id int64) bool {
	var user db.User
	user.ID = id
	db.MainDB.Table("users").Where("id = ?", id).Find(&user)
	if user.Role == "admin" {
		return true
	}

	return true
}

func AsPhone(phone string) string {
	if phone == "" {
		return ""
	}
	if len(phone) == 10 {
		return fmt.Sprintf("%s-%s-%s", phone[0:3], phone[3:6], phone[6:10])
	}
	return phone
}

func AsMoney(amount int64) template.HTML {
	shkalim := money.New(amount, money.ILS)
	val := shkalim.Display()
	if amount < 0 {
		val = fmt.Sprintf("<span class=\"text-danger fw-bold\">%v</span>", val)
	}
	return template.HTML(val)
}

func AsInputMoney(amount int64) string {
	shkalim := money.New(amount, money.ILS)
	s := strings.Replace(shkalim.Display(), "₪", "", -1)
	s = strings.Replace(s, ",", "", -1)
	s = strings.Replace(s, " ", "", -1)
	return s
}

func toHtml(s string) template.HTML {
	s = strings.Replace(s, "\n", "<br>", -1)
	s = strings.Replace(s, "\\n", "<br>", -1)
	return template.HTML(s)
}

func hideInProduction() string {
	if strings.ToLower(config.Config.Mode) == "production" {
		return "hidden"
	}
	return ""
}

func IsSameStr(s1, s2 string) bool {
	return s1 == s2
}

func hideNotActive(uid int64) string {
	if uid == 0 {
		return "hidden"
	}
	return ""
}

func safe(s string) template.HTML {
	if s == "" {
		return ""
	}
	return template.HTML(s)
}
