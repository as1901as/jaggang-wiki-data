const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const keyword = searchInput.value.trim();
    if (keyword) {
      const encoded = encodeURIComponent(keyword);
      const namuwikiUrl = `https://namu.wiki/Search?q=${encoded}`;
      window.open(namuwikiUrl, "_blank"); // 새 창 또는 새 탭 열기
    }
  }
});