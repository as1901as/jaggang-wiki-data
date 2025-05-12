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

          // ✅ [편집] 버튼 추가
          const editBtn = document.createElement("button");
          editBtn.textContent = "[ 편집 ]";
          editBtn.className = "edit-button";
          sectionBody.appendChild(editBtn);

          // ✅ textarea 및 저장 버튼 초기 생성 (숨김 상태)
          const textarea = document.createElement("textarea");
          textarea.style.display = "none";
          textarea.style.width = "100%";
          textarea.style.height = "150px";
          textarea.value = data[id] || "";
          sectionBody.appendChild(textarea);

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "저장";
          saveBtn.style.display = "none";
          sectionBody.appendChild(saveBtn);

          // ✅ 편집 버튼 클릭 시 textarea 토글
          editBtn.addEventListener("click", () => {
            const isVisible = textarea.style.display === "block";
            textarea.style.display = isVisible ? "none" : "block";
            saveBtn.style.display = isVisible ? "none" : "inline-block";
            textarea.value = sectionBody.innerHTML; // 현재 내용으로 로드
          });

          // ✅ 저장 버튼 클릭 시 Netlify로 POST 요청
          saveBtn.addEventListener("click", () => {
            const updatedContent = textarea.value;

            // 모든 섹션 데이터를 다시 읽어와서 하나의 JSON으로 구성
            fetch('/json/content.json')
              .then(res => res.json())
              .then(currentData => {
                currentData[id] = updatedContent;

                return fetch("/.netlify/functions/updateContent", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: currentData }),
                });
              })
              .then(res => res.json())
              .then(result => {
                alert("✅ 저장 완료!");
                sectionBody.innerHTML = updatedContent;
                textarea.style.display = "none";
                saveBtn.style.display = "none";
              })
              .catch(err => {
                console.error("저장 실패", err);
                alert("❌ 저장 중 오류 발생");
              });
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