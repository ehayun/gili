package tmplUtils

import (
	"fmt"
	"gishur/translate"
	"html/template"
	"os"
	"path/filepath"
)

const Version = "0.0.1"

var TemplateFunc map[string]interface{} = map[string]interface{}{
	"version":     version,
	"getCssAsset": getCssAsset,
	"getJsAsset":  getJsAsset,
	"_":           Trans,
	"tr":          Trans,
	"safe":        safe,
}

func version() string {
	return Version
}

// getJsAsset returns the HTML for a JavaScript asset
func getJsAsset(name string) template.HTML {
	var res template.HTML
	_ = filepath.Walk("public/js", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Name() == name {
			res = template.HTML("<script src=\"/" + path + "\">")
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
			res = template.HTML("<link rel=\"stylesheet\" href=\"/" + path + "\">")
		}
		return nil
	})
	return res
}

func Trans(s interface{}) string {
	v := fmt.Sprintf("%v", s)
	if v == "" {
		return ""
	}
	return translate.Trans(v)
}

func safe(s string) template.HTML {
	if s == "" {
		return ""
	}
	return template.HTML(s)
}
