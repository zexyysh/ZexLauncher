/**
 * Script for overlay.ejs
 */

/* Overlay Wrapper Functions */

/**
 * Check to see if the overlay is visible.
 * 
 * @returns {boolean} Whether or not the overlay is visible.
 */
function isOverlayVisible(){
    return document.getElementById('main').hasAttribute('overlay')
}

let overlayHandlerContent

/**
 * Overlay keydown handler for a non-dismissable overlay.
 * 
 * @param {KeyboardEvent} e The keydown event.
 */
function overlayKeyHandler (e){
    if(e.key === 'Enter' || e.key === 'Escape'){
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEnter')[0].click()
    }
}
/**
 * Overlay keydown handler for a dismissable overlay.
 * 
 * @param {KeyboardEvent} e The keydown event.
 */
function overlayKeyDismissableHandler (e){
    if(e.key === 'Enter'){
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEnter')[0].click()
    } else if(e.key === 'Escape'){
        document.getElementById(overlayHandlerContent).getElementsByClassName('overlayKeybindEsc')[0].click()
    }
}

/**
 * Bind overlay keydown listeners for escape and exit.
 * 
 * @param {boolean} state Whether or not to add new event listeners.
 * @param {string} content The overlay content which will be shown.
 * @param {boolean} dismissable Whether or not the overlay is dismissable 
 */
function bindOverlayKeys(state, content, dismissable){
    overlayHandlerContent = content
    document.removeEventListener('keydown', overlayKeyHandler)
    document.removeEventListener('keydown', overlayKeyDismissableHandler)
    if(state){
        if(dismissable){
            document.addEventListener('keydown', overlayKeyDismissableHandler)
        } else {
            document.addEventListener('keydown', overlayKeyHandler)
        }
    }
}

/**
 * Toggle the visibility of the overlay.
 * 
 * @param {boolean} toggleState True to display, false to hide.
 * @param {boolean} dismissable Optional. True to show the dismiss option, otherwise false.
 * @param {string} content Optional. The content div to be shown.
 */
function toggleOverlay(toggleState, dismissable = false, content = 'overlayContent'){
    if(toggleState == null){
        toggleState = !document.getElementById('main').hasAttribute('overlay')
    }
    if(typeof dismissable === 'string'){
        content = dismissable
        dismissable = false
    }
    bindOverlayKeys(toggleState, content, dismissable)
    if(toggleState){
        document.getElementById('main').setAttribute('overlay', true)
        // Make things untabbable.
        $('#main *').attr('tabindex', '-1')
        $('#' + content).parent().children().hide()
        $('#' + content).show()
        if(dismissable){
            $('#overlayDismiss').show()
        } else {
            $('#overlayDismiss').hide()
        }
        $('#overlayContainer').fadeIn({
            duration: 250,
            start: () => {
                if(getCurrentView() === VIEWS.settings){
                    document.getElementById('settingsContainer').style.backgroundColor = 'transparent'
                }
            }
        })
    } else {
        document.getElementById('main').removeAttribute('overlay')
        // Make things tabbable.
        $('#main *').removeAttr('tabindex')
        $('#overlayContainer').fadeOut({
            duration: 250,
            start: () => {
                if(getCurrentView() === VIEWS.settings){
                    document.getElementById('settingsContainer').style.backgroundColor = 'rgba(0, 0, 0, 0.50)'
                }
            },
            complete: () => {
                $('#' + content).parent().children().hide()
                $('#' + content).show()
                if(dismissable){
                    $('#overlayDismiss').show()
                } else {
                    $('#overlayDismiss').hide()
                }
            }
        })
    }
}

async function toggleServerSelection(toggleState){
    await prepareServerSelectionList()
    toggleOverlay(toggleState, true, 'serverSelectContent')
}

/**
 * Set the content of the overlay.
 * 
 * @param {string} title Overlay title text.
 * @param {string} description Overlay description text.
 * @param {string} acknowledge Acknowledge button text.
 * @param {string} dismiss Dismiss button text.
 */
function setOverlayContent(title, description, acknowledge, dismiss = Lang.queryJS('overlay.dismiss')){
    document.getElementById('overlayTitle').innerHTML = title
    document.getElementById('overlayDesc').innerHTML = description
    document.getElementById('overlayAcknowledge').innerHTML = acknowledge
    document.getElementById('overlayDismiss').innerHTML = dismiss
}

/**
 * Set the onclick handler of the overlay acknowledge button.
 * If the handler is null, a default handler will be added.
 * 
 * @param {function} handler 
 */
function setOverlayHandler(handler){
    if(handler == null){
        document.getElementById('overlayAcknowledge').onclick = () => {
            toggleOverlay(false)
        }
    } else {
        document.getElementById('overlayAcknowledge').onclick = handler
    }
}

/**
 * Set the onclick handler of the overlay dismiss button.
 * If the handler is null, a default handler will be added.
 * 
 * @param {function} handler 
 */
function setDismissHandler(handler){
    if(handler == null){
        document.getElementById('overlayDismiss').onclick = () => {
            toggleOverlay(false)
        }
    } else {
        document.getElementById('overlayDismiss').onclick = handler
    }
}

/* Server Select View */

document.getElementById('serverSelectConfirm').addEventListener('click', async () => {
    const listings = document.getElementsByClassName('serverListing')
    for(let i=0; i<listings.length; i++){
        if(listings[i].hasAttribute('selected')){
            const serv = (await DistroAPI.getDistribution()).getServerById(listings[i].getAttribute('servid'))
            updateSelectedServer(serv)
            refreshServerStatus(true)
            toggleOverlay(false)
            return
        }
    }
    // None are selected? Not possible right? Meh, handle it.
    if(listings.length > 0){
        const serv = (await DistroAPI.getDistribution()).getServerById(listings[i].getAttribute('servid'))
        updateSelectedServer(serv)
        toggleOverlay(false)
    }
})

document.getElementById('accountSelectConfirm').addEventListener('click', async () => {
    const listings = document.getElementsByClassName('accountListing')
    for(let i=0; i<listings.length; i++){
        if(listings[i].hasAttribute('selected')){
            const authAcc = ConfigManager.setSelectedAccount(listings[i].getAttribute('uuid'))
            ConfigManager.save()
            updateSelectedAccount(authAcc)
            if(getCurrentView() === VIEWS.settings) {
                await prepareSettings()
            }
            toggleOverlay(false)
            validateSelectedAccount()
            return
        }
    }
    // None are selected? Not possible right? Meh, handle it.
    if(listings.length > 0){
        const authAcc = ConfigManager.setSelectedAccount(listings[0].getAttribute('uuid'))
        ConfigManager.save()
        updateSelectedAccount(authAcc)
        if(getCurrentView() === VIEWS.settings) {
            await prepareSettings()
        }
        toggleOverlay(false)
        validateSelectedAccount()
    }
})

// Bind server select cancel button.
document.getElementById('serverSelectCancel').addEventListener('click', () => {
    toggleOverlay(false)
})

document.getElementById('accountSelectCancel').addEventListener('click', () => {
    $('#accountSelectContent').fadeOut(250, () => {
        $('#overlayContent').fadeIn(250)
    })
})

function setServerListingHandlers(){
    const listings = Array.from(document.getElementsByClassName('serverListing'))
    listings.map((val) => {
        val.onclick = e => {
            if(val.hasAttribute('selected')){
                return
            }
            const cListings = document.getElementsByClassName('serverListing')
            for(let i=0; i<cListings.length; i++){
                if(cListings[i].hasAttribute('selected')){
                    cListings[i].removeAttribute('selected')
                }
            }
            val.setAttribute('selected', '')
            document.activeElement.blur()
        }
    })
}

function setAccountListingHandlers(){
    const listings = Array.from(document.getElementsByClassName('accountListing'))
    listings.map((val) => {
        val.onclick = e => {
            if(val.hasAttribute('selected')){
                return
            }
            const cListings = document.getElementsByClassName('accountListing')
            for(let i=0; i<cListings.length; i++){
                if(cListings[i].hasAttribute('selected')){
                    cListings[i].removeAttribute('selected')
                }
            }
            val.setAttribute('selected', '')
            document.activeElement.blur()
        }
    })
}

async function populateServerListings(){
    const distro = await DistroAPI.getDistribution()
    const giaSel = ConfigManager.getSelectedServer()
    const servers = distro.servers
    let htmlString = ''

    // Category: Modlu Sunucular
    if(servers.length > 0) {
        htmlString += `<div class="serverSelectCategory">
            <div class="serverSelectCategoryHeader">
                <span class="serverSelectCategoryIcon">🔧</span>
                <span class="serverSelectCategoryTitle">Modlu Sunucular</span>
                <span class="serverSelectCategoryCount">${servers.length}</span>
            </div>
        </div>`
        for(const serv of servers){
            htmlString += `<button class="serverListing" servid="${serv.rawServer.id}" ${serv.rawServer.id === giaSel ? 'selected' : ''}>
                <img class="serverListingImg" src="${serv.rawServer.icon}"/>
                <div class="serverListingDetails">
                    <span class="serverListingName">${serv.rawServer.name}</span>
                    <span class="serverListingDescription">${serv.rawServer.description}</span>
                    <div class="serverListingInfo">
                        <div class="serverListingVersion">${serv.rawServer.minecraftVersion}</div>
                        <div class="serverListingRevision">${serv.rawServer.version}</div>
                        ${serv.rawServer.mainServer ? `<div class="serverListingStarWrapper">
                            <svg id="Layer_1" viewBox="0 0 107.45 104.74" width="20px" height="20px">
                                <defs>
                                    <style>.cls-1{fill:#fff;}.cls-2{fill:none;stroke:#fff;stroke-miterlimit:10;}</style>
                                </defs>
                                <path class="cls-1" d="M100.93,65.54C89,62,68.18,55.65,63.54,52.13c2.7-5.23,18.8-19.2,28-27.55C81.36,31.74,63.74,43.87,58.09,45.3c-2.41-5.37-3.61-26.52-4.37-39-.77,12.46-2,33.64-4.36,39-5.7-1.46-23.3-13.57-33.49-20.72,9.26,8.37,25.39,22.36,28,27.55C39.21,55.68,18.47,62,6.52,65.55c12.32-2,33.63-6.06,39.34-4.9-.16,5.87-8.41,26.16-13.11,37.69,6.1-10.89,16.52-30.16,21-33.9,4.5,3.79,14.93,23.09,21,34C70,86.84,61.73,66.48,61.59,60.65,67.36,59.49,88.64,63.52,100.93,65.54Z"/>
                                <circle class="cls-2" cx="53.73" cy="53.9" r="38"/>
                            </svg>
                            <span class="serverListingStarTooltip">${Lang.queryJS('settings.serverListing.mainServer')}</span>
                        </div>` : ''}
                    </div>
                </div>
            </button>`
        }
    }

    // Category: Vanilla Sürümler
    htmlString += `<div class="serverSelectCategory">
        <div class="serverSelectCategoryHeader">
            <span class="serverSelectCategoryIcon">🎮</span>
            <span class="serverSelectCategoryTitle">Vanilla Sürümler</span>
            <span class="serverSelectCategoryCount" id="vanillaVersionCount">...</span>
        </div>
    </div>
    <div id="vanillaVersionsContainer"><div class="vanillaVersionsLoading">Sürümler yükleniyor...</div></div>`

    document.getElementById('serverSelectListScrollable').innerHTML = htmlString

    if (cachedVanillaManifest) {
        renderVanillaListings()
    } else {
        try {
            await fetchVanillaVersions()
        } catch(err) {
            document.getElementById('vanillaVersionsContainer').innerHTML = '<div class="vanillaVersionsLoading">Sürümler yüklenemedi</div>'
        }
    }
}

let cachedVanillaManifest = null

function renderVanillaListings() {
    if (!cachedVanillaManifest) return

    const releases = cachedVanillaManifest.versions.filter(v => v.type === 'release')
    const snapshots = cachedVanillaManifest.versions.filter(v => v.type === 'snapshot')
    const latestRelease = cachedVanillaManifest.latest.release
    const latestSnapshot = cachedVanillaManifest.latest.snapshot

    let html = ''
    let totalCount = releases.length + snapshots.length

    // Update count UI
    const countEl = document.getElementById('vanillaVersionCount')
    if (countEl) countEl.textContent = totalCount

    // Releases SubCategory
    html += `<div class="vanillaSubCategory">
        <span class="vanillaSubCategoryTitle">📦 Kararlı Sürümler</span>
    </div>`
    for (const ver of releases) {
        const isLatest = ver.id === latestRelease
        const releaseDate = new Date(ver.releaseTime).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short', year: 'numeric'})
        html += `<button class="serverListing vanillaListing" servid="vanilla-${ver.id}" data-version="${ver.id}" data-type="release">
            <div class="vanillaVersionIcon releaseIcon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="#69db7c"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
            </div>
            <div class="serverListingDetails">
                <span class="serverListingName">${ver.id}${isLatest ? ' <span class="latestBadge">EN YENİ</span>' : ''}</span>
                <span class="serverListingDescription">${releaseDate} • Kararlı Sürüm</span>
                <div class="serverListingInfo">
                    <div class="serverListingVersion" style="background: rgba(0,200,83,0.15); color: #69db7c;">Kararlı</div>
                </div>
            </div>
        </button>`
    }

    // Snapshots SubCategory
    if (snapshots.length > 0) {
        html += `<div class="vanillaSubCategory">
            <span class="vanillaSubCategoryTitle">🧪 Snapshot Sürümler</span>
        </div>`
        for (const ver of snapshots) {
            const isLatest = ver.id === latestSnapshot
            const releaseDate = new Date(ver.releaseTime).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short', year: 'numeric'})
            html += `<button class="serverListing vanillaListing" servid="vanilla-${ver.id}" data-version="${ver.id}" data-type="snapshot">
                <div class="vanillaVersionIcon snapshotIcon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="#ffba08"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
                </div>
                <div class="serverListingDetails">
                    <span class="serverListingName">${ver.id}${isLatest ? ' <span class="latestBadge snapshotBadge">EN YENİ</span>' : ''}</span>
                    <span class="serverListingDescription">${releaseDate} • Deneysel Sürüm</span>
                    <div class="serverListingInfo">
                        <div class="serverListingVersion" style="background: rgba(255,186,8,0.15); color: #ffba08;">Snapshot</div>
                    </div>
                </div>
            </button>`
        }
    }

    document.getElementById('vanillaVersionsContainer').innerHTML = html
    setServerListingHandlers()
}

/**
 * Fetch vanilla Minecraft versions from Mojang's version manifest API.
 */
async function fetchVanillaVersions(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json',
            dataType: 'json',
            success: (data) => {
                if(!data || !data.versions) {
                    reject('No version data')
                    return
                }
                cachedVanillaManifest = data
                renderVanillaListings()
                resolve()
            },
            timeout: 10000
        }).catch(err => {
            reject(err)
        })
    })
}

function populateAccountListings(){
    const accountsObj = ConfigManager.getAuthAccounts()
    const accounts = Array.from(Object.keys(accountsObj), v=>accountsObj[v])
    let htmlString = ''
    for(let i=0; i<accounts.length; i++){
        htmlString += `<button class="accountListing" uuid="${accounts[i].uuid}" ${i===0 ? 'selected' : ''}>
            <img src="https://mc-heads.net/head/${accounts[i].uuid}/40">
            <div class="accountListingName">${accounts[i].displayName}</div>
        </button>`
    }
    document.getElementById('accountSelectListScrollable').innerHTML = htmlString

}

async function prepareServerSelectionList(){
    await populateServerListings()
    setServerListingHandlers()
}

function prepareAccountSelectionList(){
    populateAccountListings()
    setAccountListingHandlers()
}