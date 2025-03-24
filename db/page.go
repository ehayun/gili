package db

import "time"

type Page struct {
	ID        int    `json:"id" gorm:"primaryKey"`
	Slug      string `json:"slug" gorm:"unique"`
	Title     string `json:"title"`
	ImageUrl  string `json:"image_url"`
	Content   string `json:"content"`
	MenuId    int64  `json:"menu_id"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Menu      Menu `json:"menu" gorm:"foreignKey:MenuId" validate:"-"`
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
	if p.ID == 0 {
		return MainDB.Create(p).Error
	}
	return MainDB.Save(p).Error
}

func (p *Page) List() []Page {
	var pages []Page
	MainDB.Table(p.TableName()).Order("updated_at desc").Find(&pages)
	return pages
}
