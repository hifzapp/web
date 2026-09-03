const surahNames: Record<number, string> = {
  1: "الفاتحة", 2: "البقرة", 3: "آل عمران", 4: "النساء", 5: "المائدة",
  6: "الأنعام", 7: "الأعراف", 8: "الأنفال", 9: "التوبة", 10: "يونس",
  11: "هود", 12: "يوسف", 13: "الرعد", 14: "إبراهيم", 15: "الحجر",
  16: "النحل", 17: "الإسراء", 18: "الكهف", 19: "مريم", 20: "طه",
  21: "الأنبياء", 22: "الحج", 23: "المؤمنون", 24: "النور", 25: "الفرقان",
  26: "الشعراء", 27: "النمل", 28: "القصص", 29: "العنكبوت", 30: "الروم",
  31: "لقمان", 32: "السجدة", 33: "الأحزاب", 34: "سبأ", 35: "فاطر",
  36: "يس", 37: "الصافات", 38: "ص", 39: "الزمر", 40: "غافر",
  41: "فصلت", 42: "الشورى", 43: "الزخرف", 44: "الدخان", 45: "الجاثية",
  46: "الأحقاف", 47: "محمد", 48: "الفتح", 49: "الحجرات", 50: "ق",
  51: "الذاريات", 52: "الطور", 53: "النجم", 54: "القمر", 55: "الرحمن",
  56: "الواقعة", 57: "الحديد", 58: "المجادلة", 59: "الحشر", 60: "الممتحنة",
  61: "الصف", 62: "الجمعة", 63: "المنافقون", 64: "التغابن", 65: "الطلاق",
  66: "التحريم", 67: "الملك", 68: "القلم", 69: "الحاقة", 70: "المعارج",
  71: "نوح", 72: "الجن", 73: "المزمل", 74: "المدثر", 75: "القيامة",
  76: "الإنسان", 77: "المرسلات", 78: "النبأ", 79: "النازعات", 80: "عبس",
  81: "التكوير", 82: "الانفطار", 83: "المطففين", 84: "الانشقاق", 85: "البروج",
  86: "الطارق", 87: "الأعلى", 88: "الغاشية", 89: "الفجر", 90: "البلد",
  91: "الشمس", 92: "الليل", 93: "الضحى", 94: "الشرح", 95: "التين",
  96: "العلق", 97: "القدر", 98: "البينة", 99: "الزلزلة", 100: "العاديات",
  101: "القارعة", 102: "التكاثر", 103: "العصر", 104: "الهمزة", 105: "الفيل",
  106: "قريش", 107: "الماعون", 108: "الكوثر", 109: "الكافرون", 110: "النصر",
  111: "المسد", 112: "الإخلاص", 113: "الفلق", 114: "الناس"
};

const ayahCounts: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

const isMeccan: Record<number, boolean> = {
  1: true, 2: false, 3: false, 4: false, 5: false, 6: true, 7: true, 8: false, 9: false, 10: true,
  11: true, 12: true, 13: false, 14: true, 15: true, 16: true, 17: true, 18: true, 19: true, 20: true,
  21: true, 22: false, 23: true, 24: false, 25: true, 26: true, 27: true, 28: true, 29: true, 30: true,
  31: true, 32: true, 33: false, 34: true, 35: true, 36: true, 37: true, 38: true, 39: true, 40: true,
  41: true, 42: true, 43: true, 44: true, 45: true, 46: true, 47: false, 48: false, 49: false, 50: true,
  51: true, 52: true, 53: true, 54: true, 55: false, 56: true, 57: false, 58: false, 59: false, 60: false,
  61: false, 62: false, 63: false, 64: false, 65: false, 66: false, 67: true, 68: true, 69: true, 70: true,
  71: true, 72: true, 73: true, 74: true, 75: true, 76: false, 77: true, 78: true, 79: true, 80: true,
  81: true, 82: true, 83: true, 84: true, 85: true, 86: true, 87: true, 88: true, 89: true, 90: true,
  91: true, 92: true, 93: true, 94: true, 95: true, 96: true, 97: true, 98: false, 99: false, 100: true,
  101: true, 102: true, 103: true, 104: true, 105: true, 106: true, 107: true, 108: true, 109: true, 110: false,
  111: true, 112: true, 113: true, 114: true
};

function numberToArabic(number: number): string {
  const ones: Record<number, string> = {
    1: "الأولى", 2: "الثانية", 3: "الثالثة", 4: "الرابعة", 5: "الخامسة",
    6: "السادسة", 7: "السابعة", 8: "الثامنة", 9: "التاسعة", 10: "العاشرة"
  };

  const teens: Record<number, string> = {
    11: "الحادية عشرة", 12: "الثانية عشرة", 13: "الثالثة عشرة", 14: "الرابعة عشرة",
    15: "الخامسة عشرة", 16: "السادسة عشرة", 17: "السابعة عشرة", 18: "الثامنة عشرة",
    19: "التاسعة عشرة"
  };

  const tens: Record<number, string> = {
    20: "العشرون", 30: "الثلاثون", 40: "الأربعون", 50: "الخمسون",
    60: "الستون", 70: "السبعون", 80: "الثمانون", 90: "التسعون"
  };

  if (number >= 1 && number <= 10) return ones[number];
  if (number >= 11 && number <= 19) return teens[number];
  if (number >= 20 && number <= 90 && number % 10 === 0) return tens[number];

  if (number >= 21 && number <= 99) {
    const unit = number % 10;
    const ten = Math.floor(number / 10) * 10;
    const unitText = unit === 1 ? "الحادية" :
                     unit === 2 ? "الثانية" :
                     unit === 3 ? "الثالثة" :
                     unit === 4 ? "الرابعة" :
                     unit === 5 ? "الخامسة" :
                     unit === 6 ? "السادسة" :
                     unit === 7 ? "السابعة" :
                     unit === 8 ? "الثامنة" :
                     unit === 9 ? "التاسعة" : "";
    return `${unitText} و${tens[ten]}`;
  }

  if (number === 100) return "المئة";
  if (number > 100 && number <= 114) {
    const remainder = number - 100;
    const remText = remainder === 1 ? "الأولى" :
                    remainder === 2 ? "الثانية" :
                    remainder === 3 ? "الثالثة" :
                    remainder === 4 ? "الرابعة" :
                    remainder === 5 ? "الخامسة" :
                    remainder === 6 ? "السادسة" :
                    remainder === 7 ? "السابعة" :
                    remainder === 8 ? "الثامنة" :
                    remainder === 9 ? "التاسعة" :
                    remainder === 10 ? "العاشرة" :
                    remainder === 11 ? "الحادية عشرة" :
                    remainder === 12 ? "الثانية عشرة" :
                    remainder === 13 ? "الثالثة عشرة" :
                    remainder === 14 ? "الرابعة عشرة" : "";
    return `المئة و${remText}`;
  }

  return number.toString();
}

interface SurahInfo {
  number: number;
  name: string;
  ayahCount: number;
  type: "مكية" | "مدنية";
  ordinal: string; 
}


function production(surahNumber: number): SurahInfo | null {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return null;
  }

  const name = surahNames[surahNumber];
  const ayahCount = ayahCounts[surahNumber];
  const meccan = isMeccan[surahNumber];

  if (!name || !ayahCount || meccan === undefined) {
    return null;
  }

  return {
    number: surahNumber,
    name,
    ayahCount,
    type: meccan ? "مكية" : "مدنية",
    ordinal: numberToArabic(surahNumber)
  };
}

function formatSurahInfo(info: SurahInfo | null): string {
  if (!info) {
    return "رقم السورة غير صحيح. يرجى إدخال رقم بين 1 و 114.";
  }

  return `سورة ${info.name} هي السورة ${info.ordinal} في ترتيب المصحف، عدد آياتها ${info.ayahCount}، وهي ${info.type}.`;
}

export { production, formatSurahInfo, numberToArabic, surahNames };