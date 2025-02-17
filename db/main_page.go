package db

type MainPage struct {
	Page      Page
	Carousels []Carousel
}

func (mp *MainPage) GetMainPage() (MainPage, error) {
	var mainPage MainPage
	var p Page
	p, _ = p.GetPageBySlug("main")
	mainPage.Page = p

	var c Carousel
	mainPage.Carousels = c.List()

	return mainPage, nil
}
