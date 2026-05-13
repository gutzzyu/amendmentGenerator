import {
  formatDate, numToWordsMixed, numToWords,
  amountToWords, formatMoney, pctToWords,
  inlineAmended, buildTradeNameLines, buildFormerlyLineWithTrades,
  buildPersonTable, buildSignatoryBlock, formatPurposeList
} from "./helpers";

export function generateDocumentHTML(s) {
  const isArt = id => !!s.selectedArts[id];
  const mtgDateRaw = s.meetingDate;

  // ── Determine final values ──
  const art1IsAmended = isArt('1');
  const tradeNamesAmended = art1IsAmended && s.amendTradeNames;

  let finalName = art1IsAmended
    ? (s.newName || '[NEW NAME — REQUIRES CLIENT INPUT]')
    : s.baseName || '[CORPORATION NAME — REQUIRES CLIENT INPUT]';

  let finalFormerly = s.newFormerly || (art1IsAmended ? s.baseName : s.baseFormerly);
  let priorAmdDate = art1IsAmended ? s.newArt1AmdDate : s.baseArt1AmdDate;

  let finalTradeNames, tradeNamesAreNew, formerlyTradeNamesForDoc;

  // 1. Determine current trade names
  if (tradeNamesAmended) {
    finalTradeNames = [...s.newTradeNames];
    tradeNamesAreNew = true;
  } else {
    finalTradeNames = [...s.baseTradeNames];
    tradeNamesAreNew = false;
  }

  // 2. Determine formerly trade names
  if (s.newFormerly) {
    formerlyTradeNamesForDoc = [...s.newFormerlyTradeNames];
  } else if (art1IsAmended) {
    formerlyTradeNamesForDoc = [...s.baseTradeNames];
  } else {
    formerlyTradeNamesForDoc = [...s.baseFormerlyTradeNames];
  }

  // Title amended date
  const titleAmendedDate  = art1IsAmended ? mtgDateRaw : priorAmdDate;
  const titleAmendedIsNew = art1IsAmended;
  const titleAmendedClass = titleAmendedIsNew ? 'doc-title-amended-new' : 'doc-title-amended-prior';

  // ── Title block
  const titleTradeNameHTML = buildTradeNameLines(finalTradeNames, tradeNamesAreNew, 'doc-title');
  const art1TradeNameHTML  = buildTradeNameLines(finalTradeNames, tradeNamesAreNew, 'art1');
  const titleFormerlyHTML  = buildFormerlyLineWithTrades(finalFormerly, formerlyTradeNamesForDoc, art1IsAmended, 'doc-title');
  const art1FormerlyHTML   = buildFormerlyLineWithTrades(finalFormerly, formerlyTradeNamesForDoc, art1IsAmended, 'art1');

  const art1AmdDate     = art1IsAmended ? mtgDateRaw : priorAmdDate;
  const art1NameClass   = art1IsAmended ? 'art1-name-text-new'   : 'art1-name-text-prior';
  const art1AmdTagClass = art1IsAmended ? 'art1-amended-tag-new' : 'art1-amended-tag-prior';

  // ── Article II ──
  let finalPurposeHTML = '';
  const primaryIsAmended = isArt('2') && s.amendPrimary;
  const secondaryIsAmended = isArt('2') && s.amendSecondary;

  const primaryAmdDate = primaryIsAmended ? mtgDateRaw : (s.baseArt2PrimaryAmdDate || s.newArt2PrimaryAmdDate);
  const secondaryAmdDate = secondaryIsAmended ? mtgDateRaw : (s.baseArt2SecondaryAmdDate || s.newArt2SecondaryAmdDate);
  
  const primaryAmdTag = primaryAmdDate ? inlineAmended(primaryAmdDate, primaryIsAmended) : '';
  const secondaryAmdTag = secondaryAmdDate ? inlineAmended(secondaryAmdDate, secondaryIsAmended) : '';

  finalPurposeHTML = `<p><b>SECOND:</b> That the purposes for which such corporation is incorporated are:</p>`;

  // Primary
  let primaryText = '';
  if (primaryIsAmended) {
    const cp = s.customPurpose.trim();
    primaryText = cp || (s.selectedPrimary ? s.selectedPrimary.text : s.basePurpose);
    if (!primaryText) primaryText = '[PRIMARY PURPOSE]';
  } else {
    primaryText = s.basePurpose || '[PRIMARY PURPOSE]';
  }
  finalPurposeHTML += `<p class="doc-indent"><b>A. Primary Purpose:</b><br>${primaryText}${primaryAmdTag}</p>`;

  // Secondary
  if (secondaryIsAmended) {
    if (s.selectedSecondary.length > 0) {
      finalPurposeHTML += `<p class="doc-indent"><b>B. Secondary Purpose(s):</b></p>`;
      s.selectedSecondary.forEach((sp, i) => {
        finalPurposeHTML += `<p class="doc-deep-indent">${i + 1}. ${sp.text}${inlineAmended(mtgDateRaw, true)}</p>`;
      });
    } else {
      finalPurposeHTML += `<p class="doc-indent"><b>B. Secondary Purpose(s):</b><br>[SECONDARY PURPOSES REMOVED OR NOT PROVIDED]</p>`;
    }
  } else {
    if (s.baseSecPurpose) {
      finalPurposeHTML += `<p class="doc-indent"><b>B. Secondary Purpose(s):</b><br>${s.baseSecPurpose}${secondaryAmdTag}</p>`;
    }
  }

  // Footer powers
  const powerLetter = secondaryIsAmended || s.baseSecPurpose ? 'C' : 'B';
  finalPurposeHTML += `<p class="doc-indent"><b>${powerLetter}.</b> That the corporation shall have all the express powers of a corporation as provided for under Section 36 of the Revised Corporation Code of the Philippines.</p>`;

  // ── Article III ──
  const addrSt   = isArt('3') ? s.newStreet : s.baseStreet;
  const addrBrgy = isArt('3') ? s.newBrgy   : s.baseBrgy;
  const addrCity = isArt('3') ? s.newCity   : s.baseCity;
  const addrProv = isArt('3') ? s.newProv   : s.baseProv;
  const addrZip  = isArt('3') ? s.newZip    : s.baseZip;

  const addrParts = [addrSt, addrBrgy, addrCity, addrProv].filter(Boolean);
  if (addrZip) addrParts.push(addrZip);
  const addrFull    = addrParts.join(', ') || '[ADDRESS — REQUIRES CLIENT INPUT]';
  const addrDisplay = `<b>${addrFull.toUpperCase()}</b>`;
  const thirdAmdTag = isArt('3')
    ? inlineAmended(mtgDateRaw, true)
    : (s.baseArt3AmdDate ? inlineAmended(s.baseArt3AmdDate, false) : '');

  // ── Article IV ──
  let termText = '';
  const art4AmdTag = isArt('4')
    ? inlineAmended(mtgDateRaw, true)
    : (s.baseArt4AmdDate ? inlineAmended(s.baseArt4AmdDate, false) : '');

  if (isArt('4')) {
    const nt = s.newTerm;
    const perp = !nt || nt === '0';
    termText = perp
      ? `The corporation shall have <b>Perpetual</b> existence.${art4AmdTag}`
      : `That the term for which said corporation is to exist is <b>${numToWordsMixed(parseInt(nt))}</b> years from and after the date of issuance of the certificate of incorporation.${art4AmdTag}`;
  } else {
    const bt = parseInt(s.baseTerm);
    if (!s.baseTerm || s.baseTerm === '0' || bt === 0) {
      termText = 'The corporation shall have <b>Perpetual</b> existence.' + art4AmdTag;
    } else if (!isNaN(bt)) {
      termText = `That the term for which said corporation is to exist is <b>${numToWordsMixed(bt)}</b> years from and after the date of issuance of the certificate of incorporation.` + art4AmdTag;
    } else {
      termText = '[CORPORATE TERM — REQUIRES CLIENT INPUT]';
    }
  }

  // ── Article V ──
  const finalIncorp = isArt('5') ? s.newIncorp : s.baseIncorp;
  const fifthAmdTag = isArt('5')
    ? inlineAmended(mtgDateRaw, true)
    : (s.baseArt5AmdDate ? inlineAmended(s.baseArt5AmdDate, false) : '');

  // ── Article VI ──
  const finalDirCount = isArt('6') ? (s.newDirCount || '[N]') : (s.baseDirCount || '[N]');
  const finalDirs = isArt('6') ? s.newDirs : s.baseDirs;
  const sixthAmdTag = isArt('6')
    ? inlineAmended(mtgDateRaw, true)
    : (s.baseArt6AmdDate ? inlineAmended(s.baseArt6AmdDate, false) : '');

  // ── Article VII ──
  const finalAcsWords = isArt('7') ? (s.newAcsWords || s.baseAcsWords) : s.baseAcsWords;
  const finalAcsAmt   = isArt('7') ? (s.newAcsAmt   || s.baseAcsAmt)   : s.baseAcsAmt;
  const finalShares   = isArt('7') ? (s.newShares   || s.baseShares)   : s.baseShares;
  const finalPar      = isArt('7') ? (s.newPar      || s.basePar)      : s.basePar;
  const seventhAmdTag = isArt('7')
    ? inlineAmended(mtgDateRaw, true)
    : (s.baseArt7AmdDate ? inlineAmended(s.baseArt7AmdDate, false) : '');

  // ── Subscriptions ──
  const finalSubs = isArt('89') ? s.newSubs : s.baseSubs;
  const acsAmtNum = parseFloat(String(finalAcsAmt || '0').replace(/,/g,'')) || 0;
  const eighthAmdTag = isArt('89')
    ? inlineAmended(mtgDateRaw, true)
    : (s.baseArt8AmdDate ? inlineAmended(s.baseArt8AmdDate, false) : '');

  let subsTableHTML = '';
  if (finalSubs.length > 0) {
    let totalShares = 0, totalSub = 0, totalPaid = 0;
    finalSubs.forEach(r => {
      totalShares += parseFloat(String(r['No. of Shares Subscribed']||0).replace(/,/g,'')) || 0;
      totalSub    += parseFloat(String(r['Amount Subscribed (₱)']||0).replace(/,/g,'')) || 0;
      totalPaid   += parseFloat(String(r['Amount Paid (₱)']||0).replace(/,/g,'')) || 0;
    });

    let intro = '';
    if (acsAmtNum > 0 && totalSub > 0) {
      const pct = Math.round((totalSub / acsAmtNum) * 100);
      const pctWords = pctToWords(pct);
      const subAmtWords = amountToWords(totalSub);
      intro = `<p><b>EIGHTH:</b> That at least ${pctWords} percent (${pct}%) of the authorized capital stock above stated or ${subAmtWords} (₱${formatMoney(totalSub)}) Pesos has been subscribed as follows${eighthAmdTag}:</p>`;
    } else if (totalSub > 0) {
      const subAmtWords = amountToWords(totalSub);
      intro = `<p><b>EIGHTH:</b> That the amount of ${subAmtWords} (₱${formatMoney(totalSub)}) Pesos of the authorized capital stock above stated has been subscribed as follows${eighthAmdTag}:</p>`;
    } else {
      intro = `<p><b>EIGHTH:</b> That the authorized capital stock above stated has been subscribed as follows${eighthAmdTag}: [REQUIRES CLIENT INPUT — subscription amounts not provided]</p>`;
    }

    subsTableHTML = intro + `
      <table class="lt subs-table">
        <tr>
          <th>Name of Subscriber</th><th>Citizenship</th>
          <th>No. of Shares Subscribed</th><th>Amount Subscribed (₱)</th><th>Amount Paid (₱)</th>
        </tr>
        ${finalSubs.map(r => `<tr>
          <td>${r['Name of Subscriber']||''}</td>
          <td>${r['Citizenship']||''}</td>
          <td style="text-align:right">${r['No. of Shares Subscribed']||''}</td>
          <td style="text-align:right">${r['Amount Subscribed (₱)']||''}</td>
          <td style="text-align:right">${r['Amount Paid (₱)']||''}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="2"><b>TOTAL</b></td>
          <td style="text-align:right"><b>${totalShares.toLocaleString()}</b></td>
          <td style="text-align:right"><b>${formatMoney(totalSub)}</b></td>
          <td style="text-align:right"><b>${formatMoney(totalPaid)}</b></td>
        </tr>
      </table>`;
  } else {
    subsTableHTML = `<p><b>EIGHTH:</b> That the authorized capital stock above stated has been subscribed. [REQUIRES CLIENT INPUT — subscription table is empty]</p>`;
  }

  // ── Article X ──
  const finalTreasurer = isArt('10') ? (s.newTreasurer || s.baseTreasurer) : s.baseTreasurer;

  // ── Article XI ──
  let finalCompClause = 'That the corporation manifests its willingness to change its corporate name in the event another person, firm, or entity has acquired a prior right to use the said firm name or one deceptively or confusingly similar to it.';
  if (isArt('11') && s.compClause === 'custom' && s.customCompClause.trim()) {
    finalCompClause = s.customCompClause.trim();
  }

  // ── Title name style ──
  const titleNameStyle = art1IsAmended
    ? 'font-size:12pt;font-weight:bold;text-decoration:underline;display:block;line-height:1.4;'
    : 'font-size:12pt;font-weight:bold;text-decoration:none;display:block;line-height:1.4;';

  const sigs = s.newSignatories && s.newSignatories.length > 0 ? s.newSignatories : s.signatories;
  const sigsHTML = sigs.map(sig => `
    <div class="sig-box">
      <div class="sig-line">${(sig.Name || '').toUpperCase()}</div>
      <div class="sig-role">${sig.Role || ''}</div>
      <div class="sig-tin">TIN NO. ${sig.TIN || '_____________________'}</div>
    </div>
  `).join('');

  const incorpTable = buildPersonTable(finalIncorp, ['Name','Nationality','Residence']);
  const dirTable    = buildPersonTable(finalDirs,   ['Name','Nationality','Residence']);

  return `
<div class="document-page" id="page-aoi">
  <div class="doc-title-block">
    <span class="doc-title-main">AMENDED ARTICLES OF INCORPORATION</span>
    <span class="doc-title-of">OF</span>
    <span style="${titleNameStyle}">${finalName.toUpperCase()}</span>
    ${titleTradeNameHTML}
    ${titleAmendedDate ? `<span class="${titleAmendedClass}">(As amended on ${formatDate(titleAmendedDate)})</span>` : ''}
    ${titleFormerlyHTML}
  </div>

  <p><b>KNOW ALL MEN BY THESE PRESENTS:</b></p>
  <p>The undersigned incorporators, all of legal age and majority of whom are residents of the Philippines, have this day voluntarily agreed to form a stock corporation under the laws of the Republic of the Philippines.</p>
  <p style="text-align:center;"><b>THAT WE HEREBY CERTIFY:</b></p>
  <br>

  <p><b>FIRST:</b> That the name of said corporation shall be:</p>
  <div class="art1-name-block">
    <span class="${art1NameClass}">${finalName.toUpperCase()}</span>
    ${art1TradeNameHTML}
    ${art1AmdDate ? `<span class="${art1AmdTagClass}">(As amended on ${formatDate(art1AmdDate)})</span>` : ''}
    ${art1FormerlyHTML}
  </div>
  <br>

  ${finalPurposeHTML}

  <p><b>THIRD:</b> That the place where the principal office of the corporation is to be established or located is at ${addrDisplay}${thirdAmdTag};</p>

  <p><b>FOURTH:</b> ${termText}</p>

  <p><b>FIFTH:</b> That the names, nationalities, and residences of the incorporators of the corporation are as follows${fifthAmdTag}:</p>
  ${incorpTable}

  <p><b>SIXTH:</b> That the number of directors of the corporation shall be <b>${numToWordsMixed(parseInt(finalDirCount)||0)}</b>; and that the names, nationalities, and residences of the directors who are to serve until their successors are duly elected and qualified as provided by the by-laws are as follows:${sixthAmdTag}</p>
  ${dirTable}

  <p><b>SEVENTH:</b> That the authorized capital stock of the Corporation is ${finalAcsWords || '[REQUIRES CLIENT INPUT]'} (${finalAcsAmt ? '₱'+finalAcsAmt : '[AMOUNT]'}) pesos in lawful money of the Philippines, divided into ${finalShares || '[SHARES]'} shares with the par value of ${finalPar ? '₱'+finalPar : '[PAR]'} pesos per share.${seventhAmdTag}</p>

  ${subsTableHTML}

  <p><b>NINTH:</b> No transfer of stock or interest which would reduce the stock ownership of Filipino citizens to less than the required percentage of the capital stock as provided by existing laws shall be allowed or permitted to be recorded in the proper books of the corporation, and this restriction shall be indicated in all stock certificates issued by the corporation.</p>

  <p><b>TENTH:</b> That <b>${finalTreasurer || '[TREASURER — REQUIRES CLIENT INPUT]'}</b> has been elected by the subscribers as Treasurer of the Corporation to act as such until his/her successor is duly elected and qualified in accordance with the by-laws, and that as such Treasurer, he/she has been authorized to receive for and in the name and for the benefit of the Corporation all subscriptions paid by the subscribers.</p>

  <p><b>ELEVENTH:</b> ${finalCompClause}</p>
  <br>

  <p style="margin-top:40px; text-indent: 0.5in;"><b>IN WITNESS WHEREOF</b>, we have hereunto set our hands and signed these Amended Articles of Incorporation, this ________ day of ________________, ${new Date().getFullYear()} in the City/Municipality of _______________, Republic of the Philippines.</p>
  <br>
  
  <div class="sig-grid">
    ${sigsHTML}
  </div>
</div>`;
}
