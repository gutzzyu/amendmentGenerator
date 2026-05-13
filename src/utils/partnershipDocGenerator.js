import { formatDate, inlineAmended, buildPersonTable, formatPurposeList, formatCurrency, buildSignatoryBlock, buildTradeNameLines, buildFormerlyLineWithTrades } from './helpers';

export function generatePartnershipDocumentHTML(s) {
  const isArt = (id) => !!s.selectedArts?.[id];
  const amDate = s.meetingDate ? formatDate(s.meetingDate) : '[MEETING DATE]';
  const meetingPlace = s.meetingPlace || '[MEETING PLACE]';

  const art1IsAmended = isArt('1');
  const docName = (art1IsAmended ? s.newName : s.baseName) || '[PARTNERSHIP NAME]';
  const formerlyText = s.newFormerly || (art1IsAmended ? s.baseName : s.baseFormerly);
  const priorAmdDate = art1IsAmended ? s.newArt1AmdDate : s.baseArt1AmdDate;

  // Trade Names logic from docGenerator
  const tradeNamesAmended = art1IsAmended && s.amendTradeNames;
  let finalTradeNames, tradeNamesAreNew;
  if (tradeNamesAmended) {
    finalTradeNames = [...(s.newTradeNames || [])];
    tradeNamesAreNew = true;
  } else {
    finalTradeNames = [...(s.baseTradeNames || [])];
    tradeNamesAreNew = false;
  }

  const titleTradeNameHTML = buildTradeNameLines(finalTradeNames, tradeNamesAreNew, 'doc-title');
  const art1TradeNameHTML  = buildTradeNameLines(finalTradeNames, tradeNamesAreNew, 'art1');

  const amendmentTagHtml = art1IsAmended 
    ? `<span class="doc-title-amended-new" style="display:block; font-size:10pt; margin-top:2px;">(As amended on ${amDate})</span>` 
    : (priorAmdDate ? `<span class="doc-title-amended-prior" style="display:block; font-size:10pt; margin-top:2px;">(As amended on ${formatDate(priorAmdDate)})</span>` : '');

  // 2. Determine formerly trade names
  let formerlyTradeNamesForDoc;
  if (s.newFormerly) {
    formerlyTradeNamesForDoc = [...(s.newFormerlyTradeNames || [])];
  } else if (art1IsAmended) {
    formerlyTradeNamesForDoc = [...(s.baseTradeNames || [])];
  } else {
    formerlyTradeNamesForDoc = [...(s.baseFormerlyTradeNames || [])];
  }

  const titleFormerlyHTML  = buildFormerlyLineWithTrades(formerlyText, formerlyTradeNamesForDoc, art1IsAmended, 'doc-title');
  const art1FormerlyHTML   = buildFormerlyLineWithTrades(formerlyText, formerlyTradeNamesForDoc, art1IsAmended, 'art1');

  const nameStyle = art1IsAmended
    ? 'font-weight:bold; font-size:12pt; text-decoration:underline; display:block;'
    : 'font-weight:bold; font-size:12pt; text-decoration:none; display:block;';

  const introText = `<div style="margin-bottom:12pt"><b>KNOWING ALL MEN BY THESE PRESENTS:</b></div>
    <div style="text-indent: 50px; margin-bottom:12pt;">
      That we, the undersigned partners, all of legal age, residents and citizens of the Philippines, have on this day voluntarily associated ourselves together for the purpose of forming a professional partnership under the following terms and conditions and subject to existing and applicable laws of the Republic of the Philippines:
    </div>
    <div style="font-weight:bold; margin: 24pt 0;">AND WE HEREBY CERTIFY:</div>`;

  // First
  const firstArt = `<div style="margin-bottom:12pt; display: flex; align-items: flex-start;">
    <div style="font-weight:bold; width: 70px; flex-shrink: 0;">FIRST:</div>
    <div style="flex-grow: 1;">
      That the name of this partnership shall be:
      
          <div style="text-align:center; margin: 15pt 0;">
            <span style="${nameStyle}">${docName.toUpperCase()}</span> ${art1TradeNameHTML}
            ${amendmentTagHtml}
            ${art1FormerlyHTML}
          </div>
      
      and shall transact business under the said company name.
    </div>
  </div>`;

  // Second
  const primaryIsAmended = isArt('2') && s.amendPrimary;
  const secondaryIsAmended = isArt('2') && s.amendSecondary;

  const primaryPurposeRaw = primaryIsAmended 
    ? (s.selectedPrimary ? s.selectedPrimary.text : (s.customPurpose || s.basePurpose || '[PRIMARY PURPOSE]'))
    : (s.basePurpose || '[PRIMARY PURPOSE]');
  let primaryPurpose = primaryPurposeRaw.trim().replace(/;$/, '.');
  if (!primaryPurpose.endsWith('.')) primaryPurpose += '.';
  
  const primaryAmdDate = primaryIsAmended ? s.meetingDate : (s.baseArt2PrimaryAmdDate || s.newArt2PrimaryAmdDate);
  const primaryAmdTag = primaryAmdDate ? inlineAmended(primaryAmdDate, primaryIsAmended) : '';

  let secondaryHtml = '';
  const secondaryAmdDate = secondaryIsAmended ? s.meetingDate : (s.baseArt2SecondaryAmdDate || s.newArt2SecondaryAmdDate);
  const secondaryAmdTag = secondaryAmdDate ? inlineAmended(secondaryAmdDate, secondaryIsAmended) : '';

  if (secondaryIsAmended) {
    if (s.selectedSecondary && s.selectedSecondary.length > 0) {
      secondaryHtml = s.selectedSecondary.map((p, i) => {
        let cleaned = p.text.trim().replace(/;$/, '.');
        if (!cleaned.endsWith('.')) cleaned += '.';
        return `<div class="doc-purpose-item">${i + 1}. ${cleaned}${inlineAmended(s.meetingDate, true)}</div>`;
      }).join('');
    } else {
      secondaryHtml = '<div class="doc-purpose-item">[SECONDARY PURPOSES REMOVED]</div>';
    }
  } else if (s.baseSecPurpose) {
    secondaryHtml = formatPurposeList(s.baseSecPurpose) + secondaryAmdTag;
  }

  const secondArt = `<div style="margin-bottom:12pt; page-break-inside: avoid;">
    <b>SECOND:</b> That the purpose/s for which this partnership is formed is/are:
    
    <div class="doc-purpose-label">A. Primary Purpose</div>
    <div class="doc-purpose-text">${primaryPurpose}${primaryAmdTag}</div>
    
    ${secondaryHtml ? `
      <div class="doc-purpose-label">B. Secondary Purpose(s)</div>
      ${secondaryHtml}
    ` : ''}
  </div>`;

  // Third
  const currentOffice = `${s.newStreet ? s.newStreet + ', ' : ''}${s.newBrgy ? s.newBrgy + ', ' : ''}${s.newCity}${s.newProv ? ', ' + s.newProv : ''}${s.newZip ? ' ' + s.newZip : ''}`;
  const baseParts = [s.baseStreet, s.baseBrgy, s.baseCity, s.baseProv].filter(Boolean);
  if (s.baseZip) baseParts.push(s.baseZip);
  const baseOffice = baseParts.join(', ') || '[BASE OFFICE]';
  const officeDisplay = isArt('3') ? currentOffice : baseOffice;
  const thirdAmdTag = isArt('3')
    ? inlineAmended(s.meetingDate, true)
    : (s.baseArt3AmdDate ? inlineAmended(s.baseArt3AmdDate, false) : '');
  const thirdArt = `<p><b>THIRD:</b> That the principal place of business of this partnership shall be located at <b>${officeDisplay}</b>${thirdAmdTag}.</p>`;

  // Fourth
  const termVal = isArt('4') ? s.newTerm : s.baseTerm;
  const termText = termVal == 0 ? 'Perpetual' : `${termVal} years from the date of its registration`;
  const fourthArtAmdTag = isArt('4')
    ? inlineAmended(s.meetingDate, true)
    : (s.baseArt4AmdDate ? inlineAmended(s.baseArt4AmdDate, false) : '');
  const fourthArt = `<p><b>FOURTH:</b> That the term for which said partnership is to exist is <b>${termText}</b>${fourthArtAmdTag}.</p>`;

  // Fifth
  const partners = isArt('5') ? s.newPartners : s.basePartners;
  const fifthArtAmdTag = isArt('5') 
    ? inlineAmended(s.meetingDate, true)
    : (s.baseArt5AmdDate ? inlineAmended(s.baseArt5AmdDate, false) : '');
  
  const fifthArt = `<p><b>FIFTH:</b> That the names, nationalities, and residences of the partners of said partnership are as follows${fifthArtAmdTag}:</p>
    ${buildPersonTable(partners, ['Name', 'Nationality', 'Residence', 'Kind of Partner'], 'partner-table')}`;

  // Sixth
  const amtWords = isArt('6') ? s.newAmountWords : s.baseAmountWords;
  const amtNumRaw = isArt('6') ? s.newAmountNum : s.baseAmountNum;
  const amtNumFormatted = formatCurrency(amtNumRaw);
  const contribs = isArt('6') ? s.newContributions : s.baseContributions;
  const sixthArtAmdTag = isArt('6') 
    ? inlineAmended(s.meetingDate, true)
    : (s.baseArt6AmdDate ? inlineAmended(s.baseArt6AmdDate, false) : '');

  const sixthArt = `<p><b>SIXTH:</b> That the capital of this partnership shall be <b>${amtWords.toUpperCase()} (${amtNumFormatted})</b>, Philippine Currency, contributed by the partners as follows${sixthArtAmdTag}:</p>
    ${buildPersonTable(contribs, ['Name', 'Amount Contributed (₱)'], 'contrib-table')}
    <p>The partners are all Filipinos, thus compliant with the 100% Filipino-owned capital requirement for professional partnerships under the Philippine law. No transfer which will reduce the ownership of Filipino citizens to less than the required percentage of the capital shall be allowed or be recorded in the proper books of the partnership.</p>`;

  // Seventh
  const seventhArt = `<p><b>SEVENTH:</b> That the profits and losses of this partnership shall be divided and distributed proportionately on the ratio of the capital contribution of each partner.</p>`;

  // Eighth
  const gm = isArt('8') ? s.newGeneralManager : s.baseGeneralManager;
  const eighthArt = `<p><b>EIGHTH:</b> That this partnership shall be under <b>${gm}</b>, as General Manager, who shall take charge of the administration of the partnership’s affairs, and shall have the power with full authority to manage its business and property and that the partners may at any time replace the manager and point out a successor for the management of the partnership. (Only the General Partner can be the General Manager.)${isArt('8') ? inlineAmended(s.meetingDate, true) : ''}</p>`;

  // Ninth
  const undertaking = `<p><b>NINTH:</b> The partners hereby undertake to change the name of the partnership immediately upon receipt of notice from the Securities and Exchange Commission that another person, firm or entity has prior right to the use of the name or that the name is misleading, deceptive, confusingly similar to a registered name, or contrary to public morals, good customs or public policy, in accordance with the SEC MC 13 series 2019.</p>`;

  // Tenth
  const mc28 = `<p><b>TENTH:</b> That the partnership shall comply with the SEC Memorandum Circular No. 28, Series of 2020 on the designation of a valid official and alternate e-mail address and cellular phone number, and any future amendments, rules and regulations of the SEC.</p>`;

  const currentYear = new Date().getFullYear();
  const witness = `<p style="margin-top:40px; text-indent: 0.5in;"><b>IN WITNESS WHEREOF</b>, we have hereunto signed these Articles of Partnership, this ________ day of ________________, ${currentYear} in the City/Municipality of _______________, Province of _______________, Republic of the Philippines.</p>`;

  const activeSignatories = (s.newSignatories && s.newSignatories.length > 0) ? s.newSignatories : (s.signatories || []);
  const sigTable = `<br>` + buildSignatoryBlock(activeSignatories);

  return `
    <div class="doc-preview">
      <div class="document-page">
        <div class="doc-title-block">
          <span class="doc-title-main">AMENDED ARTICLES OF PARTNERSHIP</span>
          <span class="doc-title-of">OF</span>
          <span style="${nameStyle}">${docName.toUpperCase()}</span> ${titleTradeNameHTML}
          ${amendmentTagHtml}
          ${titleFormerlyHTML}
        </div>

        <div class="doc-body">
          <p>${introText}</p>
          
          <div class="art-section">
            ${firstArt}
            ${secondArt}
            ${thirdArt}
            ${fourthArt}
            ${fifthArt}
            ${sixthArt}
            ${seventhArt}
            ${eighthArt}
            ${undertaking}
            ${mc28}
          </div>
          
          ${witness}
          ${sigTable}
        </div>
      </div>
    </div>
  `;
}
