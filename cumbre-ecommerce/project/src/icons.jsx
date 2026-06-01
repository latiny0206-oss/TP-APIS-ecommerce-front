/* Inline SVG icon set — Lucide-style strokes */

const Icon = ({ d, size = 20, stroke = 1.6, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {d}
  </svg>
);

const IconMenu = (p) => <Icon {...p} d={<><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></>} />;
const IconX = (p) => <Icon {...p} d={<><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></>} />;
const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></>} />;
const IconUser = (p) => <Icon {...p} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const IconCart = (p) => <Icon {...p} d={<><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/></>} />;
const IconArrowRight = (p) => <Icon {...p} d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>} />;
const IconArrowUpRight = (p) => <Icon {...p} d={<><line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/></>} />;
const IconMountain = (p) => <Icon {...p} d={<><path d="M3 20l6-10 4 7 3-5 5 8z"/><circle cx="17" cy="6" r="1.5"/></>} />;
const IconTent = (p) => <Icon {...p} d={<><path d="M3 20L12 4l9 16"/><path d="M12 4v16"/><path d="M9 20l3-4 3 4"/></>} />;
const IconBoot = (p) => <Icon {...p} d={<><path d="M6 4h5v9l4 2 4 1v4H6z"/><line x1="6" y1="15" x2="11" y2="15"/></>} />;
const IconJacket = (p) => <Icon {...p} d={<><path d="M7 4l-3 3 2 4v9h12v-9l2-4-3-3-3 2-3-1-3 1z"/><line x1="12" y1="5" x2="12" y2="20"/></>} />;
const IconStar = (p) => <Icon {...p} d={<polygon points="12 3 14.6 9 21 9.7 16 14 17.5 20.5 12 17.2 6.5 20.5 8 14 3 9.7 9.4 9"/>} />;
const IconCheck = (p) => <Icon {...p} d={<polyline points="4 12 10 18 20 6"/>} />;
const IconShield = (p) => <Icon {...p} d={<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><polyline points="9 12 11 14 15 10"/></>} />;
const IconTruck = (p) => <Icon {...p} d={<><rect x="2" y="6" width="12" height="10" rx="1"/><polygon points="14 9 19 9 22 13 22 16 14 16"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></>} />;
const IconCompass = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><polygon points="15 9 13 13 9 15 11 11"/></>} />;
const IconInstagram = (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></>} />;
const IconYoutube = (p) => <Icon {...p} d={<><rect x="2.5" y="6" width="19" height="12" rx="3"/><polygon points="10 9 16 12 10 15" fill="currentColor"/></>} />;
const IconStrava = (p) => <Icon {...p} d={<><polyline points="3 13 8 4 13 13 11 13"/><polyline points="11 13 14 19 17 13 19 13"/></>} />;
const IconPlus = (p) => <Icon {...p} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />;
const IconMinus = (p) => <Icon {...p} d={<line x1="5" y1="12" x2="19" y2="12"/>} />;
const IconTrash = (p) => <Icon {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>} />;
const IconChevronRight = (p) => <Icon {...p} d={<polyline points="9 6 15 12 9 18"/>} />;
const IconChevronLeft = (p) => <Icon {...p} d={<polyline points="15 6 9 12 15 18"/>} />;
const IconChevronDown = (p) => <Icon {...p} d={<polyline points="6 9 12 15 18 9"/>} />;
const IconEdit = (p) => <Icon {...p} d={<><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />;
const IconBox = (p) => <Icon {...p} d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>} />;
const IconClipboard = (p) => <Icon {...p} d={<><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>} />;
const IconTicket = (p) => <Icon {...p} d={<><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><line x1="13" y1="5" x2="13" y2="7"/><line x1="13" y1="11" x2="13" y2="13"/><line x1="13" y1="17" x2="13" y2="19"/></>} />;
const IconUsers = (p) => <Icon {...p} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const IconLayers = (p) => <Icon {...p} d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} />;
const IconTag = (p) => <Icon {...p} d={<><path d="M20 12l-8 8-9-9V4h7l10 10z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></>} />;
const IconHome = (p) => <Icon {...p} d={<><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/></>} />;
const IconLogOut = (p) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />;
const IconImage = (p) => <Icon {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><polyline points="3 17 8 12 13 17 17 13 21 17"/></>} />;
const IconUpload = (p) => <Icon {...p} d={<><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/></>} />;
const IconAlertTriangle = (p) => <Icon {...p} d={<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></>} />;
const IconEye = (p) => <Icon {...p} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />;
const IconEyeOff = (p) => <Icon {...p} d={<><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 4.06-4.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-1.34 2.16"/><line x1="1" y1="1" x2="23" y2="23"/></>} />;
const IconPackage = (p) => <Icon {...p} d={<><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>} />;
const IconSettings = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />;
const IconTrendingUp = (p) => <Icon {...p} d={<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="17 7 22 7 22 12"/></>} />;
const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></>} />;
const IconSliders = (p) => <Icon {...p} d={<><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>} />;

Object.assign(window, {
  IconMenu, IconX, IconSearch, IconUser, IconCart,
  IconArrowRight, IconArrowUpRight, IconMountain,
  IconTent, IconBoot, IconJacket, IconStar, IconCheck,
  IconShield, IconTruck, IconCompass,
  IconInstagram, IconYoutube, IconStrava,
  IconPlus, IconMinus, IconTrash, IconChevronRight, IconChevronLeft, IconChevronDown,
  IconEdit, IconBox, IconClipboard, IconTicket, IconUsers, IconLayers, IconTag,
  IconHome, IconLogOut, IconImage, IconUpload, IconAlertTriangle,
  IconEye, IconEyeOff, IconPackage, IconSettings, IconTrendingUp, IconClock, IconSliders,
});
