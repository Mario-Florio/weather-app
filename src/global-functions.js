
export function createHTML(html) {
    const template = document.createElement('template')
    template.innerHTML = html.trim()
    return template.content.firstElementChild
}

export function render(page) {
    const body = document.querySelector('body')
    while (body.hasChildNodes() === true) {
        body.removeChild(body.lastChild)
    }
    body.appendChild(page)
}

export function createPage(arrOfNodes) {
    let page = createHTML(`<div></div>`)
    for (let i = 0; arrOfNodes.length > i; i++) {
        page.appendChild(arrOfNodes[i])
    }
    return page
}
