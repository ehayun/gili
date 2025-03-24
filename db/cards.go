package db

type Card struct {
	Id       int64  `gorm:"primaryKey" json:"id"`
	Title    string `json:"title"`
	ImageUrl string `json:"image_url"`
	MenuId   int64  `json:"menu_id"`
	Content  string `json:"content"`
	OrderNum int64  `json:"order_num"`
	Menu     Menu   `gorm:"foreignKey:MenuId" json:"menu"`
}

func (_ *Card) TableName() string {
	return "cards"
}

func (c *Card) List() []Card {
	var result []Card
	MainDB.Table(c.TableName()).
		Preload("Menu").
		Order("order_num").Find(&result)

	return result
}

func (c *Card) Get(id int64) (Card, error) {
	var result Card
	res := MainDB.Table(c.TableName()).Find(&result, id)
	return result, res.Error
}

func (_ *Card) Paginate(page, limit int, search string) *Pagination {

	var recs []Card

	var p Pagination

	search = "%" + search + "%"
	p.Page = page
	p.Limit = limit
	p.Sort = "___"

	udb := MainDB.Model(&Card{}).
		Where("___ like ?", search)
	p = Paginate(&recs, udb, &p)

	return &p
}

func (c *Card) Create() error {
	res := MainDB.Table(c.TableName()).Create(c)
	return res.Error
}

func (c *Card) Update() error {
	res := MainDB.Table(c.TableName()).Save(c)
	return res.Error
}

func (c *Card) Delete() error {
	res := MainDB.Table(c.TableName()).Delete(c)
	return res.Error
}
