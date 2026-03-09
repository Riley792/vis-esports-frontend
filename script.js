document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. FIREBASE GLOBAL AUTH STATE (NAVBAR & PROTECTION)
    // ==========================================
    const initGlobalAuth = async () => {
        // Dynamic imports to prevent duplicate initialization issues globally
        const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getAuth, onAuthStateChanged, signOut } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

        const firebaseConfig = {
            apiKey: "AIzaSyClyDIebYb0y3ur8-N4C2whGcUgeJnz00w",
            authDomain: "vis-esports.firebaseapp.com",
            projectId: "vis-esports",
            storageBucket: "vis-esports.firebasestorage.app",
            messagingSenderId: "247020318664",
            appId: "1:247020318664:web:5e0782ac4f04df01821afd"
        };

        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);

        onAuthStateChanged(auth, (user) => {
            const navActionsList = document.querySelectorAll('.nav-actions');

            // Page Identification
            const isTryouts = window.location.pathname.includes('tryouts');
            const isRoster = window.location.pathname.includes('roster');

            const authLoader = document.getElementById('authLoader');
            const authPromptContainer = isTryouts
                ? document.querySelector('.form-section .form-container')
                : document.querySelector('.roster-grid-section');

            if (user) {
                // --- USER IS LOGGED IN ---
                navActionsList.forEach(nav => {
                    const cartBtn = nav.querySelector('.cart-btn');
                    const cartHTML = cartBtn ? cartBtn.outerHTML : '';
                    nav.innerHTML = `
                        ${cartHTML}
                        <a href="profile.html" class="btn-neon nav-close-trigger">Profile</a>
                        <button id="logoutBtn" class="btn-primary" style="margin: 0;">Logout</button>
                    `;
                });

                document.querySelectorAll('#logoutBtn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        signOut(auth).then(() => window.location.reload()).catch(err => console.error(err));
                    });
                });

                if (typeof attachMobileNavListeners === 'function') attachMobileNavListeners();

                // Clear the loader
                if (authLoader) authLoader.style.display = 'none';

                // Reveal Protected Content
                if (isTryouts) {
                    const form = document.getElementById('tryoutForm');
                    if (form) form.style.display = 'block';
                }

                if (isRoster) {
                    const filter = document.getElementById('rosterFilter');
                    const grid = document.getElementById('rosterGrid');
                    if (filter) filter.style.display = 'flex';
                    if (grid) grid.style.display = 'grid';
                }

            } else {
                // --- USER IS NOT LOGGED IN ---
                if (authLoader) authLoader.style.display = 'none';

                if (isTryouts || isRoster) {
                    // Ensure content stays hidden
                    if (isTryouts) {
                        const form = document.getElementById('tryoutForm');
                        if (form) form.style.display = 'none';
                    }
                    if (isRoster) {
                        const filter = document.getElementById('rosterFilter');
                        const grid = document.getElementById('rosterGrid');
                        if (filter) filter.style.display = 'none';
                        if (grid) grid.style.display = 'none';
                    }

                    // Inject the Auth Prompt if it doesn't exist
                    if (authPromptContainer && !document.getElementById('authPrompt')) {
                        const pageName = isTryouts ? "access the Proving Grounds" : "view the classified Roster";

                        const loginPrompt = document.createElement('div');
                        loginPrompt.id = 'authPrompt';
                        loginPrompt.style.textAlign = 'center';
                        loginPrompt.style.padding = '3rem 0';
                        loginPrompt.innerHTML = `
                            <h2 style="margin-bottom: 1rem; color: var(--text-light);">AUTHENTICATION REQUIRED</h2>
                            <p style="color: var(--text-muted); margin-bottom: 2rem;">You must be signed into a VIS Operative account to ${pageName}.</p>
                            <a href="login.html" class="btn-primary" style="text-decoration: none; display: inline-block;">LOGIN TO PORTAL</a>
                        `;
                        authPromptContainer.appendChild(loginPrompt);
                    }
                }
            }
        });
    };
    initGlobalAuth();

    // ==========================================
    // 1. MOBILE NAVBAR TOGGLE
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    function attachMobileNavListeners() {
        document.querySelectorAll('.nav-close-trigger').forEach(link => {
            link.addEventListener('click', () => {
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
    attachMobileNavListeners();

    // ==========================================
    // 2. SMOOTH SCROLLING FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 3. START APPLICATION BUTTON (INDEX PAGE)
    // ==========================================
    const startAppBtn = document.getElementById('startAppBtn');
    const gameSelect = document.getElementById('gameSelect');

    if (startAppBtn && gameSelect) {
        startAppBtn.addEventListener('click', () => {
            const selectedGame = gameSelect.value;
            if (!selectedGame) {
                alert("Please select your primary game before starting the application.");
                return;
            }
            window.location.href = `signup.html?game=${selectedGame}`;
        });
    }

    // ==========================================
    // 4. FORM INPUT ANIMATIONS
    // ==========================================
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.parentElement.classList.remove('focused');
            }
        });
    });

    // ==========================================
    // 5. CARRY1ST PRO TOP-UP MODAL LOGIC (FULLY DYNAMIC)
    // ==========================================
    const gameCards = document.querySelectorAll('.game-card');
    const topupModal = document.getElementById('topupModal');
    const closeModal = document.getElementById('closeModal');
    const modalGameTitle = document.getElementById('modalGameTitle');
    const currencyOptionsContainer = document.querySelector('.currency-options');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const checkoutPrice = document.getElementById('checkoutPrice');
    const payNowBtn = document.getElementById('payNowBtn');

    // Verification Mock Logic
    const verifyBtn = document.getElementById('verifyBtn');
    const playerIdInput = document.getElementById('playerIdInput');
    const verifyStatus = document.getElementById('verifyStatus');

    // STATE TRACKER: Prevent checkout without an ID
    let isPlayerVerified = false;
    let currentGameId = ''; // TRACKS WHICH GAME IS SELECTED

    // THE DATABASE: Dynamic pricing and currency mapping
    const shopPackages = {
        'codm': {
            icon: 'CP',
            packages: [
                { amount: '30', price: '₦650' },
                { amount: '80', price: '₦1,650' },
                { amount: '420', price: '₦8,200' },
                { amount: '880', price: '₦15,800' },
                { amount: '2,400', price: '₦39,900' },
                { amount: '5,000', price: '₦82,000' },
                { amount: '10,800', price: '₦160,000' },
                { amount: '21,600', price: '₦310,000' },
                { amount: '32,400', price: '₦460,000' },
                { amount: '43,200', price: '₦600,000' },
                { amount: '54,000', price: '₦750,000' },
                { amount: 'Battle Pass', price: '₦7,300' },
                { amount: 'Premium BP', price: '₦17,000' }
            ]
        },
        'bloodstrike': {
            icon: '💰', // Swapped to the universally compatible money bag
            packages: [
                { amount: '100 + 10', price: '₦1,500' },
                { amount: '500 + 50', price: '₦6,000' },
                { amount: '1000 + 120', price: '₦11,500' },
                { amount: '2500 + 300', price: '₦26,000' }
            ]
        },
        'freefire': {
            icon: '💎',
            packages: [
                { amount: '100 + 10', price: '₦1,000' },
                { amount: '310 + 31', price: '₦3,000' },
                { amount: '520 + 52', price: '₦5,000' },
                { amount: '1060 + 106', price: '₦10,000' }
            ]
        },
        'eafc': {
            icon: '⚽',
            packages: [
                { amount: '100', price: '₦1,500' },
                { amount: '500', price: '₦6,500' },
                { amount: '1050', price: '₦12,000' },
                { amount: '2200', price: '₦24,000' }
            ]
        },
        'pes': {
            icon: '🟡',
            packages: [
                { amount: '130', price: '₦1,200' },
                { amount: '500', price: '₦4,500' },
                { amount: '1040', price: '₦9,000' },
                { amount: '2130', price: '₦18,000' }
            ]
        }
    };

    if (gameCards.length > 0 && topupModal) {

        // 1. Open Modal & Inject Dynamic Data
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameName = card.querySelector('h3').textContent;
                const gameId = card.getAttribute('data-game');
                const gameData = shopPackages[gameId];

                modalGameTitle.textContent = gameName;
                currentGameId = gameId; // Save the ID for the checkout button

                // Dynamic Header Backgrounds
                const headerBanner = document.getElementById('modalHeaderBanner');
                if (gameName.includes('Duty')) headerBanner.style.background = 'linear-gradient(135deg, #2a2a2a, #000)';
                if (gameName.includes('Free Fire')) headerBanner.style.background = 'linear-gradient(135deg, #3a2a00, #000)';
                if (gameName.includes('EAFC')) headerBanner.style.background = 'linear-gradient(135deg, #001a33, #000)';
                if (gameName.includes('PES')) headerBanner.style.background = 'linear-gradient(135deg, #1a0033, #000)';
                if (gameName.includes('Blood')) headerBanner.style.background = 'linear-gradient(135deg, #330000, #000)';

                // INJECT DYNAMIC CURRENCY PILLS
                currencyOptionsContainer.innerHTML = '';

                gameData.packages.forEach((pkg, index) => {
                    const isSelected = index === 2 ? 'selected' : '';
                    if (isSelected) checkoutPrice.textContent = pkg.price;

                    const pillHTML = `
                        <div class="currency-pill ${isSelected}">
                            <span class="amount">${pkg.amount} <span class="icon">${gameData.icon}</span></span>
                            <span class="price">${pkg.price}</span>
                        </div>
                    `;
                    currencyOptionsContainer.insertAdjacentHTML('beforeend', pillHTML);
                });

                // RESET FORM SECURITY STATE 
                playerIdInput.value = '';
                verifyStatus.textContent = '';
                verifyStatus.className = 'verify-status';
                isPlayerVerified = false;

                topupModal.style.display = 'flex';
            });
        });

        // 2. Close Modal
        const closeTopupModal = () => {
            topupModal.style.display = 'none';
            isPlayerVerified = false;
        };

        if (closeModal) closeModal.addEventListener('click', closeTopupModal);
        window.addEventListener('click', (e) => {
            if (e.target === topupModal) closeTopupModal();
        });

        // 3. Select Package Logic (Event Delegation)
        currencyOptionsContainer.addEventListener('click', (e) => {
            const clickedPill = e.target.closest('.currency-pill');
            if (!clickedPill) return;

            const allPills = currencyOptionsContainer.querySelectorAll('.currency-pill');
            allPills.forEach(p => p.classList.remove('selected'));

            clickedPill.classList.add('selected');

            const priceText = clickedPill.querySelector('.price').textContent;
            checkoutPrice.textContent = priceText;
        });

        // 4. Select Payment Method Logic
        if (paymentMethods.length > 0) {
            paymentMethods.forEach(method => {
                method.addEventListener('click', () => {
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    method.classList.add('selected');
                });
            });
        }

        // 5. Verify ID Logic
        if (verifyBtn && playerIdInput && verifyStatus) {
            verifyBtn.addEventListener('click', () => {
                const id = playerIdInput.value.trim();

                // Strict rule: Must be exactly VIS-YYYY-MMDD-XXX (e.g., VIS-2026-0228-001)
                const strictIdFormat = /^VIS-\d{4}-\d{4}-\d{3}$/;

                if (!strictIdFormat.test(id)) {
                    verifyStatus.textContent = "Invalid format. Must be VIS-YYYY-MMDD-XXX";
                    verifyStatus.style.color = '#ff4444';
                    isPlayerVerified = false;
                    return;
                }

                verifyStatus.innerHTML = "Checking ID...";
                verifyStatus.className = 'verify-status status-loading';
                verifyBtn.disabled = true;

                setTimeout(() => {
                    verifyStatus.textContent = `Player Verified: ${id}`;
                    verifyStatus.className = 'verify-status status-success';
                    verifyStatus.style.color = '#00E676';
                    verifyBtn.disabled = false;
                    isPlayerVerified = true;
                }, 1200);
            });

            playerIdInput.addEventListener('input', () => {
                isPlayerVerified = false;
                verifyStatus.textContent = '';
            });
        }

    }

    // 6. Checkout Button Security Check & Backend API Call
    if (payNowBtn) {
        payNowBtn.addEventListener('click', async () => {
            if (!isPlayerVerified) {
                alert("ACCESS DENIED: You must verify a valid Player ID before proceeding to payment.");
                playerIdInput.style.borderColor = '#ff4444';
                setTimeout(() => playerIdInput.style.borderColor = 'rgba(255, 255, 255, 0.15)', 2000);
                return;
            }

            const finalPriceText = checkoutPrice.textContent;
            // Clean the string (e.g., "₦5,500" -> 5500) so Java can read it as an integer
            const numericAmount = parseInt(finalPriceText.replace(/[^0-9]/g, ''), 10);
            const verifiedId = playerIdInput.value.trim();

            // Get the user's email from Firebase Auth (defaults to a recruit email if testing while logged out)
            const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
            const auth = getAuth();
            const playerEmail = auth.currentUser ? auth.currentUser.email : "recruit@visesports.com";

            const originalBtnText = payNowBtn.textContent;
            payNowBtn.textContent = "SECURING CONNECTION...";
            payNowBtn.disabled = true;

            try {
                // Call your new Java Spring Boot Backend!
                const response = await fetch('https://vis-payments-backend.onrender.com/api/payments/initialize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: playerEmail,
                        amount: numericAmount,
                        playerId: verifiedId,
                        game: currentGameId
                    })
                });

                if (!response.ok) throw new Error("Server rejected the payment request.");

                const payload = await response.json();

                // Paystack nests the secure URL inside the 'data' object
                if (payload.status && payload.data && payload.data.authorization_url) {
                    // Redirect the user to the secure Paystack checkout page!
                    window.location.href = payload.data.authorization_url;
                } else {
                    throw new Error("Invalid response from payment gateway.");
                }

            } catch (error) {
                console.error("Payment Initialization Error:", error);
                alert("Transmission failed. Make sure your Java backend is currently running!");
                payNowBtn.textContent = originalBtnText;
                payNowBtn.disabled = false;
            }
        });
    }
});