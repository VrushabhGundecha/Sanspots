window.addEventListener('DOMContentLoaded', () => {
    loadContent();
    window.onhashchange = loadContent;
});
 
function loadContent() {
    const hash = window.location.hash.substring(1);

    switch (hash) {
        case 'register':
            loadRegisterForm();
            break;
        case 'update':
            loadUpdateForm();
            break;
        case 'view':
            loadViewUsers();
            break;
        case 'delete':
            loadDeleteForm();
            break;
        default:
            loadRegisterForm();
    }
}

function loadRegisterForm() {
    document.getElementById('content').innerHTML = `
        <h2>Register</h2>
        <form id="registerForm">
            <label for="fullName">Full Name:</label>
            <input type="text" id="fullName" name="fullName" required>

            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <label for="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>

            <!-- File upload input -->
            <label for="profilePicture">Profile Picture:</label>
            <input type="file" id="profilePicture" name="profilePicture" accept="image/*">

            <button type="button" onclick="registerUser()">Register</button>
        </form>`;
}

function loadUpdateForm() {
    document.getElementById('content').innerHTML = `
        <h2>Update User</h2>
        <form id="updateForm">
            <label for="userId">User ID:</label>
            <input type="text" id="userId" name="userId" required>

            <label for="newUsername">New Username:</label>
            <input type="text" id="newUsername" name="newUsername" required>

            <!-- Additional fields for updating user details -->

            <button type="button" onclick="updateUser()">Update</button>
        </form>`;
}

function loadViewUsers() {
    fetchUsers()
        .then(users => {
            console.log('Users:', users); // Log the users to identify the structure
            if (users.length > 0) {
                const tableHeader = '<tr><th>User ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>Profile Picture</th></tr>';
                const tableRows = users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td><img src="${user.profile_picture}" alt="No Profile Picture found" style="max-width: 100px; max-height: 100px;"></td>
                    </tr>
                `).join('');

                document.getElementById('content').innerHTML = `
                    <h2>User List</h2>
                    <table class="user-table">
                        ${tableHeader}
                        ${tableRows}
                    </table>
                `;
            } else {
                document.getElementById('content').innerHTML = `
                    <h2>User List</h2>
                    No users found.
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            document.getElementById('content').innerHTML = `
                <h2>User List</h2>
                Error fetching user data.
            `;
        });
}


/*
function loadViewUsers() {
    fetchUsers()
        .then(users => {
            console.log('Users:', users); // Log the users to identify the structure
            if (users.length > 0) {
                const tableHeader = '<tr><th>User ID</th><th>Username</th><th>Full Name</th><th>Email</th></tr>';
                const tableRows = users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                    </tr>
                `).join('');

                document.getElementById('content').innerHTML = `
                    <h2>User List</h2>
                    <table class="user-table">
                        ${tableHeader}
                        ${tableRows}
                    </table>
                `;
            } else {
                document.getElementById('content').innerHTML = `
                    <h2>User List</h2>
                    No users found.
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            document.getElementById('content').innerHTML = `
                <h2>User List</h2>
                Error fetching user data.
            `;
        });
}
*/


function loadDeleteForm() {
    document.getElementById('content').innerHTML = `
        <h2>Delete User</h2>
        <form id="deleteForm">
            <label for="deleteUserId">User ID to Delete:</label>
            <input type="text" id="deleteUserId" name="deleteUserId" required>

            <button type="button" onclick="deleteUser()">Delete</button>
        </form>`;
}

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost/sanspots/api.php');
        const data = await response.json();
        console.log('User data:', data);
        return data;
    } catch (error) {
        console.error('Fetch users error:', error);
        throw error;
    }
}

function registerUser() {
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const email = document.getElementById('email').value.trim();
    const profilePicture = document.getElementById('profilePicture').files[0];

    // Client-side validation
    if (!fullName || !username || !password || !confirmPassword || !email || !profilePicture) {
        alert('Please fill in all the required fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // File type validation (you can add more checks as needed)
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedFileTypes.includes(profilePicture.type)) {
        alert('Invalid file type. Please select a valid image file.');
        return;
    }

    // Continue with the registration process
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('profilePicture', profilePicture);

    fetch('http://localhost/sanspots/api.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success || data.error);
    })
    .catch(error => console.error('Error:', error));
}

function updateUser() {
    const userId = document.getElementById('userId').value;
    const newUsername = document.getElementById('newUsername').value;

    fetch('http://localhost/sanspots/api.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userId=${userId}&newUsername=${newUsername}`,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success || data.error);
    })
    .catch(error => console.error('Error:', error));
}

function deleteUser() {
    const deleteUserId = document.getElementById('deleteUserId').value;

    fetch('http://localhost/sanspots/api.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `deleteUserId=${deleteUserId}`,
    })
    .then(response => response.json())
    .then(data => { 
        alert(data.success || data.error);
    })
    .catch(error => console.error('Error:', error));
}
