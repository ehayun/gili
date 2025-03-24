package db

import "database/sql"

type Menu struct {
	Id       int64         `gorm:"primaryKey" json:"id"`
	Title    string        `json:"title"`
	Url      string        `json:"url"`
	OrderNum int64         `json:"order_num"`
	ParentId sql.NullInt64 `json:"parent_id"`
}

func (_ *Menu) TableName() string {
	return "menus"
}

func (m *Menu) List(getAll bool) []Menu {
	var result []Menu
	q := MainDB.Table(m.TableName()).
		Order("order_num")
	if !getAll {
		q = q.Where("id > ?", 0)
	}

	q.Find(&result)
	return result
}

func (m *Menu) Get(id int64) (Menu, error) {
	var result Menu
	res := MainDB.Table(m.TableName()).Find(&result, id)
	return result, res.Error
}

func (_ *Menu) Paginate(page, limit int, search string) *Pagination {

	var recs []Menu

	var p Pagination

	search = "%" + search + "%"
	p.Page = page
	p.Limit = limit
	p.Sort = "___"

	udb := MainDB.Model(&Menu{}).
		Where("___ like ?", search)
	p = Paginate(&recs, udb, &p)

	return &p
}

func (m *Menu) Create() error {
	res := MainDB.Table(m.TableName()).Create(m)
	return res.Error
}

func (m *Menu) Update() error {
	res := MainDB.Table(m.TableName()).Save(m)
	return res.Error
}

func (m *Menu) Delete() error {
	res := MainDB.Table(m.TableName()).Delete(m)
	return res.Error
}
