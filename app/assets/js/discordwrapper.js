// Work in progress
const { LoggerUtil } = require('helios-core')

const logger = LoggerUtil.getLogger('DiscordWrapper')

const { Client } = require('discord-rpc-patch')

const Lang = require('./langloader')

let client
let activity

const ZEX_CLIENT_ID = '1508823030053343402'

exports.initRPC = function(genSettings, servSettings, minecraftVersion, initialDetails = 'Zex Launcher'){
    client = new Client({ transport: 'ipc' })

    activity = {
        details: initialDetails,
        state: minecraftVersion ? `Minecraft ${minecraftVersion}` : 'Minecraft',
        largeImageKey: servSettings.largeImageKey || 'seal-circle',
        largeImageText: `Minecraft ${minecraftVersion || ''}`,
        smallImageKey: genSettings.smallImageKey || 'seal-circle',
        smallImageText: 'Zex Launcher',
        startTimestamp: new Date().getTime(),
        instance: false,
        buttons: [
            {
                label: '🛒 Katıl',
                url: 'https://www.itemsatis.com/profil/zexyshop.html'
            }
        ]
    }

    client.on('ready', () => {
        logger.info('Discord RPC Connected')
        client.setActivity(activity)
    })
    
    client.login({clientId: ZEX_CLIENT_ID}).catch(error => {
        if(error.message.includes('ENOENT')) {
            logger.info('Unable to initialize Discord Rich Presence, no client detected.')
        } else {
            logger.info('Unable to initialize Discord Rich Presence: ' + error.message, error)
        }
    })
}

exports.updateDetails = function(details){
    activity.details = details
    client.setActivity(activity)
}

exports.shutdownRPC = function(){
    if(!client) return
    client.clearActivity()
    client.destroy()
    client = null
    activity = null
}