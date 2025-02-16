package db

type Param struct {
	Id        int64  `gorm:"primaryKey"`
	MainTitle string `json:"main_title"`
	SubTitle  string `json:"sub_title"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	Address   string `json:"address"`
	Facebook  string `json:"facebook"`
	Twitter   string `json:"twitter"`
	Instagram string `json:"instagram"`
	Linkedin  string `json:"linkedin"`
}

func (_ *Param) TableName() string {
	return "params"
}

func (p *Param) List() []Param {
	var result []Param
	MainDB.Table(p.TableName()).Find(&result)
	return result
}

func (p *Param) Get() (Param, error) {
	var result Param
	res := MainDB.Table(p.TableName()).First(&result)
	if res.Error != nil {
		MainDB.Table(p.TableName()).Create(&result)
	}
	return result, res.Error
}

func (_ *Param) Paginate(page, limit int, search string) *Pagination {

	var recs []Param

	var p Pagination

	search = "%" + search + "%"
	p.Page = page
	p.Limit = limit
	p.Sort = "___"

	udb := MainDB.Model(&Param{}).
		Where("___ like ?", search)
	p = Paginate(&recs, udb, &p)

	return &p
}

func (p *Param) Create() error {
	res := MainDB.Table(p.TableName()).Create(p)
	return res.Error
}

func (p *Param) Update() error {
	res := MainDB.Table(p.TableName()).Save(p)
	return res.Error
}

func (p *Param) Delete() error {
	res := MainDB.Table(p.TableName()).Delete(p)
	return res.Error
}
