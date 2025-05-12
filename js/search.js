const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-form input');

function handleSearchSubmit(event) {
    event.preventDefault();
    const url = 'https://namu.wiki/w/' + searchInput.value;
    window.open(url);
    searchInput.value = '';
}

searchForm.addEventListener('submit', handleSearchSubmit);