package main

import (
	"gishur/cmd"
	"gishur/config"
	"gishur/db"
	"gishur/web"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func init() {
	if err := config.InitConfig(); err != nil {
		log.Fatalf("Failed to initialize config: %v\n", err)
	}

	if err := db.ConnectMain(); err != nil {
		log.Fatalf("Failed to connect to database: %v\n", err)
	}
}

func closeDB() {
	db.CloseDB()
}

func main() {
	defer closeDB()

	//err := db.ImportDataFromFile(db.MainDB, "all.txt")
	//if err != nil {
	//	log.Fatal(err)
	//}

	if len(os.Args) < 2 {
		go web.Web()

		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM, syscall.SIGKILL)
		<-quit

		log.Println("Server exiting")
	} else {
		cmd.RunCli()
	}
}
