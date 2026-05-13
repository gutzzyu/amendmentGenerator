import { useState } from "react";

export const BASE_INCORP_COLS = ['Name','Nationality','Residence'];
export const BASE_DIR_COLS    = ['Name','Nationality','Residence'];
export const BASE_SUBS_COLS   = ['Name of Subscriber','Citizenship','No. of Shares Subscribed','Amount Subscribed (₱)','Amount Paid (₱)'];
export const NEW_INCORP_COLS  = ['Name','Nationality','Residence'];
export const NEW_DIR_COLS     = ['Name','Nationality','Residence'];
export const NEW_SUBS_COLS    = ['Name of Subscriber','Citizenship','No. of Shares Subscribed','Amount Subscribed (₱)','Amount Paid (₱)'];
export const SIGNATORY_COLS   = ['Name','Role','TIN'];

function makeRow(cols) {
  const r = {};
  cols.forEach(c => r[c] = '');
  return r;
}

export function useAppState() {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState('baseline');

  // ── Step 1: baseline fields ──
  const [baseName, setBaseName] = useState('');
  const [baseFormerly, setBaseFormerly] = useState('');
  const [baseFormerlyTradeNames, setBaseFormerlyTradeNames] = useState([]);
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

  const [baseTerm, setBaseTerm] = useState('');
  const [baseArt4AmdDate, setBaseArt4AmdDate] = useState('');

  const [baseDirCount, setBaseDirCount] = useState('');
  const [baseArt6AmdDate, setBaseArt6AmdDate] = useState('');

  const [baseAcsWords, setBaseAcsWords] = useState('');
  const [baseAcsAmt, setBaseAcsAmt] = useState('');
  const [baseShares, setBaseShares] = useState('');
  const [basePar, setBasePar] = useState('');
  const [baseArt7AmdDate, setBaseArt7AmdDate] = useState('');

  const [baseTreasurer, setBaseTreasurer] = useState('');
  const [baseTreasurerTin, setBaseTreasurerTin] = useState('');
  const [baseTreasurerAddr, setBaseTreasurerAddr] = useState('');
  const [baseTreasurerCit, setBaseTreasurerCit] = useState('');

  const [baseNinth, setBaseNinth] = useState('No transfer of stock or interest which would reduce the stock ownership of Filipino citizens to less than the required percentage of the capital stock as provided by existing laws shall be allowed or permitted to be recorded in the proper books of the corporation, and this restriction shall be indicated in all stock certificates issued by the corporation.');

  const [baseSec, setBaseSec] = useState('');
  const [baseRegDate, setBaseRegDate] = useState('');

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
  const [newFormerlyTradeNames, setNewFormerlyTradeNames] = useState([]);
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
  const [newDirCount, setNewDirCount] = useState('');
  const [newAcsWords, setNewAcsWords] = useState('');
  const [newAcsAmt, setNewAcsAmt] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPar, setNewPar] = useState('');
  const [newTreasurer, setNewTreasurer] = useState('');
  const [newTreasurerTin, setNewTreasurerTin] = useState('');
  const [compClause, setCompClause] = useState('standard');
  const [customCompClause, setCustomCompClause] = useState('');

  const [newIncorp, setNewIncorp] = useState([]);
  const [newDirs, setNewDirs] = useState([]);
  const [newSubs, setNewSubs] = useState([]);
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
  function addBaseFormerlyTradeName(name) {
    const v = name.trim().toUpperCase();
    if (!v) return;
    setBaseFormerlyTradeNames(prev => prev.includes(v) ? prev : [...prev, v]);
  }
  function removeBaseFormerlyTradeName(idx) {
    setBaseFormerlyTradeNames(prev => prev.filter((_, i) => i !== idx));
  }
  function addNewTradeName(name) {
    const v = name.trim().toUpperCase();
    if (!v) return;
    setNewTradeNames(prev => prev.includes(v) ? prev : [...prev, v]);
  }
  function removeNewTradeName(idx) {
    setNewTradeNames(prev => prev.filter((_, i) => i !== idx));
  }
  function addNewFormerlyTradeName(name) {
    const v = name.trim().toUpperCase();
    if (!v) return;
    setNewFormerlyTradeNames(prev => prev.includes(v) ? prev : [...prev, v]);
  }
  function removeNewFormerlyTradeName(idx) {
    setNewFormerlyTradeNames(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Populate from AI extraction ──
  function populateFromExtraction(data) {
    const sanitizeAmt = (val) => {
      if (!val) return '';
      // Remove 'P', '₱', 'PHP' and common OCR noise but keep numbers, commas, and dots
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
    if (data.numberOfDirectors) setBaseDirCount(data.numberOfDirectors);
    if (data.acsWords || data.totalCapitalWords) setBaseAcsWords(data.acsWords || data.totalCapitalWords);
    
    const amtValue = data.acsAmount || data.totalCapitalAmount || data.acsAmountNum;
    if (amtValue) setBaseAcsAmt(sanitizeAmt(amtValue));
    
    if (data.numberOfShares) setBaseShares(sanitizeAmt(data.numberOfShares));
    if (data.parValue) setBasePar(sanitizeAmt(data.parValue));
    if (data.treasurer) setBaseTreasurer(data.treasurer);
    if (data.treasurerTIN) setBaseTreasurerTin(data.treasurerTIN);
    if (data.treasurerAddress) setBaseTreasurerAddr(data.treasurerAddress);
    if (data.treasurerCitizenship) setBaseTreasurerCit(data.treasurerCitizenship);
    if (data.secRegistrationNo) setBaseSec(data.secRegistrationNo);
    if (data.dateOfRegistration && /^\d{4}-\d{2}-\d{2}$/.test(data.dateOfRegistration)) setBaseRegDate(data.dateOfRegistration);

    if (Array.isArray(data.tradeNames) && data.tradeNames.length > 0) {
      setBaseTradeNames(data.tradeNames.map(t => String(t).trim().toUpperCase()).filter(Boolean));
    }
    const incs = data.incorporators || data.partners || [];
    if (Array.isArray(incs) && incs.length > 0) {
      const stitchedIncs = [];
      incs.forEach(i => {
        const hasRealNationality = i.nationality && !i.nationality.toUpperCase().includes('FILI');
        const hasRealResidence = i.residence && i.residence.length > 10 && i.residence.toLowerCase() !== 'not specified';
        
        const isFragment = !hasRealNationality && !hasRealResidence && 
                          String(i.name || '').trim().split(/\s+/).length === 1;
        
        if (isFragment && stitchedIncs.length > 0) {
          stitchedIncs[stitchedIncs.length - 1].name = (stitchedIncs[stitchedIncs.length - 1].name + ' ' + (i.name || '')).trim();
        } else {
          stitchedIncs.push({ ...i });
        }
      });
      setBaseIncorp(stitchedIncs.map(i => ({ 
        Name: i.name||'', 
        Nationality: sanitizeNationality(i.nationality), 
        Residence: sanitizeAddress(i.residence, i.name) 
      })));
    }
    if (Array.isArray(data.directors) && data.directors.length > 0) {
      const stitchedDirs = [];
      data.directors.forEach(d => {
        const hasRealNationality = d.nationality && !d.nationality.toUpperCase().includes('FILI');
        const hasRealResidence = d.residence && d.residence.length > 10 && d.residence.toLowerCase() !== 'not specified';
        
        const isFragment = !hasRealNationality && !hasRealResidence && 
                          String(d.name || '').trim().split(/\s+/).length === 1;
        
        if (isFragment && stitchedDirs.length > 0) {
          stitchedDirs[stitchedDirs.length - 1].name = (stitchedDirs[stitchedDirs.length - 1].name + ' ' + (d.name || '')).trim();
        } else {
          stitchedDirs.push({ ...d });
        }
      });
      setBaseDirs(stitchedDirs.map(d => ({ 
        Name: d.name||'', 
        Nationality: sanitizeNationality(d.nationality), 
        Residence: sanitizeAddress(d.residence, d.name) 
      })));
      if (!data.numberOfDirectors) setBaseDirCount(String(stitchedDirs.length));
    }
    const subs = data.subscribers || data.contributions || [];
    if (Array.isArray(subs) && subs.length > 0) {
      const stitchedSubs = [];
      subs.forEach(s => {
        const amtStr = sanitizeAmt(s.amountSubscribed || s.amountContributed || s.amount || '');
        const isZeroOrEmpty = !amtStr || parseFloat(amtStr.replace(/,/g, '')) === 0;
        const isFragment = isZeroOrEmpty && String(s.name || '').trim().split(/\s+/).length === 1;
        if (isFragment && stitchedSubs.length > 0) {
          stitchedSubs[stitchedSubs.length - 1].name = (stitchedSubs[stitchedSubs.length - 1].name + ' ' + (s.name || '')).trim();
        } else {
          stitchedSubs.push({ ...s });
        }
      });
      setBaseSubs(stitchedSubs.map(s => ({
        'Name of Subscriber': s.name||'',
        'Citizenship': sanitizeNationality(s.citizenship || s.nationality),
        'No. of Shares Subscribed': sanitizeAmt(s.sharesSubscribed||''),
        'Amount Subscribed (₱)': sanitizeAmt(s.amountSubscribed || s.amountContributed || s.amount || ''),
        'Amount Paid (₱)': sanitizeAmt(s.amountPaid || s.amountContributed || s.amount || ''),
      })));
    }
    if (Array.isArray(data.signatories) && data.signatories.length > 0) {
      const stitchedSigs = [];
      data.signatories.forEach(s => {
        const isFragment = !s.tin && !s.role && String(s.name || '').trim().split(/\s+/).length === 1;
        if (isFragment && stitchedSigs.length > 0) {
          stitchedSigs[stitchedSigs.length - 1].name = (stitchedSigs[stitchedSigs.length - 1].name + ' ' + (s.name || '')).trim();
        } else {
          stitchedSigs.push({ ...s });
        }
      });
      setSignatories(stitchedSigs.map(s => ({ Name: s.name||'', Role: s.role||'', TIN: s.tin||'' })));
      setNewSignatories(stitchedSigs.map(s => ({ Name: s.name||'', Role: s.role||'', TIN: s.tin||'' })));
    }
  }

  function reset() {
    setActiveTab('baseline');
    setBaseName('');
    setBaseFormerly('');
    setBaseFormerlyTradeNames([]);
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
    setBaseTerm('');
    setBaseArt4AmdDate('');
    setBaseDirCount('');
    setBaseArt6AmdDate('');
    setBaseAcsWords('');
    setBaseAcsAmt('');
    setBaseShares('');
    setBasePar('');
    setBaseArt7AmdDate('');
    setBaseTreasurer('');
    setBaseTreasurerTin('');
    setBaseTreasurerAddr('');
    setBaseTreasurerCit('');
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
    setNewFormerlyTradeNames([]);
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
    setNewDirCount('');
    setNewAcsWords('');
    setNewAcsAmt('');
    setNewShares('');
    setNewPar('');
    setNewTreasurer('');
    setNewTreasurerTin('');
    setCompClause('standard');
    setCustomCompClause('');
    setNewIncorp([]);
    setNewDirs([]);
    setNewSubs([]);
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
    baseFormerlyTradeNames, setBaseFormerlyTradeNames, addBaseFormerlyTradeName, removeBaseFormerlyTradeName,
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
    baseDirCount, setBaseDirCount,
    baseArt6AmdDate, setBaseArt6AmdDate,
    baseAcsWords, setBaseAcsWords,
    baseAcsAmt, setBaseAcsAmt,
    baseShares, setBaseShares,
    basePar, setBasePar,
    baseArt7AmdDate, setBaseArt7AmdDate,
    baseTreasurer, setBaseTreasurer,
    baseTreasurerTin, setBaseTreasurerTin,
    baseTreasurerAddr, setBaseTreasurerAddr,
    baseTreasurerCit, setBaseTreasurerCit,
    baseNinth, setBaseNinth,
    baseSec, setBaseSec,
    baseRegDate, setBaseRegDate,
    baseIncorp, setBaseIncorp,
    baseDirs, setBaseDirs,
    baseSubs, setBaseSubs,
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
    newFormerlyTradeNames, setNewFormerlyTradeNames, addNewFormerlyTradeName, removeNewFormerlyTradeName,
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
    newDirCount, setNewDirCount,
    newAcsWords, setNewAcsWords,
    newAcsAmt, setNewAcsAmt,
    newShares, setNewShares,
    newPar, setNewPar,
    newTreasurer, setNewTreasurer,
    newTreasurerTin, setNewTreasurerTin,
    compClause, setCompClause,
    customCompClause, setCustomCompClause,
    newIncorp, setNewIncorp,
    newDirs, setNewDirs,
    newSubs, setNewSubs,
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
