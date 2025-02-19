package db

type MainPage struct {
	Page      Page       `json:"page"`
	Carousels []Carousel `json:"carousels"`
	Cards     []Card     `json:"cards"`
}

func (mp *MainPage) GetMainPage() (MainPage, error) {
	var mainPage MainPage
	var p Page
	p, _ = p.GetPageBySlug("main")
	mainPage.Page = p

	var c Carousel
	mainPage.Carousels = c.List()

	var card Card
	mainPage.Cards = card.List()

	return mainPage, nil
}
