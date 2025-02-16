package pkg

import (
	"fmt"
	"github.com/antchfx/xmlquery"
	"io"
	"log"
	"net/http"
	"strings"
)

type Ldap struct {
	Email string
	Hujid string
	Name  string
}

func GetUrl(method, url string) string {

	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		log.Fatalln(err)
	}

	req.Header.Set("Accept", "application/xml")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalln(err)
	}

	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {

		}
	}(resp.Body)

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
	}
	return string(b)
}

func getField(root *xmlquery.Node, field string) string {
	if val := root.SelectElement("//" + field); val != nil {
		//fmt.Println("getField", field, val.InnerText())
		return val.InnerText()
	}

	return ""
}

func GetUser(email string, password string) Ldap {
	ldap := Ldap{Email: ""}

	url := fmt.Sprintf("https://www4.huji.ac.il/htph/services/HUJIservices.php?service=identify&id=%s&pass=%s&siman=xml", email, password)

	str := GetUrl("GET", url)

	doc, err := xmlquery.Parse(strings.NewReader(str))
	if err != nil {
		return ldap
	}
	root := xmlquery.FindOne(doc, "//user")
	status := getField(root, "status")
	hujid := getField(root, "hujid")
	if status == "OK" {
		ldap = getUserData(hujid)
	}

	return ldap
}

func getUserData(huid string) Ldap {
	ldap := Ldap{Email: ""}
	url := fmt.Sprintf("https://www4.huji.ac.il/htph/services/HUJIservices.php?service=HUID&id=%s", huid)
	str := GetUrl("GET", url)
	doc, err := xmlquery.Parse(strings.NewReader(str))
	if err != nil {
		return ldap
	}

	//<Status>OK</Status>
	//<Type>Staff</Type>
	//<Zehut>5610805</Zehut>
	//<OldZehut></OldZehut>
	//<HUIDL>4c9ad853fd2ffd5d4b51ef9921cc8d74</HUIDL>
	//<HUIDS>319189</HUIDS>
	//<Name>Eli Hayun</Name>
	//<Hname>אליהו חיון</Hname>
	//<Email>elihay@savion.huji.ac.il</Email>
	//<Faculties></Faculties>
	//<Phone>025494999</Phone>
	//
	//

	root := xmlquery.FindOne(doc, "//Person")
	if status := root.SelectElement("//Status"); status != nil {
		if status.InnerText() == "OK" {
			ldap = Ldap{
				Email: getField(root, "Email"),
				Hujid: getField(root, "HUIDL"),
				Name:  getField(root, "Hname"),
			}
		}
	}

	return ldap
}
