(function () {
  function initLayout() {
    const navMount = document.getElementById('navbarMount');
    const yearMount = document.querySelectorAll('[data-current-year]');

    if (navMount && window.ZallComponents) {
      navMount.innerHTML = window.ZallComponents.buildNavbar();
    }

    yearMount.forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener('DOMContentLoaded', initLayout);
  window.ZallRouter = { initLayout };
})();
