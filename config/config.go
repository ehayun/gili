package config

import (
	"gopkg.in/ini.v1"
	"log"
)

type appConfig struct {
	Port       string     `ini:"port"`
	AppName    string     `ini:"app_name"`
	Mode       string     `ini:"mode"`
	MainDb     ConfDB     `ini:"main-db"`
	MailServer MailServer `ini:"mail"`
}

type ConfDB struct {
	Driver   string `ini:"driver"`
	Host     string `ini:"host"`
	Dbname   string `ini:"dbname"`
	User     string `ini:"user"`
	Password string `ini:"password"`
	Port     string `ini:"port"`
}

type MailServer struct {
	MailDriver      string `ini:"MAIL_DRIVER"`
	MailHost        string `ini:"MAIL_HOST"`
	MailPort        string `ini:"MAIL_PORT"`
	MailUsername    string `ini:"MAIL_USERNAME"`
	MailPassword    string `ini:"MAIL_PASSWORD"`
	MailEncryption  string `ini:"MAIL_ENCRYPTION"`
	MailFromAddress string `ini:"MAIL_FROM_ADDRESS"`
	MailFromName    string `ini:"MAIL_FROM_NAME"`
}

type ProviderPayment struct {
	ApiKey    string `ini:"API_KEY"`
	ApiSecret string `ini:"API_SECRET"`
}

var Config appConfig

func InitConfig(envFile ...string) error {
	eFile := ".env"
	if len(envFile) > 0 {
		eFile = envFile[0]
	}
	cfg, err := ini.Load(eFile)
	if err != nil {
		log.Fatalf("Unable to read ini file (.env) : %v", err)
	}

	if err := cfg.MapTo(&Config); err != nil {
		log.Fatalf("Unable to map the .env file %v", err)
	}
	return nil
}
