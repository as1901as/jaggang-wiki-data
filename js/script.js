document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = document.querySelectorAll(".toc a");
  const mainText = document.querySelector(".wiki-main-text");

  fetch("/json/content.json")
    .then((response) => response.json())
    .then((data) => {
      mainText.innerHTML = "";

      tocLinks.forEach((link) => {
        const id = link.getAttribute("href").replace("#", "");
        const titleText = link.textContent.trim();

        // 제목 h2 + 접기 버튼
        const h2 = document.createElement("h2");
        h2.id = id;
        h2.textContent = titleText;

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "toggle-section";
        toggleBtn.textContent = "[ ▼ ]";
        h2.appendChild(toggleBtn);

        const sectionContainer = document.createElement("div");
        sectionContainer.className = "section-container";

        const sectionBody = document.createElement("div");
        sectionBody.className = "section-body";
        sectionBody.innerHTML = data[id] || "<p>내용이 없습니다.</p>";

        // 접기 토글
        toggleBtn.addEventListener("click", () => {
          sectionBody.classList.toggle("hide");
          toggleBtn.textContent = sectionBody.classList.contains("hide")
            ? "[ ▶ ]"
            : "[ ▼ ]";
        });

        // ✅ 편집 버튼
        const editBtn = document.createElement("button");
        editBtn.textContent = "[ 편집 ]";
        editBtn.className = "edit-button";
        sectionBody.appendChild(editBtn);

        // ✅ textarea + 저장 버튼
        const textarea = document.createElement("textarea");
        textarea.style.display = "none";
        textarea.style.width = "100%";
        textarea.style.height = "150px";
        sectionBody.appendChild(textarea);

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "저장";
        saveBtn.style.display = "none";
        saveBtn.className = "save-button";
        sectionBody.appendChild(saveBtn);

        // 편집 토글
        editBtn.addEventListener("click", () => {
          const isVisible = textarea.style.display === "block";
          textarea.style.display = isVisible ? "none" : "block";
          saveBtn.style.display = isVisible ? "none" : "inline-block";
          textarea.value = sectionBody.innerHTML;
        });

        // 저장 버튼 클릭
        saveBtn.addEventListener("click", () => {
          const updatedContent = textarea.value;

          fetch("/json/content.json")
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
      });
    })
    .catch((error) => {
      mainText.innerHTML = "<p>본문 데이터를 불러오지 못했습니다.</p>";
      console.error("본문 로딩 오류:", error);
    });
});