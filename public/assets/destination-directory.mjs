const controls = document.getElementById("destination-directory-controls");
const search = document.getElementById("destination-search");
const regionFilter = document.getElementById("destination-region-filter");
const status = document.getElementById("destination-directory-status");
const cards = [...document.querySelectorAll("[data-destination-card]")];
const groups = [...document.querySelectorAll("[data-destination-group]")];

if (controls && search && regionFilter && status && cards.length) {
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fi");

  function filterDirectory() {
    const term = normalize(search.value.trim());
    const region = regionFilter.value;
    let visibleCount = 0;
    for (const card of cards) {
      const matchesName = normalize(card.dataset.name || "").includes(term);
      const matchesRegion = region === "all" || card.dataset.region === region;
      const visible = matchesName && matchesRegion;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    }
    for (const group of groups) {
      group.hidden = !group.querySelector("[data-destination-card]:not([hidden])");
    }
    status.textContent = visibleCount === 1 ? "Näytetään 1 kohde." : `Näytetään ${visibleCount} kohdetta.`;
  }

  search.addEventListener("input", filterDirectory);
  regionFilter.addEventListener("change", filterDirectory);
  controls.hidden = false;
  filterDirectory();
}
