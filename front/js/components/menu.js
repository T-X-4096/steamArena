export function initMobileMenu(menuBtnId = "menuBtn", menuId = "mobileMenu", linkClass = "mobile-link") {
    const menuBtn = document.getElementById(menuBtnId);
    const mobileMenu = document.getElementById(menuId);
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", e => {
        e.stopPropagation();
        mobileMenu.classList.toggle("open");
    });

    document.addEventListener("click", e => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.remove("open");
        }
    });

    const mobileLinks = mobileMenu.querySelectorAll(`.${linkClass}`);
    mobileLinks.forEach(link => link.addEventListener("click", () => mobileMenu.classList.remove("open")));
}