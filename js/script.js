document.addEventListener("DOMContentLoaded", () => {
    const tocLinks = document.querySelectorAll(".toc a");
    const mainText = document.querySelector(".wiki-main-text");
  
    fetch('/data/content.json')
      .then(response => response.json())
      .then(data => {
        mainText.innerHTML = "";
  
        tocLinks.forEach(link => {
          const id = link.getAttribute("href").replace("#", "");
          const titleText = link.textContent.trim();
  
          // h2 제목 + 접기 버튼
          const h2 = document.createElement("h2");
          h2.id = id;
          h2.textContent = titleText;
  
          const toggleBtn = document.createElement("button");
          toggleBtn.className = "toggle-section";
          toggleBtn.textContent = "[ ▼ ]";
          h2.appendChild(toggleBtn);
  
          // 본문 섹션
          const sectionContainer = document.createElement("div");
          sectionContainer.className = "section-container";
  
          const sectionBody = document.createElement("div");
          sectionBody.className = "section-body";
          sectionBody.innerHTML = data[id] || "<p>내용이 없습니다.</p>";
  
          toggleBtn.addEventListener("click", () => {
            sectionBody.classList.toggle("hide");
            toggleBtn.textContent = sectionBody.classList.contains("hide") ? "[ ▶ ]" : "[ ▼ ]";
          });
  
          sectionContainer.appendChild(sectionBody);
          mainText.appendChild(h2);
          mainText.appendChild(sectionContainer);
        });
      })
      .catch(error => {
        mainText.innerHTML = "<p>본문 데이터를 불러오지 못했습니다.</p>";
        console.error("본문 로딩 오류:", error);
      });
  });