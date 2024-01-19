document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const searchInput = document.querySelector('.form-control');
    const profileSection = document.querySelector('.profiledata');
    const repositoriesSection = document.querySelector('.repositories');
    const paginationSection = document.querySelector('.pagination');
    const loader = document.getElementById('loader');
    const briefOutline = document.getElementById('briefOutline');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = searchInput.value.trim();

        if (username) {
            showLoader();
            getUserInfo(username);
            getUserRepositories(username);
        } else {
            showBriefOutline();
            clearProfileAndRepositories();
        }
    });

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function showBriefOutline() {
        briefOutline.style.display = 'block';
    }

    function hideBriefOutline() {
        briefOutline.style.display = 'none';
    }
    async function getUserInfo(username) {
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            const userData = await response.json();
            hideBriefOutline();
            // Display user information
            profileSection.innerHTML = `
                <div class="profile-details">
                    <figure class="img-holder">
                        <img class="avtar-circle" src="${userData.avatar_url}" alt="${username}'s profile picture">
                    </figure>
                    <div class="profile-text">
                        <h1 class="title">${userData.name || username}</h1>
                        <p class="bio">${userData.bio || 'No bio available.'}</p>
                        <ul class="user-details-list">
                            <li><strong>Location:</strong> ${userData.location || 'Not specified'}</li>
                            <li><strong>Email:</strong> ${userData.email || 'Not specified'}</li>
                            <li><strong>Joined GitHub:</strong> ${formatDate(userData.created_at)}</li>
                            <li><strong>Followers:</strong> ${userData.followers}</li>
                        </ul>
                        <a href="${userData.html_url}" target="_blank" class="btn btn-secondary">
                            <span class="material-symbols-rounded">open_in_new</span>
                            See on Github
                        </a>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    async function getUserRepositories(username) {
           try {
        const perPage = 50; // Number of repositories per page
        let page = 1;
        let allRepos = [];

        // Fetch repositories for each page
        while (true) {
            const response = await fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`);
            const repositoriesData = await response.json();

            // Break the loop if no more repositories or if you reached a certain limit
            if (repositoriesData.length === 0 || allRepos.length >= 200) {
                break;
            }

            allRepos = allRepos.concat(repositoriesData);
            page++;
        }

        // Display repositories
        displayRepositories(allRepos, perPage);
        } catch (error) {
            console.error('Error fetching user repositories:', error);
        }
    }

    function displayRepositories(repositories, perPage) {
        const totalRepos = repositories.length;
        const totalPages = Math.ceil(totalRepos / perPage);

        let currentPage = 1;

        function showPage(page) {
            const start = (page - 1) * perPage;
            const end = start + perPage;
            const reposToShow = repositories.slice(start, end);

            repositoriesSection.innerHTML = reposToShow
                .map(repo => `
                    <div class="repository-card">
                        <h2><a class="text-primary" href="${repo.html_url}" target="_blank">${repo.name}</a></h2>
                        <p>${repo.description || 'No description available.'}</p>
                        <div class="tech-stacks">
                            ${getTopTechStacks(repo)}
                        </div>
                    </div>
                `)
                .join('');
        }

        showPage(currentPage);

        // Pagination buttons
        paginationSection.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', function () {
                currentPage = i;
                showPage(currentPage);
            });
            paginationSection.appendChild(button);
        }
    }

    function getTopTechStacks(repo) {
        return repo.language || 'Not specified';
    }
});
