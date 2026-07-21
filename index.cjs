const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startNova() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' })
    });

    // Request pairing code if not registered
    if (!sock.authState.creds.registered) {
        let phoneNumber = await question('Please enter your WhatsApp phone number (e.g., 2348123456789): ');
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        // Wait a few seconds for the socket to establish connection before requesting code
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`Your Pairing Code is: ${code}`);
            } catch (err) {
                console.error('Error getting pairing code:', err);
            }
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startNova();
            }
        } else if (connection === 'open') {
            console.log('Nova WhatsApp bot is ready and connected!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        
        const messageContent = m.message.conversation || m.message.extendedTextMessage?.text;
        console.log('Received message:', messageContent);
    });
}

startNova();

