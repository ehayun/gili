package cmd

import (
	"github.com/gofiber/fiber/v2/log"
	"github.com/urfave/cli/v2"
	"os"
)

func RunCli() {
	app := &cli.App{
		Commands: []*cli.Command{
			user,
		},
	}
	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func Daily() {

}
