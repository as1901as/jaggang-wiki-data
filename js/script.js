document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = document.querySelectorAll(".toc a");
  const mainText = document.querySelector(".wiki-main-text");
  const searchInput = document.getElementById("searchInput");
  const md = window.markdownit(); // 마크다운 파서 초기화

  // ✅ 본문 데이터 로드
  fetch("/data/content.json")
    .then((response) => response.json())
    .then((data) => {
      mainText.innerHTML = "";

      tocLinks.forEach((link) => {
        const id = link.getAttribute("href").replace("#", "");
        const titleText = link.textContent.trim();

        const h2 = document.createElement("h2");
        h2.id = id;
        h2.textContent = titleText;

        const buttonGroup = document.createElement("span");
        buttonGroup.className = "button-group";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "toggle-section";
        toggleBtn.textContent = "[ ▼ ]";
        buttonGroup.appendChild(toggleBtn);

        h2.appendChild(buttonGroup);

        const sectionContainer = document.createElement("div");
        sectionContainer.className = "section-container";

        const sectionBody = document.createElement("div");
        sectionBody.className = "section-body";

        if (id === "section1") {
          sectionBody.innerHTML = `
            <table class="info-table">
              <tr><th>이름</th><td>자깡</td></tr>
              <tr><th>활동 분야</th><td>인터넷 방송, 커뮤니티 운영</td></tr>
              <tr><th>채널 링크</th><td><a href="https://youtube.com" target="_blank">YouTube</a></td></tr>
            </table>
          `;
        } else {
          sectionBody.innerHTML = md.render(data[id] || "");

          const editBtn = document.createElement("button");
          editBtn.textContent = "[ 편집 ]";
          editBtn.className = "edit-button small-right";
          buttonGroup.appendChild(editBtn);

          const textarea = document.createElement("textarea");
          textarea.style.display = "none";
          textarea.style.width = "100%";
          textarea.style.height = "150px";
          sectionBody.appendChild(textarea);

          const preview = document.createElement("div");
          preview.className = "markdown-preview";
          preview.style.display = "none";
          sectionBody.appendChild(preview);

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "저장";
          saveBtn.className = "save-button";
          saveBtn.style.display = "none";
          sectionBody.appendChild(saveBtn);

          editBtn.addEventListener("click", () => {
            const isVisible = textarea.style.display === "block";
            textarea.style.display = isVisible ? "none" : "block";
            preview.style.display = isVisible ? "none" : "block";
            saveBtn.style.display = isVisible ? "none" : "inline-block";
            textarea.value = data[id] || "";
            preview.innerHTML = md.render(textarea.value);
          });

          textarea.addEventListener("input", () => {
            preview.innerHTML = md.render(textarea.value);
          });

          saveBtn.addEventListener("click", () => {
            const updatedContent = textarea.value;

            fetch("/data/content.json")
              .then((res) => res.json())
              .then((currentData) => {
                currentData[id] = updatedContent;
                return fetch("/.netlify/functions/updateContent", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: currentData }),
                });
              })
              .then((res) => res.json())
              .then((result) => {
                if (result.message) {
                  alert("✅ 저장되었습니다. 페이지를 새로고침합니다.");
                  location.reload();
                } else {
                  alert("❌ 저장 실패: " + (result.error || "알 수 없는 오류"));
                }
              })
              .catch((err) => {
                console.error("저장 실패", err);
                alert("❌ 저장 중 오류 발생");
              });
          });
        }

        toggleBtn.addEventListener("click", () => {
          sectionBody.classList.toggle("hide");
          toggleBtn.textContent = sectionBody.classList.contains("hide") ? "[ ▶ ]" : "[ ▼ ]";
        });

        sectionContainer.appendChild(sectionBody);
        mainText.appendChild(h2);
        mainText.appendChild(sectionContainer);
        const hr = document.createElement("hr");
        hr.className = "section-divider";
        mainText.appendChild(hr);
      });
    })
    .catch((error) => {
      mainText.innerHTML = "<p>본문 데이터를 불러오지 못했습니다.</p>";
      console.error("본문 로딩 오류:", error);
    });

  // KBO 순위 로드
  fetch("/data/kbo_rank.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("kbo-rank");
      const table = document.createElement("table");
      table.className = "rank-table";
      table.innerHTML = `
        <thead>
          <tr><th>팀</th><th>승</th><th>패</th><th>무</th><th>승률</th></tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.team}</td>
              <td>${row.win}</td>
              <td>${row.loss}</td>
              <td>${row.draw}</td>
              <td>${row.rate}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      container.appendChild(table);
    })
    .catch(() => {
      document.getElementById("kbo-rank").textContent = "순위를 불러올 수 없습니다.";
    });


  // ✅ 나무위키 외부 검색 (Enter 키)
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const keyword = searchInput.value.trim();
      if (keyword) {
        const encoded = encodeURIComponent(keyword);
        const namuwikiUrl = `https://namu.wiki/Search?q=${encoded}`;
        window.open(namuwikiUrl, "_blank");
      }
    }
  });

  // ✅ 실시간 필터링
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();

    document.querySelectorAll(".section-container").forEach((section) => {
      const h2 = section.previousElementSibling;
      const text = h2.textContent.toLowerCase() + section.textContent.toLowerCase();
      const match = text.includes(keyword);
      section.style.display = match ? "" : "none";
      h2.style.display = match ? "" : "none";
    });
  });
});
