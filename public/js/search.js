const input = document.getElementById("searchInput");
  const list = document.getElementById("searchResults");
  let debounceTimeout;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      const query = input.value.trim();
      list.innerHTML = "";

      if (!query) return;

      try {
        const res = await fetch(`/transctions/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.length === 0) {
          list.innerHTML = `<li style="padding:10px 16px; color:#777;">No results found</li>`;
          return;
        }

        data.forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
            <a href="/transctions/${item._id}">
              <strong>${item.amount}</strong><br>
              <small>${item.category}, ${item.date}</small>
            </a>`;
          list.appendChild(li);
        });
      } catch (err) {
        console.error("Search error:", err);
        list.innerHTML = `<li style="padding:10px 16px; color:red;">Error loading results</li>`;
      }
    }, 300); // Debounce delay
  });