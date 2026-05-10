import { useState, useEffect, useRef } from "react";
import { X, FileText, Shield, Cookie, TrendingUp, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type DocKey = "terms" | "privacy" | "cookies" | "affiliate";
type Lang = "tr" | "en";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: DocKey;
  isDarkMode: boolean;
  language?: Lang;
}

// ─── Document content ─────────────────────────────────────────────────────────

const DOCS: Record<
  DocKey,
  {
    icon: React.ReactNode;
    title: { tr: string; en: string };
    sections: { heading: { tr: string; en: string }; body: { tr: string; en: string } }[];
  }
> = {
  terms: {
    icon: <FileText className="w-4 h-4" />,
    title: { tr: "Kullanıcı Sozlesmesi", en: "User Agreement" },
    sections: [
      {
        heading: { tr: "Madde 1 — Taraflar, Kapsam ve Kabul", en: "Article 1 — Parties, Scope and Acceptance" },
        body: {
          tr: "Isbu GENODDS Kullanici Sozlesmesi, GENODDS ('Sirket') tarafindan sunulan internet sitesi, mobil uygulama ve baglantili tum dijital hizmetlere erisen veya bunlari kullanan gercek veya tuzel kisi ('Kullanici') arasinda akdedilir.\n\nKullanici, Platform'u kullanmakla isbu Sozlesme'yi okudugunu, anladigini ve kabul ettigini; Platform'un yalnizca bilgi, karsilastirma, veri goruntuleme ve yonlendirme hizmeti sundugun bildigini; Platform'un herhangi bir bahis, sans oyunu veya finansal aracilik hizmeti sunmadigini kabul eder.",
          en: "This GENODDS User Agreement is entered into between GENODDS ('Company') and any natural or legal person ('User') accessing or using the website, mobile application and all related digital services.\n\nBy using the Platform, the User acknowledges having read, understood and accepted this Agreement, and that the Platform provides only information, comparison, data display and referral services; the Platform does not provide any betting, gambling or financial intermediary services.",
        },
      },
      {
        heading: { tr: "Madde 2 — Hizmetin Niteligi ve Sinirlari", en: "Article 2 — Nature and Limits of Service" },
        body: {
          tr: "GENODDS, munhasiran bilgi sunumu, oran karsilastirmasi, veri derleme, veri gorsellestirme, istatistik saglama, editoryal degerlendirme, reklam alani tahsisi, sponsorlu icerik goserimi ve ucuncu taraf hizmet saglayicilara yonlendirme fonksiyonlari bulunan bagimsiz bir dijital platformdur.\n\nGENODDS, hicbir surette bahis, kumar veya sans oyunu duzenlemez; kullanici adina hesap acmaz; kullanici ile operator arasinda temsil, vekaletname veya acentelik iliskisi kurmaz.\n\nPlatform'da yer alan oranlar, siralamar, kampanya ozetleri ve istatistikler yalnizca genel bilgilendirme amaci tasir; dogrulugu, guncelligi veya eksiksizligi garanti edilmez.",
          en: "GENODDS is an independent digital platform providing information display, odds comparison, data aggregation, data visualisation, statistics, editorial evaluation, advertising space allocation, sponsored content display and referral functions to third-party service providers.\n\nGENODDS does not organise betting, gambling or games of chance; does not open accounts on behalf of users; and does not establish representation, power of attorney or agency relationships between users and operators.\n\nOdds, rankings, campaign summaries and statistics on the Platform are for general information purposes only; their accuracy, currency or completeness is not guaranteed.",
        },
      },
      {
        heading: { tr: "Madde 3 — Kisitli Bolgeler ve Turkiye Erisim Yasagi", en: "Article 3 — Restricted Regions and Turkey Access Prohibition" },
        body: {
          tr: "Platform, Turkiye'de ikamet eden, Turkiye'de bulunan veya Turkiye'den erisim saglayan kisilere sunulmaz. Turkiye, isbu Sozlesme bakimindan kesin ve acik sekilde Kisitli Bolge olarak belirlenmistir.\n\nSirket; IP kontrolu, cihaz tespiti, hesap davranisi analizi ve benzeri teknik-idari tedbirlerle Kisitli Bolgeler'den erisimi onleme hakkina sahiptir.\n\nKullanici, VPN, proxy, DNS yonlendirmesi veya benzeri tekniklerle cografi kisitlari asmaya calismadigini kabul, beyan ve taahhut eder. Bu yasagin ihlali halinde hesap derhal askiya alinabilir.",
          en: "The Platform is not provided to persons residing in, located in or accessing from Turkey. Turkey is expressly and definitively designated as a Restricted Region under this Agreement.\n\nThe Company has the right to prevent access from Restricted Regions through IP checking, device detection, account behaviour analysis and similar technical and administrative measures.\n\nThe User agrees, represents and undertakes not to attempt to circumvent geographic restrictions through VPN, proxy, DNS routing or similar techniques. Violation of this prohibition may result in immediate account suspension.",
        },
      },
      {
        heading: { tr: "Madde 4 — Yasakli Davranislar", en: "Article 4 — Prohibited Conduct" },
        body: {
          tr: "Kullanici asagidaki davranislarda bulunamaz:\n\n* Platform'u Kisitli Bolgeler'den kullanmak veya buna tesebbus etmek\n* Platform'daki verileri toplu kopyalamak, scraping yapmak veya bot kullanmak\n* Platform'un kaynak koduna mudahale etmek veya guvenlik katmanlarini asmak\n* Sirket veya diger kullanicilar hakkinda yaniltici veya zararli icerik yayimlamak\n* Platform'u hukuka aykiri bahis, dolandiricilik veya kara para aklama amaciyla kullanmak",
          en: "The User may not engage in the following conduct:\n\n* Using or attempting to use the Platform from Restricted Regions\n* Bulk copying Platform data, scraping or using bots\n* Interfering with the Platform's source code or bypassing security layers\n* Publishing misleading or harmful content about the Company or other users\n* Using the Platform for illegal betting, fraud or money laundering",
        },
      },
      {
        heading: { tr: "Madde 5 — Fikri Mulkiyet Haklari", en: "Article 5 — Intellectual Property Rights" },
        body: {
          tr: "Platform'un tamami ile bunun uzerinde yer alan tum yazilim, kod, tasarim, arayuz, marka, logo, veri tabani yapisi ve sair unsurlar uzerindeki haklar Sirket'e veya lisans verenlerine aittir.\n\nKullanici'ya, Platform'u yalnizca kisisel ve sinirli kullanim amaciyla goruntuleme hakki taninir. Bu hak devredilemez, geri alinabilir ve alt lisans verilemez niteliktedir.",
          en: "All rights to the entire Platform and all software, code, design, interface, brand, logo, database structure and other elements thereon belong to the Company or its licensors.\n\nThe User is granted only a personal, limited right to view the Platform. This right is non-transferable, revocable and non-sublicensable.",
        },
      },
      {
        heading: { tr: "Madde 6 — Sorumluluk Sinirlamasi", en: "Article 6 — Limitation of Liability" },
        body: {
          tr: "Uygulanabilir hukukun izin verdigi azami olcude, Sirket; Platform'un kullanimi veya kullanilamamasi, ucuncu taraf operator islemleri, veri gecikmeleri, icerik hatalari, kazanc veya kayip iddialari ile dolayli zararlardan sorumlu tutulamaz.\n\nKullanici'nin ucuncu taraf operatorlerle kurdugu iliskiler ve bunlarin hukuki sonuclari tamamen Kullanici'nin sorumlulugundadir.",
          en: "To the maximum extent permitted by applicable law, the Company shall not be liable for use or inability to use the Platform, third-party operator transactions, data delays, content errors, claims of earnings or losses or indirect damages.\n\nRelationships established by the User with third-party operators and their legal consequences are entirely the User's responsibility.",
        },
      },
      {
        heading: { tr: "Madde 7 — Uygulanacak Hukuk ve Uyusmazlik Cozumu", en: "Article 7 — Governing Law and Dispute Resolution" },
        body: {
          tr: "Isbu Sozlesme, kanunlar ihtilafi kurallari haric olmak uzere ilgili ulke hukukuna tabidir. Sozlesme'den dogan uyusmazliklar, yetkili tahkim kurumlari veya mahkemeler araciligiyla cozume kavusturulur.",
          en: "This Agreement is governed by the applicable law of the relevant jurisdiction, excluding conflict of law rules. Disputes arising from the Agreement shall be resolved through competent arbitration bodies or courts.",
        },
      },
      {
        heading: { tr: "Madde 8 — Degisiklikler ve Iletisim", en: "Article 8 — Amendments and Contact" },
        body: {
          tr: "Sirket, isbu Sozlesme'yi diledigi zaman degistirme hakkini sakli tutar. Esasli degisiklikler uygun iletisim kanallari uzerinden bildirilir. Degisikliklerin yururluge girdigi tarihten sonra Platform'un kullanilmaya devam edilmesi, degisikliklerin kabulu anlamina gelir.\n\nIletisim: legal@genodds.com",
          en: "The Company reserves the right to amend this Agreement at any time. Material changes will be notified through appropriate communication channels. Continued use of the Platform after changes take effect constitutes acceptance of those changes.\n\nContact: legal@genodds.com",
        },
      },
    ],
  },

  privacy: {
    icon: <Shield className="w-4 h-4" />,
    title: { tr: "Gizlilik Politikasi", en: "Privacy Policy" },
    sections: [
      {
        heading: { tr: "Madde 1 — Amac ve Kapsam", en: "Article 1 — Purpose and Scope" },
        body: {
          tr: "Isbu GENODDS Gizlilik Politikasi, GENODDS tarafindan sunulan internet sitesi, mobil uygulama ve baglantili tum dijital hizmetler kapsaminda elde edilen veya islenen kisisel verilere iliskin esaslari duzenler.\n\nBu Politika, Platform'u ziyaret eden, hesap olusturan, bildirim alan, destek talebinde bulunan veya Platform ile herhangi bir sekilde etkilesime gecen gercek kisilere uygulanir.",
          en: "This GENODDS Privacy Policy regulates the principles regarding personal data obtained or processed within the scope of the website, mobile application and all related digital services provided by GENODDS.\n\nThis Policy applies to natural persons who visit the Platform, create an account, receive notifications, submit support requests or interact with the Platform in any way.",
        },
      },
      {
        heading: { tr: "Madde 2 — Islenen Veri Kategorileri", en: "Article 2 — Categories of Data Processed" },
        body: {
          tr: "Platform'un niteligine gore su veri kategorileri islenebilir:\n\n* Kimlik ve hesap bilgileri: ad, e-posta, kullanici adi, dogrulama kayitlari\n* Teknik kullanim verileri: IP adresi, cihaz turu, isletim sistemi, oturum kayitlari, hata loglari, trafik kaynaklari\n* Konum ve bolgesel uygunluk verileri: ulke bilgisi, IP cografi konum tahmini, Kisitli Bolge kontrolune iliskin gostergeler\n* Pazarlama ve etkilesim verileri: kampanya katilimi, bildirim etkilesimleri, affiliate tiklama bilgileri\n* Kullanici tarafindan saglanan diger veriler: geri bildirimler, destek talepleri, yorumlar",
          en: "The following data categories may be processed depending on the nature of the Platform:\n\n* Identity and account information: name, email, username, verification records\n* Technical usage data: IP address, device type, operating system, session records, error logs, traffic sources\n* Location and regional eligibility data: country information, IP geolocation estimate, Restricted Region control indicators\n* Marketing and engagement data: campaign participation, notification interactions, affiliate click data\n* Other user-provided data: feedback, support requests, comments",
        },
      },
      {
        heading: { tr: "Madde 3 — Verilerin Islenme Amaclari", en: "Article 3 — Purposes of Data Processing" },
        body: {
          tr: "Kisisel veriler su amaclarla islenebilir:\n\n* Hesap olusturulmasi ve kullanici dogrulama sureclerinin yurutulmesi\n* Platform'un isletilmesi, hatalarinin giderilmesi ve performansinin iyilestirilmesi\n* Guvenlik, dolandiricilik onleme, bot ve otomatik erisim engelleme\n* Turkiye ve diger Kisitli Bolgeler'den erisimin tespiti ve engellenmesi\n* Destek taleplerinin karsilanmasi ve sikayet yonetimi\n* Affiliate yonlendirme, reklam performansi ve kampanya olcumleme\n* Hukuki yukumluluklerini yerine getirilmesi",
          en: "Personal data may be processed for the following purposes:\n\n* Account creation and user verification processes\n* Operating, debugging and improving Platform performance\n* Security, fraud prevention, bot and automated access blocking\n* Detection and blocking of access from Turkey and other Restricted Regions\n* Handling support requests and complaint management\n* Affiliate referral, advertising performance and campaign measurement\n* Fulfilment of legal obligations",
        },
      },
      {
        heading: { tr: "Madde 4 — Verilerin Ucuncu Taraflara Aktarimi", en: "Article 4 — Transfer of Data to Third Parties" },
        body: {
          tr: "Sirket, kisisel verileri hizmetin sunulmasi icin gerekli oldugu olcude su alici gruplariyla paylasabilir:\n\n* Barindrma, sunucu, bulut ve altyapi hizmeti saglayicilari\n* Analiz, guvenlik, bildirim ve musteri destek hizmeti saglayicilari\n* Hukuki danismanlar, denetciler ve uyum hizmeti saglayicilari\n* Resmi kurumlar ve yasal talep halinde yetkili makamlar\n\nSirket, kisisel verileri hicbir sekilde Kullanici'nin makul beklentisini asacak bicimde satmayi veya veri aracilik faaliyeti yurутmeyi amaclamaz.",
          en: "The Company may share personal data with the following recipient groups to the extent necessary for service provision:\n\n* Hosting, server, cloud and infrastructure service providers\n* Analytics, security, notification and customer support service providers\n* Legal advisors, auditors and compliance service providers\n* Official institutions and competent authorities upon legal request\n\nThe Company does not intend to sell personal data or conduct data brokerage activities in any way that exceeds the User's reasonable expectations.",
        },
      },
      {
        heading: { tr: "Madde 5 — Kisitli Bolgeler ve Turkiye", en: "Article 5 — Restricted Regions and Turkey" },
        body: {
          tr: "Platform, Turkiye ve Sirket tarafindan belirlenen diger Kisitli Bolgeler'deki kisilere sunulmaz.\n\nSirket, Turkiye veya diger Kisitli Bolgeler ile baglantili erisim gostergeleri tespit ettiginde; hesap acilisini engelleme, mevcut hesabi askiya alma ve ilgili kayitlari uyum/guvenlik amaciyla saklama hakkina sahiptir.\n\nKonum ve bolgesel uygunluk verileri (IP adresi, ulke bilgisi, vb.), Kisitli Bolge kontrolu amaci ile guvenlik odakli depolama araclarinda saklanabilir.",
          en: "The Platform is not provided to persons in Turkey and other Restricted Regions determined by the Company.\n\nWhen the Company detects access indicators related to Turkey or other Restricted Regions, it has the right to block account creation, suspend existing accounts and retain relevant records for compliance/security purposes.\n\nLocation and regional eligibility data (IP address, country information, etc.) may be stored in security-focused storage tools for Restricted Region control purposes.",
        },
      },
      {
        heading: { tr: "Madde 6 — Ilgili Kisi Haklari ve Iletisim", en: "Article 6 — Data Subject Rights and Contact" },
        body: {
          tr: "Kisisel verisi islenen kisiler, uygulanabilir hukuk cercevesinde su haklara sahip olabilir: kisisel veri islenip islenmedigini ogrenme, buna iliskin bilgi talep etme, verilerin islenme amacini ogrenme, verilerin aktarildigi ucuncu kisileri ogrenme, yanlis verilerin duzeltilmesini isteme, gerekli sartlarda silme talebinde bulunma.\n\nBasvurular icin: legal@genodds.com",
          en: "Data subjects may have the following rights under applicable law: learning whether personal data is processed, requesting information thereon, learning the purpose of processing, learning the third parties to whom data is transferred, requesting correction of incorrect data, and requesting deletion under appropriate conditions.\n\nFor requests: legal@genodds.com",
        },
      },
    ],
  },

  cookies: {
    icon: <Cookie className="w-4 h-4" />,
    title: { tr: "Cerez Politikasi", en: "Cookie Policy" },
    sections: [
      {
        heading: { tr: "Madde 1 — Amac ve Kapsam", en: "Article 1 — Purpose and Scope" },
        body: {
          tr: "Isbu GENODDS Cerez Politikasi, GENODDS tarafindan isletilen internet sitesi, mobil uygulama ve baglantili dijital hizmetler kapsaminda kullanilan cerezler, SDK'lar, pikseller, local storage, cihaz tanimlayicilari ve benzeri teknolojilere iliskin aciklamalari icerir.\n\nBu Politika, Platform'u ziyaret eden veya kullanan tum kisiler bakimindan uygulanir.",
          en: "This GENODDS Cookie Policy contains explanations regarding cookies, SDKs, pixels, local storage, device identifiers and similar technologies used within the scope of the website, mobile application and related digital services operated by GENODDS.\n\nThis Policy applies to all persons who visit or use the Platform.",
        },
      },
      {
        heading: { tr: "Madde 2 — Kullanilan Teknoloji Turleri", en: "Article 2 — Types of Technologies Used" },
        body: {
          tr: "Platform kapsaminda su teknoloji turleri kullanilabilir:\n\n* Zorunlu teknolojiler: guvenlik, oturum yonetimi, yuk dengeleme ve temel arayuz fonksiyonlari icin gerekli araclar\n\n* Islevsellik teknolojileri: dil tercihi, kullanici ayarlari ve cihaz hatirlama gibi kolaylik saglayan araclar\n\n* Performans ve analiz teknolojileri: trafik olcumu, hata tespiti, kullanim yogunlugu analizi ve urun gelistirme amacli araclar\n\n* Pazarlama ve iliskilendirme teknolojileri: affiliate yonlendirme takibi, kampanya olcumleme ve reklam etkililigi analizi araclari",
          en: "The following technology types may be used within the scope of the Platform:\n\n* Essential technologies: tools required for security, session management, load balancing and basic interface functions\n\n* Functionality technologies: convenience tools such as language preference, user settings and device remembering\n\n* Performance and analytics technologies: tools for traffic measurement, error detection, usage intensity analysis and product development\n\n* Marketing and attribution technologies: tools for affiliate referral tracking, campaign measurement and advertising effectiveness analysis",
        },
      },
      {
        heading: { tr: "Madde 3 — Turkiye ve Kisitli Bolgeler", en: "Article 3 — Turkey and Restricted Regions" },
        body: {
          tr: "Platform, Turkiye ve Sirket tarafindan belirlenen diger Kisitli Bolgeler'deki kullanicilara sunulmaz.\n\nSirket, Kisitli Bolge tespiti amaci ile teknik gostergeler ve guvenlik odakli depolama araclari kullanabilir.\n\nKullanici, cografi kisitlamalari asmaya yonelik teknik araclar kullanmasi halinde, ilgili hesabinin askiya alinabilecegini ve bazi kayitlarin guvenlik ve uyum amaciyla saklanabilecegini kabul eder.",
          en: "The Platform is not provided to users in Turkey and other Restricted Regions determined by the Company.\n\nThe Company may use technical indicators and security-focused storage tools for Restricted Region detection.\n\nThe User acknowledges that if they use technical tools to circumvent geographic restrictions, the relevant account may be suspended and certain records may be retained for security and compliance purposes.",
        },
      },
      {
        heading: { tr: "Madde 4 — Kullanici Tercihleri ve Kontrol", en: "Article 4 — User Preferences and Control" },
        body: {
          tr: "Kullanici, tarayici ayarlari veya cihaz izinleri araciligiyla bazi cerez ve benzeri teknolojileri sinirlandiabilir veya devre disi birakabilir.\n\nZorunlu teknolojilerin devre disi birakilmasi, Platform'un bazi bolumlerinin duzgun calismamasina veya oturumun kapanmasina neden olabilir.\n\nAnalitik, pazarlama veya affiliate olcumleme araclarinin reddedilmesi halinde, bazi kisisellestrme ve olcumleme islevleri sinirlanabilir.",
          en: "The User may restrict or disable certain cookies and similar technologies through browser settings or device permissions.\n\nDisabling essential technologies may cause some parts of the Platform to malfunction or the session to close.\n\nIf analytics, marketing or affiliate measurement tools are declined, some personalisation and measurement functions may be limited.",
        },
      },
      {
        heading: { tr: "Madde 5 — Ucuncu Taraf Teknolojiler ve Degisiklikler", en: "Article 5 — Third-Party Technologies and Changes" },
        body: {
          tr: "Sirket, analiz, guvenlik, hata takibi, bildirim ve pazarlama amaci ile ucuncu taraf hizmet saglayicilardan yararlanabilir. Bu saglayicilar kendi teknolojileri araciligiyla belirli teknik verileri isleyebilir.\n\nSirket, isbu Cerez Politikasi'ni diledigi zaman guncelleme hakkini sakli tutar. Yeni teknoloji kullanimi veya mevzuat gereklilikleri halinde guncel metin yayimlanir.\n\nIletisim: legal@genodds.com",
          en: "The Company may use third-party service providers for analytics, security, error tracking, notifications and marketing. These providers may process certain technical data through their own technologies.\n\nThe Company reserves the right to update this Cookie Policy at any time. An updated text will be published in the event of new technology use or regulatory requirements.\n\nContact: legal@genodds.com",
        },
      },
    ],
  },

  affiliate: {
    icon: <TrendingUp className="w-4 h-4" />,
    title: { tr: "Affiliate Aciklamasi", en: "Affiliate Disclosure" },
    sections: [
      {
        heading: { tr: "Madde 1 — Amac ve Kapsam", en: "Article 1 — Purpose and Scope" },
        body: {
          tr: "Isbu Affiliate Disclosure ve Ticari Iliski Aciklamasi, GENODDS Platformu'nda yer alan reklam, sponsorluk, affiliate baglantilar, yonlendirme sistemleri, gorunurluk kararlari ve siralama kriterleri hakkinda Kullanici'nin acik ve anlasilir sekilde bilgilendirilmesi amaciyla hazirlanmistir.",
          en: "This Affiliate Disclosure and Commercial Relationship Statement has been prepared to clearly and transparently inform Users about advertising, sponsorship, affiliate links, referral systems, visibility decisions and ranking criteria on the GENODDS Platform.",
        },
      },
      {
        heading: { tr: "Madde 2 — Affiliate Iliskisinin Niteligi", en: "Article 2 — Nature of Affiliate Relationship" },
        body: {
          tr: "Platform'da yer alan bazi baglantilar, yonlendirme butonlari veya operator profilleri affiliate baglanti niteliginde olabilir.\n\nKullanici, bu baglantilar uzerinden ucuncu taraf bir operatore yonlendirildiginde, Sirket'in reklam bedeli, sabit ucret, trafik bazli odeme, performans bazli komisyon veya benzeri ticari gelir elde edebilecegini kabul eder.\n\nSirket, ucuncu taraf operatorler ile reklam, sponsorluk, tanitim veya yonlendirme temelli ticari iliskiler kurabilir.",
          en: "Some links, referral buttons or operator profiles on the Platform may qualify as affiliate links.\n\nThe User acknowledges that when redirected to a third-party operator through these links, the Company may earn advertising fees, fixed fees, traffic-based payments, performance-based commissions or similar commercial revenue.\n\nThe Company may enter into commercial relationships with third-party operators based on advertising, sponsorship, promotion or referral.",
        },
      },
      {
        heading: { tr: "Madde 3 — Platform'un Konumu ve Hizmetin Siniri", en: "Article 3 — Platform Position and Service Limits" },
        body: {
          tr: "GENODDS, bagimsiz bir oran karsilastirma, veri sunumu ve yonlendirme platformudur.\n\nGENODDS, herhangi bir bahis veya odeme isleminin tarafi degildir; kullanici adina hesap acmaz, para tahsil etmez, kazanc odemez ve kullanici ile operator arasinda acentelik iliskisi kurmaz.\n\nPlatform'da yer alan icerikler, mutlak objektiflik veya belirli bir sonuca ulasma garantisi vermez.",
          en: "GENODDS is an independent odds comparison, data display and referral platform.\n\nGENODDS is not a party to any betting or payment transaction; it does not open accounts on behalf of users, collect money, pay winnings or establish agency relationships between users and operators.\n\nContent on the Platform does not guarantee absolute objectivity or achievement of a specific outcome.",
        },
      },
      {
        heading: { tr: "Madde 4 — Siralama, Gorunurluk ve Vitrinleme", en: "Article 4 — Ranking, Visibility and Showcasing" },
        body: {
          tr: "Platform'da operatorlerin, oranlarin veya kampanyalarin gorunurlugu su kriterlerden biri veya birkai dikkate alinarak belirlenebilir:\n\n* Veri guncelligi ve teknik dogrulama durumu\n* Kullanici etkilesimi ve urun performansi\n* Bolgesel uygunluk ve cihaz uyumlulugu\n* Editoryal degerlendirmeler ve icerik politikalari\n* Reklam, sponsorluk, affiliate veya diger ticari anlsmalar\n\nBu nedenle Platform'daki siralamalar, pazarin tamaminin notr veya eksiksiz bir yansimasi olmayabilir.",
          en: "The visibility of operators, odds or campaigns on the Platform may be determined by taking into account one or more of the following criteria:\n\n* Data currency and technical verification status\n* User engagement and product performance\n* Regional eligibility and device compatibility\n* Editorial evaluations and content policies\n* Advertising, sponsorship, affiliate or other commercial agreements\n\nTherefore, rankings on the Platform may not be a neutral or complete reflection of the entire market.",
        },
      },
      {
        heading: { tr: "Madde 5 — Sponsorlu Icerik", en: "Article 5 — Sponsored Content" },
        body: {
          tr: "Platform'da yer alan bazi icerikler sponsorlu, reklam niteliginde veya ticari is birligi kapsaminda sunuluyor olabilir.\n\nSirket, uygun gordugu olcude bu icerikleri 'SPONSORLU', 'REKLAM' veya benzeri ibarelerle isaretleyebilir.\n\nSponsorlu gorunurluk saglanmasi, Sirket'in ilgili operator icin guvence verdigi veya lisans uygunlugunu teyit ettigi anlamina gelmez.",
          en: "Some content on the Platform may be sponsored, of an advertising nature or presented within the scope of a commercial collaboration.\n\nThe Company may label such content with 'SPONSORED', 'AD' or similar designations as it deems appropriate.\n\nProviding sponsored visibility does not mean the Company vouches for the relevant operator or confirms licence eligibility.",
        },
      },
      {
        heading: { tr: "Madde 6 — Turkiye ve Kisitli Bolgeler", en: "Article 6 — Turkey and Restricted Regions" },
        body: {
          tr: "Platform, Turkiye ve Sirket tarafindan belirlenen diger Kisitli Bolgeler'de kullanilmak uzere sunulmaz.\n\nSirket, Turkiye veya baska bir Kisitli Bolge ile baglantili erisim tespit etmesi halinde affiliate baglantilarini, yonlendirme butonlarini, operator profillerini veya belirli icerikleri devre disi birakabilir.\n\nKullanici, cografi kisitlari asmaya yonelik teknik araclar kullanmasi halinde ilgili yonlendirme ve gorunurluk islevlerinin kapatilabilecegini kabul eder.\n\nIletisim: legal@genodds.com",
          en: "The Platform is not provided for use in Turkey and other Restricted Regions determined by the Company.\n\nIf the Company detects access related to Turkey or another Restricted Region, it may disable affiliate links, referral buttons, operator profiles or certain content.\n\nThe User acknowledges that if they use technical tools to circumvent geographic restrictions, the relevant referral and visibility functions may be disabled.\n\nContact: legal@genodds.com",
        },
      },
    ],
  },
};

const DOC_ORDER: DocKey[] = ["terms", "privacy", "cookies", "affiliate"];

export function LegalModal({ isOpen, onClose, initialDoc = "terms", isDarkMode, language = "tr" }: LegalModalProps) {
  const [activeDoc, setActiveDoc] = useState<DocKey>(initialDoc);
  const [activeLang, setActiveLang] = useState<Lang>(language);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveDoc(initialDoc);
      setActiveLang(language);
    }
  }, [isOpen, initialDoc, language]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeDoc]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const doc = DOCS[activeDoc];
  const lang = activeLang;

  const labels: Record<Lang, Record<string, string>> = {
    tr: { close: "Kapat", updated: "Son guncelleme: Mayis 2026" },
    en: { close: "Close", updated: "Last updated: May 2026" },
  };
  const lbl = labels[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="legal-overlay"
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            key="legal-modal"
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
                isDarkMode ? "bg-[#141414] border border-[#2a2a2a]" : "bg-white border border-gray-200"
              }`}
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#022179] via-blue-400 to-[#022179] flex-shrink-0" />

              {/* Header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDarkMode ? "border-[#2a2a2a]" : "border-gray-100"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#022179]/10 flex items-center justify-center text-[#022179]">
                    {doc.icon}
                  </div>
                  <div>
                    <h2 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {doc.title[lang]}
                    </h2>
                    <p className={`text-[10px] ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>{lbl.updated}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language switcher */}
                  <div className={`flex rounded-lg overflow-hidden border text-xs ${isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"}`}>
                    {(["tr", "en"] as Lang[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setActiveLang(l)}
                        className={`px-3 py-1.5 font-medium transition-colors uppercase ${
                          activeLang === l
                            ? "bg-[#022179] text-white"
                            : isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isDarkMode ? "hover:bg-[#2a2a2a] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Doc tabs */}
              <div
                className={`flex border-b overflow-x-auto flex-shrink-0 ${isDarkMode ? "border-[#2a2a2a] bg-[#0f0f0f]" : "border-gray-100 bg-gray-50"}`}
                style={{ scrollbarWidth: "none" }}
              >
                {DOC_ORDER.map((key) => {
                  const d = DOCS[key];
                  const isActive = activeDoc === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveDoc(key)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                        isActive
                          ? isDarkMode
                            ? "border-blue-400 text-blue-400 bg-blue-500/5"
                            : "border-[#022179] text-[#022179] bg-[#022179]/5"
                          : isDarkMode
                          ? "border-transparent text-gray-500 hover:text-gray-300"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="opacity-70">{d.icon}</span>
                      {d.title[lang]}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto p-5 sm:p-7"
                style={{ scrollbarWidth: "thin" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeDoc}-${lang}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-6"
                  >
                    {doc.sections.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <ChevronRight className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-blue-400/60" : "text-[#022179]/50"}`} />
                          <h3 className={`text-xs font-semibold tracking-wide uppercase ${isDarkMode ? "text-blue-400/80" : "text-[#022179]/80"}`}>
                            {section.heading[lang]}
                          </h3>
                        </div>
                        <div className={`ml-5 text-xs leading-relaxed whitespace-pre-wrap ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {section.body[lang]}
                        </div>
                      </div>
                    ))}

                    {/* Bottom contact strip */}
                    <div className={`mt-4 p-4 rounded-xl text-xs ${isDarkMode ? "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500" : "bg-gray-50 border border-gray-200 text-gray-500"}`}>
                      {lang === "tr"
                        ? "Bu belge hakkinda soru ve talepleriniz icin: "
                        : "For questions and requests regarding this document: "}
                      <a href="mailto:legal@genodds.com" className="text-[#022179] font-medium hover:underline">legal@genodds.com</a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className={`px-5 py-3 border-t flex items-center justify-between flex-shrink-0 ${isDarkMode ? "border-[#2a2a2a] bg-[#0f0f0f]" : "border-gray-100 bg-gray-50"}`}>
                <p className={`text-[10px] ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
                  &copy; 2026 GENODDS &nbsp;&middot;&nbsp; {lang === "tr" ? "Tum haklari saklidir" : "All rights reserved"}
                </p>
                <button
                  onClick={onClose}
                  className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#022179]/20 text-blue-300 hover:bg-[#022179]/30"
                      : "bg-[#022179] text-white hover:bg-[#022179]/90"
                  }`}
                >
                  {lbl.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
