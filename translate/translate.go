package translate

import (
	"encoding/json"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"golang.org/x/text/language"
	"log"
)

var (
	localize *i18n.Localizer
	bundle   *i18n.Bundle
)

func init() {
	bundle = i18n.NewBundle(language.Hebrew)
	bundle.RegisterUnmarshalFunc("json", json.Unmarshal)
	_, err := bundle.LoadMessageFile("./locale/he.json")
	if err != nil {
		log.Fatal(err)
	}
	localize = i18n.NewLocalizer(bundle, "he", "")

}

func Trans(v string) string {

	transStr, err := localize.LocalizeMessage(&i18n.Message{ID: v})
	//fmt.Printf("%v [%v] ==> %v\n", v, transStr, err)
	if err != nil && transStr > "" {
		return v
	}
	if err == nil && transStr == "" {
		return v
	}
	return transStr

}
