const fs = require('fs');
const path = require('path');

const bookPath = path.join(__dirname, '..', 'src', 'data', 'book.js');
let content = fs.readFileSync(bookPath, 'utf8');

// Replace (стр. XX-YY) or (стр. XX) in titles
content = content.replace(/\s*\(стр\.\s*\d+([–\-]\d+)?\)/g, '');

// Clean module pages to badges
content = content.replace(/pages:\s*'Стр\.\s*1–2',/g, "badge: 'Вводная глава',");
content = content.replace(/pages:\s*'Стр\.\s*3–19',/g, "badge: 'Базовый курс',");
content = content.replace(/pages:\s*'Стр\.\s*20–26',/g, "badge: 'Долгие гласные',");
content = content.replace(/pages:\s*'Стр\.\s*26–34',/g, "badge: 'Удвоения и танвин',");
content = content.replace(/pages:\s*'Стр\.\s*35–40',/g, "badge: 'Орфография',");
content = content.replace(/pages:\s*'Стр\.\s*41–47',/g, "badge: 'Таджвид',");
content = content.replace(/pages:\s*'Стр\.\s*48',/g, "badge: 'Коран',");

// Clean hints and descriptions
content = content.replace(/На стр\.\s*\d+(\s*\(внизу\))?(\s*и всей стр\.\s*\d+)?\s*книги приведены/g, 'В этом уроке приведены');
content = content.replace(/На стр\.\s*\d+\s*все 28 букв даны/g, 'Все 28 букв изучаются');
content = content.replace(/В казанской традиции книги перед ними/g, 'Перед ними');
content = content.replace(/На стр\.\s*\d+\s*слоги переставлены/g, 'Слоги расположены');
content = content.replace(/Внизу стр\.\s*\d+\s*показано/g, 'Обратите внимание');
content = content.replace(/На стр\.\s*\d+\s*показано/g, 'Обратите внимание');
content = content.replace(/В книге слева в скобках/g, 'Слева в скобках');
content = content.replace(/в книге — он напоминает/g, '— он напоминает');
content = content.replace(/Завершающая страница книги «Му'аллим Сани» — полный текст/g, 'Завершающий этап обучения — полный текст');
content = content.replace(/Страница 48 книги: сура/g, 'Сура');
content = content.replace(/в порядке книги\./g, 'арабского языка.');
content = content.replace(/слова для чтения из книги\./g, 'слова для чтения.');

fs.writeFileSync(bookPath, content, 'utf8');
console.log('Successfully modernized book.js into standalone EdTech curriculum!');
