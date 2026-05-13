export function formatDate(d) {
  if (!d) return '[DATE NOT SET]';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function isExplicitStreet(val) {
  if (!val) return false;
  const v = val.trim();
  if (/^\d/.test(v)) return true;
  if (/\b(street|st\.|avenue|ave\.?|road|rd\.?|blvd\.?|boulevard|drive|dr\.?|lane|ln\.?|highway|hwy\.?|extension|ext\.?|corner|cor\.?)\b/i.test(v)) return true;
  return false;
}

export function numToWords(n) {
  if (n === 0) return 'ZERO';
  const ones = ['','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE',
    'TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN'];
  const tens = ['','','TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
  function helper(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num/100)] + ' HUNDRED' + (num % 100 ? ' ' + helper(num % 100) : '');
    if (num < 1000000) return helper(Math.floor(num/1000)) + ' THOUSAND' + (num % 1000 ? ' ' + helper(num % 1000) : '');
    if (num < 1000000000) return helper(Math.floor(num/1000000)) + ' MILLION' + (num % 1000000 ? ' ' + helper(num % 1000000) : '');
    return helper(Math.floor(num/1000000000)) + ' BILLION' + (num % 1000000000 ? ' ' + helper(num % 1000000000) : '');
  }
  return helper(n);
}

export function numToWordsMixed(n) {
  if (!n || isNaN(n)) return '[N]';
  const w = numToWords(parseInt(n));
  return w.charAt(0) + w.slice(1).toLowerCase() + ' (' + n + ')';
}

export function amountToWords(amount) {
  const wholePesos = Math.floor(amount);
  const centavos = Math.round((amount - wholePesos) * 100);
  let result = numToWords(wholePesos);
  if (centavos > 0) result += ' AND ' + numToWords(centavos) + '/100';
  return result.charAt(0) + result.slice(1).toLowerCase();
}

export function formatMoney(amount) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function pctToWords(pct) {
  const ones = ['','one','two','three','four','five','six','seven','eight','nine',
    'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if (pct === 0) return 'zero';
  if (pct < 20) return ones[pct];
  if (pct < 100) return tens[Math.floor(pct/10)] + (pct%10 ? '-'+ones[pct%10] : '');
  return pct.toString();
}

export function inlineAmended(dateStr, isNew) {
  if (!dateStr) return '';
  const cls = isNew ? 'inline-amended-new' : 'inline-amended-prior';
  return `&nbsp;<span class="${cls}">(As amended on ${formatDate(dateStr)})</span>`;
}

export function buildTradeNameLines(names, isNew, prefix = 'doc-title') {
  if (!names || names.length === 0) return '';
  const cls = isNew ? `${prefix}-tradename-new` : `${prefix}-tradename-prior`;
  const phrase = names.length === 1
    ? `doing business under the name and style of ${names[0]}`
    : `doing business under the names and styles of ${names.join(', ')}`;
  return `<span class="${cls}">${phrase}</span>`;
}

export function buildFormerlyLineWithTrades(formerlyName, formerlyTradeNames, isNew, cssPrefix = 'doc-title') {
  if (!formerlyName) return '';
  const cls = isNew ? `${cssPrefix}-formerly-new` : `${cssPrefix}-formerly-prior`;
  let text = `(Formerly: ${formerlyName.toUpperCase()}`;
  if (formerlyTradeNames && formerlyTradeNames.length > 0) {
    text += formerlyTradeNames.length === 1
      ? ` doing business under the name and style of ${formerlyTradeNames[0]}`
      : ` doing business under the names and styles of ${formerlyTradeNames.join(', ')}`;
  }
  text += ')';
  return `<span class="${cls}">${text}</span>`;
}

/**
 * Automatically converts strings like "1. Do this. 2. Do that." 
 * into line-broken lists with proper hanging indent alignment.
 */
export function formatPurposeList(text) {
  if (!text) return '';
  const trimmed = text.trim();
  
  // If it already has deliberate numbering (1. 2. 3.), use that logic
  if (/(?=\b\d+\.\s+)/.test(trimmed)) {
    const parts = trimmed.split(/(?=\b\d+\.\s+)/).map(p => p.trim()).filter(p => p.length > 0);
    return parts.map(p => `<div class="doc-purpose-item">${p}</div>`).join('');
  }
  
  // Otherwise, split by "To " (case-sensitive) to create a numbered list
  // We split at word boundaries for 'To'
  let parts = trimmed.split(/(?=\bTo\b)/).map(p => p.trim()).filter(p => p.length > 0);
  
  if (parts.length === 0) return '';
  if (parts.length === 1 && !trimmed.startsWith('To')) {
    // If it doesn't start with 'To', just wrap it and ensure period
    const cleaned = trimmed.replace(/;$/, '.');
    return `<div class="doc-purpose-item">${cleaned}${cleaned.endsWith('.') ? '' : '.'}</div>`;
  }

  return parts.map((p, i) => {
    let cleaned = p.replace(/;$/, '.');
    if (!cleaned.endsWith('.')) cleaned += '.';
    return `<div class="doc-purpose-item">${i + 1}. ${cleaned}</div>`;
  }).join('');
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') return '';
  const val = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(val)) return amount;
  return '₱' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildPersonTable(rows, cols, className = 'person-table') {
  if (!rows || rows.length === 0)
    return `<table class="lt ${className}"><tr><th colspan="${cols.length}">[No data provided — REQUIRES CLIENT INPUT]</th></tr></table>`;
  
  const isContribTable = className === 'contrib-table';
  let total = 0;

  const bodyRows = rows.map(r => {
    return `<tr>${cols.map(c => {
      let val = r[c] || '';
      if (isContribTable && c.includes('Amount')) {
        const numericVal = parseFloat(String(val).replace(/,/g, '')) || 0;
        total += numericVal;
        val = formatCurrency(numericVal);
      }
      return `<td class="${isContribTable && c.includes('Amount') ? 'doc-right' : ''}">${val}</td>`;
    }).join('')}</tr>`;
  }).join('');

  let footerRow = '';
  if (isContribTable) {
    footerRow = `<tr class="table-total-row">
      <td style="text-align: right; font-weight: bold;">TOTAL</td>
      <td class="doc-right" style="font-weight: bold;">${formatCurrency(total)}</td>
    </tr>`;
  }

  return `<table class="lt ${className}"><tr>${cols.map(c => `<th>${c.toUpperCase()}</th>`).join('')}</tr>${bodyRows}${footerRow}</table>`;
}

export function buildSignatoryBlock(sigs) {
  if (!sigs || sigs.length === 0)
    return `<table class="lt sig-table"><tr><th colspan="3">[No signatories provided — REQUIRES CLIENT INPUT]</th></tr></table>`;
  
  const header = `<tr><th>NAME</th><th>TIN</th><th>SIGNATURE</th></tr>`;
  const body = sigs.map(s => `
    <tr style="height: 45pt;">
      <td style="vertical-align: middle;"><b>${(s.Name || s.name || '').toUpperCase()}</b></td>
      <td style="vertical-align: middle; text-align: center;">${s.TIN || s.tin || ''}</td>
      <td></td>
    </tr>
  `).join('');
  
  return `<table class="lt sig-table">${header}${body}</table>`;
}
