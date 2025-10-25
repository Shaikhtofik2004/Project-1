let input = document.querySelector('#search');
let loader = document.querySelector('#loader');
let usersData = [];
let lastSortedColumn = null;
let users = [];

const onLoad = async () => {
  loader.style.display = 'block';
  users = await getUsers();
  usersData = users;
  renderTable(users);
  loader.style.display = 'none';
  handleUserSearch();
};

function handleUserSearch() {
  input.addEventListener('input', () => {
    let searchInput = input.value.toLowerCase();
    const filterUsers = users.filter((u) => {
      return (
        u.name.toLowerCase().includes(searchInput) ||
        u.email.toLowerCase().includes(searchInput) ||
        u.website.toLowerCase().includes(searchInput) ||
        u.phone.toLowerCase().includes(searchInput) ||
        u.address.city.toLowerCase().includes(searchInput)
      );
    });

    if (filterUsers.length === 0) {
      const ele = document.querySelector("#users-section");
      let p = document.createElement("p");
      p.textContent = "No users found matching your search.";
      p.classList.add('no-results');
      ele.innerHTML = "";
      ele.appendChild(p);
    } else {
      renderTable(filterUsers);
    }
  });
}

const getUsers = async () => {
  let response = await fetch("https://jsonplaceholder.typicode.com/users");
  return await response.json();
};

const renderTable = (data) => {
  const table = getTableElement(data);
  const ele = document.getElementById("users-section");
  ele.innerHTML = "";
  ele.append(table);
};

const getTableElement = (data) => {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  const columns1 = [
    { id: "id", name: "User Id", key: "id", isSort: true },
    { id: 'name', name: "name", key: "name", isSort: true },
    { id: 'email', name: "User Email", key: "email", isSort: true },
    { id: 'website', name: "User Website", key: "website", isSort: true },
    { id: 'phone', name: "User Phone", key: "phone", isSort: true },
    { id: 'address', name: "User Address", key: "address", isSort: true },
  ];

  const thElements = [];

  columns1.forEach((current) => {
    const th = document.createElement("th");

    const titleSpan = document.createElement("span");
    titleSpan.textContent = current.name;
    th.appendChild(titleSpan);

    if (current.isSort) {
      const iconSpan = document.createElement("span");
      iconSpan.classList.add("sort-icon-span");

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.classList.add("sort-icon");
      icon.innerHTML = `<path d="M3 6h18M6 12h12M9 18h6"/>`;

      iconSpan.appendChild(icon);
      th.appendChild(iconSpan);

      th.onclick = (e) => {
        sortByColumn(e, current);
        updateSortIcons();
      };

      th.style.cursor = "pointer";
    }

    thElements.push(th);
  });

  const thRow = getRowElement(thElements);
  thead.appendChild(thRow);

  data.forEach((current) => {
    const tdElements = [];
    columns1.forEach((col) => {
      const td = getTDElement(current[col.key]);
      tdElements.push(td);
    });
    tbody.appendChild(getRowElement(tdElements));
  });

  table.append(thead, tbody);
  return table;
};

const getRowElement = (elements) => {
  const tr = document.createElement("tr");
  tr.append(...elements);
  return tr;
};

const getTDElement = (value) => {
  const td = document.createElement("td");
  td.innerHTML = (value && value.city) ? value.city : value;
  return td;
};

const sortByColumn = (e, column) => {
  let order = "asc";
  if (lastSortedColumn?.id === column?.id) {
    const lastSortedOrder = lastSortedColumn?.order;
    if (lastSortedOrder === 'asc') {
      order = 'dsc';
    }
    else if (lastSortedOrder === 'dsc') {
      order = '';
    }
  }

  const copyOfUsers = [...usersData];
  const { key } = column;

  if (order) {
    copyOfUsers.sort((a, b) => {
      let aValue = a?.[key];
      let bValue = b?.[key];

      if (typeof aValue === "string") aValue = aValue?.toLowerCase();
      if (typeof bValue === "string") bValue = bValue?.toLowerCase();

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  lastSortedColumn = column;
  lastSortedColumn.order = order;
  renderTable(copyOfUsers);
};

const updateSortIcons = () => {
  const ths = document.querySelectorAll("th");
  ths.forEach(th => {
    const svg = th.querySelector("svg.sort-icon");
    if (!svg) return;

    const columnName = th.querySelector("span")?.textContent?.trim();
    if (lastSortedColumn && lastSortedColumn.name === columnName) {
      if (lastSortedColumn.order === "asc") {
        svg.innerHTML = `<path d="M8 19V5"/><path d="M5 8l3-3 3 3"/>`;
      } else if (lastSortedColumn.order === "dsc") {
        svg.innerHTML = `<path d="M8 5v14"/><path d="M5 16l3 3 3-3"/>`;
      } else {
        svg.innerHTML = `<path d="M3 6h18M6 12h12M9 18h6"/>`;
      }
    } else {
      svg.innerHTML = `<path d="M3 6h18M6 12h12M9 18h6"/>`;
    }
  });
};

window.addEventListener("load", onLoad);