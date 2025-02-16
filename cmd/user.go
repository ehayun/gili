package cmd

import (
	"github.com/urfave/cli/v2"
)

// cli command for users
var (
	user = &cli.Command{
		Name:  "user",
		Usage: "run user tasks/queries",
	}
)
