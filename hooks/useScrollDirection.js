// Hides the sticky header when scrolling down, shows when scrolling up
export function onScrollDirection({ target, hiddenClass }) {
  const header = document.querySelector(target);
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const toggle = () => {
    const currentY = window.scrollY;
    const goingDown = currentY > lastY;
    header.classList.toggle(hiddenClass, goingDown && currentY > 10);
    lastY = currentY;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    window.requestAnimationFrame(toggle);
    ticking = true;
  }, { passive: true });
}