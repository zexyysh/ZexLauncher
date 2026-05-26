const loginOptionsCancelContainer = document.getElementById('loginOptionCancelContainer')
const loginOptionMicrosoft = document.getElementById('loginOptionMicrosoft')
const loginOptionMojang = document.getElementById('loginOptionMojang')
const loginOptionOffline = document.getElementById('loginOptionOffline')
const loginOptionsCancelButton = document.getElementById('loginOptionCancelButton')

let loginOptionsCancellable = false

let loginOptionsViewOnLoginSuccess
let loginOptionsViewOnLoginCancel
let loginOptionsViewOnCancel
let loginOptionsViewCancelHandler

function loginOptionsCancelEnabled(val){
    if(val){
        $(loginOptionsCancelContainer).show()
    } else {
        $(loginOptionsCancelContainer).hide()
    }
}

loginOptionMicrosoft.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
        ipcRenderer.send(
            MSFT_OPCODE.OPEN_LOGIN,
            loginOptionsViewOnLoginSuccess,
            loginOptionsViewOnLoginCancel
        )
    })
}

loginOptionMojang.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
        loginViewOnSuccess = loginOptionsViewOnLoginSuccess
        loginViewOnCancel = loginOptionsViewOnLoginCancel
        loginCancelEnabled(true)
    })
}

loginOptionOffline.onclick = (e) => {
    // Show a prompt overlay for the offline username
    setOverlayContent(
        'Offline Giriş',
        'Oyun içi kullanıcı adınızı girin (3-16 karakter, harf/rakam/alt çizgi):',
        'Giriş Yap',
        'İptal'
    )
    
    // Create input field for username
    const overlayDesc = document.getElementById('overlayDesc')
    const originalDesc = overlayDesc.innerHTML
    overlayDesc.innerHTML = originalDesc + '<br><br><input id="offlineUsername" type="text" placeholder="Kullanıcı Adı" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(108,92,231,0.6); border-radius: 4px; color: white; padding: 8px 15px; font-size: 14px; width: 200px; outline: none; text-align: center; font-family: inherit; transition: 0.25s ease;" maxlength="16" />'
    
    // Focus the input after overlay shows
    setTimeout(() => {
        const input = document.getElementById('offlineUsername')
        if(input) {
            input.focus()
            // Style on focus
            input.addEventListener('focus', () => {
                input.style.borderColor = 'rgba(108,92,231,0.9)'
                input.style.boxShadow = '0 0 10px rgba(108,92,231,0.3)'
            })
            input.addEventListener('blur', () => {
                input.style.borderColor = 'rgba(108,92,231,0.6)'
                input.style.boxShadow = 'none'
            })
            // Allow Enter key to submit
            input.addEventListener('keydown', (ev) => {
                if(ev.key === 'Enter') {
                    document.getElementById('overlayAcknowledge').click()
                }
            })
        }
    }, 600)
    
    setOverlayHandler(async () => {
        const usernameInput = document.getElementById('offlineUsername')
        if(usernameInput) {
            const username = usernameInput.value.trim()
            
            try {
                const authAccount = await AuthManager.addOfflineAccount(username)
                updateSelectedAccount(authAccount)
                toggleOverlay(false)
                switchView(getCurrentView(), loginOptionsViewOnLoginSuccess, 500, 500, async () => {
                    // Successful login actions
                    await prepareSettings(true)
                })
            } catch(err) {
                // Show error
                setOverlayContent(
                    err.title || 'Hata',
                    err.desc || 'Bilinmeyen bir hata oluştu.',
                    'Tamam'
                )
                setOverlayHandler(() => {
                    toggleOverlay(false)
                    // Re-trigger offline login
                    loginOptionOffline.click()
                })
                setDismissHandler(null)
            }
        }
    })
    setDismissHandler(() => {
        toggleOverlay(false)
    })
    toggleOverlay(true, true)
}

loginOptionsCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginOptionsViewOnCancel, 500, 500, () => {
        // Clear login values (Mojang login)
        // No cleanup needed for Microsoft.
        loginUsername.value = ''
        loginPassword.value = ''
        if(loginOptionsViewCancelHandler != null){
            loginOptionsViewCancelHandler()
            loginOptionsViewCancelHandler = null
        }
    })
}