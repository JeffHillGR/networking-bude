/**
 * Region Configuration for BudE Multi-Region Support
 *
 * This file contains all region-specific data:
 * - Zip codes for region detection
 * - Organizations per region
 * - Scrape URLs for event sources
 */

export const REGIONS = {
  'grand-rapids': {
    name: 'Grand Rapids',
    displayName: 'Grand Rapids, MI',
    hubZip: '49503',
    state: 'MI',
    isActive: true,

    // All zips in 493, 494, 495 prefixes (~50 mile coverage)
    zipCodes: [
      // 493xx - Grand Rapids metro & north
      '49301', '49302', '49303', '49304', '49305', '49306', '49307', '49309', '49310', '49312',
      '49315', '49316', '49318', '49319', '49320', '49321', '49322', '49323', '49325', '49326',
      '49327', '49328', '49329', '49330', '49331', '49332', '49333', '49335', '49336', '49337',
      '49338', '49339', '49340', '49341', '49342', '49343', '49344', '49345', '49346', '49347',
      '49348', '49349',
      // 494xx - Holland, Muskegon, lakeshore
      '49401', '49402', '49403', '49404', '49405', '49406', '49408', '49409', '49410', '49411',
      '49412', '49415', '49417', '49418', '49419', '49420', '49421', '49423', '49424', '49425',
      '49426', '49428', '49429', '49430', '49431', '49434', '49435', '49436', '49437', '49440',
      '49441', '49442', '49443', '49444', '49445', '49446', '49448', '49449', '49450', '49451',
      '49452', '49453', '49454', '49455', '49456', '49457', '49458', '49459', '49460', '49461',
      '49464',
      // 495xx - Grand Rapids city
      '49503', '49504', '49505', '49506', '49507', '49508', '49509', '49512', '49519', '49525',
      '49534', '49544', '49546', '49548'
    ],

    organizations: [
      'GR Chamber of Commerce',
      'Rotary Club',
      'CREW',
      'GRYP',
      'Economic Club of Grand Rapids',
      'Create Great Leaders',
      'Right Place',
      'Bamboo GR',
      'Hello West Michigan',
      'CARWM',
      'Creative Mornings GR',
      'Athena',
      'Inforum',
      'Start Garden',
      'GRABB',
      'WMPRSA',
      "Crain's GR Business",
      'AIGA - WM',
      'West Michigan Hispanic Chamber of Commerce',
      'YPO - WM'
    ],

    scrapeUrls: {
      'GR Chamber of Commerce': 'https://www.grandrapids.org/events',
      'Rotary Club': 'https://www.grandrapidsrotary.org/events',
      'CREW': 'https://www.crewgrandrapids.org/events',
      'GRYP': 'https://www.gryp.org/events',
      'Economic Club of Grand Rapids': 'https://economicclubgr.org/events',
      'Bamboo GR': 'https://bamboograndrapids.com/events',
      'Hello West Michigan': 'https://hellowestmichigan.com/events',
      'CARWM': 'https://carwm.org/events',
      'Creative Mornings GR': 'https://creativemornings.com/cities/grr',
      'Athena': 'https://athenawestmichigan.org/events',
      'Inforum': 'https://inforummichigan.org/events',
      'Start Garden': 'https://startgarden.com/events'
    }
  },

  'detroit': {
    name: 'Detroit',
    displayName: 'Detroit Metro',
    hubZip: '48243',
    state: 'MI',
    isActive: false, // Set to true when ready to launch

    // All zips in 480, 481, 482, 483 prefixes (~50 mile coverage)
    zipCodes: [
      // 480xx - Macomb County, St Clair
      '48001', '48002', '48003', '48004', '48005', '48006', '48007', '48009', '48012', '48014',
      '48015', '48017', '48021', '48022', '48023', '48025', '48026', '48027', '48028', '48030',
      '48032', '48033', '48034', '48035', '48036', '48037', '48038', '48039', '48040', '48041',
      '48042', '48043', '48044', '48045', '48046', '48047', '48048', '48049', '48050', '48051',
      '48054', '48055', '48059', '48060', '48061', '48062', '48063', '48064', '48065', '48066',
      '48067', '48068', '48069', '48070', '48071', '48072', '48073', '48074', '48075', '48076',
      '48079', '48080', '48081', '48082', '48083', '48084', '48085', '48086', '48088', '48089',
      '48090', '48091', '48092', '48093', '48094', '48095', '48096', '48097', '48098', '48099',
      // 481xx - Ann Arbor, Washtenaw, Monroe
      '48101', '48103', '48104', '48105', '48106', '48107', '48108', '48109', '48110', '48111',
      '48112', '48113', '48114', '48115', '48116', '48117', '48118', '48120', '48121', '48122',
      '48123', '48124', '48125', '48126', '48127', '48128', '48130', '48131', '48133', '48134',
      '48135', '48136', '48137', '48138', '48139', '48140', '48141', '48143', '48144', '48145',
      '48146', '48150', '48151', '48152', '48153', '48154', '48157', '48158', '48159', '48160',
      '48161', '48162', '48164', '48165', '48166', '48167', '48168', '48169', '48170', '48173',
      '48174', '48175', '48176', '48177', '48178', '48179', '48180', '48182', '48183', '48184',
      '48185', '48186', '48187', '48188', '48189', '48190', '48191', '48192', '48193', '48195',
      '48197', '48198',
      // 482xx - Detroit city
      '48201', '48202', '48203', '48204', '48205', '48206', '48207', '48208', '48209', '48210',
      '48211', '48212', '48213', '48214', '48215', '48216', '48217', '48218', '48219', '48220',
      '48221', '48222', '48223', '48224', '48225', '48226', '48227', '48228', '48229', '48230',
      '48231', '48232', '48233', '48234', '48235', '48236', '48237', '48238', '48239', '48240',
      '48242', '48243',
      // 483xx - Oakland County
      '48301', '48302', '48303', '48304', '48306', '48307', '48308', '48309', '48310', '48311',
      '48312', '48313', '48314', '48315', '48316', '48317', '48318', '48320', '48321', '48322',
      '48323', '48324', '48325', '48326', '48327', '48328', '48329', '48330', '48331', '48332',
      '48333', '48334', '48335', '48336', '48340', '48341', '48342', '48343', '48346', '48347',
      '48348', '48350', '48353', '48356', '48357', '48359', '48360', '48361', '48362', '48363',
      '48366', '48367', '48370', '48371', '48374', '48375', '48376', '48377', '48380', '48381',
      '48382', '48383', '48386', '48387', '48390', '48393', '48397'
    ],

    organizations: [
      // Chambers & Business
      'Detroit Regional Chamber',
      'Detroit Economic Club',
      'Ann Arbor SPARK',
      // Professional Networks
      'Detroit Young Professionals (DYP)',
      'Inforum',
      'CREW Detroit',
      // Tech & Startup
      'TechTown Detroit',
      'Build Institute',
      'Bamboo Detroit',
      'IT in the D',
      // Industry
      'Automation Alley',
      'MICHauto',
      'Detroit Mobility Lab',
      // Business Development
      'Goldman Sachs 10KSB Detroit',
      'NAWBO Detroit',
      'Sunrise Networking Group',
      // Regional Chambers
      'Royal Oak Chamber',
      'Ferndale Area Chamber',
      'Ann Arbor Chamber',
      // Diversity & Community
      'Michigan Hispanic Chamber of Commerce',
      'American Arab Chamber of Commerce'
    ],

    scrapeUrls: {
      'Detroit Regional Chamber': 'https://www.detroitchamber.com/events/',
      'Detroit Economic Club': 'https://econclub.org/events/',
      'TechTown Detroit': 'https://techtowndetroit.org/events/',
      'Detroit Young Professionals (DYP)': 'https://www.detroityp.org/events',
      'Inforum': 'https://inforummichigan.org/events',
      'Ann Arbor SPARK': 'https://annarborusa.org/events/',
      'Build Institute': 'https://www.buildinstitute.org/',
      'Bamboo Detroit': 'https://www.bamboocowork.com/events-at-bamboo',
      'CREW Detroit': 'https://detroit.crewnetwork.org/events',
      'Automation Alley': 'https://www.automationalley.com/events/events-menu',
      'IT in the D': 'https://itinthed.com/our-events/',
      'NAWBO Detroit': 'https://nawbogdc.org/',
      'Royal Oak Chamber': 'https://www.royaloakchamber.com/events',
      'Ferndale Area Chamber': 'https://ferndalechamber.com/',
      'Ann Arbor Chamber': 'https://www.a2ychamber.org/',
      'Michigan Hispanic Chamber of Commerce': 'https://www.mhcc.org/events'
    }
  },

  'chicago': {
    name: 'Chicago',
    displayName: 'Chicago Metro',
    hubZip: '60601',
    state: 'IL',
    isActive: false, // Set to true when ready to launch

    // Chicago metro area zip codes (600-609 prefixes)
    zipCodes: [
      // 600xx - Northern suburbs (Evanston, Skokie, Wilmette, etc.)
      '60001', '60002', '60004', '60005', '60006', '60007', '60008', '60009', '60010', '60011',
      '60012', '60013', '60014', '60015', '60016', '60017', '60018', '60019', '60020', '60021',
      '60022', '60025', '60026', '60029', '60030', '60031', '60033', '60034', '60035', '60037',
      '60038', '60039', '60040', '60041', '60042', '60043', '60044', '60045', '60046', '60047',
      '60048', '60050', '60051', '60053', '60055', '60056', '60060', '60061', '60062', '60064',
      '60065', '60067', '60068', '60069', '60070', '60071', '60072', '60073', '60074', '60075',
      '60076', '60077', '60078', '60079', '60081', '60082', '60083', '60084', '60085', '60086',
      '60087', '60088', '60089', '60090', '60091', '60093', '60094', '60095', '60096', '60097',
      '60098', '60099',
      // 601xx - Western suburbs (Elgin, Schaumburg, etc.)
      '60101', '60102', '60103', '60104', '60105', '60106', '60107', '60108', '60110', '60111',
      '60112', '60113', '60115', '60116', '60117', '60118', '60119', '60120', '60121', '60122',
      '60123', '60124', '60125', '60126', '60128', '60129', '60130', '60131', '60132', '60133',
      '60134', '60135', '60136', '60137', '60138', '60139', '60140', '60141', '60142', '60143',
      '60144', '60145', '60146', '60147', '60148', '60150', '60151', '60152', '60153', '60154',
      '60155', '60156', '60157', '60159', '60160', '60161', '60162', '60163', '60164', '60165',
      '60168', '60169', '60170', '60171', '60172', '60173', '60174', '60175', '60176', '60177',
      '60178', '60179', '60180', '60181', '60183', '60184', '60185', '60186', '60187', '60188',
      '60189', '60190', '60191', '60192', '60193', '60194', '60195', '60196', '60197', '60199',
      // 602xx - More suburbs
      '60201', '60202', '60203', '60204', '60208', '60209',
      // 603xx - Oak Park, River Forest area
      '60301', '60302', '60303', '60304', '60305',
      // 604xx - Aurora, Naperville area
      '60401', '60402', '60403', '60404', '60405', '60406', '60407', '60408', '60409', '60410',
      '60411', '60412', '60415', '60416', '60417', '60418', '60419', '60420', '60421', '60422',
      '60423', '60424', '60425', '60426', '60428', '60429', '60430', '60431', '60432', '60433',
      '60434', '60435', '60436', '60437', '60438', '60439', '60440', '60441', '60442', '60443',
      '60444', '60445', '60446', '60447', '60448', '60449', '60450', '60451', '60452', '60453',
      '60454', '60455', '60456', '60457', '60458', '60459', '60460', '60461', '60462', '60463',
      '60464', '60465', '60466', '60467', '60468', '60469', '60470', '60471', '60472', '60473',
      '60474', '60475', '60476', '60477', '60478', '60479', '60480', '60481', '60482', '60484',
      '60487', '60490', '60491',
      // 605xx - Joliet, Bolingbrook area
      '60501', '60502', '60503', '60504', '60505', '60506', '60507', '60510', '60511', '60512',
      '60513', '60514', '60515', '60516', '60517', '60518', '60519', '60520', '60521', '60522',
      '60523', '60525', '60526', '60527', '60530', '60531', '60532', '60534', '60536', '60537',
      '60538', '60539', '60540', '60541', '60542', '60543', '60544', '60545', '60546', '60548',
      '60549', '60550', '60551', '60552', '60553', '60554', '60555', '60556', '60557', '60558',
      '60559', '60560', '60561', '60563', '60564', '60565', '60566', '60567', '60568', '60569',
      '60570', '60572', '60585', '60586',
      // 606xx - Chicago proper
      '60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610',
      '60611', '60612', '60613', '60614', '60615', '60616', '60617', '60618', '60619', '60620',
      '60621', '60622', '60623', '60624', '60625', '60626', '60628', '60629', '60630', '60631',
      '60632', '60633', '60634', '60636', '60637', '60638', '60639', '60640', '60641', '60642',
      '60643', '60644', '60645', '60646', '60647', '60649', '60651', '60652', '60653', '60654',
      '60655', '60656', '60657', '60659', '60660', '60661', '60664', '60666', '60668', '60669',
      '60670', '60673', '60674', '60675', '60677', '60678', '60680', '60681', '60682', '60684',
      '60685', '60686', '60687', '60688', '60689', '60690', '60691', '60693', '60694', '60695',
      '60696', '60697', '60699',
      // 607xx - South suburbs
      '60701', '60706', '60707', '60712', '60714',
      // 608xx - More south suburbs
      '60803', '60804', '60805', '60827'
    ],

    organizations: [
      // Chambers & Business
      'Chicagoland Chamber of Commerce',
      'Illinois Chamber of Commerce',
      'Chicago Loop Alliance',
      // Tech & Startup
      '1871',
      'mHub',
      'Polsky Center',
      'Chicago Innovation',
      'Built In Chicago',
      'ChicagoNEXT',
      // Professional Networks
      'Chicago Young Professionals',
      'Executives\' Club of Chicago',
      'Economic Club of Chicago',
      'CHIEF Chicago',
      // Women in Business
      'WiSTEM',
      'WBDC',
      // Industry
      'Illinois Manufacturers\' Association',
      'Chicago Finance Exchange',
      // Diversity & Community
      'Illinois Hispanic Chamber of Commerce',
      'Chicago Urban League',
      'Chicagoland Black Chamber of Commerce',
      'Asian American Chamber of Commerce',
      'Polish American Chamber of Commerce',
      'India Chamber of Commerce Chicago',
      'Chicago CREW',
      'NAWBO Chicago'
    ],

    scrapeUrls: {
      'Chicagoland Chamber of Commerce': 'https://www.chicagolandchamber.org/events/',
      '1871': 'https://1871.com/events/',
      'mHub': 'https://www.mhubchicago.com/events',
      'Built In Chicago': 'https://www.builtinchicago.org/events'
      // Add more Chicago scrape URLs as you discover them
    }
  }
};

/**
 * Detect region from a 5-digit zip code
 * @param {string} zipCode - 5-digit zip code
 * @returns {string} Region ID or empty string if not found
 */
export const detectRegion = (zipCode) => {
  if (!zipCode || zipCode.length !== 5) return '';

  for (const [regionId, config] of Object.entries(REGIONS)) {
    if (config.zipCodes.includes(zipCode)) {
      return regionId;
    }
  }
  return ''; // Unknown region
};

/**
 * Get organizations for a region
 * @param {string} regionId - Region ID
 * @returns {string[]} Array of organization names
 */
export const getOrganizationsForRegion = (regionId) => {
  if (!regionId || !REGIONS[regionId]) return [];
  return REGIONS[regionId].organizations;
};

/**
 * Get scrape URLs for a region
 * @param {string} regionId - Region ID
 * @returns {Object} Map of org name to scrape URL
 */
export const getScrapeUrlsForRegion = (regionId) => {
  if (!regionId || !REGIONS[regionId]) return {};
  return REGIONS[regionId].scrapeUrls || {};
};

/**
 * Get all active regions (for dropdowns)
 * @param {boolean} includeInactive - Include inactive regions
 * @returns {Array} Array of {id, name, displayName}
 */
export const getRegionOptions = (includeInactive = false) => {
  return Object.entries(REGIONS)
    .filter(([_, config]) => includeInactive || config.isActive)
    .map(([id, config]) => ({
      id,
      name: config.name,
      displayName: config.displayName
    }));
};

/**
 * Check if a region exists
 * @param {string} regionId - Region ID to check
 * @returns {boolean}
 */
export const isValidRegion = (regionId) => {
  return regionId && REGIONS.hasOwnProperty(regionId);
};

export default REGIONS;
