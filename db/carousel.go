package db

type Carousel struct {
	ID       int    `json:"id" gorm:"primaryKey"`
	Title    string `json:"title"`
	ImageUrl string `json:"image_url"`
	Content  string `json:"content"`
	OrderNum int    `json:"order_num"`
}

func (c Carousel) List() []Carousel {
	var carousels []Carousel
	MainDB.Order("order_num").Find(&carousels)
	return carousels
}
