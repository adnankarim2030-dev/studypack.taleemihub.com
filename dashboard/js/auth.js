/* ============================================================
   Real Firebase Authentication for the admin dashboard.
   Replaces the old fake `localStorage.setItem('study_admin_auth')`
   login that anyone could bypass from the browser console.
   ============================================================ */

window.currentAdmin = null; // { uid, email, role }

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appShell').classList.remove('ready');
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appShell').classList.add('ready');
}

function setLoginError(msg) {
    const el = document.getElementById('loginError');
    if (!msg) { el.style.display = 'none'; el.textContent = ''; return; }
    el.textContent = msg;
    el.style.display = 'block';
}

function setLoginInfo(msg) {
    const el = document.getElementById('loginInfo');
    if (!msg) { el.style.display = 'none'; el.textContent = ''; return; }
    el.textContent = msg;
    el.style.display = 'block';
}

document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginInfo(null);
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged below handles the rest (admin check + showing the app)
    } catch (err) {
        console.error(err);
        let msg = 'Login failed. Please check your email and password.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            msg = 'Invalid email or password.';
        } else if (err.code === 'auth/too-many-requests') {
            msg = 'Too many attempts. Please wait a moment and try again.';
        } else if (err.code === 'auth/invalid-email') {
            msg = 'Please enter a valid email address.';
        }
        setLoginError(msg);
        btn.disabled = false;
        btn.textContent = original;
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    if (!confirm('Log out?')) return;
    await auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.currentAdmin = null;
        showLoginScreen();
        return;
    }

    setLoginInfo('Verifying admin access...');
    try {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        if (!adminDoc.exists) {
            // Signed-in user is not an authorized admin. Sign them right back out.
            await auth.signOut();
            setLoginInfo(null);
            setLoginError('This account is not an authorized admin. Ask the owner to add your account in Settings → Admin Users.');
            return;
        }

        const data = adminDoc.data();
        window.currentAdmin = { uid: user.uid, email: user.email, role: data.role || 'staff', name: data.name || user.email };

        // Reflect current admin in the header
        const nameEl = document.getElementById('currentAdminName');
        const roleEl = document.getElementById('currentAdminRole');
        if (nameEl) nameEl.textContent = window.currentAdmin.name;
        if (roleEl) roleEl.textContent = window.currentAdmin.role;

        setLoginError(null);
        setLoginInfo(null);
        showApp();

        document.dispatchEvent(new CustomEvent('adminReady', { detail: window.currentAdmin }));
    } catch (err) {
        console.error('Admin verification failed:', err);
        setLoginInfo(null);
        setLoginError('Could not verify admin access. Please check your internet connection and try again.');
    }
});
