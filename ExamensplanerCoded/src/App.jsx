import { useState, useMemo, useEffect } from "react";

const REP_PRESETS = {
  alpmann_berlin: {
    name: "Alpmann Schmidt Berlin Dahlem",
    schedule: [
      { month:3, label:"März", tracks:{zivilI:"BereicherungsR",zivilII:"ArbeitsR",oeffR:"VwAT 1 (StaatshaftungsR)",strafR:"StPO"}},
      { month:4, label:"April", tracks:{zivilI:"SchuldR AT",zivilII:"BGB AT",oeffR:"VwAT 2 + VwProzessR",strafR:"StrafR AT"}},
      { month:5, label:"Mai", tracks:{zivilI:"SchuldR AT",zivilII:"BGB AT",oeffR:"VwAT 2 + VwProzessR",strafR:"StrafR AT"}},
      { month:6, label:"Juni", tracks:{zivilI:"SchuldR AT / GSM",zivilII:"BGB AT",oeffR:"VwAT 2 + VwProzessR",strafR:"StrafR AT"}},
      { month:7, label:"Juli", tracks:{zivilI:"SchuldR BT",zivilII:"ZPO I",oeffR:"VwAT 2 + VwProzessR",strafR:"StrafR AT"}},
      { month:8, label:"August", tracks:{zivilI:"SchuldR BT",zivilII:"ZPO I / ZPO II",oeffR:"VwAT 2 + VwProzessR",strafR:"StrafR AT"}},
      { month:9, label:"September", tracks:{zivilI:"SchuldR BT",zivilII:"DeliktsR",oeffR:"VerfassungsR",strafR:"Vermögensdelikte"}},
      { month:10, label:"Oktober", tracks:{zivilI:"SchuldR BT / GoA",zivilII:"DeliktsR / HandelsR",oeffR:"VerfassungsR",strafR:"Vermögensdelikte"}},
      { month:11, label:"November", tracks:{zivilI:"MobiliarSachenR",zivilII:"HandelsR",oeffR:"Grundrechte",strafR:"Vermögensdelikte"}},
      { month:12, label:"Dezember", tracks:{zivilI:"MobiliarSachenR",zivilII:"GesellR",oeffR:"Grundrechte / POR",strafR:"Vermögensdelikte"}},
      { month:1, label:"Januar", tracks:{zivilI:"MobiliarSachenR",zivilII:"GesellR / FamR",oeffR:"POR",strafR:"NichtvermDelikte"}},
      { month:2, label:"Februar", tracks:{zivilI:"GrundstücksR",zivilII:"FamR / ErbR",oeffR:"BauR",strafR:"NichtvermDelikte"}},
    ]
  },
  hemmer:{name:"Hemmer",schedule:[]},
  jura_intensiv:{name:"Jura Intensiv",schedule:[]},
  custom:{name:"Eigenes Rep / Kein Rep",schedule:[]},
};
const TL={zivilI:"Zivil I",zivilII:"Zivil II",oeffR:"ÖffR",strafR:"StrafR"};
const TC={zivilI:"#4A6741",zivilII:"#5C7D53",oeffR:"#2E5E8B",strafR:"#8B2E2E"};
const MN=["","Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

// ─── SYLLABUS: repSync maps to Rep track values ───
const SYLLABUS=[
  {id:"zivil",name:"Bürgerliches Recht",color:"#4A6741",topics:[
    {id:"bgb-at",name:"BGB AT",depth:"R",hours:45,lit:"Brox/Walker, Allgemeiner Teil",repSync:["BGB AT"],sub:[
      "Vertragsschluss, Angebot & Annahme","Rechts- und Geschäftsfähigkeit, Minderjährige","Stellvertretung I: Voraussetzungen & Wirkung",
      "Stellvertretung II: Vertretung ohne Vertretungsmacht","Elektronische Willenserklärungen, Zugang","Tatbestand der Willenserklärung",
      "Sittenwidrigkeit § 138, Verbraucherschutz","AGB-Kontrolle §§ 305ff","Anfechtung §§ 119ff","Bedingung, Befristung","Verjährung"]},
    {id:"schuld-at",name:"Schuldrecht AT",depth:"R",hours:40,lit:"Looschelders, Schuldrecht AT",repSync:["SchuldR AT","SchuldR AT / GSM"],sub:[
      "Leistungsstörungsrecht – Überblick & System","Unmöglichkeit § 275","Schlechtleistung, Pflichtverletzung § 280 I",
      "Verzug §§ 280 II, 286","Schadensersatz statt der Leistung §§ 281–283","Rücktritt §§ 323ff",
      "Schadensersatzformen, Vertreten-Müssen","Rückabwicklung, Widerruf","Vertragsstrafe (G)","Gesamt- und Teilschuldner (G)"]},
    {id:"schuld-bt",name:"Schuldrecht BT – Verträge",depth:"R",hours:50,lit:"Brox/Walker, Besonderes Schuldrecht",repSync:["SchuldR BT","SchuldR BT / GoA"],sub:[
      "Kaufrecht: Pflichten, Gewährleistung","SE-Ansprüche des Käufers, Verjährung","Verbrauchsgüterkauf","Mietrecht (G): Rechte, Pflichten, Kündigung",
      "Werkvertrag, Bauvertrag","Dienstvertrag, Behandlungsvertrag","Auftrag, Geschäftsbesorgung","Leihe, Darlehen","Bürgschaft, Schenkung"]},
    {id:"schuld-gesetz",name:"Gesetzl. Schuldverhältnisse",depth:"R",hours:35,lit:"Röthel, Schuldrecht BT/2",repSync:["BereicherungsR","DeliktsR","DeliktsR / HandelsR"],sub:[
      "GoA: berechtigte Geschäftsführung","GoA: unberechtigte Geschäftsführung","Bereicherungsrecht: Leistungskondiktion",
      "Nichtleistungskondiktion, Eingriffskondiktion","Deliktsrecht § 823 I: Rechtsgutverletzung","§ 823 I: Kausalität & Zurechnung",
      "§ 823 II, § 826, § 831","Produzentenhaftung","Konkurrenzen & Verknüpfungen"]},
    {id:"sachenrecht",name:"Sachenrecht",depth:"R",hours:45,lit:"Vieweg/Lorz, Sachenrecht",repSync:["MobiliarSachenR","GrundstücksR"],sub:[
      "Grundbegriffe, Besitz","Eigentümer-Besitzer-Verhältnis","Eigentumserwerb bewegliche Sachen","Gutgläubiger Erwerb § 932ff",
      "Mobiliarsicherheiten, Pfandrechte","Sicherungsübereignung","Anwartschaftsrecht","Eigentumserwerb Grundstücke, Vormerkung",
      "Hypothek: Ersterwerb, Einreden","Grundschuld: Bestellung, Sicherungsvertrag"]},
    {id:"familienrecht",name:"Familienrecht",depth:"G",hours:15,lit:"Wellenhofer, Familienrecht",repSync:["FamR","GesellR / FamR","FamR / ErbR"],sub:[
      "Eingehung der Ehe, Verlöbnis","Ehefähigkeit, Eheverbote","Gesetzl. Güterrecht, Zugewinn","Scheidung, Versorgungsausgleich (Überblick)",
      "Unterhalt","Elterliche Sorge"]},
    {id:"erbrecht",name:"Erbrecht",depth:"G",hours:15,lit:"Brox/Walker, Erbrecht",repSync:["FamR / ErbR"],sub:[
      "Erbfolge: gesetzlich & gewillkürt","Annahme & Ausschlagung","Erbengemeinschaft","Testament: Errichtung & Auslegung",
      "Pflichtteil","Erbschein"]},
    {id:"handelsrecht",name:"Handelsrecht",depth:"G",hours:12,lit:"Kindler, Handels- und GesellschaftsR",repSync:["HandelsR","DeliktsR / HandelsR"],sub:[
      "Kaufleute, Handelsregister","Handelsfirma","Prokura, Handlungsvollmacht","Allg. Handelsgeschäfte, Handelskauf"]},
    {id:"gesellschaftsrecht",name:"Gesellschaftsrecht",depth:"G",hours:12,lit:"Kindler, Handels- und GesellschaftsR",repSync:["GesellR","GesellR / FamR"],sub:[
      "OHG: Errichtung, Haftung","KG: Besonderheiten","GmbH: Errichtung, Vertretung, Geschäftsführung","GmbH: Haftung, Durchgriff","GbR, Verein (Überblick)"]},
    {id:"arbeitsrecht",name:"Arbeitsrecht",depth:"G",hours:12,lit:"Junker, Grundkurs ArbeitsR",repSync:["ArbeitsR"],sub:[
      "Begründung des Arbeitsverhältnisses","Inhalt, Pflichten AG & AN","Kündigungsschutz, Beendigung","Leistungsstörungen im ArbVerh","Haftung im Arbeitsverhältnis"]},
  ]},
  {id:"strafrecht",name:"Strafrecht",color:"#8B2E2E",topics:[
    {id:"straf-at",name:"Strafrecht AT",depth:"R",hours:50,lit:"Rengier, Strafrecht AT",repSync:["StrafR AT"],sub:[
      "Erfolgsdelikte: Kausalität","Objektive Zurechnung","Vorsatz: Absicht, Wissentlichkeit, dolus ev.","Tatbestandsirrtum § 16",
      "Rechtswidrigkeit: Notwehr § 32","Einverständnis & Einwilligung","Schuld, Schuldfähigkeit §§ 19–21","Unrechtsbewusstsein, Verbotsirrtum § 17",
      "Irrtümer auf Rechtfertigungsebene","Erlaubnistatbestandsirrtum","Versuch: Tatentschluss & unmittelbares Ansetzen",
      "Rücktritt vom Versuch § 24","Täterschaft: Tatherrschaft, Mittäterschaft","Mittelbare Täterschaft",
      "Teilnahme: Anstiftung § 26","Beihilfe § 27, Teilnahmeakzessorietät","Unterlassungsdelikt § 13",
      "Fahrlässigkeit: fahrl. Begehung","Fahrlässiges unechtes Unterlassen","Strafanwendungsrecht, Konkurrenzen (G)"]},
    {id:"straf-at-rf",name:"StrafR AT – Rechtsfolgen",depth:"G",hours:10,lit:"Rengier, Strafrecht AT",repSync:["StrafR AT"],sub:[
      "Strafen, Strafbemessung","Bewährung, Maßregeln","Verfall & Einziehung","Strafantrag, Verjährung"]},
    {id:"bt-leben",name:"Tötungsdelikte",depth:"R",hours:20,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:[
      "Totschlag § 212","Mord § 211: Mordmerkmale im Einzelnen","Mord: Heimtücke, niedrige Beweggründe","Tötung auf Verlangen § 216","§ 218a Schwangerschaftsabbruch"]},
    {id:"bt-koerper",name:"Körperverletzung",depth:"R",hours:15,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:[
      "Einfache KV § 223","Gefährliche KV § 224","Schwere KV § 226","KV mit Todesfolge § 227","Beteiligung an Schlägerei § 231"]},
    {id:"bt-freiheit",name:"Freiheitsdelikte",depth:"R",hours:12,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:[
      "Freiheitsberaubung § 239","Erpresser. Menschenraub § 239a","Geiselnahme § 239b","Nötigung § 240","Bedrohung § 241"]},
    {id:"bt-ehre",name:"Ehrdelikte",depth:"R",hours:8,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:[
      "Beleidigung § 185","Üble Nachrede § 186","Verleumdung § 187","Wahrnehmung berechtigter Interessen § 193"]},
    {id:"bt-diebstahl",name:"Diebstahl & Unterschlagung",depth:"R",hours:18,lit:"Rengier, BT I",repSync:["Vermögensdelikte"],sub:[
      "Diebstahl § 242: Wegnahme, Gewahrsam","§ 242: Zueignungsabsicht","Bes. schwerer Fall § 243","Diebstahl mit Waffen § 244",
      "Wohnungseinbruchsdiebstahl § 244a","Unterschlagung § 246","Unbefugter Gebrauch § 248b"]},
    {id:"bt-raub",name:"Raub & Erpressung",depth:"R",hours:12,lit:"Rengier, BT I",repSync:["Vermögensdelikte"],sub:[
      "Raub § 249","Schwerer Raub § 250","Raub mit Todesfolge § 251","Räuberischer Diebstahl § 252","Erpressung § 253","Räuberische Erpressung § 255"]},
    {id:"bt-betrug",name:"Betrug & Untreue",depth:"R",hours:20,lit:"Rengier, BT I",repSync:["Vermögensdelikte"],sub:[
      "Betrug § 263: Täuschung, Irrtum","§ 263: Vermögensverfügung, Schaden","Computerbetrug § 263a","Versicherungsmissbrauch § 265",
      "Erschleichen v. Leistungen § 265a","Untreue § 266: Missbrauchs-/Treubruchtatbestand","Missbrauch Scheck-/Kreditkarten § 266b"]},
    {id:"bt-urkunden",name:"Urkundendelikte",depth:"R",hours:12,lit:"Rengier, BT I",repSync:["Vermögensdelikte"],sub:[
      "Urkundenfälschung § 267","Fälschung techn. Aufzeichnungen § 268","Fälschung beweiserh. Daten §§ 269/270","Mittelbare Falschbeurkundung § 271","Urkundenunterdrückung § 274"]},
    {id:"bt-sachbesch",name:"Sachbeschädigung",depth:"R",hours:6,lit:"Rengier, BT I",repSync:["Vermögensdelikte"],sub:[
      "Sachbeschädigung § 303","Gemeinschädliche SB § 304","Datenveränderung § 303a"]},
    {id:"bt-brand",name:"Brand/Verkehr/Vollrausch",depth:"R",hours:12,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:[
      "Brandstiftung §§ 306–306f","Gefährdung Straßenverkehr § 315b/c","Trunkenheit § 316, Gefährl. Eingriff § 315b","Vollrausch § 323a","Unterlassene Hilfeleistung § 323c"]},
    {id:"bt-aussage",name:"Aussagedelikte",depth:"R",hours:8,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:["Falsche uneidl. Aussage § 153","Meineid § 154","Fahrlässiger Falscheid § 163"]},
    {id:"bt-justiz",name:"Falsche Verdächtigung",depth:"R",hours:6,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:["Vortäuschen einer Straftat § 145d","Falsche Verdächtigung § 164"]},
    {id:"bt-amt",name:"Amtsdelikte",depth:"R",hours:10,lit:"Rengier, BT II",repSync:["NichtvermDelikte"],sub:[
      "Widerstand § 113","Hausfriedensbruch § 123","Vorteilsnahme § 331, Bestechlichkeit § 332","Vorteilsgewährung § 333, Bestechung § 334",
      "Rechtsbeugung § 339","KV im Amt § 340"]},
    {id:"bt-beguen",name:"Begünstigung & Hehlerei",depth:"R",hours:8,lit:"Rengier, BT I",repSync:["Vermögensdelikte"],sub:["Begünstigung § 257","Strafvereitelung § 258","Hehlerei § 259"]},
  ]},
  {id:"oeffrecht",name:"Öffentliches Recht",color:"#2E5E8B",topics:[
    {id:"staatsrecht",name:"Staatsrecht",depth:"R",hours:45,lit:"Degenhart, StaatsR I; Kingreen/Poscher, StaatsR II",repSync:["VerfassungsR","Grundrechte","Grundrechte / POR"],sub:[
      "Grundlagen Verfassung, Staatsvolk","Rechtsstaatsprinzip, Rechtssicherheit","Gesetzgebung, Kompetenzen","Bundesregierung, Bundeskanzler",
      "Bundesstaatprinzip, Verwaltung","Grundlagen Grundrechte, Grundrechtsbindung","Meinungsfreiheit Art. 5 I GG","Religions-/Gewissensfreiheit Art. 4 GG",
      "Menschenwürde Art. 1 GG","Berufsfreiheit Art. 12 GG","Eigentum Art. 14 GG","Allg. Handlungsfreiheit Art. 2 I GG","Gleichheitssätze Art. 3 GG",
      "Konkrete/Abstrakte Normenkontrolle"]},
    {id:"vw-at",name:"Allg. Verwaltungsrecht",depth:"R",hours:35,lit:"Detterbeck, Allg. VerwaltungsR",repSync:["VwAT 1 (StaatshaftungsR)","VwAT 2 + VwProzessR"],sub:[
      "Grundlagen Verwaltungsakt","Materielle Rechtmäßigkeit VA","Verpflichtungsklage","Widerspruchsverfahren",
      "Aufhebung VA: Rücknahme & Widerruf","Nebenbestimmungen","Fortsetzungsfeststellungsklage","Vorbeugender Rechtsschutz, Eilrechtsschutz",
      "Rechtsverordnungen, Satzungen, Verwaltungsvorschriften","Öff.-rechtl. Vertrag","Staatshaftung, Amtshaftung","Verwaltungsvollstreckung"]},
    {id:"polizeirecht",name:"Polizei- & Ordnungsrecht",depth:"R",hours:25,lit:"Schenke, Polizei- und OrdnungsR",repSync:["POR","Grundrechte / POR"],sub:[
      "Öffentliche Sicherheit & Ordnung","Spezialbefugnisse, Datenerhebung","Durchsuchung, Sicherstellung, Beschlagnahme","Gefahrabwehrverordnungen",
      "Vollstreckung, Kosten, Schadensersatz","Versammlungsrecht (G)"]},
    {id:"baurecht",name:"Bau- & Bauplanungsrecht",depth:"G",hours:15,lit:"Battis/Krautzberger/Löhr, BauGB",repSync:["BauR"],sub:[
      "Bauplanungsrechtl. Zulässigkeit","Baugenehmigungsverfahren","Aufstellung Bauleitpläne","Planerhaltung"]},
    {id:"kommunalrecht",name:"Kommunalrecht",depth:"G",hours:12,repSync:[],sub:["Kommunale Selbstverwaltung","Organe der Gemeinde","Satzungsautonomie"]},
  ]},
  {id:"verfahren",name:"Verfahrensrecht",color:"#6B4E8B",topics:[
    {id:"zpo",name:"ZPO",depth:"G",hours:25,lit:"Musielak/Voit, Grundkurs ZPO",repSync:["ZPO I","ZPO I / ZPO II"],sub:[
      "Zivilprozessuale Verfahrensgrundsätze","Prozessvoraussetzungen","Klagearten & Klagewirkungen","Beweisgrundsätze",
      "Allg. Vollstreckungsvoraussetzungen","Arten der Zwangsvollstreckung","Einstweiliger Rechtsschutz"]},
    {id:"stpo",name:"StPO",depth:"G",hours:25,lit:"Beulke/Swoboda, Strafprozessrecht",repSync:["StPO"],sub:[
      "Verfahrensgrundsätze, allg. Prozessvoraussetzungen","Allgemeiner Gang des Strafverfahrens","Rechtsstellung Verfahrensbeteiligte",
      "Zwangsmittel, Grundrechtseingriffe, Haft","Beweisrecht, Beweisverwertungsverbote","Rechtskraft"]},
    {id:"vwgo",name:"VwGO",depth:"G",hours:20,lit:"Hufen, VerwaltungsprozessR",repSync:["VwAT 2 + VwProzessR"],sub:[
      "Allg. Sachentscheidungsvoraussetzungen","Besondere SEV (Klagearten)","Vorverfahren","Vorläufiger Rechtsschutz","Rechtskraft"]},
    {id:"verfproz",name:"Verfassungsprozessrecht",depth:"G",hours:10,repSync:["VerfassungsR"],sub:["Verfassungsbeschwerde","Normenkontrolle","Organstreit"]},
    {id:"gvg",name:"GVG",depth:"G",hours:6,repSync:[],sub:["Gerichtsaufbau & Zuständigkeiten"]},
  ]},
  {id:"europa",name:"Europarecht",color:"#8B7D2E",topics:[
    {id:"eu-grund",name:"EU-Recht",depth:"G",hours:12,lit:"Sauer, Staatsrecht III",repSync:[],sub:["Organe der EU","Rechtsquellen & Handlungsformen","Auslandseinsätze & Kompetenzen"]},
    {id:"grundfreiheiten",name:"Grundfreiheiten",depth:"G",hours:12,lit:"Sauer, Staatsrecht III",repSync:[],sub:["Warenverkehrsfreiheit","Personenfreizügigkeit","Dienstleistungsfreiheit","Kapitalverkehrsfreiheit"]},
    {id:"eu-durchs",name:"EU-Rechtsschutz",depth:"G",hours:8,repSync:[],sub:["Vorabentscheidungsverfahren","Vertragsverletzungsverfahren","Vorrang des EU-Rechts"]},
    {id:"emrk",name:"EMRK",depth:"G",hours:8,repSync:[],sub:["EMRK-Grundlagen & Bezüge"]},
  ]},
];

const allT=SYLLABUS.flatMap(s=>s.topics.map(t=>({...t,subject:s.id,sName:s.name,sCol:s.color})));
const totH=allT.reduce((s,t)=>s+t.hours,0);
const totSub=allT.reduce((s,t)=>s+(t.sub?.length||0),0);
const LEARN_MOCK={
  subjects:[
    {id:"zivilrecht",label:"Zivilrecht",topics:[{id:"anspruchsgrundlagen",label:"Anspruchsgrundlagen"},{id:"leistungsstoerung",label:"Leistungsstörungen"}]},
    {id:"strafrecht",label:"Strafrecht",topics:[{id:"tatbestand",label:"Tatbestand und Vorsatz"},{id:"versuch",label:"Versuch und Rücktritt"}]},
    {id:"oeffrecht",label:"Öffentliches Recht",topics:[{id:"grundrechte",label:"Grundrechte"},{id:"verwaltungsakt",label:"Verwaltungsakt"}]},
  ],
};

// ── Utilities ──
const wb=(a,b)=>Math.max(1,Math.floor((new Date(b)-new Date(a))/604800000));
const fd=d=>new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
const aw=(d,w)=>{const x=new Date(d);x.setDate(x.getDate()+w*7);return x.toISOString().split("T")[0];};
const gm=d=>new Date(d).getMonth()+1;

// Find which syllabus topics match a rep month
function matchTopics(repEntry){
  if(!repEntry?.tracks) return [];
  const vals=Object.values(repEntry.tracks).filter(Boolean);
  return allT.filter(t=>t.repSync?.some(rs=>vals.some(rv=>rv.includes(rs)||rs.includes(rv))));
}

export default function App(){
  const [step,setStep]=useState(0);
  const [view,setView]=useState("plan");
  const [cfg,setCfg]=useState({start:new Date().toISOString().split("T")[0],exam:""});
  const [repKey,setRepKey]=useState("alpmann_berlin");
  const [repSch,setRepSch]=useState(REP_PRESETS.alpmann_berlin.schedule);
  const [done,setDone]=useState({}); // key: "topicId::subIndex" or "topicId::subIndex::weekIndex"
  const [kl,setKl]=useState([]);
  const [cw,setCw]=useState(0);
  const [repOn,setRepOn]=useState(true);
  const [expanded,setExpanded]=useState({});
  const [learnSubject,setLearnSubject]=useState(LEARN_MOCK.subjects[0]?.id||"");
  const [learnTopic,setLearnTopic]=useState(LEARN_MOCK.subjects[0]?.topics?.[0]?.id||"");
  const [learnMethod,setLearnMethod]=useState("quiz");
  const [learnFiles,setLearnFiles]=useState([]);
  const [learnLoading,setLearnLoading]=useState(false);
  const [learnError,setLearnError]=useState("");
  const [learnResult,setLearnResult]=useState(null);

  useEffect(()=>{try{const s=window.localStorage?.getItem?.("ep6");if(s){const d=JSON.parse(s);if(d.cfg)setCfg(d.cfg);if(d.done)setDone(d.done);if(d.kl)setKl(d.kl);if(d.repKey)setRepKey(d.repKey);if(d.repSch)setRepSch(d.repSch);if(d.step>=4)setStep(4);}}catch(e){}},[]);
  useEffect(()=>{if(step>=4){try{window.localStorage?.setItem?.("ep6",JSON.stringify({cfg,done,kl,repKey,repSch,step}));}catch(e){}}},[cfg,done,kl,repKey,repSch,step]);

  const tw=useMemo(()=>cfg.exam?wb(cfg.start,cfg.exam):0,[cfg.start,cfg.exam]);
  const bw=Math.max(1,Math.round(tw*0.12));
  const ew=tw-bw;
  const hpw=useMemo(()=>ew>0?Math.round(totH/ew*10)/10:0,[ew]);
  const hpd=useMemo(()=>hpw>0?Math.round(hpw/6*10)/10:0,[hpw]);
  const wl=useMemo(()=>{
    if(hpd<=4)return{l:"Entspannt",c:"#4A6741",d:"Genügend Zeit. Nutze Puffer für Klausuren."};
    if(hpd<=6)return{l:"Machbar",c:"#8B7D2E",d:"Gutes Pensum. Plane feste Lerntage."};
    if(hpd<=8)return{l:"Ambitioniert",c:"#C4722B",d:"Intensiv. Achte auf freie Tage."};
    return{l:"Sehr intensiv",c:"#8B2E2E",d:"Startdatum vorziehen? >8h/Tag ist schwer durchzuhalten."};
  },[hpd]);
  const dl=useMemo(()=>cfg.exam?Math.max(0,Math.round((new Date(cfg.exam)-new Date())/86400000)):0,[cfg.exam]);

  // ─── REP-DRIVEN WEEKLY PLAN ───
  const plan=useMemo(()=>{
    if(!cfg.exam||ew<4)return[];
    const weeks=[];
    // Build all weeks
    for(let wi=0;wi<tw;wi++){
      const start=aw(cfg.start,wi);
      const month=gm(start);
      const repEntry=repSch.find(r=>r.month===month)||null;
      weeks.push({week:wi+1,start,month,rep:repEntry,buf:wi>=ew});
    }
    // For each month-group, find matched topics and distribute subtopics across weeks
    const monthGroups={};
    weeks.filter(w=>!w.buf).forEach(w=>{
      if(!monthGroups[w.month])monthGroups[w.month]=[];
      monthGroups[w.month].push(w);
    });

    const weekItems={}; // weekIndex -> [{topicId, topicName, subText, subIdx, sCol, sName, lit, depth}]
    Object.entries(monthGroups).forEach(([month,mWeeks])=>{
      const repEntry=repSch.find(r=>r.month===+month);
      const matched=matchTopics(repEntry);
      // Collect all subtopics from matched topics
      const allSubs=[];
      matched.forEach(t=>{
        (t.sub||[]).forEach((s,si)=>{
          allSubs.push({topicId:t.id,topicName:t.name,subText:s,subIdx:si,sCol:t.sCol,sName:t.sName,lit:t.lit,depth:t.depth});
        });
      });
      // Distribute evenly across weeks of this month
      const perWeek=Math.max(1,Math.ceil(allSubs.length/mWeeks.length));
      mWeeks.forEach((w,i)=>{
        weekItems[w.week]=allSubs.slice(i*perWeek,(i+1)*perWeek);
      });
    });

    return weeks.map(w=>({...w,items:weekItems[w.week]||[]}));
  },[cfg,tw,ew,repSch]);

  // Completion
  const cr=useMemo(()=>{const t=plan.reduce((s,w)=>s+w.items.length,0);const d=Object.keys(done).filter(k=>k.includes("::w")&&done[k]).length;return t>0?Math.round(d/t*100):0;},[done,plan]);
  const sp=useMemo(()=>SYLLABUS.map(sx=>{
    const topicIds=sx.topics.map(t=>t.id);
    let t=0,d=0;
    plan.forEach(w=>{w.items.filter(it=>topicIds.includes(it.topicId)).forEach(it=>{t++;if(done[`${it.topicId}::${it.subIdx}::w${w.week}`])d++;});});
    return{...sx,t,d,p:t>0?Math.round(d/t*100):0};
  }),[done,plan]);
  const ka=useMemo(()=>kl.length?(kl.reduce((s,k)=>s+k.pt,0)/kl.length).toFixed(1):null,[kl]);
  const learnSubjectData=useMemo(()=>LEARN_MOCK.subjects.find(s=>s.id===learnSubject)||LEARN_MOCK.subjects[0], [learnSubject]);
  const learnTopics=useMemo(()=>learnSubjectData?.topics||[],[learnSubjectData]);
  const learnTopicData=useMemo(()=>learnTopics.find(t=>t.id===learnTopic)||learnTopics[0], [learnTopics,learnTopic]);
  const learnSubjectLabel=learnSubjectData?.label||"Unbekannt";
  const learnTopicLabel=learnTopicData?.label||"Unbekannt";

  useEffect(()=>{
    if(!learnTopics.length) return;
    if(!learnTopic||!learnTopics.some(t=>t.id===learnTopic)) setLearnTopic(learnTopics[0].id);
  },[learnTopic,learnTopics]);

  // Stoff completion (global, not week-specific)
  const stoffDone=useMemo(()=>{const m={};Object.keys(done).filter(k=>done[k]).forEach(k=>{const[tid,si]=k.split("::");m[`${tid}::${si}`]=true;});return m;},[done]);
  const toggleStoff=(tid,si)=>{const key=`${tid}::${si}`;setDone(prev=>({...prev,[key]:!prev[key]}));};
  const toggleWeekItem=(topicId,subIdx,weekNum)=>{
    const weekKey=`${topicId}::${subIdx}::w${weekNum}`;
    const stoffKey=`${topicId}::${subIdx}`;
    setDone(prev=>({...prev,[weekKey]:!prev[weekKey],[stoffKey]:!prev[weekKey]}));
  };
  const onLearnFiles=async (ev)=>{
    const picked=Array.from(ev.target.files||[]).filter(f=>f.type==="application/pdf"||f.name.toLowerCase().endsWith(".pdf"));
    if(!picked.length) return;
    const file=picked[0];
    setLearnError("");
    setLearnLoading(true);
    setLearnResult(null);
    setLearnFiles(prev=>[...prev,file]);
    try{
      const body=new FormData();
      body.append("file",file);
      body.append("subject",learnSubjectLabel);
      body.append("topic",learnTopicLabel);
      const res=await fetch("/api/analyze-document",{method:"POST",body});
      const json=await res.json();
      if(!res.ok) throw new Error(json?.error||"Analyse fehlgeschlagen.");
      setLearnResult(json?.data||null);
    }catch(err){
      setLearnError(err?.message||"Analyse fehlgeschlagen.");
    }finally{
      setLearnLoading(false);
    }
    ev.target.value="";
  };

  function RepBar({rep}){
    if(!rep||!repOn||!rep.tracks)return null;
    return(<div style={S.repBar}><div style={S.repH}><span>📚</span><span style={S.repT}>Rep · {rep.label}</span></div><div style={S.repG}>{Object.entries(TL).map(([k,l])=><div key={k} style={S.repI}><span style={{...S.repD,background:TC[k]}}></span><span style={S.repL}>{l}</span><span style={S.repV}>{rep.tracks[k]||"–"}</span></div>)}</div></div>);
  }

  const updateRep=(mi,track,val)=>{setRepSch(prev=>{const n=[...prev];const e=n.find(r=>r.month===mi);if(e)e.tracks={...e.tracks,[track]:val};else n.push({month:mi,label:MN[mi],tracks:{zivilI:"",zivilII:"",oeffR:"",strafR:"",[track]:val}});return n;});};
  const resetAll=()=>{try{window.localStorage?.removeItem?.("ep6");}catch(e){}setStep(0);setDone({});setKl([]);setCfg({start:new Date().toISOString().split("T")[0],exam:""});};

  // ─── ONBOARDING ───
  if(step<4){return(
    <div style={S.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F1EB}input,select,textarea,button{font-family:'DM Sans',sans-serif}`}</style>
      <div style={{maxWidth:560,margin:"60px auto",textAlign:"center"}}>
        <h1 style={{...S.logo,fontSize:36,marginBottom:8}}>Examensplaner</h1>
        <p style={{fontSize:13,color:"#8A8279",marginBottom:32,letterSpacing:"1px",textTransform:"uppercase"}}>Pflichtfachexamen · Lernplan</p>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:32}}>{[0,1,2,3].map(i=><div key={i} style={{width:40,height:4,borderRadius:2,background:i<=step?"#4A6741":"#D9D2C7"}}></div>)}</div>

        {step===0&&<div style={S.card}><h2 style={S.cT}>Willkommen</h2><p style={{fontSize:14,color:"#5C564E",lineHeight:1.7,marginBottom:20}}>Dein individueller Lernplan fürs Erste Staatsexamen – basierend auf dem JAG-Pflichtfachstoff, synchronisiert mit deinem Rep. Der Plan richtet sich nach dem Rep-Kursablauf: Jede Woche zeigt nur den Stoff, der gerade im Rep behandelt wird.</p><button onClick={()=>setStep(1)} style={S.btn}>Los geht's →</button></div>}

        {step===1&&<div style={{...S.card,textAlign:"left"}}><h2 style={S.cT}>Deine Zeitachse</h2><p style={S.cS}>Wann startest du, wann ist dein Examenstermin?</p>
          <div style={S.g2}>
            <label style={S.lb}><span style={S.lt}>Startdatum</span><input type="date" value={cfg.start} onChange={e=>setCfg({...cfg,start:e.target.value})} style={S.inp}/></label>
            <label style={S.lb}><span style={S.lt}>Examenstermin</span><input type="date" value={cfg.exam} onChange={e=>setCfg({...cfg,exam:e.target.value})} style={S.inp}/></label>
          </div>
          {cfg.exam&&ew>=4&&<div style={{marginTop:20}}>
            <div style={S.prev}>{[["Wochen",tw],["Effektiv",ew],["Puffer",bw],["Stoff",totH+"h"]].map(([l,v])=><div key={l} style={S.pI}><span style={S.pL}>{l}</span><span style={S.pV}>{v}</span></div>)}</div>
            <div style={{marginTop:16,padding:20,background:wl.c+"0A",border:`1px solid ${wl.c}30`,borderRadius:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div><span style={{fontSize:11,color:"#8A8279",textTransform:"uppercase",display:"block",marginBottom:2}}>Benötigtes Pensum</span><span style={{fontFamily:"'Instrument Serif',serif",fontSize:32,color:wl.c,lineHeight:1}}>{hpw} h/Wo</span></div>
                <div style={{textAlign:"right"}}><span style={{fontSize:11,color:"#8A8279",textTransform:"uppercase",display:"block",marginBottom:2}}>Pro Lerntag</span><span style={{fontFamily:"'Instrument Serif',serif",fontSize:32,color:wl.c,lineHeight:1}}>{hpd} h</span></div>
              </div>
              <span style={{fontSize:12,fontWeight:600,color:wl.c}}>{wl.l}</span><span style={{fontSize:11,color:"#8A8279"}}> (6 Lerntage/Woche)</span>
              <p style={{fontSize:12,color:"#5C564E",marginTop:4}}>{wl.d}</p>
            </div>
          </div>}
          <div style={{display:"flex",gap:8,marginTop:20}}>
            <button onClick={()=>setStep(0)} style={S.btnSec}>←</button>
            <button disabled={!cfg.exam||ew<4} onClick={()=>setStep(2)} style={{...S.btn,flex:1,opacity:(!cfg.exam||ew<4)?0.4:1}}>Weiter →</button>
          </div>
        </div>}

        {step===2&&<div style={{...S.card,textAlign:"left"}}><h2 style={S.cT}>Dein Repetitorium</h2><p style={S.cS}>Der Lernplan richtet sich nach dem Kursablauf deines Reps.</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{Object.entries(REP_PRESETS).map(([k,r])=><div key={k} onClick={()=>{setRepKey(k);setRepSch(r.schedule);}} style={{...S.repOpt,borderColor:repKey===k?"#4A6741":"#D9D2C7",background:repKey===k?"#4A674108":"#fff"}}>
            <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${repKey===k?"#4A6741":"#C5BDB2"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{repKey===k&&<div style={{width:10,height:10,borderRadius:"50%",background:"#4A6741"}}></div>}</div>
            <div><strong style={{fontSize:14}}>{r.name}</strong>{r.schedule.length>0?<span style={{fontSize:11,color:"#8A8279",display:"block"}}>Kursplan hinterlegt</span>:<span style={{fontSize:11,color:"#8B7D2E",display:"block"}}>{k==="custom"?"Eigenen Plan eintragen":"Im nächsten Schritt eintragen"}</span>}</div>
          </div>)}</div>
          <div style={{display:"flex",gap:8,marginTop:16}}><button onClick={()=>setStep(1)} style={S.btnSec}>←</button><button onClick={()=>setStep(3)} style={{...S.btn,flex:1}}>Weiter →</button></div>
        </div>}

        {step===3&&<div style={{...S.card,textAlign:"left"}}><h2 style={S.cT}>Rep-Kursplan</h2><p style={S.cS}>Welcher Stoff wird in welchem Monat behandelt?</p>
          <div style={{maxHeight:400,overflowY:"auto",border:"1px solid #EAE4DB",borderRadius:8}}>
            <div style={{display:"grid",gridTemplateColumns:"70px repeat(4,1fr)",padding:"8px",background:"#F5F1EB",position:"sticky",top:0,zIndex:1}}>
              <span style={{fontSize:10,fontWeight:600}}>Monat</span>{Object.entries(TL).map(([k,l])=><span key={k} style={{fontSize:10,fontWeight:600,color:TC[k]}}>{l}</span>)}
            </div>
            {[3,4,5,6,7,8,9,10,11,12,1,2].map(m=>{const e=repSch.find(r=>r.month===m)||{tracks:{}};return(
              <div key={m} style={{display:"grid",gridTemplateColumns:"70px repeat(4,1fr)",padding:"4px 8px",borderTop:"1px solid #EAE4DB",gap:4}}>
                <span style={{fontSize:12,fontWeight:600,paddingTop:6}}>{MN[m]}</span>
                {["zivilI","zivilII","oeffR","strafR"].map(t=><input key={t} type="text" value={e.tracks?.[t]||""} onChange={ev=>updateRep(m,t,ev.target.value)} placeholder="—" style={{...S.inp,fontSize:11,padding:"5px 6px"}}/>)}
              </div>);})}
          </div>
          <div style={{display:"flex",gap:8,marginTop:16}}><button onClick={()=>setStep(2)} style={S.btnSec}>←</button><button onClick={()=>setStep(4)} style={{...S.btn,flex:1}}>Plan erstellen →</button></div>
        </div>}
      </div>
    </div>
  );}

  // ─── MAIN APP ───
  return(
    <div style={S.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F1EB}input,select,textarea,button{font-family:'DM Sans',sans-serif}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#C5BDB2;border-radius:2px}`}</style>

      <header style={S.hdr}>
        <div><h1 style={S.logo}>Examensplaner</h1><p style={S.sub}>{REP_PRESETS[repKey]?.name||"Plan"} · {hpw} h/Wo · {hpd} h/Tag</p></div>
        <div style={{textAlign:"right"}}><span style={S.cN}>{dl}</span><span style={S.cL}>Tage</span></div>
      </header>

      <nav style={S.nav}>{[["plan","Zeitplan"],["weekly","Review"],["klausuren","Klausuren"],["stoff","Stoff"],["lernen","Lernen"],["dashboard","Dashboard"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{...S.nB,...(view===v?S.nA:{})}}>{l}</button>)}</nav>

      <main>
        {/* ── ZEITPLAN ── */}
        {view==="plan"&&<div>
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:14}}><input type="checkbox" checked={repOn} onChange={e=>setRepOn(e.target.checked)}/><span style={{fontSize:12,color:"#5C564E"}}>📚 Rep-Sync anzeigen</span></label>
          {plan.map((w,wi)=>{
            const itemsByTopic={};
            w.items.forEach(it=>{if(!itemsByTopic[it.topicId])itemsByTopic[it.topicId]={...it,subs:[]};itemsByTopic[it.topicId].subs.push(it);});
            return(
            <div key={wi} style={{...S.wC,borderLeft:`3px solid ${w.buf?"#C5BDB2":"#4A6741"}`,opacity:w.buf?0.6:1}}>
              <div style={S.wH}><div><span style={S.wN}>W{w.week}</span><span style={S.wD}>{fd(w.start)}</span></div>{w.buf&&<span style={{fontSize:11,color:"#8A8279",fontStyle:"italic"}}>Puffer</span>}</div>
              <RepBar rep={w.rep}/>
              {Object.values(itemsByTopic).map(group=>(
                <div key={group.topicId} style={{marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:group.sCol,flexShrink:0}}></span>
                    <span style={{fontSize:12,fontWeight:600,color:group.sCol}}>{group.topicName}</span>
                    <span style={{fontSize:10,color:"#8A8279"}}>{group.sName}</span>
                    <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:600,background:group.depth==="R"?"#8B2E2E15":"#4A674115",color:group.depth==="R"?"#8B2E2E":"#4A6741",marginLeft:"auto"}}>{group.depth}</span>
                  </div>
                  {group.subs.map((it,si)=>(
                    <div key={si} style={{paddingLeft:20,fontSize:11,color:"#5C564E",padding:"2px 0 2px 20px"}}>• {it.subText}</div>
                  ))}
                </div>
              ))}
              {w.items.length===0&&!w.buf&&<p style={{fontSize:11,color:"#8A8279",fontStyle:"italic"}}>Kein Rep-Stoff für diesen Monat hinterlegt</p>}
            </div>);
          })}
        </div>}

        {/* ── WEEKLY REVIEW ── */}
        {view==="weekly"&&<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:16}}>
            <button onClick={()=>setCw(Math.max(0,cw-1))} style={S.cBtn}>←</button>
            <span style={{fontSize:14,fontWeight:500}}>Woche {cw+1} / {plan.length}</span>
            <button onClick={()=>setCw(Math.min(plan.length-1,cw+1))} style={S.cBtn}>→</button>
          </div>
          {plan[cw]&&(()=>{
            const w=plan[cw];
            const dn=w.items.filter(it=>done[`${it.topicId}::${it.subIdx}::w${w.week}`]).length;
            const pct=w.items.length>0?Math.round(dn/w.items.length*100):0;
            const itemsByTopic={};
            w.items.forEach(it=>{if(!itemsByTopic[it.topicId])itemsByTopic[it.topicId]={...it,subs:[]};itemsByTopic[it.topicId].subs.push(it);});
            return(<div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div><h2 style={S.cT}>Woche {w.week}</h2><p style={S.cS}>{fd(w.start)} · {MN[w.month]}</p></div>
                <div style={{textAlign:"right"}}><span style={{fontSize:28,fontFamily:"'Instrument Serif',serif",color:pct===100?"#4A6741":pct>50?"#8B7D2E":"#8B2E2E",display:"block",lineHeight:1}}>{pct}%</span><span style={{fontSize:10,color:"#8A8279"}}>erledigt</span></div>
              </div>
              <RepBar rep={w.rep}/>
              {w.items.length===0?<p style={{fontSize:12,color:"#8A8279",fontStyle:"italic"}}>{w.buf?"Pufferwoche":"Kein Rep-Stoff hinterlegt"}</p>:(
                <div>{Object.values(itemsByTopic).map(group=>(
                  <div key={group.topicId} style={{marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:group.sCol}}></span>
                      <span style={{fontSize:13,fontWeight:600,color:group.sCol}}>{group.topicName}</span>
                      {group.lit&&<span style={{fontSize:10,color:"#8A8279",marginLeft:"auto"}}>📖 {group.lit}</span>}
                    </div>
                    {group.subs.map((it,si)=>{
                      const key=`${it.topicId}::${it.subIdx}::w${w.week}`;const isDone=done[key];
                      return(<div key={si} onClick={()=>toggleWeekItem(it.topicId,it.subIdx,w.week)} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:6,cursor:"pointer",background:isDone?"#4A674110":"transparent",borderBottom:"1px solid #F0ECE5"}}>
                        <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isDone?"#4A6741":"#C5BDB2"}`,background:isDone?"#4A6741":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isDone&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
                        <span style={{fontSize:12,flex:1,textDecoration:isDone?"line-through":"none",opacity:isDone?0.5:1}}>{it.subText}</span>
                      </div>);
                    })}
                  </div>
                ))}</div>
              )}
            </div>);
          })()}
        </div>}

        {/* ── KLAUSUREN ── */}
        {view==="klausuren"&&<div>
          <div style={S.card}><h2 style={S.cT}>Klausur eintragen</h2><KlausurForm onAdd={k=>setKl([...kl,k])}/></div>
          {kl.length>0&&<div style={{...S.card,marginTop:12}}>
            <h2 style={S.cT}>Verlauf</h2>
            <div style={{marginBottom:12,padding:10,background:"#F5F1EB",borderRadius:6,textAlign:"center"}}><span style={{fontSize:10,color:"#5C564E"}}>Ø Gesamt</span><span style={{display:"block",fontSize:24,fontFamily:"'Instrument Serif',serif",color:ka>=9?"#4A6741":ka>=4?"#8B7D2E":"#8B2E2E"}}>{ka}</span><span style={{fontSize:10,color:"#8A8279"}}>{kl.length} Klausuren</span></div>
            {kl.slice().reverse().map((k,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F0ECE5"}}><div><strong style={{fontSize:13}}>{k.thema}</strong><span style={{fontSize:11,color:"#8A8279"}}> · {k.rg} · {k.datum}</span></div><span style={{fontSize:20,fontFamily:"'Instrument Serif',serif",color:k.pt>=9?"#4A6741":k.pt>=4?"#8B7D2E":"#8B2E2E"}}>{k.pt}</span></div>)}
          </div>}
        </div>}

        {/* ── STOFF (checkable subtopics) ── */}
        {view==="stoff"&&<div style={S.card}>
          <h2 style={S.cT}>Prüfungsstoff</h2>
          <p style={S.cS}>{allT.length} Themen · {totSub} Lerneinheiten · {totH}h</p>
          {SYLLABUS.map(sx=>{
            const sxSubs=sx.topics.reduce((s,t)=>s+(t.sub?.length||0),0);
            const sxDone=sx.topics.reduce((s,t)=>s+(t.sub||[]).filter((_,si)=>stoffDone[`${t.id}::${si}`]).length,0);
            const sxPct=sxSubs>0?Math.round(sxDone/sxSubs*100):0;
            return(
            <div key={sx.id} style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <h3 style={{fontSize:15,fontWeight:600,color:sx.color,fontFamily:"'Instrument Serif',serif"}}>{sx.name}</h3>
                <span style={{fontSize:12,color:sx.color,fontWeight:500}}>{sxPct}% ({sxDone}/{sxSubs})</span>
              </div>
              <div style={S.pBar}><div style={{...S.pFill,width:sxPct+"%",background:sx.color}}></div></div>
              <div style={{marginTop:8}}>
                {sx.topics.map(t=>{
                  const tDone=(t.sub||[]).filter((_,si)=>stoffDone[`${t.id}::${si}`]).length;
                  const tTotal=t.sub?.length||0;
                  const isOpen=expanded[t.id];
                  return(
                  <div key={t.id} style={{marginBottom:2}}>
                    <div onClick={()=>setExpanded(p=>({...p,[t.id]:!p[t.id]}))} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:6,cursor:"pointer",background:"#FAFAF8",border:"1px solid #EAE4DB"}}>
                      <span style={{transform:isOpen?"rotate(90deg)":"rotate(0)",display:"inline-block",transition:"transform 0.2s",fontSize:10,color:"#8A8279"}}>▶</span>
                      <span style={{fontSize:12,fontWeight:500,flex:1}}>{t.name}</span>
                      <span style={{fontSize:10,color:tDone===tTotal&&tTotal>0?"#4A6741":"#8A8279",fontWeight:500}}>{tDone}/{tTotal}</span>
                      <span style={{fontSize:10,color:"#8A8279"}}>{t.hours}h</span>
                      <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,fontWeight:600,background:t.depth==="R"?"#8B2E2E15":"#4A674115",color:t.depth==="R"?"#8B2E2E":"#4A6741"}}>{t.depth}</span>
                    </div>
                    {isOpen&&<div style={{borderLeft:"2px solid #EAE4DB",marginLeft:12,marginTop:4,paddingLeft:12}}>
                      {(t.sub||[]).map((s,si)=>{
                        const key=`${t.id}::${si}`;const isDone=stoffDone[key];
                        return(<div key={si} onClick={()=>toggleStoff(t.id,si)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 4px",cursor:"pointer",borderBottom:"1px solid #F5F1EB"}}>
                          <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${isDone?"#4A6741":"#D9D2C7"}`,background:isDone?"#4A6741":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isDone&&<span style={{color:"#fff",fontSize:10}}>✓</span>}</div>
                          <span style={{fontSize:11,color:isDone?"#8A8279":"#5C564E",textDecoration:isDone?"line-through":"none"}}>{s}</span>
                        </div>);
                      })}
                      {t.lit&&<div style={{fontSize:11,color:"#8B7D2E",background:"#FBF8F0",padding:"6px 10px",borderRadius:6,marginTop:6}}>📖 <em>{t.lit}</em></div>}
                    </div>}
                  </div>);
                })}
              </div>
            </div>);})}
        </div>}

        {/* ── LERNEN ── */}
        {view==="lernen"&&<div style={S.card}>
          <h2 style={S.cT}>Lernen</h2>
          <p style={S.cS}>PDF hochladen und automatisch durch die Dokumenten-KI analysieren lassen.</p>
          <div style={S.g2}>
            <label style={S.lb}>
              <span style={S.lt}>Rechtsgebiet</span>
              <select value={learnSubject} onChange={e=>setLearnSubject(e.target.value)} style={S.inp}>
                {LEARN_MOCK.subjects.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label style={S.lb}>
              <span style={S.lt}>Thema</span>
              <select value={learnTopicData?.id||""} onChange={e=>setLearnTopic(e.target.value)} style={S.inp}>
                {learnTopics.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
          </div>

          <div style={{marginTop:14,padding:12,border:"1px dashed #C5BDB2",borderRadius:8,background:"#FAFAF8"}}>
            <label style={{...S.lb,gap:8}}>
              <span style={S.lt}>PDF-Dateien</span>
              <input type="file" accept="application/pdf,.pdf" multiple onChange={onLearnFiles} style={S.inp}/>
            </label>
            {learnFiles.length===0?<p style={{fontSize:11,color:"#8A8279",marginTop:8}}>Noch keine Dateien hochgeladen.</p>:(
              <div style={{marginTop:8,maxHeight:130,overflowY:"auto"}}>
                {learnFiles.map((f,i)=><div key={`${f.name}-${i}`} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"5px 0",borderBottom:"1px solid #EAE4DB"}}><span>📄 {f.name}</span><span style={{color:"#8A8279"}}>{Math.round(f.size/1024)} KB</span></div>)}
              </div>
            )}
            {learnLoading&&<p style={{fontSize:11,color:"#2E5E8B",marginTop:8}}>Analyse laeuft ...</p>}
            {learnError&&<p style={{fontSize:11,color:"#8B2E2E",marginTop:8}}>{learnError}</p>}
          </div>

          <div style={{marginTop:16}}>
            <span style={{...S.lt,display:"block",marginBottom:8}}>Lernmethode</span>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[["quiz","Quiz"],["cards","Karteikarten"],["schemata","Schemata"],["review","Wiederholung"]].map(([k,label])=>(
                <button key={k} onClick={()=>setLearnMethod(k)} style={{...S.btnSec,padding:"9px 8px",fontSize:12,borderColor:learnMethod===k?"#4A6741":"#D9D2C7",color:learnMethod===k?"#4A6741":"#5C564E",background:learnMethod===k?"#4A674110":"transparent"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginTop:14,padding:12,background:"#F5F1EB",borderRadius:8,border:"1px solid #EAE4DB"}}>
            <p style={{fontSize:12,color:"#5C564E"}}>
              Aktiv: <strong>{learnTopicData?.label||"—"}</strong> · Methode:{" "}
              <strong>{learnMethod==="quiz"?"Quiz":learnMethod==="cards"?"Karteikarten":learnMethod==="schemata"?"Schemata":"Wiederholung"}</strong>
            </p>
          </div>

          <div style={{marginTop:12,padding:12,background:"#fff",borderRadius:8,border:"1px solid #EAE4DB"}}>
            <span style={{...S.lt,display:"block",marginBottom:8}}>Erzeugte Inhalte</span>
            {!learnResult&&!learnLoading?<p style={{fontSize:12,color:"#8A8279"}}>Lade eine PDF hoch, um Inhalte zu erzeugen.</p>:null}
            {learnResult&&<div>
              <div style={{marginBottom:10,padding:"8px 10px",background:"#FAFAF8",borderRadius:6,border:"1px solid #F0ECE5"}}>
                <span style={{fontSize:11,fontWeight:600,color:"#5C564E",display:"block",marginBottom:4}}>Zusammenfassung</span>
                <p style={{fontSize:12,color:"#5C564E",lineHeight:1.5}}>{learnResult.summary||"Keine Zusammenfassung."}</p>
              </div>

              {learnMethod==="quiz"&&<div>
                {(learnResult.quizQuestions||[]).map((q,idx)=><div key={`q-${idx}`} style={{fontSize:12,color:"#5C564E",padding:"8px 6px",borderBottom:"1px solid #F0ECE5"}}>
                  <strong>{idx+1}. {q.question}</strong>
                  <div style={{fontSize:11,color:"#8A8279",marginTop:3}}>{(q.options||[]).join(" · ")}</div>
                </div>)}
              </div>}

              {learnMethod==="cards"&&<div>
                {(learnResult.flashcards||[]).map((c,idx)=><div key={`c-${idx}`} style={{fontSize:12,color:"#5C564E",padding:"8px 6px",borderBottom:"1px solid #F0ECE5"}}>
                  <strong>Vorderseite:</strong> {c.front}<br/>
                  <strong>Rueckseite:</strong> {c.back}
                </div>)}
              </div>}

              {learnMethod==="schemata"&&<div>
                {(learnResult.examSchemas||[]).map((s,idx)=><div key={`s-${idx}`} style={{fontSize:12,color:"#5C564E",padding:"8px 6px",borderBottom:"1px solid #F0ECE5"}}>
                  <strong>{s.title}</strong>
                  <div style={{fontSize:11,color:"#8A8279",marginTop:3}}>{(s.steps||[]).join(" -> ")}</div>
                </div>)}
              </div>}

              {learnMethod==="review"&&<div>
                {(learnResult.openQuestions||[]).map((q,idx)=><div key={`r-${idx}`} style={{fontSize:12,color:"#5C564E",padding:"8px 6px",borderBottom:"1px solid #F0ECE5"}}>
                  {idx+1}. {q}
                </div>)}
              </div>}
            </div>}
          </div>
        </div>}

        {/* ── DASHBOARD ── */}
        {view==="dashboard"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {[["Fortschritt",cr+"%","#2C2824"],["Tage",dl,dl<60?"#8B2E2E":"#2E5E8B"],["Ø Klausuren",ka??"–",ka>=9?"#4A6741":ka>=4?"#8B7D2E":"#8B2E2E"],["h/Woche",hpw,wl.c]].map(([l,v,c])=><div key={l} style={S.dC}><span style={S.dL}>{l}</span><span style={{...S.dB,color:c}}>{v}</span></div>)}
          </div>
          <div style={{...S.card,marginTop:12}}>
            <h2 style={S.cT}>Fortschritt pro Rechtsgebiet</h2>
            {sp.map(s=><div key={s.id} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,fontWeight:500,color:s.color}}>{s.name}</span><span style={{fontSize:11,color:"#8A8279"}}>{s.p}% ({s.d}/{s.t})</span></div><div style={S.pBar}><div style={{...S.pFill,width:s.p+"%",background:s.color}}></div></div></div>)}
          </div>
          <div style={{...S.card,marginTop:12,textAlign:"center"}}><button onClick={resetAll} style={{...S.btnSec,fontSize:12}}>🔄 Plan zurücksetzen</button></div>
        </div>}
      </main>
      <footer style={S.ft}><button onClick={()=>setStep(0)} style={{background:"none",border:"none",fontSize:12,color:"#8A8279",cursor:"pointer"}}>⚙ Neu einrichten</button></footer>
    </div>
  );
}

function KlausurForm({onAdd}){
  const [f,sf]=useState({rg:"Strafrecht",thema:"",pt:0,datum:new Date().toISOString().split("T")[0]});
  return(<div style={S.g2}>
    <label style={S.lb}><span style={S.lt}>Rechtsgebiet</span><select value={f.rg} onChange={e=>sf({...f,rg:e.target.value})} style={S.inp}>{SYLLABUS.map(s=><option key={s.id}>{s.name}</option>)}</select></label>
    <label style={S.lb}><span style={S.lt}>Thema</span><input type="text" placeholder="z.B. Irrtumslehre" value={f.thema} onChange={e=>sf({...f,thema:e.target.value})} style={S.inp}/></label>
    <label style={S.lb}><span style={S.lt}>Punkte (0–18)</span><input type="number" min={0} max={18} value={f.pt} onChange={e=>sf({...f,pt:e.target.value})} style={S.inp}/></label>
    <label style={S.lb}><span style={S.lt}>Datum</span><input type="date" value={f.datum} onChange={e=>sf({...f,datum:e.target.value})} style={S.inp}/></label>
    <button onClick={()=>{if(!f.thema)return;onAdd({...f,pt:+f.pt});sf({rg:"Strafrecht",thema:"",pt:0,datum:new Date().toISOString().split("T")[0]});}} style={{...S.btn,gridColumn:"1/-1"}}>Speichern</button>
  </div>);
}

const S={
  wrap:{fontFamily:"'DM Sans',sans-serif",maxWidth:820,margin:"0 auto",padding:"20px 16px",minHeight:"100vh",background:"#F5F1EB",color:"#2C2824"},
  hdr:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,padding:"16px 0",borderBottom:"1px solid #D9D2C7"},
  logo:{fontFamily:"'Instrument Serif',serif",fontSize:30,fontWeight:400,letterSpacing:"-0.5px"},
  sub:{fontSize:10,color:"#8A8279",marginTop:3,letterSpacing:"1px",textTransform:"uppercase"},
  cN:{fontFamily:"'Instrument Serif',serif",fontSize:40,color:"#4A6741",display:"block",lineHeight:1},
  cL:{fontSize:10,color:"#8A8279",textTransform:"uppercase",letterSpacing:"1px"},
  nav:{display:"flex",gap:3,marginBottom:20,background:"#EAE4DB",borderRadius:10,padding:3},
  nB:{flex:1,padding:"10px 6px",border:"none",background:"transparent",borderRadius:8,fontSize:12,fontWeight:500,color:"#8A8279",cursor:"pointer"},
  nA:{background:"#fff",color:"#2C2824",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"},
  card:{background:"#fff",borderRadius:12,padding:22,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  cT:{fontFamily:"'Instrument Serif',serif",fontSize:21,fontWeight:400,marginBottom:3},
  cS:{fontSize:12,color:"#8A8279",marginBottom:16},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  lb:{display:"flex",flexDirection:"column",gap:5},
  lt:{fontSize:11,fontWeight:500,color:"#5C564E",textTransform:"uppercase",letterSpacing:"0.5px"},
  inp:{padding:"9px 11px",border:"1px solid #D9D2C7",borderRadius:8,fontSize:14,background:"#FAFAF8",color:"#2C2824",outline:"none"},
  prev:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:14,background:"#F5F1EB",borderRadius:8},
  pI:{display:"flex",flexDirection:"column",alignItems:"center"},
  pL:{fontSize:10,color:"#8A8279",textTransform:"uppercase"},
  pV:{fontFamily:"'Instrument Serif',serif",fontSize:26,color:"#4A6741"},
  btn:{padding:"13px 24px",background:"#4A6741",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer",width:"100%"},
  btnSec:{padding:"10px 20px",background:"transparent",color:"#5C564E",border:"1px solid #D9D2C7",borderRadius:8,fontSize:13,cursor:"pointer"},
  wC:{background:"#fff",borderRadius:10,padding:14,marginBottom:6,boxShadow:"0 1px 2px rgba(0,0,0,0.03)"},
  wH:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6},
  wN:{fontWeight:600,fontSize:13,marginRight:8},
  wD:{fontSize:11,color:"#8A8279"},
  repBar:{background:"#F8F5F0",borderRadius:8,padding:10,marginBottom:8,border:"1px solid #EAE4DB"},
  repH:{display:"flex",alignItems:"center",gap:6,marginBottom:6},
  repT:{fontSize:11,fontWeight:600,color:"#5C564E"},
  repG:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4},
  repI:{display:"flex",alignItems:"center",gap:3,fontSize:10},
  repD:{width:6,height:6,borderRadius:"50%",flexShrink:0},
  repL:{fontWeight:600,color:"#5C564E"},
  repV:{color:"#8A8279",fontSize:10},
  cBtn:{width:34,height:34,borderRadius:"50%",border:"1px solid #D9D2C7",background:"#fff",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  dC:{background:"#fff",borderRadius:10,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  dL:{fontSize:10,color:"#8A8279",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:2},
  dB:{fontFamily:"'Instrument Serif',serif",fontSize:36,display:"block",lineHeight:1.1},
  pBar:{height:5,background:"#EAE4DB",borderRadius:3,marginTop:5,overflow:"hidden"},
  pFill:{height:"100%",borderRadius:3,transition:"width 0.5s"},
  ft:{marginTop:28,paddingTop:14,borderTop:"1px solid #D9D2C7",textAlign:"center"},
  repOpt:{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:10,border:"2px solid",cursor:"pointer",transition:"all 0.2s"},
};
