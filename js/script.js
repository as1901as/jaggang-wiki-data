document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = document.querySelectorAll(".toc a");
  const mainText = document.querySelector(".wiki-main-text");

  fetch("/data/content.json")  // ✅ 명확한 경로로 수정
    .then((response) => response.json())
    .then((data) => {
      mainText.innerHTML = "";

      tocLinks.forEach((link) => {
        const id = link.getAttribute("href").replace("#", "");
        const titleText = link.textContent.trim();

        // 제목 h2 + 버튼
        const h2 = document.createElement("h2");
        h2.id = id;
        h2.textContent = titleText;

        const buttonGroup = document.createElement("span");
        buttonGroup.className = "button-group";

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "toggle-section";
        toggleBtn.textContent = "[ ▼ ]";
        buttonGroup.appendChild(toggleBtn);

        const editBtn = document.createElement("button");
        editBtn.textContent = "[ 편집 ]";
        editBtn.className = "edit-button small-right";
        buttonGroup.appendChild(editBtn);

        h2.appendChild(buttonGroup);

        const sectionContainer = document.createElement("div");
        sectionContainer.className = "section-container";

        const sectionBody = document.createElement("div");
        sectionBody.className = "section-body";
        sectionBody.innerHTML = data[id] || "<p>내용이 없습니다.</p>";

        // toggle 접기/펼치기
        toggleBtn.addEventListener("click", () => {
          sectionBody.classList.toggle("hide");
          toggleBtn.textContent = sectionBody.classList.contains("hide") ? "[ ▶ ]" : "[ ▼ ]";
        });

        // textarea + 저장 버튼
        const textarea = document.createElement("textarea");
        textarea.style.display = "none";
        textarea.style.width = "100%";
        textarea.style.height = "150px";
        sectionBody.appendChild(textarea);

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "저장";
        saveBtn.className = "save-button";
        saveBtn.style.display = "none";
        sectionBody.appendChild(saveBtn);

        // 편집 버튼 클릭
        editBtn.addEventListener("click", () => {
          const isVisible = textarea.style.display === "block";
          textarea.style.display = isVisible ? "none" : "block";
          saveBtn.style.display = isVisible ? "none" : "inline-block";
          textarea.value = data[id] || "";
        });
        textarea.addEventListener("input", () => {
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        });
        // 저장 클릭 시 API 호출
        saveBtn.addEventListener("click", () => {
          const updatedContent = textarea.value;

          fetch("/data/content.json") // ✅ 경로 일치
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

        sectionContainer.appendChild(sectionBody);
        mainText.appendChild(h2);
        mainText.appendChild(sectionContainer);

        // ✅ 구분선 추가
        const hr = document.createElement("hr");
        hr.className = "section-divider";
        mainText.appendChild(hr);
      });
    })
    .catch((error) => {
      mainText.innerHTML = "<p>본문 데이터를 불러오지 못했습니다.</p>";
      console.error("본문 로딩 오류:", error);
    });
});