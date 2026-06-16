const btn = document.querySelector("button")
const timer = document.querySelector("#timer")
const score = document.querySelector("#score")
const container = document.querySelector(".container")
const overlay = document.querySelector("#overlay")

const box = document.createElement("div");
box.classList.add("box")

let interval, timeout, time = 0, _score = 0

const randomColor = () => {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)

    return `rgb(${r}, ${g}, ${b})`
}

const randomBox = () => {

    box.style.backgroundColor = randomColor()
    container.append(box)

    let height = container.clientHeight - box.offsetHeight
    let width = container.clientWidth - box.offsetWidth

    const randomY = Math.random() * height
    const randomX = Math.random() * width

    box.style.top = `${randomY}px`
    box.style.left = `${randomX}px`
}

btn.addEventListener("click", () => {
    clearInterval(interval)
    clearTimeout(timeout)
    time = 0
    timer.textContent = time

    interval = setInterval(() => {
        randomBox()
        time += 1;
        timer.textContent = time;
    }, 1000)

    timeout = setTimeout(() => {
        clearInterval(interval)
        overlay.style.display = "flex"
        setTimeout(() => {
            location.reload()
            // overlay.style.display = "none"
            // time = 0
            // _score = 0
            // timer.textContent = time
            // score.textContent = _score
        }, 3000)
    }, 10000)
})

box.addEventListener("click", () => {
    _score += 10;
    score.textContent = _score
    box.remove()
})