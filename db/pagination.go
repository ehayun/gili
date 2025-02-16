package db

import (
	"gorm.io/gorm"
	"math"
)

const (
	TableLimit = 20
)

type Pagination struct {
	Limit      int         `json:"limit,omitempty;query:limit"`
	Page       int         `json:"page,omitempty;query:page"`
	Sort       string      `json:"sort,omitempty;query:sort"`
	TotalRows  int64       `json:"total_rows"`
	TotalPages int         `json:"total_pages"`
	LastPage   int         `json:"last_page"`
	NextPage   int         `json:"next_page"`
	PrevPage   int         `json:"prev_page"`
	Rows       interface{} `json:"rows"`
	Url        string      `json:"url"`
	Pages      []int
}

func (p *Pagination) GetOffset() int {
	return (p.GetPage() - 1) * p.GetLimit()
}

func (p *Pagination) GetLimit() int {
	if p.Limit == 0 {
		p.Limit = 12
	}
	return p.Limit
}

func (p *Pagination) GetPage() int {
	if p.Page == 0 {
		p.Page = 1
	}
	return p.Page
}

func (p *Pagination) GetSort() string {
	if p.Sort == "" {
		p.Sort = ""
	}
	return p.Sort
}

func Paginate(recs interface{}, db *gorm.DB, pagination *Pagination) Pagination {
	//
	//startTime := time.Now()
	//defer func() {
	//	elapsed := time.Since(startTime)
	//	log.Println("Paginate elapsed time: ", elapsed)
	//}()

	p := Pagination{}
	//var p Pagination
	var rows int64
	db.Count(&rows)

	page := pagination.GetPage()
	limit := pagination.GetLimit()
	sort := pagination.GetSort()

	p.TotalPages = int(math.Ceil(float64(rows) / float64(pagination.Limit)))

	db.Offset(pagination.GetOffset()).Limit(limit).Order(sort).Find(recs)

	p.TotalRows = rows
	p.Page = page
	if page > p.TotalPages {
		p.Page = p.TotalPages
	}
	p.Rows = recs
	p.Page = pagination.GetPage()
	p.SetValues()
	p.createPagesList()

	return p
}

func (p *Pagination) createPagesList() {
	pagers := 9
	if p.TotalPages < pagers {
		pagers = p.TotalPages
	}
	l := pagers / 2
	startPage := 1
	if p.GetPage() > l {
		startPage = p.GetPage() - l
	}
	if p.TotalPages-pagers < p.GetPage() {
		startPage = p.TotalPages - pagers + 1
	}
	endPage := startPage + pagers
	if endPage > p.TotalPages {
		endPage = p.TotalPages + 1
	}
	pages := make([]int, endPage-startPage)
	idx := 0
	for i := startPage; i < endPage; i++ {
		pages[idx] = i
		idx++
	}
	p.Pages = pages
}

func (p *Pagination) SetValues() {
	p.LastPage = p.TotalPages
	p.PrevPage = 1
	p.NextPage = p.TotalPages

	if p.Page < p.TotalPages {
		p.NextPage = p.Page + 1
	}
	if p.Page > 1 {
		p.PrevPage = p.Page - 1
	}
}
