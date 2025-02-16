import React from 'react';

function Pagination(props) {
    let onChangeFunc = props.Filter
    let pages = props.pages
    let setPageClass = props.setPageClass
    let Paging = props.Paging

    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                <li className="page-item">
                    <a className="page-link" href="#" aria-label="Previous"
                       onClick={() => onChangeFunc(Paging.prev_page)}>
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                {
                    pages.map((p) => (
                        <li className={setPageClass(p, Paging.page)}>
                            <a className={"page-link"} href="#" onClick={() => onChangeFunc(p)}>
                                {p}
                            </a>
                        </li>
                    ))
                }
                <li className="page-item">
                    <a className="page-link" href="#" aria-label="Next"
                       onClick={() => onChangeFunc(Paging.next_page)}>
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination;
