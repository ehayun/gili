package db

import (
	"fmt"
	"gishur/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"time"
)

var (
	MainDB *gorm.DB
)

func ConnectMain() error {
	defer log.Printf("Connected to the main database")
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,  // Slow SQL threshold
			LogLevel:                  logger.Error, // Log level
			IgnoreRecordNotFoundError: true,         // Ignore ErrRecordNotFound error for logger
			Colorful:                  true,         // Disable color
		},
	)

	//dbParams := "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local"
	dbParams := "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jerusalem"

	dsn := fmt.Sprintf(dbParams,
		config.Config.MainDb.Host,
		config.Config.MainDb.User,
		config.Config.MainDb.Password,
		config.Config.MainDb.Dbname,
		config.Config.MainDb.Port,
	)

	if MainDB != nil {
		dbase, err := MainDB.DB()
		if err == nil {
			err = dbase.Ping()
			if err == nil {
				return err
			}
		}
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: newLogger})
	if err != nil {
		log.Fatal("Unable to connect to the main database")
	}
	MainDB = db
	return nil
}

func CloseDB() {
	defer log.Printf("Closed the main database")

	db, err := MainDB.DB()
	if err == nil {
		_ = db.Close()
	}
}
