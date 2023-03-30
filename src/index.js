import './styles.css'

const body = document.querySelector('body')
const div = document.createElement('div')

div.textContent = 'Hello World'
div.classList.add('styles')

body.appendChild(div)

console.lof('hello world')