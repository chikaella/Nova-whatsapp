import { chat } from "../services/ai.js";
import config from "../config.js";

export async function handleMessage(sock, msg) {
    try {
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        if (!text.trim()) return;

        // Ignore commands for now
        if (text.startsWith(config.prefix)) {
            return;
        }

        await sock.sendPresenceUpdate("composing", sender);

        const reply = await chat(sender, text);

        await sock.sendMessage(sender, {
            text: reply
        }, {
            quoted: msg
        });

    } catch (err) {
        console.error(err);

        await sock.sendMessage(msg.key.remoteJid, {
            text: "⚠️ Nova encountered an error."
        });
    }
}
