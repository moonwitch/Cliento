// src/js/auth.js

// 1. LOGIN Logic
async function handleLogin() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const statusMsg = document.getElementById('status-msg')

    if (!email || !password) {
        statusMsg.innerText = "Please enter both email and password."
        return
    }

    statusMsg.innerText = "Connecting..."

    // Attempt Sign In
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    })

    if (error) {
        statusMsg.innerText = "Error: " + error.message
        statusMsg.style.color = "var(--color-danger)"
    } else {
        // Success: Redirect to dashboard
        window.location.href = "/dashboard.html"
    }
}

// 2. LOGOUT Logic
async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = "/index.html"
}

// 3. PROTECTION Logic (Put this at the top of dashboard.html)
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession()
    
    if (!session) {
        // No user found, kick them back to index
        window.location.href = "/index.html"
    } else {
        // User found, fetch profile/role
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single()

        // Update UI
        const userEmailEl = document.getElementById('user-email')
        const userRoleEl = document.getElementById('user-role')
        
        if (userEmailEl) userEmailEl.innerText = session.user.email
        if (userRoleEl && profile) userRoleEl.innerText = profile.role.toUpperCase()
        
        console.log("User Role:", profile?.role)
    }
}

// 4. TEST USER LOGIN
async function loginTestUser() {
    const statusMsg = document.getElementById('status-msg')
    if (statusMsg) statusMsg.innerText = "Attempting test login..."
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: 'kelly@test.com',
        password: 'password123'
    })

    if (error) {
        if (statusMsg) {
            statusMsg.innerText = "Error: " + error.message
            statusMsg.style.color = "red"
        }
        console.error("Test login failed:", error)
    } else {
        window.location.href = "/dashboard.html"
    }
}