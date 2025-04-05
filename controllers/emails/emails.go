package emails

import (
	"bytes"
	"fmt"
	"gishur/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	log "github.com/sirupsen/logrus"
	"gopkg.in/gomail.v2"
	"strconv"
	"strings"
)

func SendEmail(ctx *fiber.Ctx, tmplName, to, title string, params fiber.Map) error {

	engine := ctx.App().Config().Views

	// Create a buffer to store the rendered template
	var buf bytes.Buffer

	// Render the template into the buffer
	if err := engine.Render(&buf, "emails/message", params, "layouts/email"); err != nil {
		return err
	}

	// Now buf.String() contains the rendered template as a string
	renderedHTML := buf.String()

	// Setup the email message
	m := gomail.NewMessage()
	senderName := "tzlev"
	fromSender := fmt.Sprintf("%s <%s>", senderName, config.Config.MailServer.MailFromAddress)
	m.SetHeader("From", fromSender)
	m.SetHeader("Reply-To", "do_not_reply@gili-gishurim.com")
	m.SetHeader("To", to)
	m.SetHeader("Subject", title)
	m.SetBody("text/html", renderedHTML)

	// Create SMTP client manually
	smtpServer := config.Config.MailServer.MailHost
	smtpPort := config.Config.MailServer.MailPort
	smtpUsername := config.Config.MailServer.MailUsername
	smtpPassword := config.Config.MailServer.MailPassword

	port, _ := strconv.Atoi(smtpPort)

	var d *gomail.Dialer
	if strings.Contains(smtpServer, "meduza") {
		d = &gomail.Dialer{
			Host: smtpServer,
			Port: port,
			SSL:  false,
		}
	} else {
		d = gomail.NewDialer(smtpServer, port, smtpUsername, smtpPassword)
	}
	// Send the email
	go func() {
		if err := d.DialAndSend(m); err != nil {
			log.Errorf("failed to send email: %v", err)
		}
	}()
	return nil
}

func RenderTemplateToString(engine *html.Engine, templateName string, params fiber.Map) (string, error) {
	// Create a new buffer to store the rendered template
	var buf bytes.Buffer

	// Execute the template with the provided parameters
	if err := engine.Render(&buf, templateName, params); err != nil {
		return "", err
	}

	return buf.String(), nil
}
