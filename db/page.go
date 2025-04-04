package db

import "time"

type Page struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug      string    `gorm:"size:255;unique;not null" json:"slug"`
	Title     string    `gorm:"size:255;not null" json:"title"`
	ImageURL  string    `gorm:"size:255;not null" json:"image_url"`
	Content   string    `gorm:"type:text" json:"content,omitempty"`
	Keywords  string    `json:"keywords"`
	MenuID    *int64    `gorm:"column:menu_id" json:"menu_id,omitempty"`
	ParentID  *int64    `gorm:"column:parent_id" json:"parent_id,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Menu      Menu      `gorm:"foreignKey:MenuID" json:"menu,omitempty"`
	Parent    *Page     `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
}

func (p *Page) TableName() string {
	return "pages"
}

func (p *Page) GetPageBySlug(slug string) (Page, error) {
	var page Page
	if err := MainDB.Where("slug = ?", slug).First(&page).Error; err != nil {
		return page, err
	}
	return page, nil
}

func (p *Page) Update() error {
	return MainDB.Save(p).Error
}

func (p *Page) List() []Page {
	var pages []Page
	MainDB.Table(p.TableName()).Order("updated_at desc").Find(&pages)
	return pages
}

func (p *Page) Create() error {
	res := MainDB.Create(p)
	return res.Error
}

func (p *Page) Get(id int64) error {
	res := MainDB.Where("id = ?", id).First(p)
	return res.Error
}
