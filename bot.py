import json
import logging
import os
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler

# === CONFIGURATION ===
TOKEN = 'VOTRE_TOKEN_TELEGRAM_ICI'  # Remplacez par votre token BotFather
# Chemin relatif au script pour le fichier status.json
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATUS_FILE = os.path.join(SCRIPT_DIR, 'status.json')
ALLOWED_USER_ID = 123456789  # Remplacez par votre ID Telegram (pour sécurité)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Bot Portfolio Actif via antigravity ! Commandes: /open, /close, /auto")

async def open_shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_USER_ID: return
    update_data("open", "force_open")
    await context.bot.send_message(chat_id=update.effective_chat.id, text="✅ Statut mis à jour : DISPONIBLE (Forcé)")

async def close_shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_USER_ID: return
    update_data("closed", "force_closed")
    await context.bot.send_message(chat_id=update.effective_chat.id, text="❌ Statut mis à jour : INDISPONIBLE (Forcé)")

async def auto_shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ALLOWED_USER_ID: return
    update_data("auto", "auto")
    await context.bot.send_message(chat_id=update.effective_chat.id, text="🔄 Statut mis à jour : AUTOMATIQUE (Selon horaires)")

def update_data(status_text, override_type):
    data = {
        "status": status_text,
        "override": override_type != "auto",
        "last_updated": "Recently"
    }
    with open(STATUS_FILE, 'w') as f:
        json.dump(data, f)

if __name__ == '__main__':
    application = ApplicationBuilder().token(TOKEN).build()
    
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('open', open_shop))
    application.add_handler(CommandHandler('close', close_shop))
    application.add_handler(CommandHandler('auto', auto_shop))
    
    application.run_polling()
