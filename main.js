const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
    origin: "bottom",
    distance: "50px",
    duration: 1000,
};


function togglePassengerPopup() {
    document.getElementById("passenger-popup").classList.toggle("active");
}

function changeCount(type, change) {
    const el = document.getElementById(`${type}-count`);
    let current = parseInt(el.textContent);
    current = Math.max(0, current + change);
    el.textContent = current;

    // Cập nhật tổng hành khách
    const adult = parseInt(document.getElementById("adult-count").textContent);
    const child = parseInt(document.getElementById("child-count").textContent);
    const infant = parseInt(document.getElementById("infant-count").textContent);
    document.getElementById("passenger-summary").textContent = adult + child + infant;
}

document.addEventListener("click", (e) => {
    const popup = document.getElementById("passenger-popup");
    const box = document.querySelector(".passenger-box");
    if (!popup.contains(e.target) && !box.contains(e.target)) {
        popup.classList.remove("active");
    }
});
