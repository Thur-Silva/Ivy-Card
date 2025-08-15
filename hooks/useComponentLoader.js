// Este script carrega fragmentos de HTML em placeholders com [data-component-path]
document.addEventListener('DOMContentLoaded', () => {
  const components = document.querySelectorAll('[data-component-path]');

  components.forEach(async (el) => {
    const path = el.getAttribute('data-component-path');
    if (path) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const html = await response.text();
          // Usa innerHTML para injetar o conteúdo, mantendo o elemento
          // no DOM e permitindo que scripts sejam executados.
          el.innerHTML = html;
        } else {
          console.error(`Falha ao carregar o componente do caminho: ${path}`, response.statusText);
        }
      } catch (error) {
        console.error(`Erro ao carregar o componente do caminho: ${path}`, error);
      }
    }
  });
});