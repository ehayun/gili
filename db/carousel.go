package db

type Carousel struct {
	ID       int    `json:"id" gorm:"primaryKey"`
	Title    string `json:"title"`
	ImageUrl string `json:"image_url"`
	Content  string `json:"content"`
	OrderNum int    `json:"order_num"`
}

func (_ *Carousel) TableName() string {
	return "carousels"
}

func (_ *Carousel) List() []Carousel {
	var carousels []Carousel
	MainDB.Order("order_num").Find(&carousels)
	return carousels
}

func (c *Carousel) Create() error {
	res := MainDB.Table(c.TableName()).Create(c)
	return res.Error
}

func (c *Carousel) Update() error {
	return MainDB.Save(c).Error
}

func (c *Carousel) Get(id int) error {
	res := MainDB.Where("id = ?", id).First(c)
	return res.Error
}

func (c *Carousel) Delete() error {
	res := MainDB.Where("id = ?", c.ID).Delete(c)
	return res.Error
}
