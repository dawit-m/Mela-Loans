import type { Language } from "./types.js";

export const messages = {
  en: {
    chooseLanguage: "Welcome! Please choose your language.",
    askName: "What is your name?",
    askStatus: "What is your current status?",
    askIncome: "What is your monthly income (in Birr)? Please enter a number.",
    invalidIncome: "Please enter a valid number for your income.",
    askAmount: "How much loan amount are you looking for?",
    statusEmployed: "Employed",
    statusStudent: "Student",
    statusUnemployed: "Unemployed",
    statusBusiness: "Business owner",

    noMatches: (name: string) =>
      `Sorry ${name}, we couldn't find any loan providers matching your details right now. Try again later as we add more institutions.`,

    matchesFound: (name: string, banks: number, microfinances: number, feeBirr: number) =>
      `There are ${microfinances} Microfinance(s) and ${banks} Bank(s) that offer the loan you want, Mr/Mrs. ${name}.\n\n` +
      `To see the full details, please pay ${feeBirr} Birr first.\n` +
      `\u26A0\uFE0F Make sure you pay from an account under your own name (${name}).`,

    paymentInstructions: (telebirr: string, cbe: string) =>
      `Tele Birr: ${telebirr}\nCBE: ${cbe}\n\nAfter paying, please send us a screenshot or receipt of the payment.`,

    invalidScreenshot: "Please send a photo (screenshot or receipt) of your payment.",

    screenshotReceived: (name: string) =>
      `Thanks, ${name}! We've received your payment proof. An admin will review it shortly and send you your matching loan options.`,

    approvedIntro: (name: string) =>
      `Thanks, ${name}! Your payment has been approved. Here are your matching loan options:`,

    rejected: (name: string) =>
      `Sorry ${name}, we couldn't verify your payment. Please contact support or try again.`,
  },
  am: {
    chooseLanguage: "\u12A5\u1295\u12A9\u1295 \u1260\u12F0\u1206 \u1218\u1321! \u12A5\u1263\u12AD\u12CE \u1240\u1295\u1240\u12CB \u12ED\u121D\u1228\u1321\u1362",
    askName: "\u1235\u121D\u12CE \u121B\u1295 \u1290\u12CD?",
    askStatus: "\u12E8\u12A0\u1201\u1291 \u1201\u1294\u1273\u12CE \u121D\u1295\u12F5\u1295 \u1290\u12CD?",
    askIncome: "\u12C8\u122D\u1203\u12CA \u130B\u1262\u12CE \u1235\u1295\u1275 \u1290\u12CD (\u1260\u1265\u122D)? \u12A5\u1263\u12AD\u12CE \u1241\u132D\u122D \u12EB\u235D\u1308\u1261\u1362",
    invalidIncome: "\u12A5\u1263\u12AD\u12CE \u1275\u12AD\u12AD\u129B\u1295 \u1241\u132D\u122D \u12EB\u235D\u1308\u1261\u1362",
    askAmount: "\u121D\u1295 \u12EB\u1205\u120D \u12A5\u12F5\u120D \u1290\u12CD \u12E8\u121A\u134D\u120D\u1309\u1275?",
    statusEmployed: "\u1270\u1240\u132B\u122A",
    statusStudent: "\u1270\u121B\u122A",
    statusUnemployed: "\u1235\u122B \u12E8\u120C\u12CD",
    statusBusiness: "\u1290\u1308\u12F4",

    noMatches: (name: string) =>
      `\u12ED\u1245\u122D\u1273 ${name}\u1363 \u1208\u12A5\u122D\u1235\u12CE \u12E8\u121A\u1235\u121B\u121B \u12E8\u1265\u12F5\u122D \u12A0\u1245\u122B\u1262 \u12A0\u120B\u1308\u1298\u1290\u121D\u1362 \u12A5\u1263\u12AD\u12CE \u1240\u12ED\u1270\u12CD \u12A5\u1295\u12F0\u1308\u293A \u12ED\u121E\u12AD\u1229\u1362`,

    matchesFound: (name: string, banks: number, microfinances: number, feeBirr: number) =>
      `${microfinances} \u121B\u12ED\u12AD\u122E\u134B\u12ED\u1293\u1295\u1235 \u12A5\u1293 ${banks} \u1263\u1295\u12AD(\u12EE\u127D) \u1208\u12A5\u122D\u1235\u12CE \u12E8\u121A\u1235\u121B\u121B \u1265\u12F5\u122D \u12A0\u120B\u278B\u12CD, \u12A0\u1276/\u12CB\u12ED\u12DA\u122E ${name}\u1362\n\n` +
      `\u1219\u1209 \u1218\u1228\u1303\u12CD\u1295 \u1208\u121B\u12E8\u1275 \u12A5\u1263\u12AD\u12CE \u1218\u1300\u1218\u122A\u12EB ${feeBirr} \u1265\u122D \u12ED\u12AD\u134D\u1209\u1362\n` +
      `\u26A0\uFE0F \u12E8\u121A\u12AD\u134D\u1209\u1275 \u12A8\u122B\u1235\u12CE \u1235\u121D (${name}) \u130B\u122D \u1270\u1218\u233B \u12A8\u1206\u1290 \u12A0\u12AB\u12CD\u1295\u275D \u1218\u1206\u1291\u12F5 \u12EB\u1228\u130B\u130D\u1321\u1362`,

    paymentInstructions: (telebirr: string, cbe: string) =>
      `\u1263\u1295\u12AD: ${cbe}\n\u1264\u1264 \u1265\u122D: ${telebirr}\n\n\u12A8\u12A8\u134D\u1209 \u1260\u128B\u120B \u12A5\u1263\u12AD\u12CE \u12E8\u12AD\u134D\u12EB \u12F0\u122D\u1230\u129D \u12C8\u12ED\u121D \u1235\u12AD\u122A\u1295\u123E\u1275 \u12ED\u120B\u12A9\u120D\u295D\u1362`,

    invalidScreenshot: "\u12A5\u1263\u12AD\u12CE \u12E8\u12AD\u134D\u12EB \u1235\u12AD\u122A\u1295\u123E\u1275 \u12C8\u12ED\u121D \u12F0\u122D\u1230\u129D \u134E\u1276 \u12ED\u120B\u12A9\u1362",

    screenshotReceived: (name: string) =>
      `\u12A0\u1218\u1230\u130D\u1293\u1208\u1201, ${name}! \u12E8\u12AD\u134D\u12EB \u121B\u1228\u130B\u1308\u132B\u12CE\u1295 \u1270\u1240\u1265\u120D\u1290\u12CD\u1362 \u12A0\u12F5\u121A\u295D \u1260\u1240\u122D\u1265 \u12EB\u1228\u130B\u130D\u1323\u120D \u12A5\u1293 \u12E8\u121A\u1235\u121B\u121B\u1279\u295D \u12E8\u1265\u12F5\u122D \u12A0\u121B\u122B\u132E\u127D\u295D \u12ED\u120D\u12A8\u120D\u12CE\u1273\u120D\u1362`,

    approvedIntro: (name: string) =>
      `\u12A0\u1218\u1230\u130D\u1293\u1208\u1201, ${name}! \u12AD\u134D\u12EB\u12CE \u133D\u12F5\u241B\u120D\u1362 \u12E8\u121A\u1235\u121B\u121B\u1279\u295D \u12E8\u1265\u12F5\u122D \u12A0\u121B\u122B\u132E\u127D \u12A5\u1290\u1206:`,

    rejected: (name: string) =>
      `\u12ED\u1245\u122D\u1273 ${name}\u1363 \u12AD\u134D\u12EB\u12CE\u1295 \u121B\u1228\u130B\u1308\u1325 \u12A0\u120D\u127B\u120D\u1290\u121D\u1362 \u12A5\u1263\u12AD\u12CE \u12F0\u130D\u134D \u12EB\u130D\u1361 \u12C8\u12ED\u121D \u12A5\u1295\u12F0\u130D\u293A \u12ED\u121E\u12AD\u1229\u1362`,
  },
} as const;

export function t(language: Language) {
  return messages[language];
}
