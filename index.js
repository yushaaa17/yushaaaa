
"use strict";
const { BufferJSON, WA_DEFAULT_EPHEMERAL, proto, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
const { downloadContentFromMessage, generateWAMessage, generateWAMessageFromContent, MessageType, buttonsMessage } = require("@adiwajshing/baileys")
const { exec, spawn } = require("child_process");
const { color, bgcolor, pickRandom, randomNomor } = require('./function/console.js')

// apinya
const fs = require("fs");
const ms = require("ms");
const chalk = require('chalk');
const axios = require("axios");
const colors = require('colors/safe');
const ffmpeg = require("fluent-ffmpeg");
const moment = require("moment-timezone");

// Database
const setting = JSON.parse(fs.readFileSync('./setting.json'));
const antilink = JSON.parse(fs.readFileSync('./database/antilink.json'));
const mess = JSON.parse(fs.readFileSync('./mess.json'));
const db_error = JSON.parse(fs.readFileSync('./database/error.json'));
const db_user = JSON.parse(fs.readFileSync('./database/pengguna.json'));
const db_respon_list = JSON.parse(fs.readFileSync('./database/list.json'));

moment.tz.setDefault("Asia/Jakarta").locale("id");
module.exports = async(ramz, msg, m, setting, store) => {
try {
let { ownerNumber, botName } = setting
const { type, quotedMsg, mentioned, now, fromMe, isBaileys } = msg
if (msg.isBaileys) return
const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
const tanggal = moment().tz("Asia/Jakarta").format("ll")
let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
const ucapanWaktu = "Selamat "+dt.charAt(0).toUpperCase() + dt.slice(1)
const content = JSON.stringify(msg.message)
const from = msg.key.remoteJid
const time = moment(new Date()).format("HH:mm");
var chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
if (chats == undefined) { chats = '' }
const prefix = /^[?????????????????????????????????_=|~!?#$%^&.+-,\/\\??^]/.test(chats) ? chats.match(/^[?????????????????????????????????_=|~!?#$%^&.+-,\/\\??^]/gi) : '#'
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const isOwner = [`${setting.ownerNumber}`,"6283834558105@s.whatsapp.net","6282279915237@s.whatsapp.net"].includes(sender) ? true : false
const pushname = msg.pushName
const body = chats.startsWith(prefix) ? chats : ''
const args = body.trim().split(/ +/).slice(1);
const q = args.join(" ");
const isCommand = body.startsWith(prefix);
const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
const isCmd = isCommand ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
const botNumber = ramz.user.id.split(':')[0] + '@s.whatsapp.net'

// Group
const groupMetadata = isGroup ? await ramz.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupId = isGroup ? groupMetadata.id : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
const isGroupAdmins = groupAdmins.includes(sender)
const isAntiLink = antilink.includes(from) ? true : false

// Quoted
const quoted = msg.quoted ? msg.quoted : msg
const isImage = (type == 'imageMessage')
const isQuotedMsg = (type == 'extendedTextMessage')
const isMedia = (type === 'imageMessage' || type === 'videoMessage');
const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
const isVideo = (type == 'videoMessage')
const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
const isSticker = (type == 'stickerMessage')
const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false 
const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
var dataGroup = (type === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : ''
var dataPrivate = (type === "messageContextInfo") ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isButton = dataGroup.length !== 0 ? dataGroup : dataPrivate
var dataListG = (type === "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
var dataList = (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isListMessage = dataListG.length !== 0 ? dataListG : dataList

function mentions(teks, mems = [], id) {
if (id == null || id == undefined || id == false) {
let res = ramz.sendMessage(from, { text: teks, mentions: mems })
return res
} else {
let res = ramz.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
return res
}
}

const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
mention != undefined ? mention.push(mentionByReply) : []
const mentionUser = mention != undefined ? mention.filter(n => n) : []



const reply = (teks) => {ramz.sendMessage(from, { text: teks }, { quoted: msg })}

//Antilink
if (isGroup && isAntiLink && isBotGroupAdmins){
if (chats.match(/(https:\/\/chat.whatsapp.com)/gi)) {
if (!isBotGroupAdmins) return reply('Untung gw bukan admin')
if (isOwner) return reply('Untung lu owner ku:v????')
if (isGroupAdmins) return reply('Admin grup mah bebas ygy????')
if (fromMe) return reply('Gw bebas share link')
await ramz.sendMessage(from, { delete: msg.key })
reply(`*??? GROUP LINK DETECTOR ???*\n\nTerdeteksi mengirim link group,Maaf sepertinya kamu akan di kick`)
ramz.groupParticipantsUpdate(from, [sender], "remove")
}
}

const sendContact = (jid, numbers, name, quoted, mn) => {
let number = numbers.replace(/[^0-9]/g, '')
const vcard = 'BEGIN:VCARD\n' 
+ 'VERSION:3.0\n' 
+ 'FN:' + name + '\n'
+ 'ORG:;\n'
+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
+ 'END:VCARD'
return ramz.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
}

let cekUser = (satu, dua) => { 
let x1 = false
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){x1 = i}})
if (x1 !== false) {
if (satu == "id"){ return db_user[x1].id }
if (satu == "name"){ return db_user[x1].name }
if (satu == "seri"){ return db_user[x1].seri }
if (satu == "premium"){ return db_user[x1].premium }
}
if (x1 == false) { return null } 
}

let setUser = (satu, dua, tiga) => { 
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){
if (satu == "??id"){ db_user[i].id = tiga
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "??name"){ db_user[i].name = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "??seri"){ db_user[i].seri = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "??premium"){ db_user[i].premium = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
}})
}





// Console
if (isGroup && isCmd) {
console.log(colors.green.bold("[Group]") + " " + colors.brightCyan(time,) + " " + colors.black.bgYellow(command) + " " + colors.green("from") + " " + colors.blue(groupName));
}

if (!isGroup && isCmd) {
console.log(colors.green.bold("[Private]") + " " + colors.brightCyan(time,) + " " + colors.black.bgYellow(command) + " " + colors.green("from") + " " + colors.blue(pushname));
}

// Casenya
switch(command) {
case 'menu':
case 'list':
case 'produk':{
if (isGroup) return 
const mark_slebew = '0@s.whatsapp.net'
const more = String.fromCharCode(8206)
const strip_ny = more.repeat(4001)
var footer_nya =`Owner by - ${setting.ownerName}`
let tampilan_nya = `Hallo Kak..????

Berikut List Menu Kami yah kak????
Jangan Lupa untuk order ????
`
ramz.sendMessage(from,
{text: tampilan_nya,
buttonText: "LIST MENU",
sections: [{title: "????????????????????????????????????[ TOPUP MENU ]????????????????????????????????????",
rows: [
{title: "???? ???? Mobile Legends A", rowId: prefix+"nokos", description: "Pricelist Diamond Mobile Legends A"},
{title: "???? ???? Mobile Legends B", rowId: prefix+"stock", description: "Pricelist Diamond Mobile Legends B"},
{title: "???? ???? Chip Domino", rowId: prefix+"jasapromosi", description: "Pricelist Chips Higgs Domino"},
{title: "??????? ???? Pubg Mobile", rowId: prefix+"desinglogo", description: "Pricelist UC Pubg Mobile"},
{title: "???? ???? Free Fire", rowId: prefix+"pengajaran", description: "Pricelist Diamond Free Fire"}]},
],
footer: footer_nya,
mentions:[setting.ownerNumber, sender]})
}
break
case 'thanksto':
if (isGroup) return 
	ramz.sendMessage(from, {text: `*??? THANKS TO ???*
   ???Allah Swt
   ???Ortu
   ???Ramaa gnnz *[Creator]*`},
{quoted: msg})
break
case 'listcmd':
if (isGroup) return 
let rama = `*LIST COMMAND*
-${prefix}produk
-${prefix}donasi
-${prefix}bayar
-${prefix}pembayaran 
-${prefix}proses
-${prefix}done

*GROUP ONLY*
-${prefix}hidetag
-${prefix}kick 
-${prefix}antilink
-${prefix}group _(open/close)_
`
	ramz.sendMessage(from, {text: rama},
{quoted: msg})
break
case 'yt':
case 'youtube':
if (isGroup) return 
	ramz.sendMessage(from, {text: `Jangan Lupa Subscriber yah kak????????\n*Link* : https://youtube.com/@ramaagnnz961?si=EnSIkaIECMiOmarE`},
{quoted: msg})
break
case 'ig':
case 'instagram':
if (isGroup) return 
	ramz.sendMessage(from, {text: `Follow Instagram Admin Cuy \nLink https://instagram.com/oh_pahadd/`},
{quoted: msg})
break
case 'gc':
case 'group':
case 'grup':
case 'groupadmin':
if (isGroup) return 
	ramz.sendMessage(from, {text: `*Group YF TOPUP*\n\nGroup1 :https://chat.whatsapp.com/C2LO1hC0R0bIVsLWrYuiZH`},
{quoted: msg})
break
case 'donasi': case 'donate':{
	if (isGroup) return 
let tekssss = `????????????  *DONASI*  ???????????????

*Payment donasi????* 

- *Dana :* 085771925745
- *Gopay :*  087843253876
- *Ovo :* 085727144288
- *Saweria :* https://saweria.co/yushafahad
- *Qris :* Scan QR Diatas

berapapun donasi dari kalian itu sangat berarti bagi kami 
`
ramz.sendMessage(from, { image: fs.readFileSync(`./gambar/qris.jpg`),
 caption: tekssss, 
footer: `${setting.ownerName} ?? 2023`},
{quoted: msg})
}
break
case 'payment':
case 'pembayaran':
case 'bayar':{
	if (isGroup) return 
let teq = `????????????  *PAYMENT*  ???????????????

- *Dana :* 085771925745
- *Gopay :*  087843253876
- *Ovo :* 085727144288
- *Qris :* klik link dibawah
https://i.ibb.co/FBcVWf1/qris.jpg

Terimakasih udah order di *YF-SHOP*
`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'KONFIRMASI???' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'format':
case 'order':
case 'formatorder':{
	if (isGroup) return 
let teq = `*CARA TULIS FORMAT ORDER*
Contoh: 
topupmla 581868908/8338|86DM
topupmlb 581868908/8338|42DM
topupff 2738352843|42DM
topuppubg 5284946284|105UC
topupchip 2393628482|1B

*_Setelah Format Dikirim Silahkan Klik Tombol Pembayaran!_*`
let btn_menu = [
{buttonId: `${prefix}payment`, buttonText: { displayText: 'PEMBAYARAN????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'swa':
case 'sewa':
case 'sewabot':{
	if (isGroup) return 
let teq =`*SEWA BOT*

*List Harga*
Rp10.000 ??? 30day

*day ??? hari*

*Keuntungan Sewabot*
- _Bisa Add Bot 1 Group_
- _Bisa Gunain Fitur Admin_

Minat Sewabot?
Pencet button Di bawah`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'jasapromosi':
case 'promosi':
case 'jasapromosiviayt':{
	if (isGroup) return 
let teq =`_*PRICELIST CHIP DOMINO*_ 
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
?? Proses 1 - 10 Menit
?? VIA ID
?? Tanyakan Stock Sebelum Order
???????????????????????????????????????????????????????????????
100M  : Rp 8.000
200M  : Rp 16.000
300M  : Rp 22.000
400M  : Rp 28.500
500M  : Rp 35.000
600M  : Rp 42.000
700M  : Rp 48.000
800M  : Rp 54.000
900M  : Rp 60.025
 1B  : Rp 67.000
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`
let btn_menu = [
{buttonId: `${prefix}format`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'desinglogo':
case 'logo':
case 'jasalogo':{
	if (isGroup) return 
let teq =`_*PRICELIST PUBG MOBILE*_ 
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
?? Proses 1 - 10 Menit
?? VIA ID
?? Tanyakan Stock Sebelum Order
???????????????????????????????????????????????????????????????

52 UC  Rp 8.000
105 UC  Rp 17.000
131 UC  Rp 21.000
263 UC  Rp 41.750
530 UC  Rp 87.000
825 UC  Rp 196.400
1.100 UC  Rp 165.00
1.925 UC  Rp 288.500
2.463 UC  Rp 370.130
3.563 UC  Rp 562.500
6.600 UC  Rp 1.100.000
13.200 UC  Rp 2.130.000
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`
let btn_menu = [
{buttonId: `${prefix}format`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'openmurid':
case 'pengajaranpembuatanbot':
case 'pengajaran':
case 'pengajaranbot':{
	if (isGroup) return 
let teq =`_*PRICELIST FREE FIRE*_ 
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
?? Proses 1 - 10 Menit
?? VIA ID
?? Tanyakan Stock Sebelum Order
???????????????????????????????????????????????????????????????

20 DIAMOND : Rp 2.820
50 DIAMOND : Rp 6.780
70 DIAMOND : Rp 8.850
100 DIAMOND : Rp 13.054
140 DIAMOND : Rp 17.937
210 DIAMOND : Rp 27.000
280 DIAMOND : Rp 34.900
355 DIAMOND : Rp 44.700
565 DIAMOND : Rp 71.025
720 DIAMOND : Rp 87.800
860 DIAMOND : Rp 106.500
1000 DIAMOND : Rp 124.000
1450 DIAMOND : Rp 176.000
2000 DIAMOND : Rp 239.500
2180 DIAMOND : Rp 262.300
7290 DIAMOND : Rp 872.000
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`
let btn_menu = [
{buttonId: `${prefix}format`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'nokoswa':
case 'nokos':
case 'noloswhatsap':{
	if (isGroup) return 
let teq =`_*PRICELIST MLBB PAKET A*_ 
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
?? Proses 1 - 10 Menit
?? VIA ID SERVER
?? Tanyakan Stock Sebelum Order
???????????????????????????????????????????????????????????????

86Diamond : Rp 19.000
172Diamond : Rp 37.805
257Diamond : Rp 57.200
344 Diamond : Rp 76.500
429 Diamond : Rp 95.749
514 Diamond : Rp 115.263
600 Diamond : Rp 133.428
706 Diamond : Rp 152.320
878 Diamond : Rp 192.710
963 Diamond : Rp 210.028
1050 Diamond : Rp 229.364
1220 Diamond : Rp 267.209
1412 Diamond : Rp 305.000
2195 Diamond : Rp 463.068
3688 Diamond : Rp 761.540
5532 Diamond : Rp 1.146.304
9288 Diamond : Rp 1.915.860
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????`
let btn_menu = [
{buttonId: `${prefix}format`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'sc':
case 'script':
case 'scbot':
case 'scriptbot':{
	if (isGroup) return 
let teq =`*DIAMOND MLBB VIA LOGIN 100% LEGAL WITH INVOICE*

*_Note :_* *Untuk 1 Akun Yang Pertama Kali Order Diwajibkan Menambah Biaya Sebesar +5k, Next Order 1 Akun Yang Sama Tidak Perlu Membayar 5k*

565 DIAMOND 112.000
1155 DIAMOND 210.000
1765 DIAMOND 310.000
2975 DIAMOND 505.000
6000 DIAMOND 985.000

??? *BERLAKU KELIPATAN*
??? *LOGIN VIA MOONTON/FB/TIKTOK*
??? *PROSES 1 - 3 JAM TANPA ANTRI LGSG PROSES ( KECUALI SAAT EVENT BESAR )*
??? *BERMAIN RANKED 1-3 MATCH*
??? *SELAMA DIPROSES DILARANG LOGIN*`
let btn_menu = [
{buttonId: `${prefix}format`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'produkstock':
case 'stock':
case 'stockproduk':{
	if (isGroup) return 
let teq =`_*PRICELIST MLBB PAKET B*_ 
????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
?? Proses 01 - 10 Menit
?? Sertakan ID SERVER
?? Tanyakan Stock Sebelum Order
????????????????????????????????????????????????????????????????????????
14 Diamond : Rp 3.650
42 Diamond : Rp 9.828
70 Diamond : Rp 15.873
140 Diamond : Rp 31.820
284 Diamond : Rp 64.500
355 Diamond : Rp 78.850
568 Diamond : Rp 128.213
716 Diamond : Rp 158.000
1084 Diamond : Rp 235.500
2162 Diamond : Rp 465.500
2530 Diamond : Rp 543.000
2976 Diamond : Rp 625.000
 7502 Diamond : Rp 1.550.000 
???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? `
let btn_menu = [
{buttonId: `${prefix}format`, buttonText: { displayText: 'BUY????' }, type: 1 },
]
ramz.sendMessage(from,
{text: teq,
buttons: btn_menu})
}
break

case 'proses':{
let tek = (`??? *TRANSAKSI PENDING* ???\n\n\`\`\`???? TANGGAL : ${tanggal}\n??? JAM     : ${jam}\n??? STATUS  : Pending\`\`\`\n\n*--------------------------*\n\n*Topup akan diproses secepatnya*`)
let btn_menu = [
{buttonId: `${prefix}aokeguwgw`, buttonText: { displayText: 'MENUNGGU????' }, type: 1 },
]
ramz.sendMessage(from,
{text: tek,
buttons: btn_menu})
ramz.sendMessage(`${setting.ownerNumber}`, {text: `????Ada yang order Cepet respon????`})
}
break
case 'done':{
	if (!fromMe) return reply('Ngapain..?')
let tek = (`??? *TRANSAKSI BERHASIL* ???\n\n\`\`\`???? TANGGAL : ${tanggal}\n??? JAM     : ${jam}\n??? STATUS  : Berhasil\`\`\`\n\nTerimakasih Telah TopUp di *YF Shop*\nDitunggu Next Order nya????`)
let btn_menu = [
{buttonId: `${prefix}aokeguwgw`, buttonText: { displayText: 'OKE MAKASIH YA TOD????' }, type: 1 },
]
ramz.sendMessage(from,
{text: tek,
buttons: btn_menu})
}
break
case 'hidetag':
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('Nagapain banv?')
let mem = [];
groupMembers.map( i => mem.push(i.id) )
ramz.sendMessage(from, { text: q ? q : '', mentions: mem })
break
case 'antilink':{
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('Ngapain deck?')
if (!args[0]) return reply(`Kirim perintah #${command} _options_\nOptions : on & off\nContoh : #${command} on`)
if (args[0] == 'ON' || args[0] == 'on' || args[0] == 'On') {
if (isAntiLink) return reply('Antilink sudah aktif')
antilink.push(from)
fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
reply('Successfully Activate Antilink In This Group')
} else if (args[0] == 'OFF' || args[0] == 'OF' || args[0] == 'Of' || args[0] == 'Off' || args[0] == 'of' || args[0] == 'off') {
if (!isAntiLink) return reply('Antilink belum aktif')
let anu = antilink.indexOf(from)
antilink.splice(anu, 1)
fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
reply('Successfully Disabling Antilink In This Group')
} else { reply('Kata kunci tidak ditemukan!') }
}
break
case 'group':
case 'grup':
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('ngapain?')
if (!q) return reply(`Kirim perintah #${command} _options_\nOptions : close & open\nContoh : #${command} close`)
if (args[0] == "close") {
ramz.groupSettingUpdate(from, 'announcement')
reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini`)
} else if (args[0] == "open") {
ramz.groupSettingUpdate(from, 'not_announcement')
reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini`)
} else {
reply(`Kirim perintah #${command} _options_\nOptions : close & open\nContoh : #${command} close`)
}
break
case 'kick':
if (!isGroup) return reply(mess.OnlyGroup)
if (!fromMe) return reply('ngapainn?')
var number;
if (mentionUser.length !== 0) {
number = mentionUser[0]
ramz.groupParticipantsUpdate(from, [number], "remove")
.then( res => 
reply(`*Sukses mengeluarkan member..!*`))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
ramz.groupParticipantsUpdate(from, [number], "remove")
.then( res => 
reply(`*Sukses mengeluarkan member..!*`))
.catch((err) => reply(mess.error.api))
} else {
reply(`Tag atau balas pesan orang yang ingin dikeluarkan dari grup`)
}
break
default:


}} catch (err) {
console.log(color('[ERROR]', 'red'), err)
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const moment = require("moment-timezone");
const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
const tanggal = moment().tz("Asia/Jakarta").format("ll")
let kon_erorr = {"tanggal": tanggal, "jam": jam, "error": err, "user": sender}
db_error.push(kon_erorr)
fs.writeFileSync('./database/error.json', JSON.stringify(db_error))
var errny =`*SERVER ERROR*
*Dari:* @${sender.split("@")[0]}
*Jam:* ${jam}
*Tanggal:* ${tanggal}
*Tercatat:* ${db_error.length}
*Type:* ${err}`
ramz.sendMessage(setting.ownerNumber, {text:errny, mentions:[sender]})
}}