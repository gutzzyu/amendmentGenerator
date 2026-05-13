import { useState } from "react";

export const BASE_PARTNER_COLS = ['Name','Nationality','Residence', 'Kind of Partner'];
export const BASE_CONTRIB_COLS = ['Name','Amount Contributed (₱)'];
export const NEW_PARTNER_COLS  = ['Name','Nationality','Residence', 'Kind of Partner'];
export const NEW_CONTRIB_COLS = ['Name','Amount Contributed (₱)'];
export const SIGNATORY_COLS   = ['Name','TIN'];

function makeRow(cols) {
  const r = {};
  cols.forEach(c => r[c] = '');
  return r;
}

export function usePartnershipState() {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState('baseline');

  // ── Step 1: baseline fields ──
  const [baseName, setBaseName] = useState('');
  const [baseFormerly, setBaseFormerly] = useState('');
  const [baseArt1AmdDate, setBaseArt1AmdDate] = useState('');
  const [baseTradeNames, setBaseTradeNames] = useState([]);
  const [baseArt2PrimaryAmdDate, setBaseArt2PrimaryAmdDate] = useState('');
  const [baseArt2SecondaryAmdDate, setBaseArt2SecondaryAmdDate] = useState('');

  const [basePurpose, setBasePurpose] = useState('');
  const [basePurposeAmdDate, setBasePurposeAmdDate] = useState('');
  const [baseSecPurpose, setBaseSecPurpose] = useState('');
  const [baseSecPurposeAmdDate, setBaseSecPurposeAmdDate] = useState('');

  const [baseStreet, setBaseStreet] = useState('');
  const [baseBrgy, setBaseBrgy] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [baseProv, setBaseProv] = useState('');
  const [baseZip, setBaseZip] = useState('');
  const [baseArt3AmdDate, setBaseArt3AmdDate] = useState('');

  const [baseTerm, setBaseTerm] = useState('0'); // 0 for indefinite
  const [baseArt4AmdDate, setBaseArt4AmdDate] = useState('');

  // Partnership specifics
  const [basePartners, setBasePartners] = useState([]);
  const [baseContributions, setBaseContributions] = useState([]);
  const [baseAmountWords, setBaseAmountWords] = useState('');
  const [baseAmountNum, setBaseAmountNum] = useState('');
  const [baseGeneralManager, setBaseGeneralManager] = useState('');

  const [baseSec, setBaseSec] = useState('');
  const [baseRegDate, setBaseRegDate] = useState('');

  // Corporate leftovers (keeping for compatibility if extraction provides them)
  const [baseIncorp, setBaseIncorp] = useState([]);
  const [baseDirs, setBaseDirs] = useState([]);
  const [baseSubs, setBaseSubs] = useState([]);
  const [signatories, setSignatories] = useState([]);

  // ── Step 2: amendment fields ──
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingPlace, setMeetingPlace] = useState('');
  const [selectedArts, setSelectedArts] = useState({});

  const [newName, setNewName] = useState('');
  const [newArt1AmdDate, setNewArt1AmdDate] = useState('');
  const [newArt2PrimaryAmdDate, setNewArt2PrimaryAmdDate] = useState('');
  const [newArt2SecondaryAmdDate, setNewArt2SecondaryAmdDate] = useState('');
  const [newFormerly, setNewFormerly] = useState('');
  const [amendTradeNames, setAmendTradeNames] = useState(false);
  const [newTradeNames, setNewTradeNames] = useState([]);

  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState([]);
  const [customPurpose, setCustomPurpose] = useState('');
  const [amendPrimary, setAmendPrimary] = useState(false);
  const [amendSecondary, setAmendSecondary] = useState(false);

  const [newStreet, setNewStreet] = useState('');
  const [newBrgy, setNewBrgy] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newProv, setNewProv] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newArt3AmdDate, setNewArt3AmdDate] = useState('');

  const [newTerm, setNewTerm] = useState('');
  const [newArt4AmdDate, setNewArt4AmdDate] = useState('');
  
  const [newPartners, setNewPartners] = useState([]);
  const [newContributions, setNewContributions] = useState([]);
  const [newAmountWords, setNewAmountWords] = useState('');
  const [newAmountNum, setNewAmountNum] = useState('');
  const [newGeneralManager, setNewGeneralManager] = useState('');
  const [newSignatories, setNewSignatories] = useState([]);

  // ── Extract status ──
  const [extractStatus, setExtractStatus] = useState(null);
  const [extractSummary, setExtractSummary] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // ── Helpers for table rows ──
  function addRow(setter, cols) {
    setter(prev => [...prev, makeRow(cols)]);
  }
  function removeRow(setter, idx) {
    setter(prev => prev.filter((_, i) => i !== idx));
  }
  function updateRow(setter, idx, col, val) {
    setter(prev => prev.map((r, i) => i === idx ? { ...r, [col]: val } : r));
  }

  // ── Trade name helpers ──
  function addBaseTradeName(name) {
    const v = name.trim().toUpperCase();
    if (!v) return;
    setBaseTradeNames(prev => prev.includes(v) ? prev : [...prev, v]);
  }
  function removeBaseTradeName(idx) {
    setBaseTradeNames(prev => prev.filter((_, i) => i !== idx));
  }
  function addNewTradeName(name) {
    const v = name.trim().toUpperCase();
    if (!v) return;
    setNewTradeNames(prev => prev.includes(v) ? prev : [...prev, v]);
  }
  function removeNewTradeName(idx) {
    setNewTradeNames(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Populate from AI extraction ──
  function populateFromExtraction(data) {
    const sanitizeAmt = (val) => {
      if (!val) return '';
      return String(val).replace(/[pP₱]|PHP/g, '').trim();
    };

    const sanitizeNationality = (val) => {
      if (!val) return 'FILIPINO';
      const v = String(val).toUpperCase();
      if (v.includes('PHILI') || v.includes('FILI')) return 'FILIPINO';
      return v;
    };

    const sanitizeAddress = (addr, name) => {
      if (!addr) return '';
      let cleaned = String(addr)
        .replace(/General Partner/gi, '')
        .replace(/Philippine/gi, '')
        .replace(/Filipino/gi, '')
        .replace(/Subdivision/gi, 'Subdivision ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Remove name if it leaked into the address (case insensitive)
      if (name && name.length > 3) {
        const words = name.split(/\s+/);
        words.forEach(word => {
          if (word.length > 2) {
             const wordEscaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             cleaned = cleaned.replace(new RegExp('\\b' + wordEscaped + '\\b', 'gi'), '');
          }
        });
      }
      return cleaned.trim();
    };

    const name = data.name || data.corporateName || data.partnershipName || '';
    if (name) setBaseName(name);

    if (data.primaryPurpose) setBasePurpose(data.primaryPurpose);
    if (data.secondaryPurposes) setBaseSecPurpose(data.secondaryPurposes);

    const art1Date = data.article1AmendedDate || data.documentAmendedDate || '';
    if (art1Date && /^\d{4}-\d{2}-\d{2}$/.test(art1Date)) setBaseArt1AmdDate(art1Date);
    if (data.article2AmendedDate && /^\d{4}-\d{2}-\d{2}$/.test(data.article2AmendedDate)) setBasePurposeAmdDate(data.article2AmendedDate);
    if (data.article3AmendedDate && /^\d{4}-\d{2}-\d{2}$/.test(data.article3AmendedDate)) setBaseArt3AmdDate(data.article3AmendedDate);
    if (data.article4AmendedDate && /^\d{4}-\d{2}-\d{2}$/.test(data.article4AmendedDate)) setBaseArt4AmdDate(data.article4AmendedDate);
    if (data.article6AmendedDate && /^\d{4}-\d{2}-\d{2}$/.test(data.article6AmendedDate)) setBaseArt6AmdDate(data.article6AmendedDate);
    if (data.article7AmendedDate && /^\d{4}-\d{2}-\d{2}$/.test(data.article7AmendedDate)) setBaseArt7AmdDate(data.article7AmendedDate);

    // Only set street if it looks like an explicit address
    const hasStreetKeyword = (val) => {
      if (!val) return false;
      if (/^\d/.test(val.trim())) return true;
      if (/\b(street|st\.|avenue|ave\.?|road|rd\.?|blvd\.?|boulevard|drive|dr\.?|lane|ln\.?|highway|hwy\.?|extension|ext\.?|corner|cor\.?)\b/i.test(val)) return true;
      return false;
    };
    if (data.street && hasStreetKeyword(data.street)) setBaseStreet(data.street);
    if (data.barangay) setBaseBrgy(data.barangay);
    if (data.city) setBaseCity(data.city);
    if (data.province) setBaseProv(data.province);
    if (data.zip) setBaseZip(data.zip);

    if (data.term) setBaseTerm(data.term);
    if (data.secRegistrationNo) setBaseSec(data.secRegistrationNo);
    if (data.dateOfRegistration && /^\d{4}-\d{2}-\d{2}$/.test(data.dateOfRegistration)) setBaseRegDate(data.dateOfRegistration);

    if (Array.isArray(data.tradeNames) && data.tradeNames.length > 0) {
      setBaseTradeNames(data.tradeNames.map(t => String(t).trim().toUpperCase()).filter(Boolean));
    }
    const parts = data.partners || data.incorporators || [];
    if (Array.isArray(parts) && parts.length > 0) {
      const stitchedParts = [];
      parts.forEach(p => {
        const hasRealNationality = p.nationality && !p.nationality.toUpperCase().includes('FILI');
        const hasRealResidence = p.residence && p.residence.length > 10 && p.residence.toLowerCase() !== 'not specified';
        const hasRealKind = p.kind && !p.kind.toUpperCase().includes('GENERAL');
        
        const isFragment = !hasRealNationality && !hasRealResidence && !hasRealKind && 
                          String(p.name || '').trim().split(/\s+/).length === 1;
        
        if (isFragment && stitchedParts.length > 0) {
          stitchedParts[stitchedParts.length - 1].name = (stitchedParts[stitchedParts.length - 1].name + ' ' + (p.name || '')).trim();
        } else {
          stitchedParts.push({ ...p });
        }
      });

      setBasePartners(stitchedParts.map(p => ({
        Name: p.name || '',
        Nationality: sanitizeNationality(p.nationality),
        Residence: sanitizeAddress(p.residence, p.name),
        'Kind of Partner': p.kind || 'GENERAL PARTNER'
      })));
    }
    const contribs = data.contributions || data.subscribers || [];
    if (Array.isArray(contribs) && contribs.length > 0) {
      const stitchedContribs = [];
      contribs.forEach(c => {
        const amtStr = sanitizeAmt(c.amount || c.amountContributed || c.amountSubscribed || '');
        const isZeroOrEmpty = !amtStr || parseFloat(amtStr.replace(/,/g, '')) === 0;
        const isFragment = isZeroOrEmpty && String(c.name || '').trim().split(/\s+/).length === 1;

        if (isFragment && stitchedContribs.length > 0) {
          stitchedContribs[stitchedContribs.length - 1].name = (stitchedContribs[stitchedContribs.length - 1].name + ' ' + (c.name || '')).trim();
        } else {
          stitchedContribs.push({ ...c });
        }
      });

      setBaseContributions(stitchedContribs.map(c => ({
        Name: c.name || '',
        'Amount Contributed (₱)': sanitizeAmt(c.amount || c.amountContributed || c.amountSubscribed || '')
      })));
      const words = data.totalCapitalWords || data.acsWords || '';
      const num = data.totalCapitalAmount || data.acsAmount || data.acsAmountNum || '';
      if (words) setBaseAmountWords(words);
      if (num) setBaseAmountNum(sanitizeAmt(num));
    }
    if (data.generalManager) setBaseGeneralManager(data.generalManager);
    if (Array.isArray(data.signatories) && data.signatories.length > 0) {
      const stitchedSigs = [];
      data.signatories.forEach(s => {
        const isFragment = !s.tin && String(s.name || '').trim().split(/\s+/).length === 1;
        if (isFragment && stitchedSigs.length > 0) {
          stitchedSigs[stitchedSigs.length - 1].name = (stitchedSigs[stitchedSigs.length - 1].name + ' ' + (s.name || '')).trim();
        } else {
          stitchedSigs.push({ ...s });
        }
      });
      setSignatories(stitchedSigs.map(s => ({ Name: s.name||'', TIN: s.tin||'', Signature: '' })));
      setNewSignatories(stitchedSigs.map(s => ({ Name: s.name||'', TIN: s.tin||'', Signature: '' })));
    }
  }

  function reset() {
    setActiveTab('baseline');
    setBaseName('');
    setBaseFormerly('');
    setBaseArt1AmdDate('');
    setBaseTradeNames([]);
    setBaseArt2PrimaryAmdDate('');
    setBaseArt2SecondaryAmdDate('');
    setBasePurpose('');
    setBasePurposeAmdDate('');
    setBaseSecPurpose('');
    setBaseSecPurposeAmdDate('');
    setBaseStreet('');
    setBaseBrgy('');
    setBaseCity('');
    setBaseProv('');
    setBaseZip('');
    setBaseArt3AmdDate('');
    setBaseTerm('0');
    setBaseArt4AmdDate('');
    setBasePartners([]);
    setBaseContributions([]);
    setBaseAmountWords('');
    setBaseAmountNum('');
    setBaseGeneralManager('');
    setBaseSec('');
    setBaseRegDate('');
    setBaseIncorp([]);
    setBaseDirs([]);
    setBaseSubs([]);
    setSignatories([]);
    setMeetingDate('');
    setMeetingPlace('');
    setSelectedArts({});
    setNewName('');
    setNewArt1AmdDate('');
    setNewArt2PrimaryAmdDate('');
    setNewArt2SecondaryAmdDate('');
    setNewFormerly('');
    setAmendTradeNames(false);
    setNewTradeNames([]);
    setSelectedPrimary(null);
    setSelectedSecondary([]);
    setCustomPurpose('');
    setAmendPrimary(false);
    setAmendSecondary(false);
    setNewStreet('');
    setNewBrgy('');
    setNewCity('');
    setNewProv('');
    setNewZip('');
    setNewArt3AmdDate('');
    setNewTerm('');
    setNewArt4AmdDate('');
    setNewPartners([]);
    setNewContributions([]);
    setNewAmountWords('');
    setNewAmountNum('');
    setNewGeneralManager('');
    setNewSignatories([]);
    setExtractStatus(null);
    setExtractSummary(null);
    setOverlayVisible(false);
  }

  return {
    reset,
    // tab
    activeTab, setActiveTab,
    // baseline
    baseName, setBaseName,
    baseFormerly, setBaseFormerly,
    baseArt1AmdDate, setBaseArt1AmdDate,
    baseTradeNames, addBaseTradeName, removeBaseTradeName,
    baseArt2PrimaryAmdDate, setBaseArt2PrimaryAmdDate,
    baseArt2SecondaryAmdDate, setBaseArt2SecondaryAmdDate,
    basePurpose, setBasePurpose,
    basePurposeAmdDate, setBasePurposeAmdDate,
    baseSecPurpose, setBaseSecPurpose,
    baseSecPurposeAmdDate, setBaseSecPurposeAmdDate,
    baseStreet, setBaseStreet,
    baseBrgy, setBaseBrgy,
    baseCity, setBaseCity,
    baseProv, setBaseProv,
    baseZip, setBaseZip,
    baseArt3AmdDate, setBaseArt3AmdDate,
    baseTerm, setBaseTerm,
    baseArt4AmdDate, setBaseArt4AmdDate,
    basePartners, setBasePartners,
    baseContributions, setBaseContributions,
    baseAmountWords, setBaseAmountWords,
    baseAmountNum, setBaseAmountNum,
    baseGeneralManager, setBaseGeneralManager,
    baseSec, setBaseSec,
    baseRegDate, setBaseRegDate,
    signatories, setSignatories,
    // amendments
    meetingDate, setMeetingDate,
    meetingPlace, setMeetingPlace,
    selectedArts, setSelectedArts,
    newName, setNewName,
    newArt1AmdDate, setNewArt1AmdDate,
    newArt2PrimaryAmdDate, setNewArt2PrimaryAmdDate,
    newArt2SecondaryAmdDate, setNewArt2SecondaryAmdDate,
    newFormerly, setNewFormerly,
    amendTradeNames, setAmendTradeNames,
    newTradeNames, setNewTradeNames, addNewTradeName, removeNewTradeName,
    selectedPrimary, setSelectedPrimary,
    selectedSecondary, setSelectedSecondary,
    customPurpose, setCustomPurpose,
    amendPrimary, setAmendPrimary,
    amendSecondary, setAmendSecondary,
    newStreet, setNewStreet,
    newBrgy, setNewBrgy,
    newCity, setNewCity,
    newProv, setNewProv,
    newZip, setNewZip,
    newArt3AmdDate, setNewArt3AmdDate,
    newTerm, setNewTerm,
    newArt4AmdDate, setNewArt4AmdDate,
    newPartners, setNewPartners,
    newContributions, setNewContributions,
    newAmountWords, setNewAmountWords,
    newAmountNum, setNewAmountNum,
    newGeneralManager, setNewGeneralManager,
    newSignatories, setNewSignatories,
    // extract
    extractStatus, setExtractStatus,
    extractSummary, setExtractSummary,
    overlayVisible, setOverlayVisible,
    populateFromExtraction,
    // row helpers
    addRow, removeRow, updateRow,
  };
}
