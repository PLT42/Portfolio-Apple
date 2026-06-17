// === macOS Redesign - script.js ===

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Clock Update (Optimized) ---
    const clockEl = document.getElementById('clock');
    const lockTimeEl = document.getElementById('lock-time');
    const iosTimeEl = document.getElementById('ios-time');
    const lockDateEl = document.getElementById('lock-date');

    function updateClock() {
        const now = new Date();
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const day = days[now.getDay()];
        const date = now.getDate();
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const month = months[now.getMonth()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        // Update Menubar
        if(clockEl) {
            clockEl.textContent = `${day} ${date} ${month} ${hours}:${minutes}`;
        }

        // Update Lock Screen and iOS Status Bar
        const timeString = `${hours}:${minutes}`;
        if (lockTimeEl) lockTimeEl.textContent = timeString;
        if (iosTimeEl) iosTimeEl.textContent = timeString;

        // Update Lock Screen Date
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        let dateString = now.toLocaleDateString('fr-FR', options);
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        if (lockDateEl) lockDateEl.textContent = dateString;

        // Schedule next update perfectly on the minute
        const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
        setTimeout(updateClock, msUntilNextMinute);
    }
    
    // Initial call
    updateClock();

    // --- Window Manager ---
    let zIndexCounter = 100;
    const desktop = document.getElementById('desktop');
    const menuAppName = document.getElementById('menu-app-name');
    const openWindows = {}; // Keep track of opened windows by app id

    // Application data mapping
    const appTitles = {
        'finder': 'Finder',
        'safari': 'Safari',
        'mail': 'Mail',
        'settings': 'Réglages Système',
        'opus': 'Opus Formation',
        'garage': 'Garage 404',
        'phenix': 'Phénix Info',
        'about': 'À propos de moi',
        'avis': 'Avis et Recommandations'
    };

    window.openApp = function(appId) {
        // If window already exists, bring to front or unminimize
        if (openWindows[appId]) {
            const win = openWindows[appId];
            win.classList.remove('minimized');
            bringToFront(win, appId);
            return;
        }

        // Create new window
        const win = document.createElement('div');
        win.className = 'mac-window';
        win.id = `window-${appId}`;
        
        // Initial random position slightly offset from center
        const offset = Object.keys(openWindows).length * 20;
        if (window.innerWidth > 768) {
            win.style.top = `${50 + offset}px`;
            win.style.left = `${50 + offset}px`;
        }

        const title = appTitles[appId] || 'Application';

        // Window HTML Structure
        win.innerHTML = `
            <div class="window-titlebar">
                <div class="window-controls">
                    <button class="control-btn btn-close" onclick="closeApp('${appId}', event)"><i class="fas fa-times"></i></button>
                    <button class="control-btn btn-minimize" onclick="minimizeApp('${appId}', event)"><i class="fas fa-minus"></i></button>
                    <button class="control-btn btn-maximize" onclick="maximizeApp('${appId}', event)"><i class="fas fa-expand-arrows-alt"></i></button>
                </div>
                <div class="window-title">${title}</div>
            </div>
            <div class="window-content" id="content-${appId}">
                <!-- Content will be injected from templates -->
            </div>
        `;

        desktop.appendChild(win);
        openWindows[appId] = win;

        // Inject content from templates
        const template = document.getElementById(`app-content-${appId}`);
        if (template) {
            document.getElementById(`content-${appId}`).innerHTML = template.innerHTML;
        }

        // Setup Dragging
        setupDraggable(win, win.querySelector('.window-titlebar'));

        // Bring to front on click
        win.addEventListener('mousedown', () => bringToFront(win, appId));

        // Show window with animation
        requestAnimationFrame(() => {
            win.classList.add('active');
            bringToFront(win, appId);
        });

        // Update Dock Dot
        const dockItem = document.querySelector(`.dock-item[data-app="${appId}"] .dock-dot`);
        if (dockItem) dockItem.classList.add('active');
    };

    window.closeApp = function(appId, event) {
        if(event) event.stopPropagation();
        const win = openWindows[appId];
        if (win) {
            win.classList.remove('active');
            setTimeout(() => {
                win.remove();
                delete openWindows[appId];
                // Remove dot if not finder
                if(appId !== 'finder') {
                    const dockItem = document.querySelector(`.dock-item[data-app="${appId}"] .dock-dot`);
                    if (dockItem) dockItem.classList.remove('active');
                }
                
                // Fallback menu name
                const remaining = Object.keys(openWindows);
                if(remaining.length > 0) {
                    menuAppName.textContent = appTitles[remaining[remaining.length - 1]];
                } else {
                    menuAppName.textContent = 'Finder';
                }
            }, 200);
        }
    };

    window.minimizeApp = function(appId, event) {
        if(event) event.stopPropagation();
        const win = openWindows[appId];
        if (win) {
            win.classList.add('minimized');
        }
    };

    let maximizedStates = {};
    window.maximizeApp = function(appId, event) {
        if(event) event.stopPropagation();
        const win = openWindows[appId];
        if (win) {
            if (!maximizedStates[appId]) {
                // Save previous state
                maximizedStates[appId] = {
                    top: win.style.top,
                    left: win.style.left,
                    width: win.style.width,
                    height: win.style.height
                };
                win.style.top = '0';
                win.style.left = '0';
                win.style.width = '100%';
                win.style.height = '100%';
                win.style.borderRadius = '0';
            } else {
                // Restore
                const state = maximizedStates[appId];
                win.style.top = state.top;
                win.style.left = state.left;
                win.style.width = state.width || '800px';
                win.style.height = state.height || '500px';
                win.style.borderRadius = '10px';
                delete maximizedStates[appId];
            }
        }
    };

    function bringToFront(win, appId) {
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
        menuAppName.textContent = appTitles[appId] || 'Application';
    }

    // --- Drag Logic ---
    function setupDraggable(element, handle) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        handle.addEventListener('mousedown', dragStart);

        function dragStart(e) {
            // Don't drag if clicking buttons
            if(e.target.closest('.window-controls')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // Get initial computed style positions
            const rect = element.getBoundingClientRect();
            // We use the offset relative to the desktop container
            initialX = element.offsetLeft;
            initialY = element.offsetTop;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            element.style.left = `${initialX + dx}px`;
            element.style.top = `${initialY + dy}px`;
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
        }
    }

    // --- Settings Logic ---
    window.setTheme = function(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('mac-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('mac-theme', 'light');
        }
    };

    window.setAccent = function(color) {
        document.documentElement.style.setProperty('--apple-blue', color);
        localStorage.setItem('mac-accent', color);
    };

    // Init Theme and Accent
    const savedTheme = localStorage.getItem('macTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
    const savedAccent = localStorage.getItem('macAccent');
    if (savedAccent) {
        setAccent(savedAccent);
    }

    // --- LOCK SCREEN LOGIC ---
    let selectedUserType = null;

    window.selectUser = function(userType) {
        selectedUserType = userType;
        const pwdContainer = document.getElementById('password-container');
        const lockUsers = document.querySelector('.lock-users');
        const cancelBtn = document.getElementById('cancel-login');
        const pwdInput = document.getElementById('lock-password');
        
        lockUsers.style.display = 'none';
        
        if (userType === 'plt') {
            pwdContainer.style.display = 'flex';
            cancelBtn.style.display = 'block';
            pwdInput.focus();
        } else if (userType === 'recruiter') {
            // Recruteur access is free
            unlockScreen();
        }
    };

    window.cancelLogin = function() {
        document.querySelector('.lock-users').style.display = 'flex';
        document.getElementById('password-container').style.display = 'none';
        document.getElementById('cancel-login').style.display = 'none';
        document.getElementById('lock-error').style.display = 'none';
        document.getElementById('lock-password').value = '';
        selectedUserType = null;
    };

    window.handleLogin = function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    };

    window.checkPassword = function() {
        const pwdInput = document.getElementById('lock-password');
        const errorMsg = document.getElementById('lock-error');
        if (pwdInput.value === '0000') { // Default password
            unlockScreen();
        } else {
            errorMsg.style.display = 'block';
            pwdInput.value = '';
            // Shake effect
            const container = document.getElementById('password-container');
            container.style.transform = 'translateX(-10px)';
            setTimeout(() => container.style.transform = 'translateX(10px)', 50);
            setTimeout(() => container.style.transform = 'translateX(-10px)', 100);
            setTimeout(() => container.style.transform = 'translateX(0)', 150);
        }
    };

    function unlockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        const desktop = document.querySelector('.mac-desktop');
        
        lockScreen.style.opacity = '0';
        setTimeout(() => {
            lockScreen.style.display = 'none';
            desktop.style.display = 'flex';
            
            // Initialize windows after login
            setTimeout(() => {
                openApp('about');
                const aboutWin = document.getElementById('window-about');
                if (aboutWin && window.innerWidth > 768) {
                    aboutWin.style.left = '10%';
                    aboutWin.style.top = '10%';
                }
            }, 400);

            // Desktop only: open Finder automatically
            if (window.innerWidth > 768) {
                setTimeout(() => {
                    openApp('finder');
                    const finderWin = document.getElementById('window-finder');
                    if (finderWin) {
                        finderWin.style.left = '50%';
                        finderWin.style.top = '15%';
                    }
                }, 800);
            }

            // Show onboarding guide on first visit
            if (!localStorage.getItem('mac-onboarding-done')) {
                setTimeout(showMacOnboarding, 1500);
            }
            
        }, 300);
    }

    // =============================================
    // macOS ONBOARDING GUIDE
    // =============================================
    const macSteps = [
        { icon: 'fa-hand-pointer', color: '#007aff', title: 'Bienvenue sur macOS !', text: 'Ce portfolio reproduit un vrai bureau macOS. Tu peux ouvrir, déplacer et fermer des fenêtres comme sur un Mac.' },
        { icon: 'fa-grip-horizontal', color: '#ff9500', title: 'Le Dock', text: 'Le Dock en bas regroupe toutes les applications. Clique sur une icône pour ouvrir la fenêtre correspondante. Survole-les pour voir leur nom.' },
        { icon: 'fa-window-restore', color: '#34c759', title: 'Gérer les fenêtres', text: 'Glisse une fenêtre par sa barre de titre pour la déplacer. Les boutons 🔴 🟡 🟢 permettent de fermer, réduire ou agrandir la fenêtre.' },
        { icon: 'fa-folder-open', color: '#5856d6', title: 'Finder — Mes projets', text: 'Le Finder (icône en bas à gauche) liste tous mes projets. Clique sur un dossier pour l\'ouvrir dans une nouvelle fenêtre.' },
        { icon: 'fa-moon', color: '#636366', title: 'Réglages', text: 'Ouvre l\'app Réglages pour passer en mode sombre ou changer la couleur d\'accentuation. Ton choix est sauvegardé automatiquement.' },
        { icon: 'fa-check-circle', color: '#34c759', title: 'C\'est parti !', text: 'Tu sais maintenant naviguer dans ce portfolio macOS. Bonne visite !' }
    ];
    let macObStep = 0;

    function showMacOnboarding() {
        if (document.getElementById('mac-ob')) return;
        const overlay = document.createElement('div');
        overlay.id = 'mac-ob';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;';
        overlay.innerHTML = `
            <div style="background:rgba(255,255,255,0.97);border-radius:22px;width:min(460px,92vw);padding:44px 38px 34px;text-align:center;box-shadow:0 32px 80px rgba(0,0,0,0.35);">
                <div id="ob-icon" style="width:68px;height:68px;border-radius:20px;margin:0 auto 22px;display:flex;align-items:center;justify-content:center;font-size:1.9rem;color:#fff;"></div>
                <h2 id="ob-title" style="font-size:1.3rem;font-weight:700;color:#1c1c1e;margin-bottom:12px;"></h2>
                <p id="ob-text" style="font-size:0.93rem;line-height:1.7;color:#636366;margin-bottom:32px;"></p>
                <div id="ob-dots" style="display:flex;gap:7px;justify-content:center;margin-bottom:28px;"></div>
                <div style="display:flex;gap:12px;justify-content:center;">
                    <button id="ob-skip" onclick="window.skipMacOb()" style="padding:11px 24px;border:1.5px solid #e0e0e0;border-radius:10px;background:transparent;color:#8e8e93;font-size:0.9rem;cursor:pointer;font-family:inherit;">Passer</button>
                    <button id="ob-next" onclick="window.nextMacOb()" style="padding:11px 28px;border:none;border-radius:10px;background:#007aff;color:#fff;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Suivant &rarr;</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        macObStep = 0;
        renderMacOb();
    }

    function renderMacOb() {
        const s = macSteps[macObStep];
        document.getElementById('ob-icon').style.background = s.color;
        document.getElementById('ob-icon').innerHTML = `<i class="fas ${s.icon}"></i>`;
        document.getElementById('ob-title').textContent = s.title;
        document.getElementById('ob-text').textContent = s.text;
        document.getElementById('ob-dots').innerHTML = macSteps.map((_,i) =>
            `<div style="width:${i===macObStep?20:7}px;height:7px;border-radius:4px;background:${i===macObStep?'#007aff':'#e0e0e0'};transition:all 0.3s;"></div>`
        ).join('');
        const btn = document.getElementById('ob-next');
        const skip = document.getElementById('ob-skip');
        if (macObStep === macSteps.length - 1) {
            btn.textContent = 'Commencer !';
            btn.style.background = '#34c759';
            skip.style.display = 'none';
        } else {
            btn.innerHTML = 'Suivant &rarr;';
            btn.style.background = '#007aff';
            skip.style.display = '';
        }
    }

    window.nextMacOb = function() {
        if (macObStep < macSteps.length - 1) { macObStep++; renderMacOb(); }
        else window.skipMacOb();
    };
    window.skipMacOb = function() {
        const el = document.getElementById('mac-ob');
        if (el) { el.style.opacity='0'; el.style.transition='opacity 0.3s'; setTimeout(()=>el.remove(),300); }
        localStorage.setItem('mac-onboarding-done','1');
    };

    window.logout = function() {
        document.getElementById('lock-screen').style.display = 'flex';
        document.getElementById('lock-screen').style.opacity = '1';
        document.querySelector('.mac-desktop').style.display = 'none';
        cancelLogin();
        
        // Close all windows
        Object.keys(openWindows).forEach(appId => {
            const win = document.getElementById(`window-${appId}`);
            if (win) win.remove();
            
            const dockDot = document.querySelector(`.dock-item[data-app="${appId}"] .dock-dot`);
            if (dockDot) dockDot.classList.remove('active');
        });
        openWindows = {};
        zIndexCounter = 10;
    };

    // (Clock logic moved to top for optimization)

});
