// Function to display user information
function displayUserInfo() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        const isEditProfilePage = window.location.pathname.includes('edit-profile.html');
        document.getElementById('userInfo').innerHTML = `
            <img src="${user.profilePicture || 'default-profile.png'}" alt="Profile Picture" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
            <span>${user.username}</span>
            ${!isEditProfilePage ? '<button onclick="editProfile()">Edit Profile</button>' : ''}
        `;
    } else {
        document.getElementById('userInfo').innerHTML = `
            <button id="connectWallet" onclick="connectWallet()">Connect Wallet</button>
        `;
    }
}

// Function to edit user profile
function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    localStorage.setItem('selectedUser', JSON.stringify(currentUser));
    window.location.href = 'edit-profile.html';
}

// Function to get the Phantom provider
function getProvider() {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            return provider;
        }
    }
    return null;
}

// Function to connect to Phantom Wallet
async function connectWallet() {
    try {
        const provider = await getProvider();
        if (!provider) {
            alert('Phantom Wallet not found. Please install it.');
            return;
        }

        const resp = await provider.connect();
        const publicKey = resp.publicKey.toString();
        let currentUser = getUser(publicKey);
        if (!currentUser) {
            currentUser = createUser(publicKey);
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        displayUserInfo();
    } catch (err) {
        console.error('Connection to Phantom Wallet failed', err);
    }
}

// Function to get user details from localStorage
function getUser(publicKey) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.publicKey === publicKey);
}

// Function to create a new user
function createUser(publicKey) {
    const newUser = { publicKey, username: 'New User', profilePicture: '' };
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
}

// Function to update user information in localStorage
function updateUser(publicKey, updatedUser) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.publicKey === publicKey);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Check if user is already logged in and display info
window.addEventListener('load', async () => {
    displayUserInfo();
    if (window.solana && window.solana.isPhantom) {
        try {
            const provider = await getProvider();
            if (provider) {
                console.log('Phantom Wallet detected');
                const connection = await provider.connect({ onlyIfTrusted: true });
                console.log('Connected to Phantom Wallet:', connection.publicKey.toString());
            }
        } catch (err) {
            console.error('Phantom Wallet detection failed:', err);
        }
    } else {
        console.log('Phantom Wallet not detected');
    }
});