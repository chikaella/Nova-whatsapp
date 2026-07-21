const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["Chrome (Linux)", "", ""]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("Connected to WhatsApp successfully!");
        } else if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting...", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    // Added a 6-second delay before requesting the pairing code to let connection stabilize
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            const phoneNumber = "234 916 115 9033"; // Replace with your WhatsApp phone number (with country code, e.g., 234...)
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n==============================`);
                console.log(`YOUR PAIRING CODE IS: ${code}`);
                console.log(`==============================\n`);
            } catch (err) {
                console.error("Error getting pairing code:", err);
            }
        }, 6000);
    }
}

startBot();

