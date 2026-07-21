import makeWASocket, { useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '22.04.4']
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const phoneNumber = '234 916 115 9033'; // Put your phone number here without the + sign
        
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n========================================`);
                console.log(`YOUR PAIRING CODE IS: ${code}`);
                console.log(`========================================\n`);
            } catch (err) {
                console.error('Error getting pairing code:', err);
            }
        }, 4000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('Nova AI successfully connected!');
        }
    });
}

startBot();

