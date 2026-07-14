const WORKER_PROFILES = [
  { key: "Никита П", full: "Пахнев Никита", aliases: ["Никита П", "Пахнев Никита", "Пахнев"], defaultRates: { 1: 500, 2: 300, 3: 300, 4: 300, 5: 300 } },
  { key: "Андрей Ш", full: "Шолохов Андрей", aliases: ["Андрей Ш", "Шолохов Андрей", "Шолохов"], defaultRates: { 1: 500, 2: 300, 3: 250, 4: 250, 5: 250 } },
  { key: "Дмитрий П", full: "Петухов Дмитрий", aliases: ["Дмитрий П", "Петухов Дмитрий", "Петухов"], defaultRates: { 1: 400, 2: 200, 3: 200, 4: 200, 5: 200 } },
  { key: "Роман З", full: "Зинченко Роман", aliases: ["Роман З", "Зинченко Роман", "Зинченко"], defaultRates: { 1: 400, 2: 200, 3: 200, 4: 200, 5: 200 } },
  { key: "Никита К", full: "Кислов Никита", aliases: ["Никита К", "Кислов Никита", "Кислов"], defaultRates: { 1: 500, 2: 250, 3: 200, 4: 200, 5: 200 } }
];
const WORKERS = WORKER_PROFILES.map((w) => w.key);
const WORKER_BY_KEY = Object.fromEntries(WORKER_PROFILES.map((w) => [w.key, w]));

const AUTO_DEFAULT_INSTALLER = "Роман З";
const AUTO_DEFAULT_RESPONSIBLE = "Роман";
const AUTO_PAY_RATES = [
  {
    "code": "Зад.полусфера",
    "direction": "Тонировка",
    "service": "Тонирование задней полусферы",
    "unit": "авто",
    "price": 6000.0,
    "pay": 3000.0
  },
  {
    "code": "Форточки",
    "direction": "Тонировка",
    "service": "Форточки",
    "unit": "пара",
    "price": 1000.0,
    "pay": 1000.0
  },
  {
    "code": "Пер. боковые",
    "direction": "Тонировка",
    "service": "Тонирование передней полусферы",
    "unit": "авто",
    "price": 4000.0,
    "pay": 4000.0
  },
  {
    "code": "Боковые",
    "direction": "Тонировка",
    "service": "Тонирование передних/задних боковых стекол",
    "unit": "пара",
    "price": 4000.0,
    "pay": 2000.0
  },
  {
    "code": "1 боковое",
    "direction": "Тонировка",
    "service": "Тонирование 1 бокового стекла",
    "unit": "шт.",
    "price": 2000.0,
    "pay": 1000.0
  },
  {
    "code": "Лоб. Стекло",
    "direction": "Тонировка",
    "service": "Тонирование лобового стекла",
    "unit": "шт.",
    "price": 4000.0,
    "pay": 2000.0
  },
  {
    "code": "Зад стекло",
    "direction": "Тонировка",
    "service": "Тонирование заднего стекла",
    "unit": "шт.",
    "price": 4000.0,
    "pay": 1500.0
  },
  {
    "code": "Полоса лоб",
    "direction": "Тонировка",
    "service": "Полоса на лобовое стекло",
    "unit": "шт.",
    "price": 1200.0,
    "pay": 1200.0
  },
  {
    "code": "Панорама",
    "direction": "Тонировка",
    "service": "Тонирование панорамы",
    "unit": "шт.",
    "price": 6000.0,
    "pay": 4000.0
  },
  {
    "code": "Люк",
    "direction": "Тонировка",
    "service": "Тонирование люка",
    "unit": "шт.",
    "price": "",
    "percent": 0.5
  },
  {
    "code": "Демонтаж пленки",
    "direction": "Демонтаж",
    "service": "Демонтаж пленки",
    "unit": "пара",
    "price": "",
    "percent": 0.5
  },
  {
    "code": "Демонтаж клея",
    "direction": "Демонтаж",
    "service": "Демонтаж клея",
    "unit": "пара",
    "price": "",
    "percent": 0.5
  },
  {
    "code": "Брон. Лобового",
    "direction": "Бронирование",
    "service": "Бронирование лобового стекла",
    "unit": "шт.",
    "price": 24000.0,
    "pay": 6000.0
  },
  {
    "code": "Брон. Фар",
    "direction": "Бронирование",
    "service": "Бронирование фар",
    "unit": "пара",
    "price": 6000.0,
    "pay": 2000.0
  },
  {
    "code": "Брон. 1 фары",
    "direction": "Бронирование",
    "service": "Бронирование 1 фары",
    "unit": "шт.",
    "price": 3000.0,
    "pay": 1000.0
  },
  {
    "code": "Брон. Туманок",
    "direction": "Бронирование",
    "service": "Бронирование противотуманных фар (1 шт)",
    "unit": "шт.",
    "price": 500.0,
    "pay": 500.0
  },
  {
    "code": "Брон. Порогов",
    "direction": "Бронирование",
    "service": "Бронирование порогов",
    "unit": "шт.",
    "price": 500.0,
    "pay": 500.0
  },
  {
    "code": "Полоса на крышу",
    "direction": "Бронирование",
    "service": "Полоса на крышу",
    "unit": "шт.",
    "price": 4000.0,
    "pay": 2000.0
  },
  {
    "code": "Антиблик",
    "direction": "Антиблик",
    "service": "Антибликовая плёнка на монитор",
    "unit": "шт.",
    "price": 2000.0,
    "pay": 700.0
  },
  {
    "code": "Доплата",
    "direction": "Доплаты",
    "service": "Доплата",
    "unit": "авто",
    "price": ""
  }
];
const TRASH_STATUSES = new Set(["Отменена", "Удалена", "Отказ", "В корзине", "Удаление", "Событие (удаление)", "Событие удалено"]);
const PAYROLL_STATUSES = new Set(["Выполнено", "Оплачено"]);
const $ = (id) => document.getElementById(id);

let records = [];
let current = null;
let cal = new Date();
let selectedCalendarDate = today();
let currentReportType = "requests";
let selectedInstaller = null;
let filesCache = [];
let calendarImportEvents = [];
let quickCalendarEvent = null;
let currentClientKey = null;
let smsQueueCache = [];
let currentSmsId = null;
let autosaveTimer = null;
let autosaveBusy = false;
let lastAutosaveSnapshot = "";

const storage = {
  password: "solncanet_admin_password_v9",
  userName: "solncanet_user_name_v41",
  workspace: "solncanet_workspace_v46",
  history: "solncanet_history_v9",
  payroll: "solncanet_payroll_settings_v9",
  notificationLog: "solncanet_notification_log_v19",
  calendarHidden: "solncanet_calendar_hidden_v22",
  activity: "solncanet_activity_v45",
  comments: "solncanet_comments_v45",
  filesFallback: "solncanet_files_fallback_v54"
};


const WORKSPACES = {
  architecture: "Архитектура",
  auto: "Авто",
  all: "Все"
};
const APP_ACCOUNTS = [
  { name: "Сергей", role: "admin", password: "sergey41" },
  { name: "Роман", role: "admin", password: "roman41" },
  { name: "Никита К", role: "staff", password: "nikitaK41" },
  { name: "Дима", role: "staff", password: "dima41" },
  { name: "Никита П", role: "staff", password: "nikitaP41" },
  { name: "Андрей", role: "staff", password: "andrey41" }
];
let currentWorkspace = localStorage.getItem(storage.workspace) || "all";
let autoRefreshTimer = null;
let lastLoadAt = 0;
let selectedRequestIds = new Set();
let bulkLastPageIds = [];
let contextMenuEl = null;

const els = {
  sidebar: $("sidebar"), mobileMenuBtn: $("mobileMenuBtn"), sidebarCloseBtn: $("sidebarCloseBtn"), sidebarOverlay: $("sidebarOverlay"),
  loginPanel: $("loginPanel"), appPanel: $("appPanel"), loginForm: $("loginForm"), passwordInput: $("passwordInput"), loginMessage: $("loginMessage"), logoutBtn: $("logoutBtn"), refreshBtn: $("refreshBtn"), listBtn: $("listBtn"), calendarBtn: $("calendarBtn"), listView: $("listView"), calendarView: $("calendarView"), requestsBody: $("requestsBody"), calendarGrid: $("calendarGrid"), monthTitle: $("monthTitle"), calendarMonthSummary: $("calendarMonthSummary"), calendarTodayBtn: $("calendarTodayBtn"), calendarDayAgenda: $("calendarDayAgenda"), calendarSelectedDateTitle: $("calendarSelectedDateTitle"), calendarSelectedDateSummary: $("calendarSelectedDateSummary"), calendarSelectedEvents: $("calendarSelectedEvents"), prevMonth: $("prevMonth"), nextMonth: $("nextMonth"), searchInput: $("searchInput"), statusFilter: $("statusFilter"), installerFilter: $("installerFilter"), dateFrom: $("dateFrom"), dateTo: $("dateTo"), clearFiltersBtn: $("clearFiltersBtn"), message: $("message"), statTotal: $("statTotal"), statNew: $("statNew"), statToday: $("statToday"), statWork: $("statWork"), statVolume: $("statVolume"), statFiltered: $("statFiltered"), bulkToolbar: $("bulkToolbar"), bulkSelectedCount: $("bulkSelectedCount"), bulkSelectAll: $("bulkSelectAll"), bulkDeleteBtn: $("bulkDeleteBtn"), bulkStatusSelect: $("bulkStatusSelect"), bulkApplyStatusBtn: $("bulkApplyStatusBtn"), bulkInstallerSelect: $("bulkInstallerSelect"), bulkApplyInstallerBtn: $("bulkApplyInstallerBtn"), bulkExportBtn: $("bulkExportBtn"),
  dialog: $("requestDialog"), dialogTitle: $("dialogTitle"), requestInfo: $("requestInfo"), editDate: $("editDate"), editTime: $("editTime"), editStatus: $("editStatus"), editM2: $("editM2"), editResponsible: $("editResponsible"), editCompany: $("editCompany"), editDirection: $("editDirection"), editAutoFields: $("editAutoFields"), editAuto: $("editAuto"), editFilm: $("editFilm"), editAutoServices: $("editAutoServices"), editAddServiceBtn: $("editAddServiceBtn"), editAutoTotal: $("editAutoTotal"), editService: $("editService"), editAddress: $("editAddress"), editAdminComment: $("editAdminComment"), saveRequestBtn: $("saveRequestBtn"), cancelRequestBtn: $("cancelRequestBtn"), cancelReason: $("cancelReason"), requestHistoryBox: $("requestHistoryBox"), requestAutosaveStatus: $("requestAutosaveStatus"), requestCommentsBox: $("requestCommentsBox"), requestCommentText: $("requestCommentText"), addRequestCommentBtn: $("addRequestCommentBtn"), activityBody: $("activityBody"), requestGoogleCalendarBox: $("requestGoogleCalendarBox"), requestGoogleCreateBtn: $("requestGoogleCreateBtn"), requestGoogleOpenLink: $("requestGoogleOpenLink"), requestGoogleStatus: $("requestGoogleStatus"), exportBtn: $("exportBtn"),
  clientsBody: $("clientsBody"), objectsBody: $("objectsBody"), installersBody: $("installersBody"), trashBody: $("trashBody"), historyBody: $("historyBody"), historySearchInput: $("historySearchInput"), clearHistoryLocalBtn: $("clearHistoryLocalBtn"), filesBody: $("filesBody"), filesSearchInput: $("filesSearchInput"), filesTypeFilter: $("filesTypeFilter"),
  quickAddBtn: $("quickAddBtn"), quickAddDialog: $("quickAddDialog"), quickSaveBtn: $("quickSaveBtn"), quickName: $("quickName"), quickCompany: $("quickCompany"), quickPhone: $("quickPhone"), quickClientHint: $("quickClientHint"), quickClientSuggestions: $("quickClientSuggestions"), quickGoogleSync: $("quickGoogleSync"), quickDirection: $("quickDirection"), quickAutoFields: $("quickAutoFields"), quickAuto: $("quickAuto"), quickFilm: $("quickFilm"), quickAutoServices: $("quickAutoServices"), quickAddServiceBtn: $("quickAddServiceBtn"), quickAutoTotal: $("quickAutoTotal"), quickService: $("quickService"), quickServiceLabel: $("quickServiceLabel"), quickM2Label: $("quickM2Label"), quickAddressLabel: $("quickAddressLabel"), editServiceLabel: $("editServiceLabel"), quickDate: $("quickDate"), quickTime: $("quickTime"), quickM2: $("quickM2"), quickAddress: $("quickAddress"), quickComment: $("quickComment"),
  reportDialog: $("reportDialog"), reportTitle: $("reportTitle"), reportDateFrom: $("reportDateFrom"), reportDateTo: $("reportDateTo"), reportStatus: $("reportStatus"), reportFormat: $("reportFormat"), reportAllInstallers: $("reportAllInstallers"), downloadReportBtn: $("downloadReportBtn"), payrollOptions: $("payrollOptions"), payrollSplitMode: $("payrollSplitMode"), payrollStatusMode: $("payrollStatusMode"), payrollSettingsBody: $("payrollSettingsBody"), savePayrollSettingsBtn: $("savePayrollSettingsBtn"), previewPayrollBtn: $("previewPayrollBtn"), reportPreview: $("reportPreview"),
  clientsSearchInput: $("clientsSearchInput"), clientsDateFrom: $("clientsDateFrom"), clientsDateTo: $("clientsDateTo"), clientsServiceFilter: $("clientsServiceFilter"), clientsFilmFilter: $("clientsFilmFilter"), clientsStatusFilter: $("clientsStatusFilter"), clientsClearFiltersBtn: $("clientsClearFiltersBtn"), clientsStatCount: $("clientsStatCount"), clientsStatRequests: $("clientsStatRequests"), clientsStatM2: $("clientsStatM2"), clientsStatRepeat: $("clientsStatRepeat"),
  objectsSearchInput: $("objectsSearchInput"), objectsDateFrom: $("objectsDateFrom"), objectsDateTo: $("objectsDateTo"), objectsServiceFilter: $("objectsServiceFilter"), objectsStatusFilter: $("objectsStatusFilter"), objectsInstallerFilter: $("objectsInstallerFilter"), objectsM2Min: $("objectsM2Min"), objectsM2Max: $("objectsM2Max"), objectsClearFiltersBtn: $("objectsClearFiltersBtn"), objectsStatCount: $("objectsStatCount"), objectsStatM2: $("objectsStatM2"), objectsStatDone: $("objectsStatDone"), objectsStatWork: $("objectsStatWork"),
  installersSearchInput: $("installersSearchInput"), installersDateFrom: $("installersDateFrom"), installersDateTo: $("installersDateTo"), installersStatusFilter: $("installersStatusFilter"), installersServiceFilter: $("installersServiceFilter"), installersClearFiltersBtn: $("installersClearFiltersBtn"), installersStatJobs: $("installersStatJobs"), installersStatM2: $("installersStatM2"), installersStatAmount: $("installersStatAmount"), installersStatTotal: $("installersStatTotal"), payrollGuide: $("payrollGuide"),
  installerDetailsPanel: $("installerDetailsPanel"), installerDetailsTitle: $("installerDetailsTitle"), installerDetailsInfo: $("installerDetailsInfo"), installerDetailsCloseBtn: $("installerDetailsCloseBtn"), installerDetailsSearchInput: $("installerDetailsSearchInput"), installerDetailsDateFrom: $("installerDetailsDateFrom"), installerDetailsDateTo: $("installerDetailsDateTo"), installerDetailsStatusFilter: $("installerDetailsStatusFilter"), installerDetailsServiceFilter: $("installerDetailsServiceFilter"), installerDetailsM2Min: $("installerDetailsM2Min"), installerDetailsM2Max: $("installerDetailsM2Max"), installerDetailsClearBtn: $("installerDetailsClearBtn"), installerDetailsStatJobs: $("installerDetailsStatJobs"), installerDetailsStatM2: $("installerDetailsStatM2"), installerDetailsStatAmount: $("installerDetailsStatAmount"), installerDetailsStatRate: $("installerDetailsStatRate"), installerDetailsBody: $("installerDetailsBody"),
  notifyTemplate: $("notifyTemplate"), notifyChannel: $("notifyChannel"), notifyMessage: $("notifyMessage"), sendNotifyBtn: $("sendNotifyBtn"), copyNotifyBtn: $("copyNotifyBtn"), requestNotifyStatus: $("requestNotifyStatus"),
  notificationCheckBtn: $("notificationCheckBtn"), smsBalanceBtn: $("smsBalanceBtn"), smsBalanceText: $("smsBalanceText"), notificationSmsStatus: $("notificationSmsStatus"), notificationTelegramStatus: $("notificationTelegramStatus"), testNotifyChannel: $("testNotifyChannel"), testNotifyTo: $("testNotifyTo"), testNotifyMessage: $("testNotifyMessage"), sendTestNotifyBtn: $("sendTestNotifyBtn"), copyTestNotifyBtn: $("copyTestNotifyBtn"), notificationStatus: $("notificationStatus"), notificationTemplatesList: $("notificationTemplatesList"), notificationLogBody: $("notificationLogBody"), sigmaStatusId: $("sigmaStatusId"), checkSigmaStatusBtn: $("checkSigmaStatusBtn"), sigmaStatusText: $("sigmaStatusText"), smsQueueRefreshBtn: $("smsQueueRefreshBtn"), smsQueueSearch: $("smsQueueSearch"), smsQueueStatus: $("smsQueueStatus"), smsQueueFrom: $("smsQueueFrom"), smsQueueTo: $("smsQueueTo"), smsQueueBody: $("smsQueueBody"), smsQueueStatusText: $("smsQueueStatusText"), smsStatTotal: $("smsStatTotal"), smsStatPlanned: $("smsStatPlanned"), smsStatSent: $("smsStatSent"), smsStatErrors: $("smsStatErrors"), smsDetailDialog: $("smsDetailDialog"), smsDetailTitle: $("smsDetailTitle"), smsDetailSubtitle: $("smsDetailSubtitle"), smsDetailStatusPill: $("smsDetailStatusPill"), smsDetailClient: $("smsDetailClient"), smsDetailPhone: $("smsDetailPhone"), smsDetailRequestId: $("smsDetailRequestId"), smsDetailSigmaId: $("smsDetailSigmaId"), smsDetailClientId: $("smsDetailClientId"), smsDetailDelivery: $("smsDetailDelivery"), smsDetailMessage: $("smsDetailMessage"), smsDetailService: $("smsDetailService"), smsDetailCheckBtn: $("smsDetailCheckBtn"), smsDetailCopyIdBtn: $("smsDetailCopyIdBtn"), smsDetailSendNowBtn: $("smsDetailSendNowBtn"), smsDetailOpenRequestBtn: $("smsDetailOpenRequestBtn"), smsDetailCancelBtn: $("smsDetailCancelBtn"), smsDetailStatusText: $("smsDetailStatusText"), scheduleSmsTemplate: $("scheduleSmsTemplate"), scheduleSmsDate: $("scheduleSmsDate"), scheduleSmsTime: $("scheduleSmsTime"), scheduleSmsMessage: $("scheduleSmsMessage"), scheduleSmsBtn: $("scheduleSmsBtn"), scheduleDefaultSmsBtn: $("scheduleDefaultSmsBtn"), scheduleSmsStatus: $("scheduleSmsStatus"),
  calendarImportCheckBtn: $("calendarImportCheckBtn"), calendarImportLoadBtn: $("calendarImportLoadBtn"), calendarImportSearch: $("calendarImportSearch"), calendarImportFrom: $("calendarImportFrom"), calendarImportTo: $("calendarImportTo"), calendarImportMode: $("calendarImportMode"), calendarImportTodayBtn: $("calendarImportTodayBtn"), calendarImportWeekBtn: $("calendarImportWeekBtn"), calendarImportStatus: $("calendarImportStatus"), calendarImportList: $("calendarImportList"), calendarImportStatTotal: $("calendarImportStatTotal"), calendarImportStatWork: $("calendarImportStatWork"), calendarImportStatImported: $("calendarImportStatImported"), calendarImportStatHidden: $("calendarImportStatHidden"),
  topQuickAddBtn: $("topQuickAddBtn"), topRefreshBtn: $("topRefreshBtn"), topReportsBtn: $("topReportsBtn"), globalSearchInput: $("globalSearchInput"), globalSearchResults: $("globalSearchResults"),
  clientCardDialog: $("clientCardDialog"), clientCardTitle: $("clientCardTitle"), clientCardSubtitle: $("clientCardSubtitle"), clientCardQuickBtn: $("clientCardQuickBtn"), clientCardStatRequests: $("clientCardStatRequests"), clientCardStatM2: $("clientCardStatM2"), clientCardStatDone: $("clientCardStatDone"), clientCardStatLast: $("clientCardStatLast"), clientCardInfo: $("clientCardInfo"), clientCardAddresses: $("clientCardAddresses"), clientCardRequestsBody: $("clientCardRequestsBody"), clientCardFiles: $("clientCardFiles"), clientCardComments: $("clientCardComments")
};

const NOTIFICATION_TEMPLATES = {
  confirm: { title: "Запись подтверждена", text: "СОЛНЦАНЕТ: ваша запись подтверждена на {date} в {time}. Адрес: {address}. Тел. +7 912 662-92-35" },
  reminder: { title: "Напоминание о записи", text: "СОЛНЦАНЕТ: напоминаем о записи {date} в {time}. Услуга: {service}. Адрес: {address}. Тел. +7 912 662-92-35" },
  reschedule: { title: "Перенос записи", text: "СОЛНЦАНЕТ: ваша запись перенесена на {date} в {time}. Адрес: {address}. Если время не подходит, свяжитесь с нами: +7 912 662-92-35" },
  cancel: { title: "Отмена записи", text: "СОЛНЦАНЕТ: ваша запись отменена. Для выбора новой даты свяжитесь с нами: +7 912 662-92-35" },
  done: { title: "Работы выполнены", text: "СОЛНЦАНЕТ: работы по услуге {service} выполнены. Спасибо за обращение! По вопросам гарантии: +7 912 662-92-35" },
  review: { title: "Просьба оставить отзыв", text: "СОЛНЦАНЕТ: спасибо за обращение! Будем благодарны за отзыв о нашей работе. Это помогает нам становиться лучше." },
  custom: { title: "Свой текст", text: "" }
};

init();

function init() {
  const saved = localStorage.getItem(storage.password);
  if (saved) login(saved);

  els.loginForm.addEventListener("submit", (e) => { e.preventDefault(); login(els.passwordInput.value.trim()); });
  els.logoutBtn.addEventListener("click", () => { localStorage.removeItem(storage.password); localStorage.removeItem(storage.userName); records = []; currentUser = null; showLogin(); });
  els.refreshBtn.addEventListener("click", load);
  els.listBtn.addEventListener("click", () => setView("list"));
  els.calendarBtn.addEventListener("click", () => setView("calendar"));
  els.prevMonth.addEventListener("click", () => { cal.setMonth(cal.getMonth() - 1); render(); });
  els.nextMonth.addEventListener("click", () => { cal.setMonth(cal.getMonth() + 1); render(); });
  if (els.calendarTodayBtn) els.calendarTodayBtn.addEventListener("click", () => { const now = new Date(); cal = new Date(now.getFullYear(), now.getMonth(), 1); selectedCalendarDate = today(); render(); });
  initMobileSidebar();
  initClickableRows();
  initContextMenu();
  initAutoServiceDatalist();
  initDialogBackdropClose();

  [els.searchInput, els.statusFilter, els.installerFilter, els.dateFrom, els.dateTo].forEach((el) => {
    el.addEventListener("input", renderAll);
    el.addEventListener("change", renderAll);
  });

  els.clearFiltersBtn.addEventListener("click", clearFilters);
  if (els.bulkSelectAll) els.bulkSelectAll.addEventListener("change", () => setBulkPageSelection(els.bulkSelectAll.checked));
  if (els.bulkDeleteBtn) els.bulkDeleteBtn.addEventListener("click", bulkMoveToTrash);
  if (els.bulkApplyStatusBtn) els.bulkApplyStatusBtn.addEventListener("click", bulkApplyStatus);
  if (els.bulkApplyInstallerBtn) els.bulkApplyInstallerBtn.addEventListener("click", bulkApplyInstaller);
  if (els.bulkExportBtn) els.bulkExportBtn.addEventListener("click", bulkExportSelected);
  els.saveRequestBtn.addEventListener("click", saveRequest);
  initRequestAutosave();
  if (els.addRequestCommentBtn) els.addRequestCommentBtn.addEventListener("click", addRequestComment);
  if (els.requestGoogleCreateBtn) els.requestGoogleCreateBtn.addEventListener("click", createOrUpdateGoogleCalendarForCurrent);
  els.cancelRequestBtn.addEventListener("click", cancelCurrentRequest);
  els.exportBtn.addEventListener("click", () => setSection("reports"));
  els.quickAddBtn.addEventListener("click", openQuickAdd);
  if (els.topQuickAddBtn) els.topQuickAddBtn.addEventListener("click", openQuickAdd);
  if (els.topRefreshBtn) els.topRefreshBtn.addEventListener("click", load);
  if (els.workspaceSelect) els.workspaceSelect.addEventListener("change", () => setWorkspace(els.workspaceSelect.value));
  initWorkspaceSegment();
  if (els.quickDirection) els.quickDirection.addEventListener("change", updateQuickDirectionUI);
  if (els.editDirection) els.editDirection.addEventListener("change", updateEditDirectionUI);
  if (els.quickAddServiceBtn) els.quickAddServiceBtn.addEventListener("click", () => addAutoServiceRow("quick"));
  if (els.editAddServiceBtn) els.editAddServiceBtn.addEventListener("click", () => addAutoServiceRow("edit"));
  if (els.topReportsBtn) els.topReportsBtn.addEventListener("click", () => openReport("payroll"));
  if (els.globalSearchInput) els.globalSearchInput.addEventListener("input", renderGlobalSearch);
  if (els.globalSearchInput) els.globalSearchInput.addEventListener("focus", renderGlobalSearch);
  if (els.globalSearchResults) els.globalSearchResults.addEventListener("click", handleGlobalSearchClick);
  if (els.clientCardQuickBtn) els.clientCardQuickBtn.addEventListener("click", quickAddFromClientCard);
  els.quickSaveBtn.addEventListener("click", saveQuickAdd);
  if (els.quickPhone) {
    els.quickPhone.addEventListener("input", handleQuickPhoneInput);
    els.quickPhone.addEventListener("focus", renderQuickClientSuggestions);
    els.quickPhone.addEventListener("keydown", handleQuickPhoneKeydown);
  }
  if (els.quickClientSuggestions) {
    els.quickClientSuggestions.addEventListener("click", handleQuickClientSuggestionClick);
  }
  document.addEventListener("click", (event) => {
    if (els.globalSearchInput && els.globalSearchResults && !els.globalSearchInput.contains(event.target) && !els.globalSearchResults.contains(event.target)) {
      els.globalSearchResults.hidden = true;
    }
    if (!els.quickAddDialog || !els.quickAddDialog.open) return;
    if (els.quickPhone && els.quickPhone.contains(event.target)) return;
    if (els.quickClientSuggestions && els.quickClientSuggestions.contains(event.target)) return;
    hideQuickClientSuggestions();
  });
  els.filesSearchInput.addEventListener("input", renderFiles);
  els.filesTypeFilter.addEventListener("change", renderFiles);
  initFileServiceEvents();
  els.historySearchInput.addEventListener("input", renderHistorySection);
  els.clearHistoryLocalBtn.addEventListener("click", clearLocalHistory);
  initNotifications();
  initCalendarImport();

  [els.clientsSearchInput, els.clientsDateFrom, els.clientsDateTo, els.clientsServiceFilter, els.clientsFilmFilter, els.clientsStatusFilter].forEach((el) => el && el.addEventListener("input", renderClients));
  [els.clientsDateFrom, els.clientsDateTo, els.clientsServiceFilter, els.clientsStatusFilter].forEach((el) => el && el.addEventListener("change", renderClients));
  if (els.clientsClearFiltersBtn) els.clientsClearFiltersBtn.addEventListener("click", clearClientFilters);

  [els.objectsSearchInput, els.objectsDateFrom, els.objectsDateTo, els.objectsServiceFilter, els.objectsStatusFilter, els.objectsInstallerFilter, els.objectsM2Min, els.objectsM2Max].forEach((el) => el && el.addEventListener("input", renderObjects));
  [els.objectsDateFrom, els.objectsDateTo, els.objectsServiceFilter, els.objectsStatusFilter, els.objectsInstallerFilter].forEach((el) => el && el.addEventListener("change", renderObjects));
  if (els.objectsClearFiltersBtn) els.objectsClearFiltersBtn.addEventListener("click", clearObjectFilters);

  [els.installersSearchInput, els.installersDateFrom, els.installersDateTo, els.installersStatusFilter, els.installersServiceFilter].forEach((el) => el && el.addEventListener("input", renderInstallers));
  [els.installersDateFrom, els.installersDateTo, els.installersStatusFilter, els.installersServiceFilter].forEach((el) => el && el.addEventListener("change", renderInstallers));
  if (els.installersClearFiltersBtn) els.installersClearFiltersBtn.addEventListener("click", clearInstallerFilters);

  [els.installerDetailsSearchInput, els.installerDetailsDateFrom, els.installerDetailsDateTo, els.installerDetailsStatusFilter, els.installerDetailsServiceFilter, els.installerDetailsM2Min, els.installerDetailsM2Max].forEach((el) => el && el.addEventListener("input", renderInstallerDetails));
  [els.installerDetailsDateFrom, els.installerDetailsDateTo, els.installerDetailsStatusFilter, els.installerDetailsServiceFilter].forEach((el) => el && el.addEventListener("change", renderInstallerDetails));
  if (els.installerDetailsClearBtn) els.installerDetailsClearBtn.addEventListener("click", clearInstallerDetailsFilters);
  if (els.installerDetailsCloseBtn) els.installerDetailsCloseBtn.addEventListener("click", closeInstallerDetails);

  document.querySelectorAll("[data-section]").forEach((link) => link.addEventListener("click", (e) => { e.preventDefault(); setSection(link.dataset.section); }));
  document.querySelectorAll("[data-report]").forEach((button) => button.addEventListener("click", () => openReport(button.dataset.report)));

  els.reportAllInstallers.addEventListener("change", () => {
    if (els.reportAllInstallers.checked) document.querySelectorAll('[name="reportInstaller"]').forEach((c) => c.checked = false);
    updateReportPreview();
  });
  document.querySelectorAll('[name="reportInstaller"]').forEach((c) => c.addEventListener("change", () => {
    if ([...document.querySelectorAll('[name="reportInstaller"]')].some((x) => x.checked)) els.reportAllInstallers.checked = false;
    updateReportPreview();
  }));
  [els.reportDateFrom, els.reportDateTo, els.reportStatus, els.reportFormat, els.payrollSplitMode, els.payrollStatusMode].forEach((el) => el && el.addEventListener("change", updateReportPreview));

  els.savePayrollSettingsBtn.addEventListener("click", () => { savePayrollSettingsFromForm(); msg("Ставки зарплаты сохранены в браузере"); updateReportPreview(); });
  els.previewPayrollBtn.addEventListener("click", updateReportPreview);
  els.downloadReportBtn.addEventListener("click", downloadReport);
  if (els.payrollSettingsBody) els.payrollSettingsBody.addEventListener("input", () => { savePayrollSettingsFromForm(); updateReportPreview(); });

  setDefaultDates();
  renderPayrollSettings();
}

function initMobileSidebar() {
  if (els.mobileMenuBtn) els.mobileMenuBtn.addEventListener("click", openMobileSidebar);
  if (els.sidebarCloseBtn) els.sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  if (els.sidebarOverlay) els.sidebarOverlay.addEventListener("click", closeMobileSidebar);
  if (els.sidebar) els.sidebar.addEventListener("click", (event) => {
    const link = event.target.closest("[data-section]");
    if (link) closeMobileSidebar();
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMobileSidebar(); });
}
function openMobileSidebar() { document.body.classList.add("sidebar-open"); }
function closeMobileSidebar() { document.body.classList.remove("sidebar-open"); }


function rowClickIgnored(target) {
  return Boolean(target.closest('button, a, input, select, textarea, label, summary, [role="button"], .file-chip, .quick-client-suggestions, .global-search-results'));
}

function handleClickableTableRow(event) {
  if (rowClickIgnored(event.target)) return;
  const row = event.target.closest('tr[data-open-row], tr[data-open-client-row], tr[data-installer-row]');
  if (!row) return;
  if (row.dataset.openRow) return openRequest(row.dataset.openRow);
  if (row.dataset.openClientRow) return openClientCard(row.dataset.openClientRow);
  if (row.dataset.installerRow) return openInstallerDetails(row.dataset.installerRow);
}

function initClickableRows() {
  [
    els.requestsBody,
    els.clientsBody,
    els.objectsBody,
    els.installersBody,
    els.installerDetailsBody,
    els.trashBody,
    els.historyBody,
    els.filesBody,
    $('clientCardRequestsBody')
  ].filter(Boolean).forEach((body) => body.addEventListener('click', handleClickableTableRow));
}

function initDialogBackdropClose() {
  document.querySelectorAll('dialog').forEach((dialog) => {
    let backdropPointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerMoved = false;

    dialog.addEventListener('pointerdown', (event) => {
      backdropPointerDown = event.target === dialog;
      pointerStartX = event.clientX || 0;
      pointerStartY = event.clientY || 0;
      pointerMoved = false;
    });

    dialog.addEventListener('pointermove', (event) => {
      if (!backdropPointerDown) return;
      const dx = Math.abs((event.clientX || 0) - pointerStartX);
      const dy = Math.abs((event.clientY || 0) - pointerStartY);
      if (dx > 6 || dy > 6) pointerMoved = true;
    });

    dialog.addEventListener('pointerup', (event) => {
      if (!backdropPointerDown) return;
      const shouldClose = event.target === dialog && !pointerMoved;
      backdropPointerDown = false;
      if (shouldClose) dialog.close();
    });

    dialog.addEventListener('click', (event) => {
      // Закрытие по фону обрабатывается через pointerdown/pointerup.
      // Это защищает карточку от случайного закрытия при выделении текста.
      if (event.target === dialog) event.preventDefault();
    });
  });
}

function setDefaultDates() {
  const t = today();
  if (els.quickDate) els.quickDate.value = t;
  if (els.quickTime) els.quickTime.value = "10:00";
}

function accountFromPassword(password) {
  return APP_ACCOUNTS.find((a) => a.password === password) || null;
}
function setWorkspace(value) {
  currentWorkspace = ["architecture", "auto", "all"].includes(value) ? value : "all";
  localStorage.setItem(storage.workspace, currentWorkspace);
  updateWorkspaceUI();
  renderAll();
}
function updateWorkspaceUI() {
  if (els.workspaceSelect) els.workspaceSelect.value = currentWorkspace;
  if (els.userBadge) {
    const name = currentUser?.name || localStorage.getItem(storage.userName) || "Сотрудник";
    els.userBadge.textContent = `${name} · ${WORKSPACES[currentWorkspace] || "Все"}`;
  }
  document.body.dataset.workspace = currentWorkspace;
  document.querySelectorAll("[data-workspace-mode]").forEach((button) => {
    const active = button.dataset.workspaceMode === currentWorkspace;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}
function initWorkspaceSegment() {
  document.querySelectorAll("[data-workspace-mode]").forEach((button) => {
    button.addEventListener("click", () => setWorkspace(button.dataset.workspaceMode));
  });
  updateWorkspaceUI();
}
function recordDirection(recordOrFields) {
  const f = recordOrFields?.fields || recordOrFields || {};
  const raw = norm(f["Направление"] || f["Тип направления"] || f["Категория"] || "");
  const hay = norm([f["Услуга"], f["Авто"], f["Пленка"], f["Авто услуги"], f["Марка"], f["Модель"]].join(" "));
  if (raw.includes("авто") || hay.includes("авто") || hay.includes("лобов") || hay.includes("фар") || hay.includes("полиурет") || hay.includes("керамик") || hay.includes("атерм")) return "auto";
  return "architecture";
}
function workspaceRecords(list) {
  if (currentWorkspace === "all") return list;
  return list.filter((r) => recordDirection(r) === currentWorkspace);
}

async function login(password) {
  els.loginMessage.textContent = "";
  if (!password) { els.loginMessage.textContent = "Введите пароль"; return; }
  const account = accountFromPassword(password);
  try {
    const response = await fetch("/list-zayavki", { headers: { "x-admin-password": password } });
    const data = await response.json();
    if (!response.ok || !data.ok) { els.loginMessage.textContent = data.error || "Неверный пароль"; return showLogin(); }
    localStorage.setItem(storage.password, password);
    if (account) { currentUser = account; localStorage.setItem(storage.userName, account.name); }
    else { currentUser = { name: "Администратор", role: "admin" }; localStorage.setItem(storage.userName, currentUser.name); }
    records = data.records || [];
    await loadFiles(true);
    await loadSmsQueue(true);
    showApp();
    setSection("calendar");
    renderAll();
  } catch (error) {
    els.loginMessage.textContent = "Ошибка входа: " + error.message;
    showLogin();
  }
}

function showApp() { document.body.classList.remove("logged-out"); document.body.classList.add("logged-in"); els.loginPanel.style.display = "none"; els.appPanel.style.display = "block"; updateWorkspaceUI(); startAutoRefresh(); }
function showLogin() { if (autoRefreshTimer) clearInterval(autoRefreshTimer); autoRefreshTimer = null; document.body.classList.remove("logged-in"); document.body.classList.add("logged-out"); els.appPanel.style.display = "none"; els.loginPanel.style.display = "block"; }
function pwd() { return localStorage.getItem(storage.password) || ""; }

async function load(options = {}) {
  const silent = Boolean(options.silent);
  if (!silent) msg("Загружаю...");
  try {
    const response = await fetch("/list-zayavki", { headers: { "x-admin-password": pwd() }, cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка загрузки");
    records = data.records || [];
    await loadFiles(true);
    await loadSmsQueue(true);
    renderAll();
    lastLoadAt = Date.now();
    if (!silent) msg("Готово");
  } catch (error) { if (!silent) msg(error.message); }
}

async function reloadRecordsFromNocoDB() {
  const response = await fetch("/list-zayavki?_=" + Date.now(), { headers: { "x-admin-password": pwd() }, cache: "no-store" });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Не удалось перечитать NocoDB после сохранения");
  records = data.records || [];
  lastLoadAt = Date.now();
  return records;
}
function sameSavedValue(a, b) {
  const av = a === null || a === undefined ? "" : String(a);
  const bv = b === null || b === undefined ? "" : String(b);
  return av === bv;
}
function verifyRecordFields(record, fields) {
  const f = record?.fields || {};
  const misses = [];
  Object.entries(fields || {}).forEach(([key, value]) => {
    if (key.startsWith("__")) return;
    if (!sameSavedValue(f[key], value)) misses.push(`${key}: отправлено «${value ?? ""}», в базе «${f[key] ?? ""}»`);
  });
  return misses;
}

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    if (!document.body.classList.contains("logged-in")) return;
    if (document.hidden) return;
    if (document.querySelector("dialog[open]")) return;
    load({ silent: true });
  }, 15000);
}

function setSection(section) {
  closeMobileSidebar();
  document.querySelectorAll("[data-section]").forEach((a) => a.classList.toggle("active", a.dataset.section === section));
  document.querySelectorAll(".workspace-section").forEach((s) => s.style.display = "none");

  if (section === "calendar") { $("requestsSection").style.display = "block"; setView("calendar", false); }
  else if (section === "requests") { $("requestsSection").style.display = "block"; setView("list", false); }
  else { const target = $(section + "Section"); if (target) target.style.display = "block"; }

  renderAll();
}
function setView(view, doRender = true) { els.listView.style.display = view === "list" ? "block" : "none"; els.calendarView.style.display = view === "calendar" ? "block" : "none"; els.listBtn.classList.toggle("active", view === "list"); els.calendarBtn.classList.toggle("active", view === "calendar"); if (doRender) render(); }
function clearFilters() { els.searchInput.value = ""; els.statusFilter.value = ""; els.installerFilter.value = ""; els.dateFrom.value = ""; els.dateTo.value = ""; renderAll(); }

function isTrashRecord(record) {
  const f = record.fields || {};
  const statusText = fieldText(f["Статус"] || f["Status"] || f["Статус заявки"] || f["Состояние"] || "").trim();
  const statusNorm = norm(statusText);
  if (TRASH_STATUSES.has(statusText)) return true;
  if (statusNorm.includes("удал") || statusNorm.includes("отмен") || statusNorm.includes("отказ") || statusNorm.includes("корзин") || statusNorm.includes("delete") || statusNorm.includes("trash") || statusNorm.includes("cancel")) return true;
  const deletedValue = norm(fieldText(f["Удалено"] || f["Deleted"] || f["В корзине"] || ""));
  if (["true", "1", "да", "yes"].includes(deletedValue)) return true;
  if (f["Дата удаления"] || f["Дата отмены"] || f["Причина отмены"] || f["Deleted At"] || f["deletedAt"]) return true;
  const comment = norm(fieldText(f["Комментарий администратора"] || f["Комментарий"] || f["История изменений"] || ""));
  if (comment.includes("корзина") || comment.includes("удалено вручную") || comment.includes("перенос в корзину") || comment.includes("отмена / удаление")) return true;
  // Последний защитный фильтр: если NocoDB хранит статус как объект/массив или в другом служебном поле,
  // всё равно убираем запись из активных списков и календаря при любом явном признаке удаления.
  const allFields = norm(fieldText(Object.entries(f).filter(([key]) => /статус|удален|удаление|корзин|отмен|отказ|delete|trash|cancel/i.test(key)).map(([, value]) => value)));
  return allFields.includes("удал") || allFields.includes("корзин") || allFields.includes("отмен") || allFields.includes("отказ") || allFields.includes("delete") || allFields.includes("trash") || allFields.includes("cancel");
}
function activeRecords() { return records.filter((r) => !isTrashRecord(r)); }
function filtered(includeTrash = false) {
  const q = norm(els.searchInput.value);
  const status = els.statusFilter.value;
  const installer = els.installerFilter.value;
  const from = els.dateFrom.value;
  const to = els.dateTo.value;
  const base = workspaceRecords(includeTrash ? records : activeRecords());

  return base.filter((r) => {
    const f = r.fields || {};
    const date = String(f["Дата записи"] || "");
    const installers = splitInstallers(f["Монтажники"]);
    const hay = norm(["#" + r.id, f["Имя клиента"], f["Компания"], f["Телефон"], f["Услуга"], f["Адрес"], f["Монтажники"], f["Статус"], f["Комментарий клиента"], f["Комментарий администратора"], f["Cal Booking ID"]].join(" "));
    if (status && f["Статус"] !== status) return false;
    if (installer && !installers.includes(installer)) return false;
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    if (q && !hay.includes(q)) return false;
    return true;
  }).sort(sortByDateDesc);
}
function sortByDateDesc(a, b) { const af = a.fields || {}, bf = b.fields || {}; return (String(bf["Дата записи"] || "") + " " + String(bf["Время записи"] || "")).localeCompare(String(af["Дата записи"] || "") + " " + String(af["Время записи"] || "")); }

function renderAll() { render(); renderClients(); renderObjects(); renderInstallers(); renderInstallerDetails(); renderTrash(); renderFiles(); renderHistorySection(); renderCalendarImport(); renderSmsQueue(); renderActivity(); renderGlobalSearch(false); }
function render() {
  const arr = filtered(false);
  bulkLastPageIds = arr.map((r) => String(r.id));
  selectedRequestIds = new Set([...selectedRequestIds].filter((id) => bulkLastPageIds.includes(String(id))));
  els.requestsBody.innerHTML = arr.map(requestRow).join("") || '<tr><td colspan="12">Нет заявок</td></tr>';
  bindActionButtons();
  updateBulkUI();
  renderCalendar(arr);
  renderStats(records, arr);
}
function requestRow(r) {
  const f = r.fields || {}, status = e(f["Статус"] || ""), dir = recordDirection(r), checked = selectedRequestIds.has(String(r.id)) ? "checked" : "";
  return `<tr class="clickable-row direction-${dir}" data-open-row="${e(r.id)}" data-context-row="${e(r.id)}"><td class="bulk-check-cell"><input type="checkbox" class="bulk-row-check" data-bulk-id="${e(r.id)}" ${checked} /></td><td>${e(f["Дата записи"])}</td><td>${e(f["Время записи"])}</td><td><span class="direction-dot direction-${dir}"></span><b>${e(f["Имя клиента"])}</b></td><td>${e(f["Компания"] || "—")}</td><td>${phoneLink(f["Телефон"])}</td><td>${e(f["Услуга"])}</td><td>${e(f["Адрес"])}</td><td>${e(f["Итоговый м2"] || f["м2"])}</td><td>${e(f["Монтажники"])}</td><td class="status-cell"><span class="status" data-status="${status}">${status || "—"}</span></td><td><button class="open-btn" data-open="${e(r.id)}">Открыть</button></td></tr>`;
}

function renderCalendar(arr) {
  if (!els.calendarGrid || !els.monthTitle) return;
  els.monthTitle.textContent = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(cal);
  const y = cal.getFullYear(), m = cal.getMonth(), first = new Date(y, m, 1), offset = (first.getDay() + 6) % 7, start = new Date(y, m, 1 - offset);
  const byDate = {};
  arr.forEach((r) => {
    const d = String((r.fields || {})["Дата записи"] || "").slice(0, 10);
    if (!d) return;
    (byDate[d] ||= []).push(r);
  });
  Object.values(byDate).forEach((items) => items.sort((a, b) => String((a.fields || {})["Время записи"] || "").localeCompare(String((b.fields || {})["Время записи"] || ""))));

  const todayStr = today();
  const monthStart = ymdLocal(new Date(y, m, 1));
  const monthEnd = ymdLocal(new Date(y, m + 1, 0));
  const monthEventsCount = arr.filter((r) => {
    const d = String((r.fields || {})["Дата записи"] || "").slice(0, 10);
    return d >= monthStart && d <= monthEnd;
  }).length;
  if (els.calendarMonthSummary) els.calendarMonthSummary.textContent = `${monthEventsCount} ${plural(monthEventsCount, "событие", "события", "событий")} в месяце`;

  if (!selectedCalendarDate || selectedCalendarDate < monthStart || selectedCalendarDate > monthEnd) {
    selectedCalendarDate = todayStr >= monthStart && todayStr <= monthEnd ? todayStr : monthStart;
  }

  let html = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ymd = ymdLocal(d), items = byDate[ymd] || [];
    const topItems = items.slice(0, 3);
    const hasItems = items.length > 0;
    html += `<div class="day calendar-day ${d.getMonth() !== m ? "muted" : ""} ${ymd === todayStr ? "today" : ""} ${ymd === selectedCalendarDate ? "selected" : ""} ${hasItems ? "has-events" : ""}" data-calendar-day="${e(ymd)}">
      <button class="calendar-day-number" type="button" data-calendar-select-day="${e(ymd)}" aria-label="Открыть ${e(formatDateRu(ymd))}">${d.getDate()}</button>
      <div class="calendar-day-events">
        ${topItems.map((r) => calendarMonthEventButton(r)).join("")}
        ${items.length > 3 ? `<button class="calendar-more" type="button" data-calendar-select-day="${e(ymd)}">+${items.length - 3} ещё</button>` : ""}
      </div>
    </div>`;
  }
  els.calendarGrid.innerHTML = html;
  renderCalendarSelectedDay(byDate[selectedCalendarDate] || []);
  bindActionButtons();
  bindCalendarMonthButtons();
}

function calendarMonthEventButton(record) {
  const f = record.fields || {};
  const name = f["Имя клиента"] || f["Компания"] || "Без клиента";
  const time = f["Время записи"] || "";
  const status = f["Статус"] || "";
  const dir = recordDirection(record);
  return `<button class="event calendar-event-chip direction-${dir}" type="button" data-open="${e(record.id)}" title="${e([time, name, f["Услуга"], f["Адрес"]].filter(Boolean).join(" — "))}"><span>${e(time || "—")}</span><b>${e(name)}</b>${status ? `<small>${e(status)}</small>` : ""}</button>`;
}

function bindCalendarMonthButtons() {
  document.querySelectorAll("[data-calendar-select-day]").forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      selectedCalendarDate = button.dataset.calendarSelectDay;
      render();
    };
  });
  document.querySelectorAll("[data-calendar-day]").forEach((day) => {
    day.onclick = (event) => {
      if (event.target.closest("[data-open], [data-calendar-select-day]")) return;
      selectedCalendarDate = day.dataset.calendarDay;
      render();
    };
  });
}

function renderCalendarSelectedDay(items) {
  if (!els.calendarSelectedDateTitle || !els.calendarSelectedEvents) return;
  const title = selectedCalendarDate ? formatDateRu(selectedCalendarDate, true) : "Выберите день";
  els.calendarSelectedDateTitle.textContent = title;
  els.calendarSelectedDateSummary.textContent = `${items.length} ${plural(items.length, "событие", "события", "событий")} на выбранный день`;
  els.calendarSelectedEvents.innerHTML = items.map(calendarAgendaItemHtml).join("") || `<div class="calendar-agenda-empty">На этот день заявок нет.</div>`;
}

function calendarAgendaItemHtml(record) {
  const f = record.fields || {};
  const status = e(f["Статус"] || "");
  const dir = recordDirection(record);
  return `<article class="calendar-agenda-item direction-${dir}" data-open="${e(record.id)}">
    <div class="calendar-agenda-time"><b>${e(f["Время записи"] || "—")}</b><span class="status" data-status="${status}">${status || "—"}</span></div>
    <div class="calendar-agenda-content">
      <h4>${e(f["Имя клиента"] || "Без клиента")}${f["Компания"] ? ` · ${e(f["Компания"])}` : ""}</h4>
      <p>${e(f["Услуга"] || "—")}</p>
      <small>${phoneLink(f["Телефон"])}${f["Адрес"] ? ` · ${e(f["Адрес"])}` : ""}</small>
    </div>
    <button class="open-btn" type="button" data-open="${e(record.id)}">Открыть</button>
  </article>`;
}

function formatDateRu(ymd, long = false) {
  if (!ymd) return "";
  const [yy, mm, dd] = ymd.split("-").map(Number);
  if (!yy || !mm || !dd) return ymd;
  return new Intl.DateTimeFormat("ru-RU", long ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(yy, mm - 1, dd));
}

function plural(n, one, few, many) {
  const v = Math.abs(Number(n)) % 100;
  const v1 = v % 10;
  if (v > 10 && v < 20) return many;
  if (v1 > 1 && v1 < 5) return few;
  if (v1 === 1) return one;
  return many;
}

function renderStats(all, arr) { const t = today(); const active = workspaceRecords(activeRecords()); els.statTotal.textContent = active.length; els.statNew.textContent = active.filter((r) => (r.fields || {})["Статус"] === "Новая заявка").length; els.statToday.textContent = active.filter((r) => (r.fields || {})["Дата записи"] === t).length; els.statWork.textContent = active.filter((r) => (r.fields || {})["Статус"] === "В работе").length; els.statFiltered.textContent = arr.length; els.statVolume.textContent = moneyNumber(arr.reduce((s, r) => s + getM2(r.fields || {}), 0)); }
function bindActionButtons() {
  document.querySelectorAll("[data-open]").forEach((button) => button.onclick = () => openRequest(button.dataset.open));
  document.querySelectorAll("[data-open-client]").forEach((button) => button.onclick = () => openClientCard(button.dataset.openClient));
  document.querySelectorAll("[data-restore]").forEach((button) => button.onclick = () => restoreRequest(button.dataset.restore));
  document.querySelectorAll("[data-file-preview]").forEach((button) => button.onclick = () => openFilePreview(button.dataset.filePreview));
  document.querySelectorAll("[data-file-open]").forEach((button) => button.onclick = () => openFileInDrive(button.dataset.fileOpen));
  document.querySelectorAll("[data-file-download]").forEach((button) => button.onclick = () => downloadAdminFile(button.dataset.fileDownload));
  document.querySelectorAll("[data-file-delete]").forEach((button) => button.onclick = () => deleteAdminFile(button.dataset.fileDelete));
  document.querySelectorAll("[data-trash-client]").forEach((button) => button.onclick = (event) => { event.stopPropagation(); trashClient(button.dataset.trashClient); });
  document.querySelectorAll("[data-trash-record]").forEach((button) => button.onclick = (event) => { event.stopPropagation(); trashRecordById(button.dataset.trashRecord); });
  document.querySelectorAll(".bulk-row-check").forEach((box) => box.onchange = (event) => { event.stopPropagation(); toggleBulkSelection(box.dataset.bulkId, box.checked); });
}

function updateBulkUI() {
  if (!els.bulkToolbar) return;
  const count = selectedRequestIds.size;
  els.bulkToolbar.hidden = count === 0;
  if (els.bulkSelectedCount) els.bulkSelectedCount.textContent = count ? `Выбрано: ${count}` : "";
  if (els.bulkSelectAll) {
    const pageCount = bulkLastPageIds.length;
    const selectedOnPage = bulkLastPageIds.filter((id) => selectedRequestIds.has(String(id))).length;
    els.bulkSelectAll.checked = pageCount > 0 && selectedOnPage === pageCount;
    els.bulkSelectAll.indeterminate = selectedOnPage > 0 && selectedOnPage < pageCount;
  }
}
function toggleBulkSelection(id, checked) {
  if (!id) return;
  if (checked) selectedRequestIds.add(String(id)); else selectedRequestIds.delete(String(id));
  updateBulkUI();
}
function setBulkPageSelection(checked) {
  bulkLastPageIds.forEach((id) => checked ? selectedRequestIds.add(String(id)) : selectedRequestIds.delete(String(id)));
  document.querySelectorAll(".bulk-row-check").forEach((box) => { box.checked = checked; });
  updateBulkUI();
}
function selectedBulkRecords() {
  return [...selectedRequestIds].map((id) => records.find((r) => String(r.id) === String(id))).filter(Boolean);
}
async function bulkMoveToTrash() {
  const list = selectedBulkRecords();
  if (!list.length) return msg("Выберите заявки");
  if (!confirm(`Удалить выбранные заявки (${list.length})? Они попадут в корзину.`)) return;
  for (const record of list) await moveRecordToTrash(record, "Массовое удаление");
  selectedRequestIds.clear();
  renderAll();
  msg(`Удалено заявок: ${list.length}`);
}
async function bulkApplyStatus() {
  const status = els.bulkStatusSelect?.value || "";
  const list = selectedBulkRecords();
  if (!status) return msg("Выберите статус");
  if (!list.length) return msg("Выберите заявки");
  for (const record of list) {
    let history = getHistoryForRecord(record);
    history = addHistory(record, "Массовое изменение статуса", `${record.fields?.["Статус"] || "—"} → ${status}`, history);
    await updateRecord(record.id, { "Статус": status, "История изменений": JSON.stringify(history) }, "Статус изменён", { silent: true });
  }
  selectedRequestIds.clear();
  renderAll();
  msg(`Статус изменён у заявок: ${list.length}`);
}
async function bulkApplyInstaller() {
  const installer = els.bulkInstallerSelect?.value || "";
  const list = selectedBulkRecords();
  if (!installer) return msg("Выберите исполнителя");
  if (!list.length) return msg("Выберите заявки");
  for (const record of list) {
    let history = getHistoryForRecord(record);
    history = addHistory(record, "Массовое назначение исполнителя", installer, history);
    await updateRecord(record.id, { "Монтажники": installer, "История изменений": JSON.stringify(history) }, "Исполнитель назначен", { silent: true });
  }
  selectedRequestIds.clear();
  renderAll();
  msg(`Исполнитель назначен заявкам: ${list.length}`);
}
function bulkExportSelected() {
  const list = selectedBulkRecords();
  if (!list.length) return msg("Выберите заявки");
  const headers = ["ID", "Дата", "Время", "Клиент", "Компания", "Телефон", "Услуга", "Адрес", "м2", "Монтажники", "Статус"];
  const rows = list.map((r) => { const f = r.fields || {}; return [r.id, f["Дата записи"], f["Время записи"], f["Имя клиента"], f["Компания"], f["Телефон"], f["Услуга"], f["Адрес"], f["Итоговый м2"] || f["м2"], f["Монтажники"], f["Статус"]].map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(";"); });
  downloadText(`solncanet_selected_${today()}.csv`, [headers.join(";"), ...rows].join("\n"), "text/csv;charset=utf-8");
}
function ensureContextMenu() {
  if (contextMenuEl) return contextMenuEl;
  contextMenuEl = document.createElement("div");
  contextMenuEl.className = "row-context-menu";
  contextMenuEl.hidden = true;
  document.body.appendChild(contextMenuEl);
  document.addEventListener("click", () => hideContextMenu());
  window.addEventListener("scroll", () => hideContextMenu(), true);
  return contextMenuEl;
}
function hideContextMenu() { if (contextMenuEl) contextMenuEl.hidden = true; }
function showRowContextMenu(event, id) {
  event.preventDefault();
  const record = records.find((r) => String(r.id) === String(id));
  if (!record) return;
  const f = record.fields || {};
  const menu = ensureContextMenu();
  menu.innerHTML = `<button data-ctx="open">Открыть</button><button data-ctx="copy-phone">Копировать телефон</button><button data-ctx="copy-address">Копировать адрес</button><button data-ctx="client">История клиента</button><button data-ctx="delete" class="danger-context">Удалить</button>`;
  menu.style.left = Math.min(event.clientX, window.innerWidth - 240) + "px";
  menu.style.top = Math.min(event.clientY, window.innerHeight - 230) + "px";
  menu.hidden = false;
  menu.querySelectorAll("button").forEach((btn) => btn.onclick = async (ev) => {
    ev.stopPropagation();
    const action = btn.dataset.ctx;
    hideContextMenu();
    if (action === "open") return openRequest(id);
    if (action === "copy-phone") { await navigator.clipboard?.writeText(String(f["Телефон"] || "")); return msg("Телефон скопирован"); }
    if (action === "copy-address") { await navigator.clipboard?.writeText(String(f["Адрес"] || "")); return msg("Адрес скопирован"); }
    if (action === "client") return openClientCard(clientKeyFromFields(f));
    if (action === "delete") return trashRecordById(id);
  });
}
function initContextMenu() {
  document.addEventListener("contextmenu", (event) => {
    const row = event.target.closest("tr[data-context-row], tr[data-open-row]");
    if (!row || rowClickIgnored(event.target)) return;
    const id = row.dataset.contextRow || row.dataset.openRow;
    if (id) showRowContextMenu(event, id);
  });
}


function normalizeAutoServiceItem(item = {}) {
  if (typeof item === "string") return { name: item, material: "", price: "" };
  const name = item.name ?? item.service ?? item["Услуга"] ?? item["Название"] ?? "";
  const material = item.material ?? item["Материал"] ?? item.film ?? item["Пленка"] ?? "";
  const price = item.price ?? item.cost ?? item.amount ?? item["Стоимость"] ?? item["Сумма"] ?? item["Цена"] ?? "";
  return { name: String(name || "").trim(), material: String(material || "").trim(), price: price === null || price === undefined ? "" : String(price).trim() };
}
function parseAutoServices(value, total = "", serviceName = "") {
  let arr = [];
  if (Array.isArray(value)) arr = value;
  else {
    try { const parsed = JSON.parse(value || "[]"); if (Array.isArray(parsed)) arr = parsed; } catch (_) {}
  }
  arr = arr.map(normalizeAutoServiceItem).filter((x) => x.name || x.material || x.price);
  if (arr.length) return arr;
  if (serviceName || total) return [{ name: serviceName || "Услуга", material: "", price: total || "" }];
  return [{ name: "", material: "", price: "" }];
}
function autoServicePriceValue(item = {}) {
  return parseFloat(String(item.price ?? item.cost ?? item.amount ?? item["Стоимость"] ?? item["Сумма"] ?? "").replace(",", ".")) || 0;
}
function autoServicesTotal(list) {
  return (list || []).reduce((sum, item) => sum + autoServicePriceValue(normalizeAutoServiceItem(item)), 0);
}
function autoServiceContainer(prefix) { return prefix === "quick" ? els.quickAutoServices : els.editAutoServices; }
function initAutoServiceDatalist() {
  const dl = document.getElementById("autoServiceDatalist");
  if (!dl) return;
  dl.innerHTML = AUTO_PAY_RATES.map((r) => `<option value="${e(String(r.service || "").trim())}"></option>`).join("");
}
function autoRateForService(name) {
  const n = norm(name);
  if (!n) return null;
  let rate = AUTO_PAY_RATES.find((r) => norm(r.service) === n);
  if (rate) return rate;
  rate = AUTO_PAY_RATES.find((r) => n.includes(norm(r.service)) || norm(r.service).includes(n));
  return rate || null;
}
function scoreAutoSuggestion(query, name) {
  const q = norm(query || "");
  const n = norm(name || "");
  if (!q || !n) return 0;
  if (n === q) return 1000;
  if (n.startsWith(q)) return 900 - Math.max(0, n.length - q.length);
  if (n.includes(q)) return 700 - n.indexOf(q);
  const parts = q.split(" ").filter(Boolean);
  if (parts.length && parts.every((part) => n.includes(part))) return 500 + parts.length * 20;
  let score = 0;
  parts.forEach((part) => { if (n.includes(part)) score += 80; });
  return score;
}
function hideAutoServiceSuggestions(row) {
  row?.querySelector(".auto-suggest-box")?.remove();
}
function showAutoServiceSuggestions(input, prefix) {
  const row = input?.closest("[data-auto-service-row]");
  if (!row) return;
  const q = input.value || "";
  if (norm(q).length < 1) { hideAutoServiceSuggestions(row); return; }
  const matches = AUTO_PAY_RATES
    .map((r) => ({ rate: r, score: scoreAutoSuggestion(q, r.service) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || String(a.rate.service).localeCompare(String(b.rate.service)))
    .slice(0, 7);
  if (!matches.length) { hideAutoServiceSuggestions(row); return; }
  let box = row.querySelector(".auto-suggest-box");
  if (!box) {
    box = document.createElement("div");
    box.className = "auto-suggest-box";
    row.appendChild(box);
  }
  box.innerHTML = matches.map(({ rate }) => {
    const price = rate.price !== undefined && rate.price !== null && rate.price !== "" ? `${moneyNumber(rate.price)} ₽` : (rate.percent ? `${Math.round(rate.percent * 100)}%` : "");
    return `<button type="button" data-service="${e(rate.service)}"><span>${e(rate.service)}</span>${price ? `<small>${e(price)}</small>` : ""}</button>`;
  }).join("");
  box.querySelectorAll("button[data-service]").forEach((btn) => {
    btn.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      const service = btn.dataset.service || "";
      input.value = service;
      applyAutoServiceDefault(row);
      hideAutoServiceSuggestions(row);
      updateAutoTotal(prefix);
    });
  });
}
function autoServicePay(item) {
  const normalized = normalizeAutoServiceItem(item || {});
  const rate = autoRateForService(normalized.name || "");
  const price = autoServicePriceValue(normalized);
  if (!rate) return { amount: 0, rateText: "не найдено в прайсе", direction: "", code: "" };
  if (rate.payFromPrice) return { amount: price, rateText: "по сумме услуги", direction: rate.direction, code: rate.code };
  if (rate.percent) return { amount: price * rate.percent, rateText: `${Math.round(rate.percent * 100)}% от суммы`, direction: rate.direction, code: rate.code };
  return { amount: Number(rate.pay) || 0, rateText: moneyNumber(rate.pay), direction: rate.direction, code: rate.code };
}
function autoServicesPayTotal(list) {
  return (list || []).reduce((sum, item) => sum + autoServicePay(item).amount, 0);
}
function ensureRomanInstallerForAuto(prefix) {
  const isAuto = prefix === "quick" ? (els.quickDirection?.value || currentWorkspace) === "auto" : (els.editDirection?.value || recordDirection(current)) === "auto";
  if (!isAuto) return;
  if (prefix === "edit") {
    const checked = [...document.querySelectorAll('[name="installer"]')].some((c) => c.checked);
    if (!checked) document.querySelector('[name="installer"][value="Роман З"]')?.click();
    if (els.editResponsible && !els.editResponsible.value.trim()) els.editResponsible.value = AUTO_DEFAULT_RESPONSIBLE;
  }
}
function defaultAutoServicePrice(name) {
  const rate = autoRateForService(name || "");
  if (!rate) return "";
  if (rate.price !== undefined && rate.price !== null && rate.price !== "") return String(Number(rate.price) || "");
  return "";
}
function applyAutoServiceDefault(row) {
  if (!row) return;
  const nameInput = row.querySelector(".auto-service-name");
  const priceInput = row.querySelector(".auto-service-price");
  if (!nameInput || !priceInput) return;
  const rate = autoRateForService(nameInput.value || "");
  if (rate && norm(nameInput.value) !== norm(rate.service)) nameInput.value = rate.service;
  if (rate && !String(priceInput.value || "").trim()) {
    const p = defaultAutoServicePrice(rate.service);
    if (p) priceInput.value = p;
  }
}
function renderAutoServiceRows(prefix, list = null) {
  const box = autoServiceContainer(prefix);
  if (!box) return;
  const arr = list && list.length ? list : [{ name: "", material: "", price: "" }];
  box.innerHTML = arr.map((item, i) => `<div class="auto-service-row" data-auto-service-row><input class="auto-service-name" list="autoServiceDatalist" placeholder="Полное название услуги" value="${e(item.name || "")}" /><input class="auto-service-material" placeholder="Материал" value="${e(item.material || item["Материал"] || "")}" /><input class="auto-service-price" type="number" step="1" placeholder="Сумма" value="${e(item.price || "")}" /><button type="button" class="ghost-small" data-auto-service-remove>×</button></div>`).join("");
  box.querySelectorAll(".auto-service-name").forEach((input) => {
    input.addEventListener("input", () => { showAutoServiceSuggestions(input, prefix); updateAutoTotal(prefix); });
    input.addEventListener("focus", () => { showAutoServiceSuggestions(input, prefix); });
    input.addEventListener("change", () => { applyAutoServiceDefault(input.closest("[data-auto-service-row]")); updateAutoTotal(prefix); });
    input.addEventListener("blur", () => { const row = input.closest("[data-auto-service-row]"); setTimeout(() => hideAutoServiceSuggestions(row), 160); applyAutoServiceDefault(row); updateAutoTotal(prefix); });
  });
  box.querySelectorAll("input").forEach((input) => input.addEventListener("input", () => updateAutoTotal(prefix)));
  box.querySelectorAll("[data-auto-service-remove]").forEach((btn) => btn.addEventListener("click", () => { btn.closest("[data-auto-service-row]")?.remove(); updateAutoTotal(prefix); }));
  updateAutoTotal(prefix);
}
function addAutoServiceRow(prefix) {
  const list = collectAutoServices(prefix);
  list.push({ name: "", material: "", price: "" });
  renderAutoServiceRows(prefix, list);
}
function collectAutoServices(prefix) {
  const box = autoServiceContainer(prefix);
  if (!box) return [];
  return [...box.querySelectorAll("[data-auto-service-row]")].map((row) => ({ name: row.querySelector(".auto-service-name")?.value.trim() || "", material: row.querySelector(".auto-service-material")?.value.trim() || "", price: row.querySelector(".auto-service-price")?.value || "" })).filter((x) => x.name || x.material || x.price);
}
function updateAutoTotal(prefix) {
  const total = autoServicesTotal(collectAutoServices(prefix));
  const target = prefix === "quick" ? els.quickAutoTotal : els.editAutoTotal;
  if (target) target.textContent = money(total) + " ₽";
}
function updateQuickDirectionUI() {
  const isAuto = (els.quickDirection?.value || currentWorkspace) === "auto";
  if (els.quickAutoFields) els.quickAutoFields.style.display = isAuto ? "block" : "none";
  [els.quickServiceLabel, els.quickM2Label, els.quickAddressLabel].forEach((node) => { if (node) node.style.display = isAuto ? "none" : ""; });
  if (isAuto && els.quickAutoServices && !els.quickAutoServices.children.length) renderAutoServiceRows("quick");
}
function updateEditDirectionUI() {
  const isAuto = (els.editDirection?.value || "architecture") === "auto";
  if (els.editAutoFields) els.editAutoFields.style.display = isAuto ? "block" : "none";
  if (els.editServiceLabel) els.editServiceLabel.style.display = isAuto ? "none" : "";
  if (isAuto && els.editAutoServices && !els.editAutoServices.children.length) renderAutoServiceRows("edit");
  ensureRomanInstallerForAuto("edit");
}

function openRequest(id) {
  current = records.find((r) => String(r.id) === String(id));
  if (!current) return;
  const f = current.fields || {};
  els.dialogTitle.textContent = "Заявка #" + current.id;
  els.requestInfo.innerHTML = `<b>${e(f["Имя клиента"] || "—")}</b>${f["Компания"] ? `<br><b>Компания:</b> ${e(f["Компания"])}` : ""}<br>${phoneLink(f["Телефон"])}<br>${e(f["Дата записи"] || "")} ${e(f["Время записи"] || "")}<br>${e(f["Услуга"] || "")}<br>${recordDirection(current)==="auto" ? `<b>Авто:</b> ${e(f["Авто"]||"—")}<br><b>Плёнка:</b> ${e(f["Пленка"]||"—")}<br><b>Стоимость:</b> ${e(f["Общая стоимость"]||"0")} ₽<br>` : ""}${e(f["Адрес"] || "")}<br><br>${nl2br(f["Комментарий клиента"] || f["Комментарий"] || "")}`;
  els.editDate.value = f["Дата записи"] || "";
  els.editTime.value = f["Время записи"] || "";
  els.editStatus.value = f["Статус"] || "Новая заявка";
  els.editM2.value = f["Итоговый м2"] || f["м2"] || "";
  els.editResponsible.value = f["Ответственный"] || "";
  if (els.editCompany) els.editCompany.value = f["Компания"] || "";
  if (els.editDirection) els.editDirection.value = recordDirection(current);
  if (els.editAuto) els.editAuto.value = f["Авто"] || "";
  if (els.editFilm) els.editFilm.value = f["Пленка"] || "";
  renderAutoServiceRows("edit", parseAutoServices(f["Авто услуги"], f["Общая стоимость"], f["Услуга"]));
  updateEditDirectionUI();
  els.editService.value = f["Услуга"] || "";
  els.editAddress.value = f["Адрес"] || "";
  els.editAdminComment.value = f["Комментарий администратора"] || "";
  els.cancelReason.value = "";
  let names = splitInstallers(f["Монтажники"]);
  if (recordDirection(current) === "auto" && !names.length) names = [AUTO_DEFAULT_INSTALLER];
  document.querySelectorAll('[name="installer"]').forEach((c) => c.checked = names.includes(c.value));
  renderRequestFiles(current.id);
  renderRequestHistory(current);
  renderRequestComments(current);
  lastAutosaveSnapshot = JSON.stringify(currentEditFields());
  setAutosaveStatus("Сохраните изменения кнопкой «Сохранить»");
  updateRequestNotificationEditor();
  updateScheduleSmsEditor();
  renderRequestGoogleCalendar(current);
  els.dialog.showModal();
}

function currentEditFields() {
  const direction = els.editDirection?.value || recordDirection(current);
  const autoServices = collectAutoServices("edit");
  const selectedInstallers = [...document.querySelectorAll('[name="installer"]:checked')].map((x) => x.value);
  if (direction === "auto" && !selectedInstallers.length) selectedInstallers.push(AUTO_DEFAULT_INSTALLER);
  const fields = {
    "Направление": direction === "auto" ? "Авто" : "Архитектура",
    "Дата записи": els.editDate.value,
    "Время записи": els.editTime.value,
    "Статус": els.editStatus.value,
    "Итоговый м2": els.editM2.value,
    "Ответственный": direction === "auto" ? (els.editResponsible.value.trim() || AUTO_DEFAULT_RESPONSIBLE) : els.editResponsible.value.trim(),
    "Компания": els.editCompany?.value.trim() || "",
    "Услуга": direction === "auto" ? (autoServices.map((s) => s.name).filter(Boolean).join("; ") || "Авто") : els.editService.value.trim(),
    "Адрес": els.editAddress.value.trim(),
    "Комментарий администратора": els.editAdminComment.value.trim(),
    "Монтажники": selectedInstallers.join(", ")
  };
  if (direction === "auto") {
    fields["Авто"] = els.editAuto?.value.trim() || "";
    fields["Пленка"] = els.editFilm?.value.trim() || "";
    fields["Авто услуги"] = JSON.stringify(autoServices);
    fields["Общая стоимость"] = String(autoServicesTotal(autoServices));
  }
  return fields;
}
async function saveRequest() {
  if (!current) return;
  const oldFields = current.fields || {};
  const fields = currentEditFields();
  const changes = diffFields(oldFields, fields);
  let history = getHistoryForRecord(current);
  if (changes.length) history = addHistory(current, "Изменение заявки", changes.join("; "), history);
  fields["История изменений"] = JSON.stringify(history);
  await updateRecord(current.id, fields, "Заявка сохранена");
  els.dialog.close();
  renderAll();
}
async function cancelCurrentRequest() {
  if (!current) return;
  const reason = els.cancelReason.value.trim() || "Причина не указана";
  if (!confirm("Удалить заявку? Она сразу попадёт в корзину.")) return;
  const oldFields = current.fields || {};
  const adminComment = [oldFields["Комментарий администратора"] || "", `ОТМЕНА: ${dateTimeY()} — ${reason}`].filter(Boolean).join("\n");
  let history = getHistoryForRecord(current);
  history = addHistory(current, "Отмена / удаление в корзину", `Причина: ${reason}`, history);
  const fields = { "Удалено": true, "Дата удаления": dateTimeY(), "Дата отмены": today(), "Кто удалил": currentUserName(), "Причина отмены": reason, "Комментарий администратора": adminComment, "История изменений": JSON.stringify(history), "__moveToTrash": true };
  await updateRecord(current.id, fields, "Заявка удалена и перенесена в корзину");
  els.dialog.close();
  renderAll();
}
async function moveRecordToTrash(record, reason = "Удалено вручную") {
  if (!record) return;
  const oldFields = record.fields || {};
  const adminComment = [oldFields["Комментарий администратора"] || "", `КОРЗИНА: ${dateTimeY()} — ${reason}`].filter(Boolean).join("\n");
  let history = getHistoryForRecord(record);
  history = addHistory(record, "Перенос в корзину", reason, history);
  const fields = {
    "Удалено": true,
    "Дата удаления": dateTimeY(),
    "Дата отмены": today(),
    "Кто удалил": currentUserName(),
    "Причина отмены": reason,
    "Комментарий администратора": adminComment,
    "История изменений": JSON.stringify(history),
    "__moveToTrash": true
  };
  await updateRecord(record.id, fields, "Запись удалена и перенесена в корзину");
}
async function trashRecordById(id, reason = "Удалено вручную") {
  const record = records.find((r) => String(r.id) === String(id));
  if (!record) return msg("Запись не найдена. Обновите страницу.");
  if (!confirm("Удалить запись? Она сразу попадёт в корзину.")) return;
  await moveRecordToTrash(record, reason);
  renderAll();
}
async function trashClient(clientKey) {
  const list = records.filter((r) => !isTrashRecord(r) && clientKeyFromFields(r.fields || {}) === clientKey);
  if (!list.length) return msg("Активные заявки клиента не найдены");
  if (!confirm(`Перенести в корзину все активные заявки клиента (${list.length})?`)) return;
  for (const record of list) await moveRecordToTrash(record, "Удаление клиента: все заявки клиента перенесены в корзину");
  renderAll();
}
async function restoreRequest(id) {
  const record = records.find((r) => String(r.id) === String(id));
  if (!record) return;
  let history = getHistoryForRecord(record);
  history = addHistory(record, "Восстановление заявки", "Статус изменён на Новая заявка", history);
  await updateRecord(id, { "Статус": "Новая заявка", "Удалено": false, "Дата удаления": "", "Дата отмены": "", "Кто удалил": "", "Причина отмены": "", "История изменений": JSON.stringify(history) }, "Заявка восстановлена");
  renderAll();
}
async function updateRecord(id, fields, successText, options = {}) {
  try {
    const response = await fetch("/update-zayavka", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd() },
      body: JSON.stringify({ id, fields })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      const extra = data.lastError || data.hint || data.error || "Ошибка сохранения";
      throw new Error(extra);
    }

    const saved = data.savedFields || fields || {};
    await reloadRecordsFromNocoDB();
    const fresh = records.find((r) => String(r.id) === String(id));
    if (!fresh) throw new Error("Сохранение прошло, но запись не найдена при повторной проверке NocoDB");

    const misses = verifyRecordFields(fresh, saved);
    if (misses.length) {
      throw new Error("NocoDB сохранил не все данные: " + misses.slice(0, 3).join("; ") + (misses.length > 3 ? " ..." : ""));
    }

    if (current && String(current.id) === String(id)) current = fresh;
    renderAll();
    if (!options.silent) msg(successText || "Сохранено в NocoDB");
    return { ...data, record: fresh };
  } catch (error) {
    msg("Не сохранено: " + error.message);
    throw error;
  }
}



function currentUserName() {
  return currentUser?.name || localStorage.getItem(storage.userName) || "Сотрудник";
}
function setAutosaveStatus(text) {
  if (els.requestAutosaveStatus) els.requestAutosaveStatus.textContent = text || "";
}
function initRequestAutosave() {
  const targets = [els.editDate, els.editTime, els.editStatus, els.editM2, els.editResponsible, els.editCompany, els.editDirection, els.editAuto, els.editFilm, els.editService, els.editAddress, els.editAdminComment, els.editAutoServices];
  targets.forEach((el) => {
    if (!el) return;
    el.addEventListener("input", scheduleRequestAutosave);
    el.addEventListener("change", scheduleRequestAutosave);
  });
  document.querySelectorAll('[name="installer"]').forEach((el) => el.addEventListener("change", scheduleRequestAutosave));
}
function scheduleRequestAutosave() {
  if (!current || !els.dialog?.open) return;
  setAutosaveStatus("Есть несохранённые изменения");
}
async function runRequestAutosave() {
  // v61: автосохранение отключено, чтобы не было гонок и частичного сохранения.
  // Сохранение карточки выполняется только кнопкой «Сохранить» и обязательно проверяется повторным чтением из NocoDB.
  return;
}
function getCommentsForRecord(record) {
  const f = record?.fields || {};
  let comments = [];
  try { comments = JSON.parse(f["Комментарии"] || "[]"); } catch (_) { comments = []; }
  const local = getLocalComments()[String(record?.id)] || [];
  return [...comments, ...local].filter(Boolean).sort((a,b)=>String(b.at||"").localeCompare(String(a.at||""))).slice(0,200);
}
function getLocalComments() { try { return JSON.parse(localStorage.getItem(storage.comments) || "{}"); } catch (_) { return {}; } }
function saveLocalComment(id, comment) { const all = getLocalComments(); all[String(id)] ||= []; all[String(id)].unshift(comment); localStorage.setItem(storage.comments, JSON.stringify(all)); }
function renderRequestComments(record) {
  if (!els.requestCommentsBox) return;
  const list = getCommentsForRecord(record);
  els.requestCommentsBox.innerHTML = list.length ? list.map((c)=>`<div class="comment-item"><b>${e(c.author||"Сотрудник")}</b><span>${e(c.at||"")}</span><p>${nl2br(c.text||"")}</p></div>`).join("") : '<p class="muted-text">Комментариев пока нет.</p>';
}
async function addRequestComment() {
  if (!current || !els.requestCommentText) return;
  const text = els.requestCommentText.value.trim();
  if (!text) return;
  const comment = { at: dateTimeY(), author: currentUserName(), text };
  const comments = getCommentsForRecord(current).filter((c)=>!c.localOnly);
  const next = [comment, ...comments].slice(0,200);
  let history = getHistoryForRecord(current);
  history = addHistory(current, "Комментарий", text, history);
  try {
    await updateRecord(current.id, { "Комментарии": JSON.stringify(next), "История изменений": JSON.stringify(history) }, "Комментарий добавлен");
  } catch (_) {
    saveLocalComment(current.id, { ...comment, localOnly: true });
  }
  els.requestCommentText.value = "";
  renderRequestComments(current);
  renderRequestHistory(current);
  renderActivity();
}
function getActivity() { try { return JSON.parse(localStorage.getItem(storage.activity) || "[]"); } catch (_) { return []; } }
function saveActivity(entry) { const list = getActivity(); list.unshift(entry); localStorage.setItem(storage.activity, JSON.stringify(list.slice(0,300))); }
function renderActivity() {
  if (!els.activityBody) return;
  const rows = getActivity();
  els.activityBody.innerHTML = rows.length ? rows.map((a)=>`<div class="activity-item"><div><b>${e(a.action||"")}</b><p>${e(a.details||"")}</p></div><span>${e(a.user||"")} · ${e(a.at||"")}</span></div>`).join("") : '<p class="muted-text">Активность появится после изменений в заявках.</p>';
}


function normalizePhoneDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits[0] === "8") digits = "7" + digits.slice(1);
  else if (digits[0] === "9") digits = "7" + digits;
  else if (digits[0] !== "7") digits = "7" + digits;
  return digits.slice(0, 11);
}
function phoneKey(value) {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}
function phoneSearchKey(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if ((digits[0] === "7" || digits[0] === "8") && digits.length > 1) digits = digits.slice(1);
  return digits.slice(0, 10);
}
function formatRussianPhone(value) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return "";
  const rest = digits.slice(1);
  let out = "+7";
  if (rest.length > 0) out += " (" + rest.slice(0, 3);
  if (rest.length >= 3) out += ")";
  if (rest.length > 3) out += " " + rest.slice(3, 6);
  if (rest.length > 6) out += "-" + rest.slice(6, 8);
  if (rest.length > 8) out += "-" + rest.slice(8, 10);
  return out;
}
function formatQuickPhoneForTyping(value) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return "";
  return "+" + digits;
}
function handleQuickPhoneInput() {
  if (!els.quickPhone) return;
  const before = els.quickPhone.value;
  els.quickPhone.value = formatQuickPhoneForTyping(before);
  try { els.quickPhone.setSelectionRange(els.quickPhone.value.length, els.quickPhone.value.length); } catch (_) {}
  renderQuickClientSuggestions();
}
function handleQuickPhoneKeydown(event) {
  if (!els.quickPhone) return;
  if (event.key !== "Backspace" && event.key !== "Delete") return;
  const value = els.quickPhone.value || "";
  const start = els.quickPhone.selectionStart || 0;
  const end = els.quickPhone.selectionEnd || start;
  if (start !== end) return;
  if (event.key === "Backspace" && start <= 2) {
    event.preventDefault();
    els.quickPhone.value = "";
    renderQuickClientSuggestions();
  }
}
function getQuickClientMatches(value) {
  const query = phoneSearchKey(value);
  if (!query) return [];
  const latestByPhone = new Map();
  activeRecords().sort(sortByDateDesc).forEach((r) => {
    const f = r.fields || {};
    const key = phoneKey(f["Телефон"]);
    if (!key || latestByPhone.has(key)) return;
    latestByPhone.set(key, r);
  });
  return [...latestByPhone.values()].filter((r) => {
    const key = phoneKey((r.fields || {})["Телефон"]);
    return key && (key.startsWith(query) || key.includes(query));
  }).slice(0, 8);
}
function findClientByPhone(value) {
  const key = phoneKey(value);
  if (!key || key.length < 10) return null;
  const matches = activeRecords().filter((r) => phoneKey((r.fields || {})["Телефон"]) === key).sort(sortByDateDesc);
  return matches[0] || null;
}
function renderQuickClientSuggestions() {
  const hint = els.quickClientHint;
  const box = els.quickClientSuggestions;
  const value = els.quickPhone?.value || "";
  const query = phoneSearchKey(value);
  if (hint) hint.classList.remove("is-found", "is-empty");
  if (!box) return;
  if (!query) {
    box.hidden = true;
    box.innerHTML = "";
    if (hint) hint.textContent = "Начните вводить номер — подходящие клиенты появятся списком ниже.";
    return;
  }
  const matches = getQuickClientMatches(value);
  if (!matches.length) {
    box.hidden = true;
    box.innerHTML = "";
    if (hint) {
      hint.classList.add("is-empty");
      hint.textContent = query.length < 3 ? "Продолжайте вводить номер — ищу совпадения в базе." : "Совпадений пока нет — будет создана новая заявка.";
    }
    return;
  }
  box.hidden = false;
  box.innerHTML = matches.map((r) => quickClientSuggestionHtml(r)).join("");
  const exact = findClientByPhone(value);
  if (hint) {
    hint.classList.add(exact ? "is-found" : "");
    hint.textContent = exact ? "Номер найден. Нажмите на клиента в списке, чтобы заполнить карточку." : `Найдено совпадений: ${matches.length}. Выберите клиента из списка.`;
  }
}
function quickClientSuggestionHtml(record) {
  const f = record.fields || {};
  return `<button type="button" class="quick-client-item" data-quick-client="${e(record.id)}"><b>${e(f["Имя клиента"] || "Без имени")}</b>${f["Компания"] ? `<span>${e(f["Компания"])}</span>` : ""}<small>${e(f["Телефон"] || "")}${f["Адрес"] ? " · " + e(f["Адрес"]) : ""}${f["Дата записи"] ? " · последняя: " + e(f["Дата записи"]) : ""}</small></button>`;
}
function hideQuickClientSuggestions() {
  if (!els.quickClientSuggestions) return;
  els.quickClientSuggestions.hidden = true;
}
function handleQuickClientSuggestionClick(event) {
  const btn = event.target.closest("[data-quick-client]");
  if (!btn) return;
  const record = records.find((r) => String(r.id) === String(btn.dataset.quickClient));
  if (record) applyQuickClient(record);
}
function applyQuickClient(record) {
  const f = record.fields || {};
  if (els.quickName) els.quickName.value = f["Имя клиента"] || "";
  if (els.quickCompany) els.quickCompany.value = f["Компания"] || "";
  if (els.quickPhone) els.quickPhone.value = formatQuickPhoneForTyping(f["Телефон"] || els.quickPhone.value || "");
  if (els.quickAddress && !els.quickAddress.value.trim()) els.quickAddress.value = f["Адрес"] || "";
  if (els.quickClientHint) {
    els.quickClientHint.classList.remove("is-empty");
    els.quickClientHint.classList.add("is-found");
    els.quickClientHint.textContent = `Выбран клиент: ${f["Имя клиента"] || "без имени"}${f["Компания"] ? " · " + f["Компания"] : ""}. Данные подставлены.`;
  }
  hideQuickClientSuggestions();
}

function openQuickAdd(prefill = null) {
  setDefaultDates();
  quickCalendarEvent = prefill && prefill.calendarEvent ? prefill.calendarEvent : null;
  els.quickName.value = prefill?.name || "";
  if (els.quickCompany) els.quickCompany.value = prefill?.company || "";
  els.quickPhone.value = prefill?.phone ? formatQuickPhoneForTyping(prefill.phone) : "";
  if (els.quickClientHint) {
    els.quickClientHint.classList.remove("is-found", "is-empty");
    els.quickClientHint.textContent = quickCalendarEvent ? "Данные предварительно заполнены из Google Календаря. Проверьте и сохраните заявку." : "Начните вводить номер — подходящие клиенты появятся списком ниже.";
  }
  if (els.quickGoogleSync) els.quickGoogleSync.checked = true;
  hideQuickClientSuggestions();
  if (els.quickService && prefill?.service) els.quickService.value = prefill.service;
  if (els.quickDate && prefill?.date) els.quickDate.value = prefill.date;
  if (els.quickTime && prefill?.time) els.quickTime.value = prefill.time;
  els.quickAddress.value = prefill?.address || "";
  els.quickComment.value = prefill?.comment || "";
  els.quickM2.value = prefill?.m2 || "";
  if (els.quickDirection) els.quickDirection.value = prefill?.direction || (currentWorkspace === "auto" ? "auto" : "architecture");
  renderAutoServiceRows("quick", prefill?.service ? [{ name: prefill.service, price: "" }] : [{ name: "", price: "" }]);
  updateQuickDirectionUI();
  els.quickAddDialog.showModal();
}
async function saveQuickAdd() {
  const syncGoogle = Boolean(els.quickGoogleSync?.checked);
  const calendarId = quickCalendarEvent?.id ? "gcal-" + quickCalendarEvent.id : "manual-" + Date.now();
  const direction = els.quickDirection?.value || currentWorkspace || "architecture";
  const isAuto = direction === "auto";
  const autoServices = collectAutoServices("quick");
  if (isAuto && !autoServices.length) { msg("Добавьте хотя бы одну услугу по авто"); return; }
  const autoServiceTitle = autoServices.map((s) => s.name).filter(Boolean).join("; ") || "Авто";
  const record = {
    "Направление": isAuto ? "Авто" : "Архитектура",
    "Имя клиента": els.quickName.value.trim(),
    "Компания": els.quickCompany?.value.trim() || "",
    "Телефон": formatRussianPhone(els.quickPhone.value),
    "Услуга": isAuto ? autoServiceTitle : els.quickService.value,
    "Дата записи": els.quickDate.value,
    "Время записи": els.quickTime.value,
    "Адрес": isAuto ? "" : els.quickAddress.value.trim(),
    "м2": isAuto ? "" : (els.quickM2.value ? String(els.quickM2.value) : ""),
    "Комментарий клиента": els.quickComment.value.trim(),
    "Статус": "Новая заявка",
    "Cal Booking ID": calendarId
  };
  if (isAuto) { record["Авто"] = els.quickAuto?.value.trim() || ""; record["Пленка"] = els.quickFilm?.value.trim() || ""; record["Авто услуги"] = JSON.stringify(autoServices); record["Общая стоимость"] = String(autoServicesTotal(autoServices)); record["Монтажники"] = AUTO_DEFAULT_INSTALLER; record["Ответственный"] = AUTO_DEFAULT_RESPONSIBLE; }
  if (!record["Имя клиента"] || !record["Телефон"] || !record["Дата записи"] || !record["Время записи"]) { msg("Заполните ФИО, телефон, дату и время"); return; }
  try {
    const response = await fetch("/create-zayavka", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ fields: record }) });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка создания заявки");
    const createdId = extractCreatedRecordId(data);
    let googleResult = null;
    if (syncGoogle && !quickCalendarEvent?.id) {
      googleResult = await createGoogleCalendarEventForQuick(record, createdId);
      if (googleResult?.ok && createdId && (googleResult.eventId || googleResult.htmlLink)) {
        await saveGoogleCalendarInfoToRecord(createdId, googleResult);
      }
    }
    els.quickAddDialog.close();
    if (quickCalendarEvent?.id) markCalendarEventImported(quickCalendarEvent.id);
    quickCalendarEvent = null;
    await load();
    if (syncGoogle && googleResult?.ok) msg("Быстрая заявка создана и продублирована в Google Календарь");
    else if (syncGoogle && googleResult && !googleResult.ok) msg("Заявка создана, но Google Календарь не создал событие: " + (googleResult.error || "ошибка"));
    else msg("Быстрая заявка создана");
  } catch (error) { msg(error.message); }
}

function extractCreatedRecordId(data) {
  const r = data?.nocodbResponse;
  if (Array.isArray(r)) return r[0]?.id || r[0]?.Id || r[0]?.fields?.Id || r[0]?.fields?.id || "";
  if (Array.isArray(r?.list)) return r.list[0]?.id || r.list[0]?.Id || "";
  if (Array.isArray(r?.data)) return r.data[0]?.id || r.data[0]?.Id || "";
  return r?.id || r?.Id || r?.fields?.id || r?.fields?.Id || "";
}

async function createGoogleCalendarEventForQuick(fields, recordId) {
  try {
    const response = await fetch("/calendar-create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd() },
      body: JSON.stringify({ fields, recordId, source: "quickAdd" })
    });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция календаря вернула не JSON" }));
    if (!response.ok || !data.ok) return { ok: false, error: data.error || data.appsScript?.error || "Ошибка Google Календаря", details: data };
    return data;
  } catch (error) {
    return { ok: false, error: error.message || "Ошибка Google Календаря" };
  }
}

async function saveGoogleCalendarInfoToRecord(recordId, googleResult, source = "Быстрая запись → Google Календарь") {
  const fields = {
    "Google Calendar Event ID": googleResult.eventId || "",
    "Ссылка на событие": googleResult.htmlLink || "",
    "Источник": source
  };
  try {
    await fetch("/update-zayavka", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ id: recordId, fields }) });
  } catch (_) {}
}

function googleEventInfoFromFields(f = {}) {
  return {
    eventId: f["Google Calendar Event ID"] || "",
    htmlLink: f["Ссылка на событие"] || "",
    source: f["Источник"] || ""
  };
}

function renderRequestGoogleCalendar(record) {
  if (!els.requestGoogleCalendarBox) return;
  const f = record?.fields || {};
  const info = googleEventInfoFromFields(f);
  const hasEvent = Boolean(info.eventId || info.htmlLink);
  els.requestGoogleCalendarBox.innerHTML = `
    <div class="google-calendar-status ${hasEvent ? "is-linked" : "is-empty"}">
      <span>${hasEvent ? "Событие связано" : "Событие ещё не создано"}</span>
      <b>${hasEvent ? e(info.eventId || "ID не записан") : "Нет выгрузки"}</b>
      <small>${e(info.source || (hasEvent ? "Google Календарь" : "Нажмите кнопку ниже, чтобы создать событие"))}</small>
    </div>`;
  if (els.requestGoogleOpenLink) {
    els.requestGoogleOpenLink.hidden = !info.htmlLink;
    if (info.htmlLink) els.requestGoogleOpenLink.href = info.htmlLink;
  }
  if (els.requestGoogleStatus) els.requestGoogleStatus.textContent = hasEvent ? "Можно обновить событие после изменения даты, времени, адреса или услуги." : "Создаст событие в Google Календаре и запишет ID обратно в NocoDB.";
}

function fieldsForGoogleFromCurrent() {
  if (!current) return {};
  const base = { ...(current.fields || {}) };
  const edited = currentEditFields();
  return { ...base, ...edited };
}

async function createOrUpdateGoogleCalendarForCurrent() {
  if (!current) return;
  const fields = fieldsForGoogleFromCurrent();
  if (!fields["Дата записи"] || !fields["Время записи"]) { if (els.requestGoogleStatus) els.requestGoogleStatus.textContent = "Для выгрузки нужны дата и время записи."; return; }
  if (els.requestGoogleStatus) els.requestGoogleStatus.textContent = "Отправляю событие в Google Календарь...";
  try {
    const eventId = (current.fields || {})["Google Calendar Event ID"] || "";
    const res = await fetch("/calendar-create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd() },
      body: JSON.stringify({ action: eventId ? "upsert" : "create", eventId, fields, recordId: current.id, source: "requestCard" })
    });
    const data = await res.json().catch(() => ({ ok: false, error: "Функция календаря вернула не JSON" }));
    if (!res.ok || !data.ok) throw new Error(data.error || data.appsScript?.error || "Ошибка Google Календаря");
    const updateFields = {
      "Google Calendar Event ID": data.eventId || eventId || "",
      "Ссылка на событие": data.htmlLink || "",
      "Источник": eventId ? "Заявка → обновлено в Google Календаре" : "Заявка → Google Календарь"
    };
    let history = getHistoryForRecord(current);
    history = addHistory(current, eventId ? "Google Календарь" : "Выгрузка в Google Календарь", eventId ? "Событие обновлено" : "Событие создано", history);
    updateFields["История изменений"] = JSON.stringify(history);
    await updateRecord(current.id, updateFields, eventId ? "Событие Google Календаря обновлено" : "Событие Google Календаря создано");
    current.fields = { ...(current.fields || {}), ...updateFields };
    renderRequestGoogleCalendar(current);
    renderRequestHistory(current);
    await load();
  } catch (error) {
    if (els.requestGoogleStatus) els.requestGoogleStatus.textContent = error.message;
    msg(error.message);
  }
}


function recordHay(f, id = "") {
  return norm(["#" + id, f["Имя клиента"], f["Компания"], f["Телефон"], f["Услуга"], f["Адрес"], f["Монтажники"], f["Статус"], f["Комментарий клиента"], f["Комментарий администратора"], f["Файлы"], f["Cal Booking ID"]].join(" "));
}
function sectionRecords(opts = {}) {
  const { q = "", from = "", to = "", service = "", status = "", installer = "", film = "", m2Min = "", m2Max = "", includeTrash = false } = opts;
  return (includeTrash ? records : activeRecords()).filter((r) => {
    const f = r.fields || {};
    const date = String(f["Дата записи"] || "");
    const m2 = getM2(f);
    const hay = recordHay(f, r.id);
    const installers = splitInstallers(f["Монтажники"]);
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    if (service && f["Услуга"] !== service) return false;
    if (status && f["Статус"] !== status) return false;
    if (installer && !installers.includes(installer)) return false;
    if (film && !hay.includes(norm(film))) return false;
    if (m2Min !== "" && m2 < num(m2Min)) return false;
    if (m2Max !== "" && m2 > num(m2Max)) return false;
    if (q && !hay.includes(norm(q))) return false;
    return true;
  }).sort(sortByDateDesc);
}
function clearClientFilters() { [els.clientsSearchInput, els.clientsDateFrom, els.clientsDateTo, els.clientsFilmFilter].forEach((el) => { if (el) el.value = ""; }); [els.clientsServiceFilter, els.clientsStatusFilter].forEach((el) => { if (el) el.value = ""; }); renderClients(); }
function clearObjectFilters() { [els.objectsSearchInput, els.objectsDateFrom, els.objectsDateTo, els.objectsM2Min, els.objectsM2Max].forEach((el) => { if (el) el.value = ""; }); [els.objectsServiceFilter, els.objectsStatusFilter, els.objectsInstallerFilter].forEach((el) => { if (el) el.value = ""; }); renderObjects(); }
function clearInstallerFilters() { [els.installersSearchInput, els.installersDateFrom, els.installersDateTo].forEach((el) => { if (el) el.value = ""; }); [els.installersStatusFilter, els.installersServiceFilter].forEach((el) => { if (el) el.value = ""; }); renderInstallers(); }

function renderClients() {
  const rows = sectionRecords({ q: els.clientsSearchInput?.value || "", from: els.clientsDateFrom?.value || "", to: els.clientsDateTo?.value || "", service: els.clientsServiceFilter?.value || "", status: els.clientsStatusFilter?.value || "", film: els.clientsFilmFilter?.value || "" });
  const map = new Map();
  rows.forEach((r) => {
    const f = r.fields || {}, name = f["Имя клиента"] || "Без имени", company = f["Компания"] || "", phone = f["Телефон"] || "", key = clientKeyFromFields(f);
    const item = map.get(key) || { key, name, company, phone, count: 0, last: "", id: r.id, m2: 0, service: "", address: "" };
    item.count++; item.m2 += getM2(f);
    if (String(f["Дата записи"] || "") >= String(item.last || "")) { item.last = f["Дата записи"] || ""; item.id = r.id; item.service = f["Услуга"] || ""; item.address = f["Адрес"] || ""; item.company = f["Компания"] || item.company || ""; }
    map.set(key, item);
  });
  const clients = [...map.values()].sort((a, b) => String(b.last).localeCompare(String(a.last)));
  if (els.clientsStatCount) els.clientsStatCount.textContent = clients.length;
  if (els.clientsStatRequests) els.clientsStatRequests.textContent = rows.length;
  if (els.clientsStatM2) els.clientsStatM2.textContent = moneyNumber(rows.reduce((s, r) => s + getM2(r.fields || {}), 0));
  if (els.clientsStatRepeat) els.clientsStatRepeat.textContent = clients.filter((x) => x.count > 1).length;
  els.clientsBody.innerHTML = clients.map((x) => `<tr class="clickable-row" data-open-client-row="${e(x.key)}"><td><b>${e(x.name)}</b></td><td>${e(x.company || "—")}</td><td>${phoneLink(x.phone)}</td><td>${x.count}</td><td>${e(x.service || "—")}</td><td>${e(x.address || "—")}</td><td>${moneyNumber(x.m2)}</td><td>${e(x.last)}</td><td><button class="open-btn" data-open-client="${e(x.key)}">Карточка</button></td></tr>`).join("") || '<tr><td colspan="9">Клиенты не найдены</td></tr>';
  bindActionButtons();
}
function renderObjects() {
  const rows = sectionRecords({ q: els.objectsSearchInput?.value || "", from: els.objectsDateFrom?.value || "", to: els.objectsDateTo?.value || "", service: els.objectsServiceFilter?.value || "", status: els.objectsStatusFilter?.value || "", installer: els.objectsInstallerFilter?.value || "", m2Min: els.objectsM2Min?.value || "", m2Max: els.objectsM2Max?.value || "" });
  if (els.objectsStatCount) els.objectsStatCount.textContent = rows.length;
  if (els.objectsStatM2) els.objectsStatM2.textContent = moneyNumber(rows.reduce((s, r) => s + getM2(r.fields || {}), 0));
  if (els.objectsStatDone) els.objectsStatDone.textContent = rows.filter((r) => PAYROLL_STATUSES.has((r.fields || {})["Статус"] || "")).length;
  if (els.objectsStatWork) els.objectsStatWork.textContent = rows.filter((r) => (r.fields || {})["Статус"] === "В работе").length;
  els.objectsBody.innerHTML = rows.map((r) => { const f = r.fields || {}; return `<tr class="clickable-row" data-open-row="${e(r.id)}"><td>${e(f["Дата записи"] || "")}</td><td><b>${e(f["Имя клиента"] || "—")}</b><br>${phoneLink(f["Телефон"])}</td><td>${e(f["Компания"] || "—")}</td><td>${e(f["Адрес"] || "—")}</td><td>${e(f["Услуга"] || "—")}</td><td>${moneyNumber(getM2(f))}</td><td>${e(displayInstallers(f["Монтажники"]) || "—")}</td><td class="status-cell"><span class="status" data-status="${e(f["Статус"] || "")}">${e(f["Статус"] || "—")}</span></td><td><button class="open-btn" data-open="${e(r.id)}">Открыть</button></td></tr>`; }).join("") || '<tr><td colspan="9">Объекты не найдены</td></tr>';
  bindActionButtons();
}
function installerRowsForSection() {
  return sectionRecords({ q: els.installersSearchInput?.value || "", from: els.installersDateFrom?.value || "", to: els.installersDateTo?.value || "", service: els.installersServiceFilter?.value || "", status: els.installersStatusFilter?.value || "" });
}
function renderInstallers() {
  const rows = installerRowsForSection();
  const payroll = buildPayroll(rows, { useUi: false, selectedWorkers: WORKERS, statusModeOverride: els.installersStatusFilter?.value ? "report-filter" : "all-active" });
  const summary = payroll.summary;
  const summaryRows = WORKERS.map((w) => summary[w] || emptyPayrollSummary(w));
  if (els.installersStatJobs) els.installersStatJobs.textContent = summaryRows.reduce((s, x) => s + x.jobs, 0);
  if (els.installersStatM2) els.installersStatM2.textContent = moneyNumber(summaryRows.reduce((s, x) => s + x.m2, 0));
  if (els.installersStatAmount) els.installersStatAmount.textContent = money(summaryRows.reduce((s, x) => s + x.amount, 0));
  if (els.installersStatTotal) els.installersStatTotal.textContent = money(summaryRows.reduce((s, x) => s + x.total, 0));
  els.installersBody.innerHTML = summaryRows.map((x) => `<tr class="installer-row clickable-row ${selectedInstaller === x.worker ? "selected" : ""}" data-installer-row="${e(x.worker)}"><td><button class="installer-open-name" data-installer="${e(x.worker)}" type="button"><b>${e(workerLabel(x.worker))}</b><br><small>${e(x.worker)}</small></button></td><td>${x.jobs}</td><td>${moneyNumber(x.m2)}</td><td>${money(x.amount)}</td><td>${money(x.bonus)}</td><td>${money(x.advance)}</td><td><b>${money(x.total)}</b></td><td>${e(x.last || "—")}</td><td><button class="open-btn" data-installer="${e(x.worker)}" type="button">История работ</button></td></tr>`).join("");
  bindInstallerButtons();
}
function bindInstallerButtons() {
  document.querySelectorAll("[data-installer]").forEach((button) => button.onclick = () => openInstallerDetails(button.dataset.installer));
  document.querySelectorAll("[data-installer-row]").forEach((row) => row.ondblclick = () => openInstallerDetails(row.dataset.installerRow));
}
function openInstallerDetails(worker) {
  selectedInstaller = canonicalWorker(worker);
  if (els.installerDetailsPanel) els.installerDetailsPanel.style.display = "block";
  renderInstallers();
  renderInstallerDetails();
  setTimeout(() => els.installerDetailsPanel?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
}
function closeInstallerDetails() {
  selectedInstaller = null;
  if (els.installerDetailsPanel) els.installerDetailsPanel.style.display = "none";
  renderInstallers();
}
function clearInstallerDetailsFilters() {
  [els.installerDetailsSearchInput, els.installerDetailsDateFrom, els.installerDetailsDateTo, els.installerDetailsM2Min, els.installerDetailsM2Max].forEach((el) => { if (el) el.value = ""; });
  [els.installerDetailsStatusFilter, els.installerDetailsServiceFilter].forEach((el) => { if (el) el.value = ""; });
  renderInstallerDetails();
}
function installerDetailRows() {
  if (!selectedInstaller) return [];
  return records.filter((r) => {
    const f = r.fields || {};
    const names = splitInstallers(f["Монтажники"]);
    if (!names.includes(selectedInstaller)) return false;
    const q = norm(els.installerDetailsSearchInput?.value || "");
    const from = els.installerDetailsDateFrom?.value || "";
    const to = els.installerDetailsDateTo?.value || "";
    const status = els.installerDetailsStatusFilter?.value || "";
    const service = els.installerDetailsServiceFilter?.value || "";
    const m2 = getM2(f);
    const date = String(f["Дата записи"] || "");
    const hay = recordHay(f, r.id);
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    if (status && f["Статус"] !== status) return false;
    if (service && f["Услуга"] !== service) return false;
    if (els.installerDetailsM2Min?.value !== "" && m2 < num(els.installerDetailsM2Min.value)) return false;
    if (els.installerDetailsM2Max?.value !== "" && m2 > num(els.installerDetailsM2Max.value)) return false;
    if (q && !hay.includes(q)) return false;
    return true;
  }).sort(sortByDateDesc);
}
function payrollDetailsForInstaller(rows) {
  const payroll = buildPayroll(rows, { useUi: false, selectedWorkers: [selectedInstaller], statusModeOverride: "report-filter" });
  const detailsById = new Map();
  payroll.details.filter((d) => d.worker === selectedInstaller).forEach((d) => detailsById.set(String(d.id), d));
  return { payroll, detailsById };
}
function renderInstallerDetails() {
  if (!els.installerDetailsPanel || !selectedInstaller) return;
  const rows = installerDetailRows();
  const { detailsById } = payrollDetailsForInstaller(rows);
  const detailRows = rows.map((r) => {
    const f = r.fields || {};
    const calc = detailsById.get(String(r.id));
    const status = e(f["Статус"] || "");
    return `<tr class="clickable-row" data-open-row="${e(r.id)}"><td>${e(f["Дата записи"] || "")}<br><small>${e(f["Время записи"] || "")}</small></td><td><b>${e(f["Имя клиента"] || "—")}</b></td><td>${e(f["Компания"] || "—")}</td><td>${phoneLink(f["Телефон"])}</td><td>${e(f["Адрес"] || "—")}</td><td>${e(f["Услуга"] || "—")}</td><td>${moneyNumber(getM2(f))}</td><td>${e(displayInstallers(f["Монтажники"]) || "—")}</td><td>${calc ? moneyNumber(calc.rate) : "—"}</td><td>${calc ? money(calc.amount) : "—"}</td><td class="status-cell"><span class="status" data-status="${status}">${status || "—"}</span></td><td><button class="open-btn" data-open="${e(r.id)}">Открыть / редактировать</button></td></tr>`;
  });
  const amount = [...detailsById.values()].reduce((s, d) => s + d.amount, 0);
  const m2 = rows.reduce((s, r) => s + getM2(r.fields || {}), 0);
  const rateAvg = m2 ? amount / m2 : 0;
  els.installerDetailsTitle.textContent = `История работ: ${workerLabel(selectedInstaller)}`;
  els.installerDetailsInfo.textContent = `Найдено объектов: ${rows.length}. Можно искать по клиенту, компании, телефону, адресу, услуге, статусу и м².`;
  if (els.installerDetailsStatJobs) els.installerDetailsStatJobs.textContent = rows.length;
  if (els.installerDetailsStatM2) els.installerDetailsStatM2.textContent = moneyNumber(m2);
  if (els.installerDetailsStatAmount) els.installerDetailsStatAmount.textContent = money(amount);
  if (els.installerDetailsStatRate) els.installerDetailsStatRate.textContent = money(rateAvg);
  els.installerDetailsBody.innerHTML = detailRows.join("") || '<tr><td colspan="12">По этому монтажнику ничего не найдено</td></tr>';
  bindActionButtons();
}
function renderTrash() { const arr = records.filter(isTrashRecord).sort(sortByDateDesc); els.trashBody.innerHTML = arr.map((r) => { const f = r.fields || {}; return `<tr class="clickable-row" data-open-row="${e(r.id)}"><td>${e(f["Дата записи"] || "")}</td><td><b>${e(f["Имя клиента"] || "—")}</b></td><td>${e(f["Компания"] || "—")}</td><td>${phoneLink(f["Телефон"])}</td><td>${e(f["Услуга"] || "")}</td><td>${e(f["Адрес"] || "")}</td><td>${nl2br(f["Причина отмены"] || lastCancelReason(f) || f["Комментарий администратора"] || "")}</td><td class="status-cell"><span class="status" data-status="${e(f["Статус"] || "")}">${e(f["Статус"] || "—")}</span></td><td><button class="open-btn" data-open="${e(r.id)}">Открыть</button> <button class="restore-btn" data-restore="${e(r.id)}">Восстановить</button></td></tr>`; }).join("") || '<tr><td colspan="8">Корзина пустая</td></tr>'; bindActionButtons(); }
function renderFiles() {
  renderFilesRequestSelect();
  const q = norm(els.filesSearchInput?.value || ""), type = norm(els.filesTypeFilter?.value || "");
  const byRequest = groupFilesByRequest(filesCache);
  const ids = new Set(Object.keys(byRequest));
  const rows = [...ids].map((id) => ({ record: records.find((r) => String(r.id) === String(id)), id, files: byRequest[id] || [] }))
    .filter(({ record, id, files }) => {
      if (!files.length) return false;
      const f = record?.fields || {};
      const filesText = files.map((file) => [file.originalName, file.fileType, file.contentType, file.client, file.phone, file.address, file.service].join(" ")).join(" ");
      const hay = norm(["#" + id, f["Имя клиента"], f["Компания"], f["Телефон"], f["Адрес"], f["Услуга"], f["Статус"], f["Комментарий клиента"], f["Комментарий администратора"], f["Файлы"], filesText].join(" "));
      if (q && !hay.includes(q)) return false;
      if (type && !files.some((file) => fileMatchesType(file, type))) return false;
      return true;
    })
    .sort((a, b) => String(b.id).localeCompare(String(a.id), "ru", { numeric: true }));

  els.filesBody.innerHTML = rows.map(({ record, id, files }) => {
    const f = record?.fields || {};
    const fileHtml = files.length ? files.map(fileMiniHtml).join("") : e(f["Файлы"] || "Пока нет файлов");
    return `<tr class="clickable-row" data-open-row="${e(id)}"><td>#${e(id)}</td><td>${e(f["Имя клиента"] || files[0]?.client || "—")}</td><td>${phoneLink(f["Телефон"] || files[0]?.phone || "")}</td><td>${e(f["Адрес"] || files[0]?.address || "—")}</td><td>${fileHtml}</td><td class="status-cell"><span class="status" data-status="${e(f["Статус"] || files[0]?.status || "")}">${e(f["Статус"] || files[0]?.status || "—")}</span></td><td>${record ? `<button class="open-btn" data-open="${e(id)}">Открыть</button>` : "—"}</td></tr>`;
  }).join("") || '<tr><td colspan="7">Нет заявок с прикреплёнными файлами</td></tr>';
  bindActionButtons();
}

function getHistoryForRecord(record) {
  const f = record.fields || {};
  const fromField = parseHistoryField(f["История изменений"]);
  const local = getLocalHistory()[String(record.id)] || [];
  const merged = [...fromField, ...local];
  const byKey = new Map();
  merged.forEach((item) => byKey.set([item.at, item.action, item.details].join("|"), item));
  return [...byKey.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
}
function addHistory(record, action, details, currentHistory = null) { const history = currentHistory || getHistoryForRecord(record); const entry = { at: dateTimeY(), id: String(record.id), user: currentUserName(), client: (record.fields || {})["Имя клиента"] || "", phone: (record.fields || {})["Телефон"] || "", action, details }; saveLocalHistory(record.id, entry); saveActivity({ at: entry.at, user: entry.user, action, details: `${entry.client || "Заявка #" + entry.id}: ${details || ""}`, id: entry.id }); return [entry, ...history].slice(0, 200); }
function saveLocalHistory(id, entry) { const all = getLocalHistory(); all[String(id)] ||= []; all[String(id)].unshift(entry); all[String(id)] = all[String(id)].slice(0, 200); localStorage.setItem(storage.history, JSON.stringify(all)); }
function getLocalHistory() { try { return JSON.parse(localStorage.getItem(storage.history) || "{}"); } catch (_) { return {}; } }
function parseHistoryField(value) { if (!value) return []; if (Array.isArray(value)) return value; try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch (_) { return String(value).split("\n").filter(Boolean).map((line) => ({ at: "", action: "Запись", details: line })); } }
function renderRequestHistory(record) { const history = getHistoryForRecord(record); els.requestHistoryBox.innerHTML = history.length ? history.map((h) => `<div class="history-item"><b>${e(h.at || "—")}</b><span>${e(h.action || "")} · ${e(h.user || "")}</span><p>${e(h.details || "")}</p></div>`).join("") : '<p class="muted-text">Истории изменений пока нет.</p>'; }
function renderHistorySection() { const q = norm(els.historySearchInput?.value || ""); const rows = []; records.forEach((r) => getHistoryForRecord(r).forEach((h) => rows.push({ record: r, h }))); rows.sort((a, b) => String(b.h.at).localeCompare(String(a.h.at))); const filteredRows = rows.filter(({ record, h }) => { const f = record.fields || {}; const hay = norm([h.at, h.action, h.details, record.id, f["Имя клиента"], f["Телефон"]].join(" ")); return !q || hay.includes(q); }); els.historyBody.innerHTML = filteredRows.map(({ record, h }) => `<tr class="clickable-row" data-open-row="${e(record.id)}"><td>${e(h.at || "—")}</td><td>#${e(record.id)}</td><td>${e((record.fields || {})["Имя клиента"] || h.client || "—")}</td><td><b>${e(h.action || "")}</b></td><td>${e(h.details || "")}</td><td><button class="open-btn" data-open="${e(record.id)}">Открыть</button></td></tr>`).join("") || '<tr><td colspan="6">Истории пока нет</td></tr>'; bindActionButtons(); }
function clearLocalHistory() { if (!confirm("Очистить локальную историю изменений в этом браузере? Данные в NocoDB не удаляются.")) return; localStorage.removeItem(storage.history); renderHistorySection(); msg("Локальная история очищена"); }


function openReport(type) {
  currentReportType = type;
  const titles = { requests: "Отчёт по заявкам", payroll: "Отчёт по зарплате монтажников", autoPayroll: "Отчет по авто", objects: "Отчёт по объектам и объёму", clients: "Отчёт по клиентам" };
  els.reportTitle.textContent = titles[type] || "Настройка отчёта";
  els.reportDateFrom.value = els.dateFrom.value || monthStart();
  els.reportDateTo.value = els.dateTo.value || today();
  els.reportStatus.value = type === "payroll" ? "" : (els.statusFilter.value || "");
  if (els.reportFormat) els.reportFormat.value = (type === "payroll" || type === "autoPayroll") ? "xls" : (els.reportFormat.value || "xls");
  els.reportAllInstallers.checked = true;
  document.querySelectorAll('[name="reportInstaller"]').forEach((c) => c.checked = false);
  els.payrollOptions.style.display = type === "payroll" ? "block" : "none";
  renderPayrollSettings();
  updateReportPreview();
  els.reportDialog.showModal();
}
function reportSelectedInstallers() { return els.reportAllInstallers.checked ? WORKERS : [...document.querySelectorAll('[name="reportInstaller"]:checked')].map((x) => x.value); }
function reportFiltered() {
  const from = els.reportDateFrom.value, to = els.reportDateTo.value, status = els.reportStatus.value, selected = reportSelectedInstallers();
  return records.filter((r) => {
    const f = r.fields || {}, date = String(f["Дата записи"] || ""), names = splitInstallers(f["Монтажники"]);
    if (from && date < from) return false;
    if (to && date > to) return false;
    if (status && f["Статус"] !== status) return false;
    if (!els.reportAllInstallers.checked && (!names.length || !names.some((n) => selected.includes(n)))) return false;
    return true;
  }).sort(sortByDateDesc);
}

function autoReportRows() {
  const from = els.reportDateFrom?.value || "";
  const to = els.reportDateTo?.value || "";
  const status = els.reportStatus?.value || "";
  const selected = reportSelectedInstallers();
  return records.filter((r) => {
    if (isTrashRecord(r)) return false;
    if (recordDirection(r) !== "auto") return false;
    const f = r.fields || {};
    const date = String(f["Дата записи"] || "");
    if (from && date < from) return false;
    if (to && date > to) return false;
    if (status && f["Статус"] !== status) return false;
    const names = splitInstallers(f["Монтажники"] || f["Ответственный"] || "");
    if (!els.reportAllInstallers?.checked && selected.length && (!names.length || !names.some((n) => selected.includes(n)))) return false;
    return true;
  }).sort((a, b) => String((a.fields || {})["Дата записи"] || "").localeCompare(String((b.fields || {})["Дата записи"] || "")) || String((a.fields || {})["Время записи"] || "").localeCompare(String((b.fields || {})["Время записи"] || "")) || String(a.id).localeCompare(String(b.id)));
}
function autoMaterialText(f) {
  return String(f["Пленка"] || f["Плёнка"] || f["Материал"] || f["Пленка / материал"] || "").trim();
}
function autoRecordServices(f) {
  const parsed = parseAutoServices(f["Авто услуги"], f["Общая стоимость"] || f["Стоимость"] || "", f["Услуга"] || "");
  return parsed.filter((x) => String(x.name || x.price || "").trim());
}
function autoRecordPay(f) {
  return autoServicesPayTotal(autoRecordServices(f));
}
function renderAutoPayrollPreview() {
  const rows = autoReportRows();
  const totalOrder = rows.reduce((sum, r) => sum + (num((r.fields || {})["Общая стоимость"] || (r.fields || {})["Стоимость"]) || autoServicesTotal(autoRecordServices(r.fields || {}))), 0);
  const totalPay = rows.reduce((sum, r) => sum + autoRecordPay(r.fields || {}), 0);
  const servicesCount = rows.reduce((sum, r) => sum + autoRecordServices(r.fields || {}).length, 0);
  if (!els.reportPreview) return;
  els.reportPreview.innerHTML = `<div class="report-mini-grid"><div><b>${rows.length}</b><span>авто</span></div><div><b>${servicesCount}</b><span>услуг</span></div><div><b>${moneyNumber(totalOrder)} ₽</b><span>сумма заказов</span></div><div><b>${moneyNumber(totalPay)} ₽</b><span>оплата</span></div></div>`;
}
function downloadAutoPayrollReport() {
  const rows = autoReportRows();
  const data = buildAutoPayrollWorkbookData(rows);
  const xml = buildAutoPayrollSpreadsheetXml(data);
  const period = `${data.from || "start"}_${data.to || "end"}`.replace(/[^0-9a-zA-Zа-яА-Я_-]+/g, "_");
  downloadText(`solncanet_otchet_po_avto_${period}.xls`, "\uFEFF" + xml, "application/vnd.ms-excel;charset=utf-8");
  els.reportDialog.close();
}
function buildAutoPayrollWorkbookData(rows) {
  const autoRows = rows.map((r) => {
    const f = r.fields || {};
    const services = autoRecordServices(f);
    const orderTotal = num(f["Общая стоимость"] || f["Стоимость"]) || autoServicesTotal(services);
    const payTotal = autoServicesPayTotal(services);
    return {
      id: String(r.id || ""),
      date: String(f["Дата записи"] || ""),
      time: String(f["Время записи"] || ""),
      client: String(f["Имя клиента"] || ""),
      company: String(f["Компания"] || ""),
      phone: String(f["Телефон"] || ""),
      auto: String(f["Авто"] || f["Марка"] || f["Модель"] || ""),
      material: autoMaterialText(f),
      services,
      servicesText: services.map((s) => `${s.name || "Услуга"}${s.material ? ` (${s.material})` : ""}${s.price ? ` — ${moneyNumber(num(s.price))} ₽` : ""}`).join("; "),
      address: String(f["Адрес"] || ""),
      status: String(f["Статус"] || ""),
      installer: String(f["Монтажники"] || f["Ответственный"] || AUTO_DEFAULT_INSTALLER),
      orderTotal,
      payTotal,
      comment: String(f["Комментарий администратора"] || f["Комментарий"] || f["Комментарий клиента"] || "")
    };
  });
  const serviceRows = [];
  autoRows.forEach((r) => r.services.forEach((s) => {
    const pay = autoServicePay(s);
    serviceRows.push({
      id: r.id, date: r.date, client: r.client, auto: r.auto, material: String(s.material || r.material || ""),
      service: String(s.name || ""), price: autoServicePriceValue(s), pay: pay.amount, rateText: pay.rateText, code: pay.code || (pay.amount ? "" : "НЕ НАЙДЕНО"), direction: pay.direction
    });
  }));
  return { generatedAt: dateTimeY(), from: els.reportDateFrom?.value || "", to: els.reportDateTo?.value || "", autoRows, serviceRows };
}
function buildAutoPayrollSpreadsheetXml(data) {
  const styles = `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
    <Style ss:ID="Title"><Font ss:FontName="Arial" ss:Size="16" ss:Bold="1" ss:Color="#0B2A66"/></Style>
    <Style ss:ID="Header"><Interior ss:Color="#4F46E5" ss:Pattern="Solid"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>
    <Style ss:ID="Cell"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
    <Style ss:ID="Money"><NumberFormat ss:Format="# ##0 ₽"/><Alignment ss:Horizontal="Right"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
    <Style ss:ID="Number"><NumberFormat ss:Format="0"/><Alignment ss:Horizontal="Right"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
    <Style ss:ID="Kpi"><Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/><Font ss:FontName="Arial" ss:Bold="1" ss:Size="11"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>
  </Styles>`;
  const sheets = [buildAutoSummarySheet(data), buildAutoMainSheet(data), buildAutoServicesSheet(data), buildAutoRatesSheet(data)];
  return `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">\n<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>СОЛНЦАНЕТ</Author><Company>СОЛНЦАНЕТ</Company><Title>Отчет по авто</Title><Created>${new Date().toISOString()}</Created></DocumentProperties>\n<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"><WindowHeight>9000</WindowHeight><WindowWidth>16000</WindowWidth><ProtectStructure>False</ProtectStructure><ProtectWindows>False</ProtectWindows></ExcelWorkbook>\n${styles}\n${sheets.join("\n")}\n</Workbook>`;
}
function buildAutoSummarySheet(data) {
  const totalOrders = data.autoRows.reduce((s, r) => s + r.orderTotal, 0);
  const totalPay = data.autoRows.reduce((s, r) => s + r.payTotal, 0);
  const avgCheck = data.autoRows.length ? totalOrders / data.autoRows.length : 0;
  const byService = new Map();
  data.serviceRows.forEach((r) => {
    const key = r.service || "Без названия";
    const cur = byService.get(key) || { count: 0, revenue: 0, pay: 0 };
    cur.count += 1; cur.revenue += r.price; cur.pay += r.pay; byService.set(key, cur);
  });
  const rows = [];
  rows.push(xRow([xCell("Отчет по авто", "Title")], 22));
  rows.push(xRow([xCell("Период", "Kpi"), xCell(`${data.from || "—"} — ${data.to || "—"}`, "Cell") ]));
  rows.push(xRow([xCell("Создан", "Kpi"), xCell(data.generatedAt, "Cell") ]));
  rows.push(xRow([xCell("Автомобилей", "Kpi"), xCell(data.autoRows.length, "Number", "Number") ]));
  rows.push(xRow([xCell("Услуг", "Kpi"), xCell(data.serviceRows.length, "Number", "Number") ]));
  rows.push(xRow([xCell("Сумма заказов", "Kpi"), xCell(totalOrders, "Money", "Number") ]));
  rows.push(xRow([xCell("Оплата за авто", "Kpi"), xCell(totalPay, "Money", "Number") ]));
  rows.push(xRow([xCell("Средний чек", "Kpi"), xCell(avgCheck, "Money", "Number") ]));
  rows.push(xRow([xCell("", "Cell")], 4));
  rows.push(xRow(["Услуга", "Кол-во", "Сумма услуг", "Оплата"].map((h) => xCell(h, "Header"))));
  [...byService.entries()].sort((a,b)=>b[1].pay-a[1].pay).forEach(([name, x]) => rows.push(xRow([xCell(name), xCell(x.count,"Number","Number"), xCell(x.revenue,"Money","Number"), xCell(x.pay,"Money","Number")])));
  return xWorksheet("Сводка", [28, 16, 18, 18], rows, 10);
}
function buildAutoMainSheet(data) {
  const rows = [];
  rows.push(xRow(["ID", "Дата", "Время", "Клиент", "Компания", "Телефон", "Авто", "Материал", "Услуги", "Адрес", "Статус", "Монтажник", "Сумма заказа", "Оплата", "Комментарий"].map((h) => xCell(h, "Header"))));
  data.autoRows.forEach((r) => rows.push(xRow([xCell(r.id), xCell(r.date), xCell(r.time), xCell(r.client), xCell(r.company), xCell(r.phone), xCell(r.auto), xCell(r.material), xCell(r.servicesText), xCell(r.address), xCell(r.status), xCell(r.installer), xCell(r.orderTotal,"Money","Number"), xCell(r.payTotal,"Money","Number"), xCell(r.comment)])));
  rows.push(xRow([xCell("ИТОГО", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell(data.autoRows.reduce((s,r)=>s+r.orderTotal,0),"Money","Number"), xCell(data.autoRows.reduce((s,r)=>s+r.payTotal,0),"Money","Number"), xCell("", "Kpi") ]));
  return xWorksheet("Авто", [10, 12, 10, 24, 24, 18, 28, 24, 52, 42, 18, 18, 16, 16, 42], rows, 1);
}
function buildAutoServicesSheet(data) {
  const rows = [];
  rows.push(xRow(["ID", "Дата", "Клиент", "Авто", "Материал", "Услуга", "Код прайса", "Направление", "Сумма услуги", "Правило оплаты", "Оплата"].map((h) => xCell(h, "Header"))));
  data.serviceRows.forEach((r) => rows.push(xRow([xCell(r.id), xCell(r.date), xCell(r.client), xCell(r.auto), xCell(r.material), xCell(r.service), xCell(r.code), xCell(r.direction), xCell(r.price,"Money","Number"), xCell(r.rateText), xCell(r.pay,"Money","Number")])));
  rows.push(xRow([xCell("ИТОГО", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell("", "Kpi"), xCell(data.serviceRows.reduce((s,r)=>s+r.price,0),"Money","Number"), xCell("", "Kpi"), xCell(data.serviceRows.reduce((s,r)=>s+r.pay,0),"Money","Number") ]));
  return xWorksheet("Детализация услуг", [10, 12, 24, 28, 24, 34, 18, 18, 16, 18, 16], rows, 1);
}
function buildAutoRatesSheet(data) {
  const rows = [];
  rows.push(xRow(["Код", "Группа", "Услуга", "Ед.", "Стоимость", "Оплата сотруднику", "Процент", "Особое правило"].map((h) => xCell(h, "Header"))));
  AUTO_PAY_RATES.forEach((r) => rows.push(xRow([xCell(r.code), xCell(r.direction), xCell(r.service), xCell(r.unit), xCell(r.price || 0,"Money","Number"), xCell(r.pay || 0,"Money","Number"), xCell(r.percent ? Math.round(r.percent * 100) + "%" : ""), xCell(r.payFromPrice ? "по сумме услуги" : "")])));
  return xWorksheet("Прайс оплаты", [20, 18, 40, 12, 14, 16, 12, 22], rows, 1);
}

function updateReportPreview() {
  if (!els.reportPreview) return;
  if (currentReportType === "payroll") renderPayrollPreview();
  else if (currentReportType === "autoPayroll") renderAutoPayrollPreview();
  else {
    const rows = reportFiltered();
    const m2 = rows.reduce((s, r) => s + getM2(r.fields || {}), 0);
    els.reportPreview.innerHTML = `<p class="modal-note">В отчёт попадёт строк: <b>${rows.length}</b>. Общий объём: <b>${moneyNumber(m2)} м²</b>. Формат: <b>${els.reportFormat?.value === "xls" ? "Excel .xls" : "CSV"}</b>.</p>`;
  }
}
function downloadReport() {
  if (currentReportType === "payroll") return downloadPayrollReport();
  if (currentReportType === "autoPayroll") return downloadAutoPayrollReport();
  const rows = reportFiltered();
  const format = els.reportFormat?.value || "xls";
  let fields, title, filename;
  if (currentReportType === "objects") { title = "Отчёт по объектам"; filename = "solncanet_report_objects"; fields = ["Дата записи", "Время записи", "Имя клиента", "Компания", "Телефон", "Адрес", "Услуга", "Итоговый м2", "м2", "Статус", "Монтажники"]; }
  else if (currentReportType === "clients") { title = "Отчёт по клиентам"; filename = "solncanet_report_clients"; fields = ["Имя клиента", "Компания", "Телефон", "Дата записи", "Услуга", "Адрес", "Статус", "Итоговый м2", "м2"]; }
  else { title = "Отчёт по заявкам"; filename = "solncanet_report_requests"; fields = ["Дата записи", "Время записи", "Имя клиента", "Компания", "Телефон", "Услуга", "Адрес", "Итоговый м2", "м2", "Монтажники", "Статус", "Комментарий администратора"]; }
  if (format === "csv") downloadCsv(filename + ".csv", rows, fields);
  else downloadExcel(filename + ".xls", title, [{ title: "Данные", headers: fields, rows: rows.map((r) => { const f = r.fields || {}; return fields.map((k) => f[k] || ""); }) }]);
  els.reportDialog.close();
}
function downloadCsv(filename, rows, fields) { const csv = [fields.join(";"), ...rows.map((r) => { const f = r.fields || {}; return fields.map((k) => csvCell(f[k])).join(";"); })].join("\n"); downloadText(filename, "\uFEFF" + csv, "text/csv;charset=utf-8"); }


function defaultPayrollSettings() {
  const rates = {};
  WORKER_PROFILES.forEach((w) => rates[w.key] = { ...w.defaultRates, bonus: 0, advance: 0, comment: "" });
  return { splitMode: "equal-m2", statusMode: "completed", rates };
}
function migratePayrollSettings(saved) {
  const base = defaultPayrollSettings();
  if (!saved || typeof saved !== "object") return base;
  base.splitMode = "equal-m2";
  base.statusMode = saved.statusMode || base.statusMode;
  WORKERS.forEach((w) => {
    const old = saved.rates?.[w] || {};
    const target = base.rates[w];
    [1,2,3,4,5].forEach((n) => { if (old[n] !== undefined && old[n] !== "") target[n] = num(old[n]); });
    if (old.rate) target[1] = num(old.rate);
    target.bonus = num(old.bonus);
    target.advance = num(old.advance);
    target.comment = old.comment || "";
  });
  return base;
}
function getPayrollSettings() { try { return migratePayrollSettings(JSON.parse(localStorage.getItem(storage.payroll) || "{}")); } catch (_) { return defaultPayrollSettings(); } }
function savePayrollSettings(settings) { localStorage.setItem(storage.payroll, JSON.stringify(settings)); }
function renderPayrollSettings() {
  const settings = getPayrollSettings();
  if (els.payrollSplitMode) els.payrollSplitMode.value = "equal-m2";
  if (els.payrollStatusMode) els.payrollStatusMode.value = settings.statusMode || "completed";
  if (!els.payrollSettingsBody) return;
  els.payrollSettingsBody.innerHTML = WORKER_PROFILES.map((w) => { const r = settings.rates?.[w.key] || {}; return `<tr><td><b>${e(w.full)}</b><br><small>${e(w.key)}</small></td><td><input data-payroll-rate="${w.key}" data-crew="1" type="number" step="1" value="${e(r[1] ?? 0)}"></td><td><input data-payroll-rate="${w.key}" data-crew="2" type="number" step="1" value="${e(r[2] ?? 0)}"></td><td><input data-payroll-rate="${w.key}" data-crew="3" type="number" step="1" value="${e(r[3] ?? 0)}"></td><td><input data-payroll-rate="${w.key}" data-crew="4" type="number" step="1" value="${e(r[4] ?? 0)}"></td><td><input data-payroll-rate="${w.key}" data-crew="5" type="number" step="1" value="${e(r[5] ?? 0)}"></td><td><input data-payroll-bonus="${w.key}" type="number" step="1" value="${e(r.bonus || 0)}"></td><td><input data-payroll-advance="${w.key}" type="number" step="1" value="${e(r.advance || 0)}"></td><td><input data-payroll-comment="${w.key}" value="${e(r.comment || "")}"></td></tr>`; }).join("");
}
function savePayrollSettingsFromForm() {
  const settings = defaultPayrollSettings();
  settings.splitMode = "equal-m2";
  settings.statusMode = els.payrollStatusMode?.value || "completed";
  WORKERS.forEach((w) => {
    const current = settings.rates[w];
    [1,2,3,4,5].forEach((n) => current[n] = num(document.querySelector(`[data-payroll-rate="${w}"][data-crew="${n}"]`)?.value));
    current.bonus = num(document.querySelector(`[data-payroll-bonus="${w}"]`)?.value);
    current.advance = num(document.querySelector(`[data-payroll-advance="${w}"]`)?.value);
    current.comment = document.querySelector(`[data-payroll-comment="${w}"]`)?.value || "";
  });
  savePayrollSettings(settings);
  return settings;
}
function emptyPayrollSummary(worker) { return { worker, jobs: 0, m2: 0, amount: 0, bonus: 0, advance: 0, total: 0, last: "", comment: "" }; }
function payrollRecordsForReport() {
  const settings = getPayrollSettings();
  const rows = reportFiltered();
  const statusMode = els.payrollStatusMode?.value || settings.statusMode || "completed";
  if (statusMode === "report-filter") return rows;
  if (statusMode === "all-active") return rows.filter((r) => !TRASH_STATUSES.has((r.fields || {})["Статус"] || ""));
  return rows.filter((r) => PAYROLL_STATUSES.has((r.fields || {})["Статус"] || ""));
}
function getWorkerRate(settings, worker, crewSize, mode) {
  const size = mode === "one-rate-full" ? 1 : Math.min(Math.max(Number(crewSize) || 1, 1), 5);
  return num(settings.rates?.[worker]?.[size]);
}
function buildPayroll(sourceRows = payrollRecordsForReport(), options = {}) {
  const settings = getPayrollSettings();
  const mode = "equal-m2";
  const selected = options.selectedWorkers || reportSelectedInstallers();
  const statusMode = options.statusModeOverride || (options.useUi === false ? "all-active" : (els.payrollStatusMode?.value || settings.statusMode || "completed"));
  const source = statusMode === "completed" ? sourceRows.filter((r) => PAYROLL_STATUSES.has((r.fields || {})["Статус"] || "")) : statusMode === "all-active" ? sourceRows.filter((r) => !TRASH_STATUSES.has((r.fields || {})["Статус"] || "")) : sourceRows;
  const summary = Object.fromEntries(WORKERS.map((w) => [w, emptyPayrollSummary(w)]));
  const details = [];
  source.forEach((r) => {
    const f = r.fields || {};
    const allNames = splitInstallers(f["Монтажники"]);
    const names = allNames.filter((n) => selected.includes(n));
    if (!names.length) return;
    const totalM2 = getM2(f);
    const crewSize = Math.min(Math.max(allNames.length || names.length || 1, 1), 5);
    names.forEach((name) => {
      const shareM2 = totalM2 / Math.max(allNames.length || names.length, 1);
      const rate = getWorkerRate(settings, name, crewSize, mode);
      const amount = shareM2 * rate;
      const item = summary[name] || emptyPayrollSummary(name);
      item.jobs++;
      item.m2 += shareM2;
      item.amount += amount;
      if (String(f["Дата записи"] || "") >= String(item.last || "")) item.last = f["Дата записи"] || "";
      summary[name] = item;
      details.push({ id: r.id, date: f["Дата записи"] || "", time: f["Время записи"] || "", client: f["Имя клиента"] || "", company: f["Компания"] || "", phone: f["Телефон"] || "", address: f["Адрес"] || "", service: f["Услуга"] || "", status: f["Статус"] || "", worker: name, workerFull: workerLabel(name), installers: displayInstallers(allNames.join(", ")), crewSize, totalM2, shareM2, rate, amount });
    });
  });
  WORKERS.forEach((w) => { const r = settings.rates?.[w] || {}; summary[w].bonus = num(r.bonus); summary[w].advance = num(r.advance); summary[w].comment = r.comment || ""; summary[w].total = summary[w].amount + summary[w].bonus - summary[w].advance; });
  return { summary, details, settings, mode };
}
function renderPayrollPreview() {
  savePayrollSettingsFromForm();
  const payroll = buildPayroll();
  const summaryRows = WORKERS.map((w) => payroll.summary[w]).filter((x) => x.jobs || x.bonus || x.advance);
  const total = summaryRows.reduce((s, x) => s + x.total, 0);
  const summaryHtml = summaryRows.length ? `<h3>Итого к выплате: ${money(total)}</h3><div class="table-mini-wrap"><table class="table-mini"><thead><tr><th>Монтажник</th><th>Объектов</th><th>м² к оплате</th><th>Начислено</th><th>Доплата</th><th>Аванс/удерж.</th><th>Итого</th></tr></thead><tbody>${summaryRows.map((x) => `<tr><td><b>${e(workerLabel(x.worker))}</b></td><td>${x.jobs}</td><td>${moneyNumber(x.m2)}</td><td>${money(x.amount)}</td><td>${money(x.bonus)}</td><td>${money(x.advance)}</td><td><b>${money(x.total)}</b></td></tr>`).join("")}</tbody></table></div>` : '<p class="modal-note">По выбранным условиям нет работ для расчёта зарплаты.</p>';
  const detailsHtml = payroll.details.length ? `<h3>Детализация</h3><div class="table-mini-wrap"><table class="table-mini"><thead><tr><th>Дата</th><th>Заявка</th><th>Клиент</th><th>Компания</th><th>Объект</th><th>Бригада</th><th>Монтажник</th><th>м² к оплате</th><th>Ставка</th><th>Сумма</th></tr></thead><tbody>${payroll.details.slice(0, 120).map((d) => `<tr><td>${e(d.date)}</td><td>#${e(d.id)}</td><td>${e(d.client)}</td><td>${e(d.company || "—")}</td><td>${e(d.address)}</td><td>${d.crewSize}</td><td>${e(d.workerFull)}</td><td>${moneyNumber(d.shareM2)}</td><td>${moneyNumber(d.rate)}</td><td>${money(d.amount)}</td></tr>`).join("")}</tbody></table></div>` : "";
  els.reportPreview.innerHTML = summaryHtml + detailsHtml;
}
function downloadPayrollReport() {
  savePayrollSettingsFromForm();
  const format = els.reportFormat?.value || "xls";
  if (format === "csv") return downloadPayrollCsvReport();
  downloadPayrollSmartWorkbook();
  els.reportDialog.close();
}
function downloadPayrollCsvReport() {
  const { summary, details, settings, mode } = buildPayroll();
  const summaryRows = WORKERS.map((w) => summary[w]).filter((x) => x.jobs || x.bonus || x.advance);
  const summaryTable = { title: "Сводка к выплате", headers: ["Сотрудник", "Кратко", "Объектов", "м² к оплате", "Начислено", "Доплата", "Аванс/удержание", "Итого к выплате", "Комментарий"], rows: summaryRows.map((x) => [workerLabel(x.worker), x.worker, x.jobs, moneyNumber(x.m2), moneyNumber(x.amount), moneyNumber(x.bonus), moneyNumber(x.advance), moneyNumber(x.total), x.comment]) };
  const detailsTable = { title: "Детализация по объектам", headers: ["Дата", "Время", "Заявка", "Клиент", "Компания", "Телефон", "Адрес", "Услуга", "Статус", "Бригада, чел", "Монтажник", "Все монтажники", "Общий м² объекта", "м² к оплате", "Ставка по бригаде", "Сумма"], rows: details.map((d) => [d.date, d.time, "#" + d.id, d.client, d.company || "", d.phone, d.address, d.service, d.status, d.crewSize, d.workerFull, d.installers, moneyNumber(d.totalM2), moneyNumber(d.shareM2), moneyNumber(d.rate), moneyNumber(d.amount)]) };
  const ratesTable = { title: "Ставки за м²", headers: ["Сотрудник", "1 чел", "2 чел", "3 чел", "4 чел", "5 чел", "Доплата", "Аванс/удержание", "Комментарий"], rows: WORKER_PROFILES.map((w) => { const r = settings.rates[w.key] || {}; return [w.full, r[1], r[2], r[3], r[4], r[5], r.bonus, r.advance, r.comment || ""]; }) };
  const metaTable = { title: "Параметры отчёта", headers: ["Параметр", "Значение"], rows: [["Период", `${els.reportDateFrom.value} — ${els.reportDateTo.value}`], ["Метод расчёта", payrollModeText(mode)], ["Статусы", payrollStatusText(els.payrollStatusMode?.value || settings.statusMode)], ["Создан", dateTimeY()]] };
  const lines = [];
  [metaTable, ratesTable, summaryTable, detailsTable].forEach((tbl) => { lines.push([tbl.title].join(";")); lines.push(tbl.headers.join(";")); tbl.rows.forEach((row) => lines.push(row.map(csvCell).join(";"))); lines.push(""); });
  downloadText("solncanet_report_payroll.csv", "\uFEFF" + lines.join("\n"), "text/csv;charset=utf-8");
  els.reportDialog.close();
}
function downloadPayrollSmartWorkbook() {
  const data = buildPayrollWorkbookData();
  const xml = buildPayrollSpreadsheetXml(data);
  const period = `${data.from || "start"}_${data.to || "end"}`.replace(/[^0-9a-zA-Zа-яА-Я_-]+/g, "_");
  downloadText(`solncanet_zp_smart_${period}.xls`, "\uFEFF" + xml, "application/vnd.ms-excel;charset=utf-8");
}
function buildPayrollWorkbookData() {
  const settings = getPayrollSettings();
  const mode = "equal-m2";
  const selected = reportSelectedInstallers();
  const rows = payrollRecordsForReport().slice().sort((a, b) => String((a.fields || {})["Дата записи"] || "").localeCompare(String((b.fields || {})["Дата записи"] || "")) || String(a.id).localeCompare(String(b.id)));
  const mainRows = rows.map((r) => {
    const f = r.fields || {};
    const installers = splitInstallers(f["Монтажники"]);
    return {
      id: String(r.id || ""),
      date: String(f["Дата записи"] || ""),
      time: String(f["Время записи"] || ""),
      status: String(f["Статус"] || ""),
      client: String(f["Имя клиента"] || ""),
      company: String(f["Компания"] || ""),
      phone: String(f["Телефон"] || ""),
      address: String(f["Адрес"] || ""),
      service: String(f["Услуга"] || ""),
      m2: moneyNumber(getM2(f)),
      installers: installers.map(workerLabel).filter(Boolean).join(", "),
      comment: String(f["Комментарий администратора"] || f["Комментарий"] || "")
    };
  });
  const workers = selected.length ? selected : WORKERS;
  const maxRows = Math.max(mainRows.length + 100, 300);
  return {
    generatedAt: dateTimeY(),
    from: els.reportDateFrom.value || "",
    to: els.reportDateTo.value || "",
    statusText: payrollStatusText(els.payrollStatusMode?.value || settings.statusMode),
    mode,
    modeText: payrollModeText(mode),
    settings,
    workers,
    mainRows,
    maxRows,
    mainHeaderRow: 1,
    mainDataStartRow: 2,
    employeeDataStartRow: 6
  };
}
function buildPayrollSpreadsheetXml(data) {
  const workbookStyles = `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
    <Style ss:ID="Title"><Font ss:FontName="Arial" ss:Size="16" ss:Bold="1" ss:Color="#0B2A66"/></Style>
    <Style ss:ID="SubTitle"><Font ss:FontName="Arial" ss:Size="10" ss:Color="#4B5563"/><Alignment ss:WrapText="1"/></Style>
    <Style ss:ID="Header"><Interior ss:Color="#0B7A75" ss:Pattern="Solid"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>
    <Style ss:ID="Cell"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
    <Style ss:ID="Editable"><Interior ss:Color="#FFF7ED" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDBA74"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDBA74"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDBA74"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDBA74"/></Borders><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
    <Style ss:ID="Formula"><Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/></Borders><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
    <Style ss:ID="Money"><NumberFormat ss:Format="# ##0 ₽"/><Alignment ss:Horizontal="Right"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
    <Style ss:ID="Number"><NumberFormat ss:Format="0.00"/><Alignment ss:Horizontal="Right"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders></Style>
    <Style ss:ID="Kpi"><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/><Font ss:FontName="Arial" ss:Bold="1" ss:Size="11"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/></Borders></Style>
    <Style ss:ID="Warn"><Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/><Font ss:FontName="Arial" ss:Color="#991B1B" ss:Bold="1"/><Alignment ss:WrapText="1"/></Style>
  </Styles>`;
  const sheets = [
    buildPayrollRatesSheet(data),
    buildPayrollMainSheet(data),
    buildPayrollSummarySheet(data),
    ...data.workers.map((w) => buildPayrollEmployeeSheet(data, w))
  ];
  return `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">\n<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>СОЛНЦАНЕТ</Author><Company>СОЛНЦАНЕТ</Company><Title>Зарплатный отчёт монтажников</Title><Created>${new Date().toISOString()}</Created></DocumentProperties>\n<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"><WindowHeight>9000</WindowHeight><WindowWidth>16000</WindowWidth><ProtectStructure>False</ProtectStructure><ProtectWindows>False</ProtectWindows></ExcelWorkbook>\n${workbookStyles}\n${sheets.join("\n")}\n</Workbook>`;
}
function buildPayrollRatesSheet(data) {
  const rows = [];
  rows.push(xRow(["Кратко", "Сотрудник", "1 чел", "2 чел", "3 чел", "4 чел", "5 чел", "Доплата", "Аванс / удержание", "Комментарий"].map((h) => xCell(h, "Header"))));
  WORKER_PROFILES.forEach((w) => {
    const r = data.settings.rates?.[w.key] || {};
    rows.push(xRow([
      xCell(w.key, "Cell"), xCell(w.full, "Cell"),
      xCell(num(r[1]), "Editable", "Number"), xCell(num(r[2]), "Editable", "Number"), xCell(num(r[3]), "Editable", "Number"), xCell(num(r[4]), "Editable", "Number"), xCell(num(r[5]), "Editable", "Number"),
      xCell(num(r.bonus), "Editable", "Number"), xCell(num(r.advance), "Editable", "Number"), xCell(r.comment || "", "Editable")
    ]));
  });
  return xWorksheet("Ставки", [16, 24, 12, 12, 12, 12, 12, 14, 18, 36], rows, 1);
}
function buildPayrollMainSheet(data) {
  const rows = [];
  rows.push(xRow(["ID", "Дата", "Время", "Статус", "Клиент", "Компания", "Телефон", "Адрес / объект", "Услуга", "Общий м²", "Монтажники", "Кол-во монтажников", "Комментарий"].map((h) => xCell(h, "Header"))));
  for (let i = 0; i < data.maxRows; i++) {
    const r = data.mainRows[i] || {};
    rows.push(xRow([
      xCell(r.id || "", "Editable"),
      xCell(r.date || "", "Editable"),
      xCell(r.time || "", "Editable"),
      xCell(r.status || "", "Editable"),
      xCell(r.client || "", "Editable"),
      xCell(r.company || "", "Editable"),
      xCell(r.phone || "", "Editable"),
      xCell(r.address || "", "Editable"),
      xCell(r.service || "", "Editable"),
      xCell(r.m2 || 0, "Editable", "Number"),
      xCell(r.installers || "", "Editable"),
      xCell(0, "Formula", "Number", `=IF(RC[-1]="","",LEN(RC[-1])-LEN(SUBSTITUTE(RC[-1],",",""))+1)`),
      xCell(r.comment || "", "Editable")
    ]));
  }
  return xWorksheet("Монтажи", [12, 12, 10, 18, 24, 24, 18, 42, 28, 12, 46, 14, 46], rows, 1);
}
function buildPayrollSummarySheet(data) {
  const rows = [];
  const start = data.employeeDataStartRow;
  const end = data.employeeDataStartRow + data.maxRows - 1;
  rows.push(xRow(["Сотрудник", "Объектов", "м² к оплате", "Начислено", "Ручные корректировки", "Доплата", "Аванс / удержание", "Итого к выплате", "Комментарий"].map((h) => xCell(h, "Header"))));
  data.workers.forEach((key) => {
    const full = workerLabel(key);
    const rateRow = 2 + WORKERS.indexOf(key);
    const sh = xlSheet(full);
    rows.push(xRow([
      xCell(full, "Cell"),
      xCell(0, "Formula", "Number", `=COUNTIF('${sh}'!R${start}C2:R${end}C2,"<>")`),
      xCell(0, "Formula", "Number", `=SUM('${sh}'!R${start}C12:R${end}C12)`),
      xCell(0, "Formula", "Number", `=SUM('${sh}'!R${start}C14:R${end}C14)`),
      xCell(0, "Formula", "Number", `=SUM('${sh}'!R${start}C15:R${end}C15)`),
      xCell(0, "Formula", "Number", `='Ставки'!R${rateRow}C8`),
      xCell(0, "Formula", "Number", `='Ставки'!R${rateRow}C9`),
      xCell(0, "Formula", "Number", `=RC[-4]+RC[-3]+RC[-2]-RC[-1]`),
      xCell("", "Formula", "String", `='Ставки'!R${rateRow}C10`)
    ]));
  });
  rows.push(xRow([xCell("ИТОГО", "Kpi"), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell(0, "Kpi", "Number", `=SUM(R[-${data.workers.length}]C:R[-1]C)`), xCell("", "Kpi")]));
  return xWorksheet("Сводка", [28, 12, 14, 16, 20, 14, 18, 18, 32], rows, 1);
}
function buildPayrollEmployeeSheet(data, workerKey) {
  const full = workerLabel(workerKey);
  const key = workerKey;
  const rows = [];
  const start = data.employeeDataStartRow;
  const end = data.employeeDataStartRow + data.maxRows - 1;
  const rateRow = 2 + WORKERS.indexOf(workerKey);
  rows.push(xRow([xCell(full, "Title")], 22));
  rows.push(xRow(["Объектов", "м² к оплате", "Начислено", "Корректировки", "Доплата", "Аванс", "Итого"].map((h) => xCell(h, "Header"))));
  rows.push(xRow([
    xCell(0, "Formula", "Number", `=COUNTIF(R${start}C2:R${end}C2,"<>")`),
    xCell(0, "Formula", "Number", `=SUM(R${start}C12:R${end}C12)`),
    xCell(0, "Formula", "Number", `=SUM(R${start}C14:R${end}C14)`),
    xCell(0, "Formula", "Number", `=SUM(R${start}C15:R${end}C15)`),
    xCell(0, "Formula", "Number", `='Ставки'!R${rateRow}C8`),
    xCell(0, "Formula", "Number", `='Ставки'!R${rateRow}C9`),
    xCell(0, "Formula", "Number", `=RC[-4]+RC[-3]+RC[-2]-RC[-1]`)
  ]));
  rows.push(xRow([xCell("", "Cell")], 6));
  rows.push(xRow(["№", "ID", "Дата", "Статус", "Клиент", "Компания", "Телефон", "Адрес", "Услуга", "Общий м²", "Бригада", "м² к оплате", "Ставка", "Начислено", "Корректировка", "Итого", "Комментарий"].map((h) => xCell(h, "Header"))));
  for (let i = 0; i < data.maxRows; i++) {
    const mainRow = data.mainDataStartRow + i;
    const test = workerInMainFormula(full, key, mainRow);
    const rateIndex = `MAX(1,MIN(5,'Монтажи'!R${mainRow}C12))`;
    const m2Formula = `=IF(${test},IF('Монтажи'!R${mainRow}C12=0,0,'Монтажи'!R${mainRow}C10/'Монтажи'!R${mainRow}C12),"")`;
    rows.push(xRow([
      xCell(0, "Formula", "Number", `=IF(RC[1]="","",ROW()-${start - 1})`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C1,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C2,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C4,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C5,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C6,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C7,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C8,"")`),
      xCell("", "Formula", "String", `=IF(${test},'Монтажи'!R${mainRow}C9,"")`),
      xCell(0, "Formula", "Number", `=IF(${test},'Монтажи'!R${mainRow}C10,"")`),
      xCell(0, "Formula", "Number", `=IF(${test},'Монтажи'!R${mainRow}C12,"")`),
      xCell(0, "Formula", "Number", m2Formula),
      xCell(0, "Formula", "Number", `=IF(RC[-11]="","",INDEX('Ставки'!R2C3:R6C7,MATCH("${xlFormulaText(full)}",'Ставки'!R2C2:R6C2,0),${rateIndex}))`),
      xCell(0, "Formula", "Number", `=IF(RC[-12]="","",RC[-2]*RC[-1])`),
      xCell(0, "Editable", "Number"),
      xCell(0, "Formula", "Number", `=IF(RC[-14]="","",RC[-2]+RC[-1])`),
      xCell("", "Editable")
    ]));
  }
  return xWorksheet(full, [8, 12, 12, 16, 24, 24, 18, 42, 28, 12, 10, 12, 12, 14, 16, 14, 32], rows, 5);
}
function workerInMainFormula(full, key, mainRow) {
  return `OR(ISNUMBER(SEARCH(\"${xlFormulaText(full)}\",'Монтажи'!R${mainRow}C11)),ISNUMBER(SEARCH(\"${xlFormulaText(key)}\",'Монтажи'!R${mainRow}C11)))`;
}
function xWorksheet(name, widths, rows, freezeRow = 0) {
  const cols = widths.map((w) => `<Column ss:Width="${Number(w) * 6}"/>`).join("");
  return `<Worksheet ss:Name="${xmlAttr(xlSheet(name))}"><Table>${cols}${rows.join("")}</Table>${worksheetOptions(freezeRow)}</Worksheet>`;
}
function worksheetOptions(freezeRow) {
  if (!freezeRow) return `<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><PageSetup><Layout x:Orientation="Landscape"/></PageSetup></WorksheetOptions>`;
  return `<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><PageSetup><Layout x:Orientation="Landscape"/></PageSetup><FreezePanes/><FrozenNoSplit/><SplitHorizontal>${freezeRow}</SplitHorizontal><TopRowBottomPane>${freezeRow}</TopRowBottomPane><ActivePane>2</ActivePane></WorksheetOptions>`;
}
function xRow(cells, height) {
  const h = height ? ` ss:Height="${height}"` : "";
  return `<Row${h}>${cells.join("")}</Row>`;
}
function xCell(value, style = "Cell", type = "String", formula = "") {
  const isNumber = type === "Number";
  const dataValue = isNumber ? String(Number(value) || 0) : xmlText(value);
  const formulaAttr = formula ? ` ss:Formula="${xmlAttr(formula)}"` : "";
  return `<Cell ss:StyleID="${style}"${formulaAttr}><Data ss:Type="${isNumber ? "Number" : "String"}">${dataValue}</Data></Cell>`;
}
function xmlText(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function xmlAttr(value) { return xmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }
function xlSheet(name) { return String(name || "Лист").replace(/[\\/?*\[\]:]/g, " ").slice(0, 31); }
function xlFormulaText(value) { return String(value || "").replace(/"/g, "\"\""); }
function payrollModeText(mode) { return "м² объекта делится на всех монтажников, ставка берётся по количеству монтажников"; }
function payrollStatusText(mode) { return mode === "all-active" ? "Все, кроме Отказ / Отменена" : mode === "report-filter" ? "Как выбран статус в фильтре отчёта" : "Только Выполнено и Оплачено"; }
function downloadExcel(filename, title, tables) {
  const style = `<style>body{font-family:Arial}h1{color:#0b2a66}h2{margin-top:22px;color:#0b2a66}table{border-collapse:collapse;margin-bottom:20px}th{background:#0b7a75;color:#fff;font-weight:bold}th,td{border:1px solid #d0d7de;padding:7px 9px}td.num{text-align:right} .total{font-weight:bold;background:#f1f5f9}</style>`;
  const body = `<h1>${escapeHtml(title)}</h1>` + tables.map((tbl) => `<h2>${escapeHtml(tbl.title)}</h2><table><thead><tr>${tbl.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${tbl.rows.map((row) => `<tr>${row.map((cell) => `<td${typeof cell === "number" ? ' class="num"' : ""}>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${body}</body></html>`;
  downloadText(filename, "\uFEFF" + html, "application/vnd.ms-excel;charset=utf-8");
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function diffFields(oldF, newF) { const labels = { "Дата записи": "дата", "Время записи": "время", "Статус": "статус", "Итоговый м2": "м²", "Ответственный": "ответственный", "Компания": "компания", "Услуга": "услуга", "Адрес": "адрес", "Комментарий администратора": "комментарий администратора", "Монтажники": "монтажники" }; const changes = []; for (const key of Object.keys(newF)) { const oldVal = String(oldF[key] || (key === "Итоговый м2" ? oldF["м2"] || "" : "")).trim(); const newVal = String(newF[key] || "").trim(); if (oldVal !== newVal) changes.push(`${labels[key] || key}: «${oldVal || "—"}» → «${newVal || "—"}»`); } return changes; }
function lastCancelReason(f) { const text = String(f["Комментарий администратора"] || ""); const lines = text.split("\n").filter((x) => x.includes("ОТМЕНА:")); return lines.at(-1) || ""; }
function msg(text) { els.message.textContent = text; }
function e(value) { return String(value || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }
function nl2br(value) { return e(value).replace(/\n/g, "<br>"); }
function phoneLink(value) { const phone = String(value || "").trim(); return phone ? `<a href="tel:${e(phone)}">${e(phone)}</a>` : "—"; }
function ymdLocal(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function today() { return dateY(new Date()); }
function monthStart() { return today().slice(0, 8) + "01"; }
function dateY(d) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yekaterinburg", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d); return parts.find((p) => p.type === "year").value + "-" + parts.find((p) => p.type === "month").value + "-" + parts.find((p) => p.type === "day").value; }
function timeY(d) { return new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Yekaterinburg", hour: "2-digit", minute: "2-digit", hour12: false }).format(d); }
function dateTimeY() { const d = new Date(); return dateY(d) + " " + timeY(d); }
function csvCell(value) { return `"${String(value || "").replace(/\r?\n/g, " ").replace(/"/g, '""')}"`; }
function canonicalWorker(value) { const raw = String(value || "").trim(); if (!raw) return ""; const n = norm(raw); const found = WORKER_PROFILES.find((w) => w.aliases.some((a) => norm(a) === n) || norm(w.key) === n || norm(w.full) === n); return found ? found.key : raw; }
function workerLabel(key) { return WORKER_BY_KEY[key]?.full || key || ""; }
function displayInstallers(value) { return splitInstallers(value).map(workerLabel).join(", "); }
function splitInstallers(value) { return String(value || "").split(/[,;]+/).map((x) => canonicalWorker(x)).filter(Boolean); }
function getM2(f) { return Number(String(f["Итоговый м2"] || f["м2"] || 0).replace(",", ".")) || 0; }
function num(value) { return Number(String(value || 0).replace(",", ".")) || 0; }
function moneyNumber(value) { return Math.round((Number(value) || 0) * 100) / 100; }
function money(value) { return moneyNumber(value).toLocaleString("ru-RU") + " ₽"; }
function norm(value) { return String(value || "").toLowerCase().replace(/ё/g, "е").trim(); }
function fieldText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(fieldText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return [value.name, value.title, value.value, value.label, value.text, value.display, value.status, value.Name, value.Title]
      .filter((v) => v !== null && v !== undefined && v !== "")
      .map(String)
      .join(" ") || JSON.stringify(value);
  }
  return String(value);
}
function downloadText(filename, content, type = "text/plain;charset=utf-8") { const blob = new Blob([content], { type }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }


// === V13: бесплатное файловое хранилище через Google Drive + Apps Script ===
function initFileServiceEvents() {
  const uploadBtn = $("filesUploadBtn");
  const refreshBtn = $("filesRefreshBtn");
  const testBtn = $("googleDriveTestBtn");
  const testBtnSettings = $("googleDriveTestBtnSettings");
  const requestUploadBtn = $("requestUploadBtn");
  const requestFilesRefreshBtn = $("requestFilesRefreshBtn");
  const zone = $("filesDropZone");
  if (uploadBtn) uploadBtn.addEventListener("click", () => uploadFilesFromPanel());
  if (refreshBtn) refreshBtn.addEventListener("click", () => load());
  if (testBtn) testBtn.addEventListener("click", openGoogleDriveTest);
  if (testBtnSettings) testBtnSettings.addEventListener("click", openGoogleDriveTest);
  if (requestUploadBtn) requestUploadBtn.addEventListener("click", () => uploadFilesForCurrentRequest());
  if (requestFilesRefreshBtn) requestFilesRefreshBtn.addEventListener("click", () => loadFiles(false).then(() => current && renderRequestFiles(current.id)));
  if (zone) {
    zone.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("is-dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragover");
      const input = $("filesUploadInput");
      if (input && event.dataTransfer?.files?.length) input.files = event.dataTransfer.files;
    });
  }
}
async function loadFiles(silent = false) {
  filesCache = parseFilesFromRecords(records);
  renderFiles();
  if (current) renderRequestFiles(current.id);
  if (!silent) setFilesStatus(`Файлов в заявках: ${filesCache.length}`);
}
function setFilesStatus(text) {
  const el = $("filesStatus");
  if (el) el.textContent = text || "";
}

function openGoogleDriveTest() {
  const password = encodeURIComponent(pwd());
  window.open(`/google-drive-test?password=${password}&t=${Date.now()}`, "_blank", "noopener");
}
function renderFilesRequestSelect() {
  const select = $("filesRequestSelect");
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = records.slice().sort(sortByDateDesc).map((r) => {
    const f = r.fields || {};
    const label = `#${r.id} — ${f["Имя клиента"] || "без имени"} — ${f["Адрес"] || f["Услуга"] || "без адреса"}`;
    return `<option value="${e(r.id)}">${e(label)}</option>`;
  }).join("") || '<option value="">Нет заявок</option>';
  if (currentValue && [...select.options].some((o) => o.value === currentValue)) select.value = currentValue;
}
function getLocalFilesFallback() {
  try { return JSON.parse(localStorage.getItem(storage.filesFallback) || "{}"); } catch (_) { return {}; }
}
function setLocalFilesFallback(requestId, files) {
  const all = getLocalFilesFallback();
  all[String(requestId)] = files || [];
  localStorage.setItem(storage.filesFallback, JSON.stringify(all));
}
function mergeFilesUnique(files) {
  const out = [];
  const seen = new Set();
  for (const file of files || []) {
    const key = String(file.key || file.id || file.fileId || file.url || file.downloadUrl || file.originalName || Math.random());
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(file);
  }
  return out;
}
function parseRecordFiles(record) {
  const f = record?.fields || {};
  const raw = f["Файлы"] || f["Файл"] || f["Вложения"] || f["Google Drive"] || "";
  let list = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
      else if (parsed && typeof parsed === "object") list = [parsed];
    } catch (_) {
      list = String(raw).split(/\n+/).map((line) => ({ originalName: line.trim(), url: line.trim() })).filter((x) => x.originalName);
    }
  }
  const local = getLocalFilesFallback()[String(record?.id)] || [];
  return mergeFilesUnique([...list, ...local]).map((file) => normalizeFileMeta(file, record.id, f));
}
function parseFilesFromRecords(sourceRecords) {
  return (sourceRecords || []).flatMap((record) => parseRecordFiles(record)).sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
}
function normalizeFileMeta(file, requestId, fields = {}) {
  const id = file.id || file.fileId || String(file.key || "").replace(/^drive:/, "");
  const key = file.key || (id ? `drive:${id}` : `${requestId}-${file.originalName || file.name || Date.now()}`);
  return {
    ...file,
    id,
    key,
    requestId: String(file.requestId || requestId || ""),
    originalName: file.originalName || file.name || "Файл",
    name: file.name || file.originalName || "Файл",
    contentType: file.contentType || file.mimeType || "",
    fileType: file.fileType || fileTypeByMime(file.contentType || file.mimeType || "", file.originalName || file.name || ""),
    size: Number(file.size || 0),
    uploadedAt: file.uploadedAt || "",
    client: file.client || fields["Имя клиента"] || "",
    phone: file.phone || fields["Телефон"] || "",
    address: file.address || fields["Адрес"] || "",
    service: file.service || fields["Услуга"] || "",
    status: file.status || fields["Статус"] || "",
    url: file.url || file.webViewLink || "",
    downloadUrl: file.downloadUrl || file.webContentLink || file.url || file.webViewLink || ""
  };
}
function groupFilesByRequest(files) {
  return (files || []).reduce((acc, file) => {
    const id = String(file.requestId || "");
    if (!id) return acc;
    (acc[id] ||= []).push(file);
    return acc;
  }, {});
}
function fileTypeByMime(mime, name) {
  const m = String(mime || "").toLowerCase();
  const n = String(name || "").toLowerCase();
  if (m.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(n)) return "фото";
  if (m.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(n)) return "видео";
  if (m.includes("pdf") || /\.pdf$/i.test(n)) return "pdf";
  return "документ";
}
function fileMatchesType(file, type) {
  const t = norm(type);
  const hay = norm([file.fileType, file.contentType, file.originalName, file.name].join(" "));
  if (t === "фото") return hay.includes("фото") || hay.includes("image") || /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(file.originalName || "");
  if (t === "видео") return hay.includes("видео") || hay.includes("video") || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.originalName || "");
  if (t === "pdf") return hay.includes("pdf") || /\.pdf$/i.test(file.originalName || "");
  return hay.includes(t);
}
function fileMiniHtml(file) {
  const isImage = fileMatchesType(file, "фото") && (file.url || file.downloadUrl);
  const thumb = isImage
    ? `<button type="button" class="file-thumb file-thumb-btn" data-file-preview="${e(file.key)}" title="Посмотреть файл"><img src="${e(file.downloadUrl || file.url)}" alt="${e(file.originalName || "Файл")}" loading="lazy"></button>`
    : `<button type="button" class="file-thumb file-thumb-btn file-thumb-icon" data-file-preview="${e(file.key)}" title="Посмотреть файл">${fileIcon(file)}</button>`;
  return `<div class="file-chip file-chip-v53"><div class="file-chip__main">${thumb}<span><button type="button" class="file-title-button" data-file-preview="${e(file.key)}">${e(file.originalName || file.name || "Файл")}</button><small>${e(file.fileType || "файл")} · ${formatFileSize(file.size)} · ${e(formatDateTime(file.uploadedAt))}</small></span></div><div class="file-chip__actions"><button type="button" data-file-preview="${e(file.key)}">Посмотреть</button><button type="button" data-file-open="${e(file.key)}">Открыть</button><button type="button" data-file-download="${e(file.key)}">Скачать</button><button type="button" class="danger-mini" data-file-delete="${e(file.key)}">Удалить</button></div></div>`;
}
function renderRequestFiles(requestId) {
  const box = $("requestFilesBox");
  if (!box) return;
  const record = records.find((r) => String(r.id) === String(requestId)) || current;
  const fromRecord = record ? parseRecordFiles(record) : [];
  const fromCache = filesCache.filter((file) => String(file.requestId) === String(requestId));
  const files = mergeFilesUnique([...fromRecord, ...fromCache]);
  box.innerHTML = files.length
    ? `<div class="files-list-head"><b>Загружено файлов: ${files.length}</b><span>Нажмите на файл, чтобы посмотреть его.</span></div>${files.map(fileMiniHtml).join("")}`
    : '<p class="muted-text">К этой заявке файлы пока не загружены.</p>';
  bindActionButtons();
}
async function uploadFilesFromPanel() {
  const requestId = $("filesRequestSelect")?.value;
  const input = $("filesUploadInput");
  if (!requestId) return setFilesStatus("Выберите заявку для привязки файлов");
  await uploadFiles(requestId, input?.files, input, setFilesStatus);
}
async function uploadFilesForCurrentRequest() {
  if (!current) return;
  const input = $("requestFileInput");
  await uploadFiles(current.id, input?.files, input, (text) => {
    const box = $("requestFilesBox");
    if (box) box.innerHTML = `<p class="muted-text">${e(text)}</p>`;
  });
}
async function uploadFiles(requestId, fileList, input, statusFn = setFilesStatus) {
  const files = [...(fileList || [])];
  if (!files.length) return statusFn("Выберите файлы для загрузки");
  const record = records.find((r) => String(r.id) === String(requestId));
  if (!record) return statusFn("Заявка не найдена. Обновите список заявок.");
  const f = record.fields || {};
  const form = new FormData();
  form.append("requestId", String(requestId));
  form.append("client", f["Имя клиента"] || "");
  form.append("phone", f["Телефон"] || "");
  form.append("address", f["Адрес"] || "");
  form.append("service", f["Услуга"] || "");
  form.append("status", f["Статус"] || "");
  files.forEach((file) => form.append("files", file, file.name));
  statusFn(`Загружаю в Google Drive: ${files.length}...`);
  try {
    const response = await fetch("/upload-file", { method: "POST", headers: { "x-admin-password": pwd() }, body: form });
    const data = await response.json().catch(() => ({ ok: false, error: "Cloudflare Function вернула не JSON" }));
    if (!response.ok || !data.uploaded?.length) {
      const details = [data.hint, data.details?.hint, data.details?.rawSnippet].filter(Boolean).join(" | ");
      throw new Error((data.error || "Ошибка загрузки") + (details ? " — " + details : ""));
    }
    const uploaded = data.uploaded.map((file) => normalizeFileMeta(file, requestId, f));
    const merged = mergeFilesUnique([...parseRecordFiles(record), ...uploaded]);
    setLocalFilesFallback(requestId, merged);
    const filesJson = JSON.stringify(merged);
    let history = getHistoryForRecord(record);
    history = addHistory(record, "Загрузка файлов в Google Drive", uploaded.map((x) => x.originalName).join(", "), history);
    const updateFields = { "Файлы": filesJson, "История изменений": JSON.stringify(history) };
    try {
      await updateRecord(requestId, updateFields, "Файлы загружены");
    } catch (saveError) {
      statusFn("Файл загружен в Google Drive, но список не сохранился в NocoDB: " + saveError.message + ". Проверьте, что в таблице заявок есть поле Файлы типа Long text.");
    }
    record.fields = { ...(record.fields || {}), ...updateFields };
    if (current && String(current.id) === String(requestId)) current.fields = { ...(current.fields || {}), ...updateFields };
    filesCache = parseFilesFromRecords(records);
    renderFiles();
    renderRequestFiles(requestId);
    if (input) input.value = "";
    const googleText = await syncGoogleCalendarFilesForRecord(record, merged, statusFn);
    await load();
    const refreshed = records.find((r) => String(r.id) === String(requestId));
    if (refreshed && current && String(current.id) === String(requestId)) current = refreshed;
    filesCache = parseFilesFromRecords(records);
    renderFiles();
    renderRequestFiles(requestId);
    statusFn(`Загружено файлов: ${uploaded.length}.${googleText ? " " + googleText : ""}`);
  } catch (error) {
    statusFn("Ошибка загрузки: " + error.message);
  }
}

async function syncGoogleCalendarFilesForRecord(record, files = null, statusFn = null) {
  if (!record) return "";
  const f = record.fields || {};
  if (!f["Дата записи"] || !f["Время записи"]) {
    return "В Google Календарь не отправлено: нет даты или времени записи.";
  }
  const list = files || parseRecordFiles(record);
  const fields = { ...f, "Файлы": JSON.stringify(list) };
  const eventId = f["Google Calendar Event ID"] || "";
  try {
    if (statusFn) statusFn("Обновляю Google Календарь и ссылки на файлы...");
    const res = await fetch("/calendar-create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd() },
      body: JSON.stringify({ action: eventId ? "upsert" : "create", eventId, fields, recordId: record.id, source: "files" })
    });
    const data = await res.json().catch(() => ({ ok: false, error: "Функция календаря вернула не JSON" }));
    if (!res.ok || !data.ok) throw new Error(data.error || data.appsScript?.error || "ошибка календаря");
    const updateFields = {
      "Google Calendar Event ID": data.eventId || eventId || "",
      "Ссылка на событие": data.htmlLink || f["Ссылка на событие"] || "",
      "Источник": "Файлы → Google Календарь"
    };
    let history = getHistoryForRecord(record);
    const att = data.attachmentResult;
    const attText = att?.ok ? `, вложений: ${att.count || list.length}` : ", ссылки добавлены в описание";
    history = addHistory(record, "Файлы в Google Календаре", `${list.length} файл(ов)${attText}`, history);
    updateFields["История изменений"] = JSON.stringify(history);
    await updateRecord(record.id, updateFields, "Google Календарь обновлён");
    record.fields = { ...(record.fields || {}), ...updateFields };
    if (current && String(current.id) === String(record.id)) {
      current.fields = { ...(current.fields || {}), ...updateFields };
      renderRequestGoogleCalendar(current);
      renderRequestHistory(current);
    }
    if (data.attachmentResult?.ok) return "Файлы добавлены в событие Google Календаря.";
    return "Ссылки на файлы добавлены в описание события Google Календаря.";
  } catch (error) {
    return "Google Календарь не обновился: " + error.message;
  }
}

function fileIcon(file) {
  const type = String(file.fileType || "").toLowerCase();
  if (type.includes("pdf")) return "PDF";
  if (type.includes("видео")) return "▶";
  if (type.includes("фото")) return "IMG";
  return "DOC";
}
function getDriveFileId(file) {
  return String(file.id || file.fileId || String(file.key || "").replace(/^drive:/, "") || "").trim();
}
function fileDrivePreviewUrl(file) {
  const id = getDriveFileId(file);
  if (file.previewUrl) return file.previewUrl;
  if (id) return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
  return file.url || file.webViewLink || file.downloadUrl || "";
}
function fileOpenUrl(file) {
  return file.url || file.webViewLink || fileDrivePreviewUrl(file) || file.downloadUrl || "";
}
function fileDownloadUrl(file) {
  const id = getDriveFileId(file);
  return file.downloadUrl || (id ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}` : fileOpenUrl(file));
}
function openFileInDrive(key) {
  const file = filesCache.find((x) => x.key === key);
  if (!file) return msg("Файл не найден. Обновите страницу.");
  const url = fileOpenUrl(file);
  if (!url) return msg("У файла нет ссылки Google Drive");
  window.open(url, "_blank", "noopener");
}
function openFilePreview(key) {
  const file = filesCache.find((x) => x.key === key);
  if (!file) return msg("Файл не найден. Обновите страницу.");
  const dialog = $("filePreviewDialog");
  const title = $("filePreviewTitle");
  const meta = $("filePreviewMeta");
  const content = $("filePreviewContent");
  const openLink = $("filePreviewOpenLink");
  const downloadLink = $("filePreviewDownloadLink");
  if (!dialog || !title || !content) return openFileInDrive(key);

  title.textContent = file.originalName || file.name || "Просмотр файла";
  meta.innerHTML = `Заявка: <b>#${e(file.requestId || "—")}</b> · Клиент: <b>${e(file.client || "—")}</b> · Тип: <b>${e(file.fileType || "файл")}</b> · Размер: <b>${formatFileSize(file.size)}</b><br>Адрес: ${e(file.address || "—")}`;

  const previewUrl = fileDrivePreviewUrl(file);
  const downloadUrl = fileDownloadUrl(file);
  const openUrl = fileOpenUrl(file);
  if (openLink) openLink.href = openUrl || previewUrl || "#";
  if (downloadLink) downloadLink.href = downloadUrl || openUrl || previewUrl || "#";

  if (fileMatchesType(file, "фото")) {
    content.innerHTML = `<img src="${e(downloadUrl || openUrl || previewUrl)}" alt="${e(file.originalName || "Файл")}">`;
  } else if (fileMatchesType(file, "видео")) {
    if (getDriveFileId(file)) content.innerHTML = `<iframe class="file-preview-frame" src="${e(previewUrl)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    else content.innerHTML = `<video class="file-preview-video" controls src="${e(downloadUrl || openUrl)}"></video>`;
  } else if (fileMatchesType(file, "pdf") || getDriveFileId(file)) {
    content.innerHTML = `<iframe class="file-preview-frame" src="${e(previewUrl)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  } else {
    content.innerHTML = `<div class="file-preview-empty">Предпросмотр для этого типа файла может быть недоступен.<br><br><a class="dialog-link-button" href="${e(openUrl || downloadUrl)}" target="_blank" rel="noopener">Открыть файл</a></div>`;
  }

  dialog.showModal();
}

async function downloadAdminFile(key) {
  const file = filesCache.find((x) => x.key === key);
  if (!file) return msg("Файл не найден в заявках. Обновите страницу.");
  const url = fileDownloadUrl(file);
  if (!url) return msg("У файла нет ссылки Google Drive");
  window.open(url, "_blank", "noopener");
}
async function deleteAdminFile(key) {
  const file = filesCache.find((x) => x.key === key);
  if (!file) return msg("Файл не найден в заявках. Обновите страницу.");
  if (!confirm("Удалить файл из Google Drive и убрать его из заявки?")) return;
  try {
    const response = await fetch("/delete-file", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ fileId: file.id, key: file.key }) });
    const data = await response.json().catch(() => ({ ok: false, error: "Cloudflare Function вернула не JSON" }));
    if (!response.ok || !data.ok) {
      const details = [data.hint, data.details?.hint, data.details?.rawSnippet].filter(Boolean).join(" | ");
      throw new Error((data.error || "Не удалось удалить файл") + (details ? " — " + details : ""));
    }
    const record = records.find((r) => String(r.id) === String(file.requestId));
    if (record) {
      const kept = parseRecordFiles(record).filter((x) => x.key !== key);
      setLocalFilesFallback(record.id, kept);
      const filesJson = JSON.stringify(kept);
      let history = getHistoryForRecord(record);
      history = addHistory(record, "Удаление файла", file.originalName || file.name || "Файл", history);
      const updateFields = { "Файлы": filesJson, "История изменений": JSON.stringify(history) };
      await updateRecord(record.id, updateFields, "Файл удалён");
      record.fields = { ...(record.fields || {}), ...updateFields };
      if (current && String(current.id) === String(record.id)) current.fields = { ...(current.fields || {}), ...updateFields };
      await syncGoogleCalendarFilesForRecord(record, kept);
    }
    await load();
  } catch (error) { msg(error.message); }
}
function formatFileSize(bytes) {
  const n = Number(bytes || 0);
  if (!n) return "0 Б";
  if (n < 1024) return n + " Б";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace(".", ",") + " КБ";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1).replace(".", ",") + " МБ";
  return (n / 1024 / 1024 / 1024).toFixed(1).replace(".", ",") + " ГБ";
}
function formatDateTime(value) {
  if (!value) return "";
  try { return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Yekaterinburg" }).format(new Date(value)); } catch (_) { return value; }
}


// ===== Уведомления v19 =====

function initNotifications() {
  if (els.notifyTemplate) els.notifyTemplate.addEventListener("change", updateRequestNotificationEditor);
  if (els.notifyChannel) els.notifyChannel.addEventListener("change", updateRequestNotificationEditor);
  if (els.sendNotifyBtn) els.sendNotifyBtn.addEventListener("click", () => sendCurrentRequestNotification());
  if (els.copyNotifyBtn) els.copyNotifyBtn.addEventListener("click", () => copyTextFrom(els.notifyMessage, els.requestNotifyStatus));
  if (els.notificationCheckBtn) els.notificationCheckBtn.addEventListener("click", checkNotificationsConnection);
  if (els.smsBalanceBtn) els.smsBalanceBtn.addEventListener("click", checkSigmaBalance);
  if (els.sendTestNotifyBtn) els.sendTestNotifyBtn.addEventListener("click", sendTestNotification);
  if (els.copyTestNotifyBtn) els.copyTestNotifyBtn.addEventListener("click", () => copyTextFrom(els.testNotifyMessage, els.notificationStatus));
  initSmsQueue();
  renderNotificationTemplates();
  renderNotificationLog();
}

function renderNotificationTemplates() {
  if (!els.notificationTemplatesList) return;
  els.notificationTemplatesList.innerHTML = Object.entries(NOTIFICATION_TEMPLATES).filter(([key]) => key !== "custom").map(([key, tpl]) => `<button class="template-chip" type="button" data-template-pick="${e(key)}"><b>${e(tpl.title)}</b><p>${e(tpl.text)}</p></button>`).join("");
  els.notificationTemplatesList.querySelectorAll("[data-template-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSection("requests");
      msg("Шаблон выбран: " + (NOTIFICATION_TEMPLATES[btn.dataset.templatePick]?.title || ""));
    });
  });
}

function updateRequestNotificationEditor() {
  if (!current || !els.notifyTemplate || !els.notifyMessage) return;
  const key = els.notifyTemplate.value || "confirm";
  const tpl = NOTIFICATION_TEMPLATES[key] || NOTIFICATION_TEMPLATES.confirm;
  if (key !== "custom" || !els.notifyMessage.value.trim()) {
    els.notifyMessage.value = fillNotificationTemplate(tpl.text, current);
  }
  if (els.requestNotifyStatus) els.requestNotifyStatus.textContent = "";
}

function fillNotificationTemplate(template, record) {
  const f = (record && record.fields) || {};
  const values = {
    id: record?.id || "",
    client: f["Имя клиента"] || "клиент",
    company: f["Компания"] || "",
    phone: f["Телефон"] || "",
    service: f["Услуга"] || "услуга",
    date: formatRuDate(f["Дата записи"] || ""),
    time: f["Время записи"] || "",
    address: f["Адрес"] || "адрес уточняется",
    m2: f["Итоговый м2"] || f["м2"] || ""
  };
  return String(template || "").replace(/\{(id|client|company|phone|service|date|time|address|m2)\}/g, (_, key) => values[key] || "").replace(/\s+/g, " ").trim();
}

function formatRuDate(value) {
  if (!value) return "";
  try {
    const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return value;
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(y, m - 1, d));
  } catch (_) { return value; }
}

async function sendCurrentRequestNotification() {
  if (!current) return;
  const f = current.fields || {};
  const channel = els.notifyChannel?.value || "sms";
  const messageText = els.notifyMessage?.value.trim() || "";
  const to = channel === "sms" ? (f["Телефон"] || "") : "";
  if (!messageText) return setNotificationStatus(els.requestNotifyStatus, "Введите текст уведомления", false);
  if (channel === "sms" && !to) return setNotificationStatus(els.requestNotifyStatus, "В заявке нет телефона клиента", false);
  setNotificationStatus(els.requestNotifyStatus, "Отправляю...", true);
  const result = await sendNotificationApi({ channel, to, message: messageText, recordId: current.id, client: f["Имя клиента"] || "" });
  if (result.ok) {
    const successText = smsSendSuccessText(result);
    setNotificationStatus(els.requestNotifyStatus, successText, true);
    saveNotificationLog({ channel, to: to || "Telegram администратор", message: messageText, status: successText });
    let history = getHistoryForRecord(current);
    history = addHistory(current, "Уведомление", `${channel.toUpperCase()}: ${successText} · ${messageText}`, history);
    await updateRecord(current.id, { "История изменений": JSON.stringify(history) }, "Уведомление отправлено и записано в историю").catch(() => null);
    if (result.smsId && els.sigmaStatusId) els.sigmaStatusId.value = result.smsId;
    await loadSmsQueue(true);
    await load();
  } else {
    const err = result.error || result.result?.status_text || "Ошибка отправки";
    setNotificationStatus(els.requestNotifyStatus, err, false);
    saveNotificationLog({ channel, to, message: messageText, status: "Ошибка: " + err });
  }
}

function smsSendSuccessText(result) {
  if (result.provider !== "sigma") return "Уведомление отправлено";
  const parts = ["SIGMA принял сообщение"];
  if (result.smsId) parts.push(`ID: ${result.smsId}`);
  if (result.cost !== undefined && result.cost !== "") parts.push(`стоимость: ${result.cost} ₽`);
  if (result.balance !== undefined && result.balance !== "") parts.push(`баланс: ${result.balance} ₽`);
  if (result.statusText) parts.push(result.statusText);
  if (result.testMode) parts.push("ВНИМАНИЕ: тестовый режим, SMS реально не уйдёт");
  return parts.join(" · ");
}

async function checkSigmaBalance() {
  const target = els.smsBalanceText || els.notificationStatus;
  setNotificationStatus(target, "Проверяю баланс SIGMA...", true);
  try {
    const response = await fetch("/sms-balance", { headers: { "x-admin-password": pwd(), "Cache-Control": "no-cache" } });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция баланса вернула не JSON" }));
    if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка проверки баланса");
    setNotificationStatus(target, `Баланс SIGMA: ${data.balance} ₽`, true);
  } catch (error) {
    setNotificationStatus(target, error.message, false);
  }
}

async function sendTestNotification() {
  const channel = els.testNotifyChannel?.value || "sms";
  const to = els.testNotifyTo?.value || "";
  const messageText = els.testNotifyMessage?.value.trim() || "";
  if (!messageText) return setNotificationStatus(els.notificationStatus, "Введите текст тестового сообщения", false);
  if (channel === "sms" && !String(to).replace(/\D/g, "")) return setNotificationStatus(els.notificationStatus, "Введите телефон клиента", false);
  setNotificationStatus(els.notificationStatus, "Отправляю тест...", true);
  const result = await sendNotificationApi({ channel, to, message: messageText, recordId: "TEST", client: "Тестовая отправка", type: "Тестовая SMS" });
  if (result.ok) {
    const successText = smsSendSuccessText(result);
    setNotificationStatus(els.notificationStatus, "Тест: " + successText, true);
    saveNotificationLog({ channel, to: to || "Telegram администратор", message: messageText, status: successText });
    if (result.smsId && els.sigmaStatusId) els.sigmaStatusId.value = result.smsId;
    await loadSmsQueue(true);
  } else {
    const err = result.error || "Ошибка отправки";
    setNotificationStatus(els.notificationStatus, err, false);
    saveNotificationLog({ channel, to, message: messageText, status: "Ошибка: " + err });
    await loadSmsQueue(true);
  }
}

async function checkNotificationsConnection() {
  setNotificationStatus(els.notificationStatus, "Проверяю подключение...", true);
  try {
    const response = await fetch("/send-notification", { headers: { "x-admin-password": pwd() } });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция вернула не JSON" }));
    if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка проверки");
    if (els.notificationSmsStatus) { els.notificationSmsStatus.textContent = data.sms ? "готово" : "нет API-ключа"; els.notificationSmsStatus.className = "pill-status " + (data.sms ? "ok" : "bad"); }
    if (els.notificationTelegramStatus) { els.notificationTelegramStatus.textContent = data.telegram ? "готово" : "нет токена/chat_id"; els.notificationTelegramStatus.className = "pill-status " + (data.telegram ? "ok" : "bad"); }
    setNotificationStatus(els.notificationStatus, "Проверка завершена", true);
  } catch (error) {
    setNotificationStatus(els.notificationStatus, error.message, false);
  }
}

async function sendNotificationApi(payload) {
  try {
    const response = await fetch("/send-notification", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция уведомлений вернула не JSON" }));
    if (!response.ok && !data.error) data.error = "HTTP " + response.status;
    return data;
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function saveNotificationLog(entry) {
  const log = getNotificationLog();
  log.unshift({ at: dateTimeY(), ...entry });
  localStorage.setItem(storage.notificationLog, JSON.stringify(log.slice(0, 300)));
  renderNotificationLog();
}

function getNotificationLog() {
  try { return JSON.parse(localStorage.getItem(storage.notificationLog) || "[]"); } catch (_) { return []; }
}

function renderNotificationLog() {
  if (!els.notificationLogBody) return;
  const log = getNotificationLog();
  els.notificationLogBody.innerHTML = log.map((x) => `<tr><td>${e(x.at)}</td><td>${e(x.channel)}</td><td>${e(x.to || "—")}</td><td>${e(x.message)}</td><td>${e(x.status)}</td></tr>`).join("") || '<tr><td colspan="5">Пока нет отправок</td></tr>';
}

function setNotificationStatus(el, text, ok) {
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("success", Boolean(ok));
  el.classList.toggle("error", !ok);
}


// ===== SMS-очередь и автонапоминания v25 =====
function initSmsQueue() {
  document.querySelectorAll("[data-sms-refresh]").forEach((btn) => btn.addEventListener("click", () => loadSmsQueue(false)));
  [els.smsQueueSearch, els.smsQueueStatus, els.smsQueueFrom, els.smsQueueTo].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", renderSmsQueue);
    el.addEventListener("change", renderSmsQueue);
  });
  if (els.smsQueueBody) els.smsQueueBody.addEventListener("click", handleSmsQueueClick);
  if (els.checkSigmaStatusBtn) els.checkSigmaStatusBtn.addEventListener("click", checkManualSigmaStatus);
  if (els.scheduleSmsBtn) els.scheduleSmsBtn.addEventListener("click", scheduleSmsForCurrentRequest);
  if (els.scheduleDefaultSmsBtn) els.scheduleDefaultSmsBtn.addEventListener("click", scheduleDefaultSmsForCurrentRequest);
  if (els.scheduleSmsTemplate) els.scheduleSmsTemplate.addEventListener("change", updateScheduleSmsEditor);
  if (els.scheduleSmsDate) els.scheduleSmsDate.addEventListener("change", updateScheduleSmsEditor);
  if (els.scheduleSmsTime) els.scheduleSmsTime.addEventListener("change", updateScheduleSmsEditor);
  if (els.testNotifyTo) initRuPhoneInput(els.testNotifyTo);
  if (els.smsDetailCheckBtn) els.smsDetailCheckBtn.addEventListener("click", checkCurrentSmsStatusFromCard);
  if (els.smsDetailCopyIdBtn) els.smsDetailCopyIdBtn.addEventListener("click", copyCurrentSmsIdFromCard);
  if (els.smsDetailSendNowBtn) els.smsDetailSendNowBtn.addEventListener("click", () => currentSmsId && sendSmsQueueNow(currentSmsId));
  if (els.smsDetailOpenRequestBtn) els.smsDetailOpenRequestBtn.addEventListener("click", openCurrentSmsRequestFromCard);
  if (els.smsDetailCancelBtn) els.smsDetailCancelBtn.addEventListener("click", cancelCurrentSmsFromCard);
  loadSmsQueue(true);
}

function initRuPhoneInput(input) {
  const setPrefix = () => {
    const v = String(input.value || "").trim();
    if (!v) input.value = "+7";
  };
  input.addEventListener("focus", setPrefix);
  input.addEventListener("input", () => {
    const raw = String(input.value || "");
    if (!raw.trim()) return;
    if (raw.startsWith("+7")) return;
    const digits = raw.replace(/\D/g, "");
    if (!digits) { input.value = "+7"; return; }
    if (digits.startsWith("8") && digits.length >= 1) input.value = "+7" + digits.slice(1);
    else if (digits.startsWith("7")) input.value = "+" + digits;
    else if (digits.startsWith("9")) input.value = "+7" + digits;
    else input.value = "+7" + digits;
  });
}

async function loadSmsQueue(silent = false) {
  if (!els.smsQueueBody) return;
  if (!silent) setNotificationStatus(els.smsQueueStatusText, "Загружаю SMS-историю...", true);
  const refreshButtons = document.querySelectorAll("[data-sms-refresh], #smsQueueRefreshBtn");
  refreshButtons.forEach((btn) => { if (btn) btn.disabled = true; });
  try {
    const response = await fetch(`/sms-queue?t=${Date.now()}`, { headers: { "x-admin-password": pwd(), "Cache-Control": "no-cache" } });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция SMS-очереди вернула не JSON" }));
    if (data.setupRequired) {
      smsQueueCache = [];
      renderSmsQueue();
      if (!silent) setNotificationStatus(els.smsQueueStatusText, "Для автоматических SMS добавьте NOCODB_SMS_ENDPOINT", false);
      return;
    }
    if (!response.ok || !data.ok) {
      const details = data.nocodbResponse?.msg || data.nocodbResponse?.message || data.error || "Ошибка загрузки SMS-истории";
      throw new Error(details);
    }
    smsQueueCache = data.records || [];
    renderSmsQueue();
    if (!silent) setNotificationStatus(els.smsQueueStatusText, `SMS-история обновлена. Записей: ${smsQueueCache.length}`, true);
  } catch (error) {
    smsQueueCache = [];
    renderSmsQueue();
    if (!silent) setNotificationStatus(els.smsQueueStatusText, error.message, false);
  } finally {
    refreshButtons.forEach((btn) => { if (btn) btn.disabled = false; });
  }
}

function smsValue(item, key, fallback = "") {
  const f = (item && item.fields) || {};
  return f[key] ?? fallback;
}
function smsSigmaId(item) {
  const f = (item && item.fields) || {};
  return String(f["ID SIGMA"] || f["SIGMA ID"] || f["ID SMS.ru"] || f["smsId"] || f["sms_id"] || "").trim();
}
function smsClientId(item) {
  const f = (item && item.fields) || {};
  return String(f["Стоимость SMS"] || f["Стоимость"] || f["Баланс после отправки"] || "").trim();
}
function smsRecordId(item) { return String(item?.id || ""); }
function smsStatusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("ошиб") || s.includes("reject") || s.includes("error")) return "bad";
  if (s.includes("отправ") || s.includes("delivered")) return "ok";
  if (s.includes("отмен")) return "muted";
  return "wait";
}
function smsStatusTitle(status) {
  const map = {
    "100": "Принято / в очереди SIGMA",
    "101": "Передаётся оператору",
    "102": "Отправлено, в пути",
    "103": "Доставлено",
    "104": "Не доставлено: истёк срок жизни",
    "105": "Не доставлено: удалено оператором",
    "106": "Не доставлено: сбой в телефоне",
    "107": "Не доставлено: неизвестная причина",
    "108": "Не доставлено: отклонено",
    "150": "Не найден маршрут",
    "OK": "Принято SIGMA",
    "ERROR": "Ошибка SIGMA"
  };
  const key = String(status || "");
  return map[key] || status || "—";
}
function formatSmsDateTime(f) {
  const fact = f["Дата фактической отправки"] || "";
  const scheduled = `${f["Дата отправки"] || ""} ${f["Время отправки"] || ""}`.trim();
  if (fact) return `<b>${e(formatDateTime(fact) || fact)}</b><small>факт. отправка</small>`;
  return `<b>${e(scheduled || "—")}</b><small>плановая дата</small>`;
}
function renderSmsStats(arr = smsQueueCache) {
  const total = arr.length;
  const planned = arr.filter((r) => (r.fields || {})["Статус"] === "Запланировано").length;
  const sent = arr.filter((r) => ["Отправлено"].includes((r.fields || {})["Статус"])).length;
  const errors = arr.filter((r) => ["Ошибка"].includes((r.fields || {})["Статус"])).length;
  if (els.smsStatTotal) els.smsStatTotal.textContent = total;
  if (els.smsStatPlanned) els.smsStatPlanned.textContent = planned;
  if (els.smsStatSent) els.smsStatSent.textContent = sent;
  if (els.smsStatErrors) els.smsStatErrors.textContent = errors;
}
function smsQueueFiltered() {
  const q = norm(els.smsQueueSearch?.value || "");
  const status = els.smsQueueStatus?.value || "";
  const from = els.smsQueueFrom?.value || "";
  const to = els.smsQueueTo?.value || "";
  return smsQueueCache.filter((r) => {
    const f = r.fields || {};
    const d = String(f["Дата отправки"] || f["Дата фактической отправки"] || "").slice(0, 10);
    const hay = norm([r.id, f["ID заявки"], f["ФИО"], f["Компания"], f["Телефон"], f["Тип уведомления"], f["Текст SMS"], f["Статус"], f["Ошибка"], f["ID SIGMA"], f["ID SMS.ru"], f["Стоимость"], f["Статус доставки"], f["Ответ сервиса"]].join(" "));
    if (status && f["Статус"] !== status) return false;
    if (from && d && d < from) return false;
    if (to && d && d > to) return false;
    if (q && !hay.includes(q)) return false;
    return true;
  }).sort((a, b) => {
    const af = a.fields || {}, bf = b.fields || {};
    const ad = String(af["Дата фактической отправки"] || `${af["Дата отправки"] || ""}T${af["Время отправки"] || "00:00"}`);
    const bd = String(bf["Дата фактической отправки"] || `${bf["Дата отправки"] || ""}T${bf["Время отправки"] || "00:00"}`);
    return bd.localeCompare(ad);
  });
}

function renderSmsQueue() {
  if (!els.smsQueueBody) return;
  renderSmsStats(smsQueueCache);
  const arr = smsQueueFiltered();
  if (!arr.length) {
    els.smsQueueBody.innerHTML = `<tr><td colspan="7">${smsQueueCache.length ? "По фильтрам ничего не найдено" : "SMS-история пуста или ещё не подключена"}</td></tr>`;
    return;
  }
  els.smsQueueBody.innerHTML = arr.map((r) => {
    const f = r.fields || {};
    const status = f["Статус"] || "—";
    const delivery = f["Статус доставки"] || "";
    const pid = smsSigmaId(r);
    const cid = smsClientId(r);
    const idAttr = e(smsRecordId(r));
    const statusBtn = pid ? `<button class="open-btn" type="button" data-sms-status="${e(pid)}" data-sms-nocodb="${idAttr}">Статус</button>` : "";
    const openBtn = f["ID заявки"] ? `<button class="open-btn" type="button" data-sms-open-request="${e(f["ID заявки"])}">Заявка</button>` : "";
    const actions = [
      `<button class="open-btn" type="button" data-sms-open-card="${idAttr}">Карточка</button>`,
      status === "Запланировано" ? `<button class="open-btn" type="button" data-sms-send-now="${idAttr}">Сейчас</button>` : "",
      status === "Запланировано" ? `<button class="open-btn danger-inline" type="button" data-sms-cancel="${idAttr}">Отменить</button>` : "",
      status === "Отменено" ? `<button class="open-btn" type="button" data-sms-restore="${idAttr}">Вернуть</button>` : "",
      statusBtn,
      openBtn
    ].filter(Boolean).join("");
    return `<tr class="sms-row" data-sms-open-card="${idAttr}">
      <td>${formatSmsDateTime(f)}</td>
      <td><b>${e(f["ФИО"] || "—")}</b>${f["Компания"] ? `<small>${e(f["Компания"])}</small>` : ""}</td>
      <td><b>${e(formatPhoneForView(f["Телефон"] || ""))}</b></td>
      <td><div class="sms-message-preview"><b>${e(f["Тип уведомления"] || "SMS")}</b><span>${e(f["Текст SMS"] || "")}</span></div></td>
      <td><div class="sms-id-cell">${pid ? `<b>${e(pid)}</b>` : `<span>нет ID</span>`}${cid ? `<small>Стоимость: ${e(cid)}</small>` : ""}${delivery ? `<small>${e(smsStatusTitle(delivery))}</small>` : ""}</div></td>
      <td><span class="sms-status-pill ${smsStatusClass(status)}">${e(status)}</span>${delivery ? `<small class="sms-delivery ${smsStatusClass(delivery)}">${e(delivery)}</small>` : ""}</td>
      <td class="sms-actions">${actions}</td>
    </tr>`;
  }).join("");
}

function formatPhoneForView(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  if (digits.length === 10) return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  return value || "—";
}

function handleSmsQueueClick(event) {
  const cancel = event.target.closest("[data-sms-cancel]");
  const restore = event.target.closest("[data-sms-restore]");
  const sendNow = event.target.closest("[data-sms-send-now]");
  const open = event.target.closest("[data-sms-open-request]");
  const checkStatus = event.target.closest("[data-sms-status]");
  const openCard = event.target.closest("[data-sms-open-card]");
  if (checkStatus) { event.stopPropagation(); return checkSmsDeliveryStatus(checkStatus.dataset.smsStatus, checkStatus.dataset.smsNocodb); }
  if (cancel) { event.stopPropagation(); return updateSmsQueueItem(cancel.dataset.smsCancel, { action: "cancel", reason: "Отменено вручную" }); }
  if (restore) { event.stopPropagation(); return updateSmsQueueItem(restore.dataset.smsRestore, { action: "restore" }); }
  if (sendNow) { event.stopPropagation(); return sendSmsQueueNow(sendNow.dataset.smsSendNow); }
  if (open) { event.stopPropagation(); return openRequest(open.dataset.smsOpenRequest); }
  if (openCard) return openSmsCard(openCard.dataset.smsOpenCard);
}

function getCurrentSms() {
  return smsQueueCache.find((r) => String(r.id) === String(currentSmsId));
}
function openSmsCard(id) {
  const item = smsQueueCache.find((r) => String(r.id) === String(id));
  if (!item) return setNotificationStatus(els.smsQueueStatusText, "SMS не найдена. Обновите историю.", false);
  currentSmsId = String(id);
  renderSmsCard(item);
  if (els.smsDetailDialog) els.smsDetailDialog.showModal();
}
function prettyServiceResponse(value) {
  if (!value) return "—";
  if (typeof value !== "string") return JSON.stringify(value, null, 2);
  try { return JSON.stringify(JSON.parse(value), null, 2); } catch (_) { return value; }
}
function renderSmsCard(item) {
  const f = item.fields || {};
  const pid = smsSigmaId(item);
  const status = f["Статус"] || "—";
  const delivery = f["Статус доставки"] || "—";
  if (els.smsDetailTitle) els.smsDetailTitle.textContent = `SMS #${item.id}`;
  if (els.smsDetailSubtitle) els.smsDetailSubtitle.textContent = `${f["Дата отправки"] || ""} ${f["Время отправки"] || ""} · ${f["Тип уведомления"] || "SMS"}`.trim();
  if (els.smsDetailStatusPill) { els.smsDetailStatusPill.textContent = status; els.smsDetailStatusPill.className = `pill-status ${smsStatusClass(status)}`; }
  if (els.smsDetailClient) els.smsDetailClient.textContent = [f["ФИО"] || "—", f["Компания"] || ""].filter(Boolean).join(" / ");
  if (els.smsDetailPhone) els.smsDetailPhone.textContent = formatPhoneForView(f["Телефон"] || "");
  if (els.smsDetailRequestId) els.smsDetailRequestId.textContent = f["ID заявки"] || "—";
  if (els.smsDetailSigmaId) els.smsDetailSigmaId.textContent = pid || "—";
  if (els.smsDetailClientId) els.smsDetailClientId.textContent = (f["Стоимость SMS"] || f["Стоимость"] || "—");
  if (els.smsDetailDelivery) els.smsDetailDelivery.textContent = smsStatusTitle(delivery) || "—";
  if (els.smsDetailMessage) els.smsDetailMessage.textContent = f["Текст SMS"] || "—";
  if (els.smsDetailService) els.smsDetailService.textContent = [f["Ошибка"] ? `Ошибка: ${f["Ошибка"]}` : "", f["Ответ сервиса"] ? prettyServiceResponse(f["Ответ сервиса"]) : ""].filter(Boolean).join("\n\n") || "—";
  if (els.smsDetailStatusText) els.smsDetailStatusText.textContent = pid ? "ID SIGMA найден. Можно проверить точный статус." : "ID SIGMA пока нет. Он появится после отправки через SIGMA.";
  if (els.sigmaStatusId && pid) els.sigmaStatusId.value = pid;
  if (els.smsDetailCheckBtn) els.smsDetailCheckBtn.disabled = !pid;
  if (els.smsDetailCopyIdBtn) els.smsDetailCopyIdBtn.disabled = !pid;
  if (els.smsDetailSendNowBtn) els.smsDetailSendNowBtn.style.display = status === "Запланировано" ? "" : "none";
  if (els.smsDetailCancelBtn) els.smsDetailCancelBtn.style.display = status === "Запланировано" ? "" : "none";
  if (els.smsDetailOpenRequestBtn) els.smsDetailOpenRequestBtn.style.display = f["ID заявки"] ? "" : "none";
}
async function checkCurrentSmsStatusFromCard() {
  const item = getCurrentSms();
  const pid = smsSigmaId(item);
  if (!pid) return setNotificationStatus(els.smsDetailStatusText, "У этой SMS нет ID SIGMA", false);
  await checkSmsDeliveryStatus(pid, smsRecordId(item), els.smsDetailStatusText);
  const fresh = smsQueueCache.find((r) => String(r.id) === String(currentSmsId));
  if (fresh) renderSmsCard(fresh);
}
async function copyCurrentSmsIdFromCard() {
  const pid = smsSigmaId(getCurrentSms());
  if (!pid) return setNotificationStatus(els.smsDetailStatusText, "ID SIGMA отсутствует", false);
  try { await navigator.clipboard.writeText(pid); setNotificationStatus(els.smsDetailStatusText, "ID SIGMA скопирован", true); }
  catch (_) { setNotificationStatus(els.smsDetailStatusText, "Не удалось скопировать ID", false); }
}
function openCurrentSmsRequestFromCard() {
  const item = getCurrentSms();
  const rid = item?.fields?.["ID заявки"] || "";
  if (!rid) return setNotificationStatus(els.smsDetailStatusText, "У SMS нет ID заявки", false);
  if (els.smsDetailDialog) els.smsDetailDialog.close();
  openRequest(rid);
}
async function cancelCurrentSmsFromCard() {
  if (!currentSmsId) return;
  await updateSmsQueueItem(currentSmsId, { action: "cancel", reason: "Отменено из карточки SMS" });
  const fresh = smsQueueCache.find((r) => String(r.id) === String(currentSmsId));
  if (fresh) renderSmsCard(fresh);
}

async function checkManualSigmaStatus() {
  const smsId = els.sigmaStatusId?.value.trim() || "";
  if (!smsId) return setNotificationStatus(els.sigmaStatusText, "Введите ID SIGMA / smsId", false);
  return checkSmsDeliveryStatus(smsId, "", els.sigmaStatusText);
}

async function checkSmsDeliveryStatus(smsId, nocodbId = "", statusEl = null) {
  const target = statusEl || els.sigmaStatusText || els.smsQueueStatusText;
  setNotificationStatus(target, "Проверяю статус SIGMA...", true);
  try {
    const response = await fetch("/sms-status", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ smsId, nocodbId }) });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция статуса вернула не JSON" }));
    if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка проверки статуса");
    const statusText = data.statusText || data.statusCode || "—";
    const costText = data.cost ? ` · стоимость ${data.cost} ₽` : "";
    const deliveryMark = data.delivered ? "✅ доставлено" : (data.failed ? "❌ не доставлено" : "ℹ️ статус получен");
    const text = `Статус SIGMA: ${deliveryMark} · ${smsStatusTitle(statusText)} (${statusText}). ID: ${data.smsId || smsId}${costText}`;
    setNotificationStatus(target, text, true);
    if (els.sigmaStatusId) els.sigmaStatusId.value = data.smsId || smsId;
    await loadSmsQueue(true);
  } catch (error) {
    setNotificationStatus(target, error.message, false);
  }
}

async function updateSmsQueueItem(id, payload) {
  try {
    const response = await fetch("/sms-queue", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ id, ...payload }) });
    const data = await response.json().catch(() => ({ ok: false, error: "Функция SMS-очереди вернула не JSON" }));
    if (!response.ok || !data.ok) throw new Error(data.error || data.nocodbResponse?.msg || "Ошибка обновления SMS");
    await loadSmsQueue(true);
    setNotificationStatus(els.smsQueueStatusText, "SMS-история обновлена", true);
  } catch (error) {
    setNotificationStatus(els.smsQueueStatusText, error.message, false);
  }
}

async function sendSmsQueueNow(id) {
  const item = smsQueueCache.find((r) => String(r.id) === String(id));
  if (!item) return;
  const f = item.fields || {};
  setNotificationStatus(els.smsQueueStatusText, "Отправляю SMS из очереди...", true);
  const result = await sendNotificationApi({ channel: "sms", to: f["Телефон"], message: f["Текст SMS"], recordId: f["ID заявки"], client: f["ФИО"] || "", company: f["Компания"] || "", type: f["Тип уведомления"] || "Ручное SMS", queueId: id, skipSmsLog: true });
  if (result.ok) {
    await updateSmsQueueItem(id, { action: "mark_sent", smsId: result.smsId || "", deliveryStatus: result.statusCode || result.status || "OK", serviceResponse: result.result || result, cost: result.cost || "", balance: result.balance || "" });
    saveNotificationLog({ channel: "sms", to: f["Телефон"], message: f["Текст SMS"], status: `Отправлено из очереди${result.smsId ? " · ID " + result.smsId : ""}` });
    if (currentSmsId && String(currentSmsId) === String(id)) {
      const fresh = smsQueueCache.find((r) => String(r.id) === String(id));
      if (fresh) renderSmsCard(fresh);
    }
  } else {
    await updateSmsQueueItem(id, { action: "mark_error", error: result.error || "Ошибка отправки", serviceResponse: result.result || result });
  }
}

function updateScheduleSmsEditor() {
  if (!current || !els.scheduleSmsTemplate || !els.scheduleSmsMessage) return;
  if (!els.scheduleSmsDate?.value) els.scheduleSmsDate.value = current.fields?.["Дата записи"] || today();
  if (!els.scheduleSmsTime?.value) els.scheduleSmsTime.value = "18:00";
  const key = els.scheduleSmsTemplate.value || "reminder";
  const tpl = NOTIFICATION_TEMPLATES[key] || NOTIFICATION_TEMPLATES.reminder;
  if (key !== "custom" || !els.scheduleSmsMessage.value.trim()) els.scheduleSmsMessage.value = fillNotificationTemplate(tpl.text, current);
  if (els.scheduleSmsStatus) els.scheduleSmsStatus.textContent = "";
}

async function scheduleSmsForCurrentRequest() {
  if (!current) return;
  const f = current.fields || {};
  const date = els.scheduleSmsDate?.value || "";
  const time = els.scheduleSmsTime?.value || "";
  const messageText = els.scheduleSmsMessage?.value.trim() || "";
  const type = NOTIFICATION_TEMPLATES[els.scheduleSmsTemplate?.value]?.title || "SMS";
  if (!f["Телефон"]) return setNotificationStatus(els.scheduleSmsStatus, "В заявке нет телефона клиента", false);
  if (!date || !time) return setNotificationStatus(els.scheduleSmsStatus, "Укажите дату и время отправки", false);
  if (!messageText) return setNotificationStatus(els.scheduleSmsStatus, "Введите текст SMS", false);
  await scheduleSmsApi({ recordId: current.id, client: f["Имя клиента"] || "", company: f["Компания"] || "", phone: f["Телефон"], type, date, time, message: messageText });
}

async function scheduleDefaultSmsForCurrentRequest() {
  if (!current) return;
  const f = current.fields || {};
  if (!f["Телефон"]) return setNotificationStatus(els.scheduleSmsStatus, "В заявке нет телефона клиента", false);
  if (!f["Дата записи"] || !f["Время записи"]) return setNotificationStatus(els.scheduleSmsStatus, "В заявке нет даты или времени записи", false);
  const slots = defaultReminderSlots(f["Дата записи"], f["Время записи"]);
  if (!slots.length) return setNotificationStatus(els.scheduleSmsStatus, "Не удалось рассчитать время напоминаний", false);
  try {
    setNotificationStatus(els.scheduleSmsStatus, "Создаю напоминания...", true);
    for (const slot of slots) {
      const text = fillNotificationTemplate(NOTIFICATION_TEMPLATES.reminder.text, current);
      await scheduleSmsApi({ recordId: current.id, client: f["Имя клиента"] || "", company: f["Компания"] || "", phone: f["Телефон"], type: slot.type, date: slot.date, time: slot.time, message: text }, true);
    }
    await loadSmsQueue(true);
    setNotificationStatus(els.scheduleSmsStatus, "Напоминания за 24 часа и за 2 часа созданы", true);
  } catch (error) {
    setNotificationStatus(els.scheduleSmsStatus, error.message, false);
  }
}

function defaultReminderSlots(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr || "10:00"}:00`);
  if (Number.isNaN(d.getTime())) return [];
  return [
    { type: "Напоминание за 24 часа", ms: 24 * 60 * 60 * 1000 },
    { type: "Напоминание за 2 часа", ms: 2 * 60 * 60 * 1000 }
  ].map((x) => {
    const t = new Date(d.getTime() - x.ms);
    return { type: x.type, date: ymdLocal(t), time: String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0") };
  }).filter((x) => `${x.date} ${x.time}` >= `${today()} 00:00`);
}

async function scheduleSmsApi(payload, silent = false) {
  if (!silent) setNotificationStatus(els.scheduleSmsStatus, "Планирую SMS...", true);
  const response = await fetch("/sms-queue", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ action: "schedule", ...payload }) });
  const data = await response.json().catch(() => ({ ok: false, error: "Функция SMS-очереди вернула не JSON" }));
  if (data.setupRequired) throw new Error("Сначала добавьте NOCODB_SMS_ENDPOINT и таблицу SMS-очереди");
  if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка планирования SMS");
  await loadSmsQueue(true);
  if (!silent) setNotificationStatus(els.scheduleSmsStatus, "SMS запланировано", true);
  return data;
}


async function copyTextFrom(input, statusEl) {
  const text = input?.value || input?.textContent || "";
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setNotificationStatus(statusEl, "Текст скопирован", true);
  } catch (_) {
    setNotificationStatus(statusEl, "Не удалось скопировать автоматически", false);
  }
}

// v22: ручной импорт заявок из Google Календаря
function initCalendarImport() {
  if (els.calendarImportFrom && !els.calendarImportFrom.value) els.calendarImportFrom.value = today();
  if (els.calendarImportTo && !els.calendarImportTo.value) els.calendarImportTo.value = addDaysY(today(), 7);
  if (els.calendarImportCheckBtn) els.calendarImportCheckBtn.addEventListener("click", checkCalendarImportConnection);
  if (els.calendarImportLoadBtn) els.calendarImportLoadBtn.addEventListener("click", loadCalendarImportEvents);
  if (els.calendarImportTodayBtn) els.calendarImportTodayBtn.addEventListener("click", () => { els.calendarImportFrom.value = today(); els.calendarImportTo.value = today(); loadCalendarImportEvents(); });
  if (els.calendarImportWeekBtn) els.calendarImportWeekBtn.addEventListener("click", () => { els.calendarImportFrom.value = today(); els.calendarImportTo.value = addDaysY(today(), 7); loadCalendarImportEvents(); });
  [els.calendarImportSearch, els.calendarImportFrom, els.calendarImportTo, els.calendarImportMode].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", renderCalendarImport);
    el.addEventListener("change", renderCalendarImport);
  });
  if (els.calendarImportList) {
    els.calendarImportList.addEventListener("click", handleCalendarImportClick);
  }
}

function addDaysY(dateStr, days) {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function checkCalendarImportConnection() {
  setCalendarImportStatus("Проверяю подключение к Google Календарю...", true);
  try {
    const res = await fetch("/calendar-events?action=health", { headers: { "x-admin-password": pwd() } });
    const data = await res.json().catch(() => ({ ok: false, error: "Функция календаря вернула не JSON" }));
    if (!res.ok || !data.ok) throw new Error(data.error || data.appsScript?.error || "Ошибка проверки календаря");
    setCalendarImportStatus(data.message || "Google Календарь подключён", true);
  } catch (error) {
    setCalendarImportStatus(error.message, false);
  }
}

async function loadCalendarImportEvents() {
  const from = els.calendarImportFrom?.value || today();
  const to = els.calendarImportTo?.value || addDaysY(from, 7);
  setCalendarImportStatus("Загружаю события календаря...", true);
  try {
    const res = await fetch("/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pwd() },
      body: JSON.stringify({ action: "list", dateFrom: from, dateTo: to })
    });
    const data = await res.json().catch(() => ({ ok: false, error: "Функция календаря вернула не JSON" }));
    if (!res.ok || !data.ok) throw new Error(data.error || data.appsScript?.error || "Ошибка загрузки календаря");
    calendarImportEvents = Array.isArray(data.events) ? data.events : [];
    setCalendarImportStatus(`Загружено событий: ${calendarImportEvents.length}`, true);
    renderCalendarImport();
  } catch (error) {
    calendarImportEvents = [];
    renderCalendarImport();
    setCalendarImportStatus(error.message, false);
  }
}

function setCalendarImportStatus(text, ok) {
  if (!els.calendarImportStatus) return;
  els.calendarImportStatus.textContent = text || "";
  els.calendarImportStatus.classList.toggle("success", Boolean(ok));
  els.calendarImportStatus.classList.toggle("error", !ok);
}

function getCalendarHiddenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(storage.calendarHidden) || "[]")); } catch (_) { return new Set(); }
}
function saveCalendarHiddenIds(set) {
  localStorage.setItem(storage.calendarHidden, JSON.stringify([...set]));
}
function hideCalendarEvent(id) {
  const set = getCalendarHiddenIds();
  set.add(String(id));
  saveCalendarHiddenIds(set);
  renderCalendarImport();
}
function restoreCalendarEvent(id) {
  const set = getCalendarHiddenIds();
  set.delete(String(id));
  saveCalendarHiddenIds(set);
  renderCalendarImport();
}
function markCalendarEventImported(id) {
  // Импортированные события определяются по Cal Booking ID = gcal-<eventId> в NocoDB.
  // В скрытые добавляем только личные / нерабочие события, чтобы статистика не путалась.
  if (!id) return;
}

function existingRecordForCalendarEvent(id) {
  if (!id) return null;
  const needle = "gcal-" + id;
  // Важно: удалённая заявка не считается перенесённой из Google Календаря.
  // Иначе после удаления события повторный перенос блокируется статусом «Уже перенесено».
  return records.find((r) => !isTrashRecord(r) && String((r.fields || {})["Cal Booking ID"] || "") === needle) || null;
}

function calendarEventHay(ev) {
  return norm([ev.id, ev.title, ev.description, ev.location, ev.startText, ev.endText, ev.creator, ev.organizer].join(" "));
}

function analyzeCalendarEvent(ev) {
  const parsed = parseCalendarEvent(ev);
  const text = calendarEventHay(ev);
  const hasPhone = Boolean(parsed.phone);
  const workKeywords = ["тонир", "плен", "плён", "балкон", "окн", "витрин", "замер", "брон", "фары", "фар", "полиур", "ppf", "атерм", "офис", "перегород", "стекл", "солнцанет"];
  const isWorkLike = hasPhone || workKeywords.some((w) => text.includes(w));
  return { ...parsed, isWorkLike };
}

function renderCalendarImport() {
  if (!els.calendarImportList) return;
  const hidden = getCalendarHiddenIds();
  const q = norm(els.calendarImportSearch?.value || "");
  const mode = els.calendarImportMode?.value || "all";
  const items = calendarImportEvents.map((ev) => ({ ev, parsed: analyzeCalendarEvent(ev), hidden: hidden.has(String(ev.id)), existing: existingRecordForCalendarEvent(ev.id) }));
  const total = items.length;
  const work = items.filter((x) => x.parsed.isWorkLike).length;
  const imported = items.filter((x) => x.existing).length;
  const hiddenCount = items.filter((x) => x.hidden).length;
  if (els.calendarImportStatTotal) els.calendarImportStatTotal.textContent = total;
  if (els.calendarImportStatWork) els.calendarImportStatWork.textContent = work;
  if (els.calendarImportStatImported) els.calendarImportStatImported.textContent = imported;
  if (els.calendarImportStatHidden) els.calendarImportStatHidden.textContent = hiddenCount;

  let filteredItems = items.filter((x) => {
    if (mode === "work-like" && !x.parsed.isWorkLike) return false;
    if (mode === "not-imported" && (x.existing || x.hidden)) return false;
    if (mode === "hidden" && !x.hidden) return false;
    if (mode !== "hidden" && x.hidden) return false;
    if (q && !calendarEventHay(x.ev).includes(q) && !norm(Object.values(x.parsed).join(" ")).includes(q)) return false;
    return true;
  });
  filteredItems.sort((a, b) => String(a.ev.start || "").localeCompare(String(b.ev.start || "")));

  els.calendarImportList.innerHTML = filteredItems.map(calendarImportCardHtml).join("") || '<div class="calendar-event-card empty">События не найдены. Выберите период и нажмите «Загрузить события».</div>';
}

function calendarImportCardHtml(item) {
  const { ev, parsed, hidden, existing } = item;
  const scoreClass = existing ? "imported" : hidden ? "hidden" : parsed.isWorkLike ? "work" : "weak";
  const statusText = existing ? "Уже перенесено" : hidden ? "Скрыто" : parsed.isWorkLike ? "Похоже на заявку" : "Сомнительное";
  const description = String(ev.description || "").trim();
  return `<article class="calendar-event-card ${scoreClass}" data-calendar-event-card="${e(ev.id)}">
    <div class="calendar-event-main">
      <div class="calendar-event-time"><b>${e(ev.date || "")}</b><span>${e(ev.startTime || "")}–${e(ev.endTime || "")}</span></div>
      <div class="calendar-event-content">
        <div class="calendar-event-title"><b>${e(ev.title || "Без названия")}</b><span class="calendar-event-pill">${e(statusText)}</span></div>
        <div class="calendar-event-fields">
          <span><b>Клиент:</b> ${e(parsed.name || "—")}</span>
          <span><b>Компания:</b> ${e(parsed.company || "—")}</span>
          <span><b>Телефон:</b> ${parsed.phone ? phoneLink(parsed.phone) : "—"}</span>
          <span><b>Услуга:</b> ${e(parsed.service || "—")}</span>
          <span><b>Адрес:</b> ${e(parsed.address || ev.location || "—")}</span>
        </div>
        ${description ? `<details class="calendar-event-description"><summary>Описание события</summary><pre>${e(description)}</pre></details>` : ""}
      </div>
    </div>
    <div class="calendar-event-actions">
      ${existing ? `<button class="open-btn" data-open="${e(existing.id)}" type="button">Открыть заявку</button>` : `<button class="btn-green mini-action" data-calendar-create="${e(ev.id)}" type="button">Создать заявку</button><button class="mini-action" data-calendar-prefill="${e(ev.id)}" type="button">Проверить / заполнить</button>`}
      ${hidden ? `<button class="mini-action" data-calendar-restore="${e(ev.id)}" type="button">Вернуть</button>` : `<button class="mini-action ghost-mini" data-calendar-hide="${e(ev.id)}" type="button">Не работа</button>`}
      ${ev.htmlLink ? `<a class="mini-link" href="${e(ev.htmlLink)}" target="_blank" rel="noopener">Открыть в Google</a>` : ""}
    </div>
  </article>`;
}

function handleCalendarImportClick(event) {
  const open = event.target.closest("[data-open]");
  if (open) return;
  const create = event.target.closest("[data-calendar-create]");
  if (create) return createCalendarLead(create.dataset.calendarCreate);
  const prefill = event.target.closest("[data-calendar-prefill]");
  if (prefill) return prefillQuickFromCalendar(prefill.dataset.calendarPrefill);
  const hide = event.target.closest("[data-calendar-hide]");
  if (hide) return hideCalendarEvent(hide.dataset.calendarHide);
  const restore = event.target.closest("[data-calendar-restore]");
  if (restore) return restoreCalendarEvent(restore.dataset.calendarRestore);
}

function getCalendarEventById(id) {
  return calendarImportEvents.find((ev) => String(ev.id) === String(id));
}

function prefillQuickFromCalendar(id) {
  const ev = getCalendarEventById(id);
  if (!ev) return;
  openQuickAdd(calendarPrefillData(ev));
}

async function createCalendarLead(id) {
  const ev = getCalendarEventById(id);
  if (!ev) return;
  const parsed = calendarPrefillData(ev);
  if (!parsed.phone) {
    setCalendarImportStatus("В событии не найден телефон. Нажмите «Проверить / заполнить» и внесите данные вручную.", false);
    return openQuickAdd(parsed);
  }
  if (!parsed.name) parsed.name = "Клиент из календаря";
  const fields = {
    "Имя клиента": parsed.name,
    "Компания": parsed.company || "",
    "Телефон": formatRussianPhone(parsed.phone),
    "Услуга": parsed.service || "Замер / консультация",
    "Дата записи": parsed.date || today(),
    "Время записи": parsed.time || "10:00",
    "Адрес": parsed.address || "",
    "м2": parsed.m2 || "",
    "Комментарий клиента": parsed.comment || "Источник: Google Календарь",
    "Статус": "Новая заявка",
    "Cal Booking ID": "gcal-" + ev.id
  };
  try {
    setCalendarImportStatus("Создаю заявку из события календаря...", true);
    const response = await fetch("/create-zayavka", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": pwd() }, body: JSON.stringify({ fields }) });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Ошибка создания заявки");
    markCalendarEventImported(ev.id);
    await load();
    setCalendarImportStatus("Заявка создана из Google Календаря", true);
  } catch (error) {
    setCalendarImportStatus(error.message, false);
  }
}


/* v24: закреплённая панель, глобальный поиск и карточка клиента */
function clientKeyFromFields(f = {}) {
  const phone = phoneKey(f["Телефон"] || "");
  if (phone && phone.length >= 5) return "phone:" + phone;
  const name = norm(f["Имя клиента"] || "");
  const company = norm(f["Компания"] || "");
  return "name:" + [name, company].filter(Boolean).join("|");
}

function clientRecordsByKey(key) {
  if (!key) return [];
  return records.filter((r) => clientKeyFromFields(r.fields || {}) === key).sort(sortByDateDesc);
}

function clientSummaryFromRows(rows) {
  const first = rows[0] || { fields: {} };
  const f0 = first.fields || {};
  const last = rows[0]?.fields || {};
  const name = last["Имя клиента"] || f0["Имя клиента"] || "Без имени";
  const company = last["Компания"] || f0["Компания"] || "";
  const phone = last["Телефон"] || f0["Телефон"] || "";
  const requests = rows.length;
  const m2 = rows.reduce((s, r) => s + getM2(r.fields || {}), 0);
  const done = rows.filter((r) => PAYROLL_STATUSES.has((r.fields || {})["Статус"] || "")).length;
  const lastDate = rows.map((r) => (r.fields || {})["Дата записи"] || "").filter(Boolean).sort().pop() || "—";
  return { name, company, phone, requests, m2, done, lastDate };
}

function openClientCard(key) {
  const rows = clientRecordsByKey(key);
  if (!rows.length || !els.clientCardDialog) return;
  currentClientKey = key;
  const s = clientSummaryFromRows(rows);
  els.clientCardTitle.textContent = s.name || "Карточка клиента";
  els.clientCardSubtitle.textContent = [s.company, s.phone].filter(Boolean).join(" · ");
  els.clientCardStatRequests.textContent = s.requests;
  els.clientCardStatM2.textContent = moneyNumber(s.m2);
  els.clientCardStatDone.textContent = s.done;
  els.clientCardStatLast.textContent = s.lastDate;

  const phones = uniqueValues(rows.map((r) => (r.fields || {})["Телефон"]));
  const companies = uniqueValues(rows.map((r) => (r.fields || {})["Компания"]));
  const services = uniqueValues(rows.map((r) => (r.fields || {})["Услуга"]));
  const addresses = uniqueValues(rows.map((r) => (r.fields || {})["Адрес"]));
  els.clientCardInfo.innerHTML = `
    <p><b>ФИО:</b> ${e(s.name || "—")}</p>
    <p><b>Компания:</b> ${e(companies.join(", ") || "—")}</p>
    <p><b>Телефон:</b> ${phones.length ? phones.map(phoneLink).join("<br>") : "—"}</p>
    <p><b>Услуги:</b> ${e(services.join(", ") || "—")}</p>
  `;
  els.clientCardAddresses.innerHTML = addresses.length ? addresses.map((a) => `<span>${e(a)}</span>`).join("") : '<p class="muted-text">Адресов пока нет.</p>';
  els.clientCardRequestsBody.innerHTML = rows.map((r) => {
    const f = r.fields || {};
    return `<tr class="clickable-row" data-open-row="${e(r.id)}"><td>${e(f["Дата записи"] || "")}</td><td>${e(f["Услуга"] || "—")}</td><td>${e(f["Адрес"] || "—")}</td><td>${moneyNumber(getM2(f))}</td><td><span class="status" data-status="${e(f["Статус"] || "")}">${e(f["Статус"] || "—")}</span></td><td><button class="open-btn" data-open="${e(r.id)}">Открыть</button></td></tr>`;
  }).join("") || '<tr><td colspan="6">Заявок пока нет</td></tr>';

  const requestIds = new Set(rows.map((r) => String(r.id)));
  const files = filesCache.filter((file) => requestIds.has(String(file.requestId)));
  els.clientCardFiles.innerHTML = files.length ? files.map(fileMiniHtml).join("") : '<p class="muted-text">Файлов по клиенту пока нет.</p>';

  const comments = rows.map((r) => {
    const f = r.fields || {};
    const text = [f["Комментарий клиента"], f["Комментарий"], f["Комментарий администратора"]].filter(Boolean).join("\n");
    if (!text) return "";
    return `<div class="history-item"><b>#${e(r.id)} · ${e(f["Дата записи"] || "")}</b><p>${nl2br(text)}</p></div>`;
  }).filter(Boolean);
  els.clientCardComments.innerHTML = comments.join("") || '<p class="muted-text">Комментариев пока нет.</p>';
  bindActionButtons();
  els.clientCardDialog.showModal();
}

function quickAddFromClientCard() {
  const rows = clientRecordsByKey(currentClientKey);
  if (!rows.length) return;
  const f = rows[0].fields || {};
  if (els.clientCardDialog?.open) els.clientCardDialog.close();
  openQuickAdd({
    name: f["Имя клиента"] || "",
    company: f["Компания"] || "",
    phone: f["Телефон"] || "",
    address: f["Адрес"] || "",
    service: f["Услуга"] || "Замер / консультация",
    comment: "Повторное обращение клиента"
  });
}

function uniqueValues(list) {
  return [...new Set((list || []).map((x) => String(x || "").trim()).filter(Boolean))];
}

function renderGlobalSearch(allowOpen = true) {
  if (!els.globalSearchInput || !els.globalSearchResults) return;
  const q = norm(els.globalSearchInput.value || "");
  if (!q || q.length < 2) { els.globalSearchResults.hidden = true; els.globalSearchResults.innerHTML = ""; return; }
  const items = [];
  const seenClients = new Set();
  records.forEach((r) => {
    const f = r.fields || {};
    const hay = norm([r.id, f["Имя клиента"], f["Компания"], f["Телефон"], f["Услуга"], f["Адрес"], f["Статус"], f["Монтажники"], f["Комментарий клиента"], f["Комментарий администратора"]].join(" "));
    if (hay.includes(q)) {
      items.push({ type: "Заявка", title: `#${r.id} — ${f["Имя клиента"] || "Без имени"}`, sub: [f["Компания"], f["Телефон"], f["Услуга"], f["Адрес"], f["Статус"]].filter(Boolean).join(" · "), action: "open", id: r.id });
      const ck = clientKeyFromFields(f);
      if (ck && !seenClients.has(ck)) {
        seenClients.add(ck);
        items.push({ type: "Клиент", title: f["Имя клиента"] || f["Компания"] || f["Телефон"] || "Клиент", sub: [f["Компания"], f["Телефон"], "карточка клиента"].filter(Boolean).join(" · "), action: "client", id: ck });
      }
    }
  });
  filesCache.forEach((file) => {
    const hay = norm([file.originalName, file.name, file.client, file.phone, file.address, file.service, file.fileType, file.requestId].join(" "));
    if (hay.includes(q)) items.push({ type: "Файл", title: file.originalName || file.name || "Файл", sub: [`#${file.requestId || "—"}`, file.client, file.address, file.fileType].filter(Boolean).join(" · "), action: "file", id: file.key });
  });
  const limited = items.slice(0, 18);
  els.globalSearchResults.innerHTML = limited.length ? limited.map((item) => `<button type="button" class="global-search-item" data-global-action="${e(item.action)}" data-global-id="${e(item.id)}"><span>${e(item.type)}</span><b>${e(item.title)}</b><small>${e(item.sub)}</small></button>`).join("") : '<div class="global-search-empty">Ничего не найдено</div>';
  els.globalSearchResults.hidden = false;
}

function handleGlobalSearchClick(event) {
  const btn = event.target.closest("[data-global-action]");
  if (!btn) return;
  const action = btn.dataset.globalAction;
  const id = btn.dataset.globalId;
  els.globalSearchResults.hidden = true;
  if (action === "open") openRequest(id);
  if (action === "client") openClientCard(id);
  if (action === "file") openFilePreview(id);
}

function calendarPrefillData(ev) {
  const parsed = parseCalendarEvent(ev);
  return {
    ...parsed,
    date: ev.date || String(ev.start || "").slice(0, 10),
    time: ev.startTime || "10:00",
    address: parsed.address || ev.location || "",
    calendarEvent: ev,
    comment: buildCalendarComment(ev, parsed)
  };
}

function buildCalendarComment(ev, parsed) {
  const parts = [
    "Источник: Google Календарь",
    ev.title ? "Событие: " + ev.title : "",
    parsed.company ? "Компания: " + parsed.company : "",
    ev.location ? "Адрес из календаря: " + ev.location : "",
    ev.description ? "Описание: " + ev.description : "",
    ev.htmlLink ? "Ссылка на событие: " + ev.htmlLink : ""
  ];
  return parts.filter(Boolean).join("\n");
}

function parseCalendarEvent(ev) {
  const title = String(ev.title || "");
  const description = String(ev.description || "");
  const location = String(ev.location || "");
  const all = [title, description, location].join("\n");
  const phone = extractPhone(all);
  const company = extractCompany(all);
  const service = detectServiceFromText(all);
  const m2Match = all.match(/(\d+(?:[\.,]\d+)?)\s*(?:м2|м²|кв\.?\s*м)/i);
  const m2 = m2Match ? m2Match[1].replace(",", ".") : "";
  let name = extractNameFromTitle(title, phone, service, company);
  const address = extractAddress(all, location);
  return { phone, company, service, name, address, m2 };
}

function extractPhone(text) {
  const m = String(text || "").match(/(?:\+?7|8)?[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}/);
  return m ? formatQuickPhoneForTyping(m[0]) : "";
}

function extractCompany(text) {
  const s = String(text || "");
  const m = s.match(/((?:ООО|ИП|АО|ПАО|ЗАО)\s+[«\"А-ЯA-ZЁ0-9][^\n,;]{1,80})/i);
  return m ? m[1].trim() : "";
}

function extractNameFromTitle(title, phone, service, company) {
  let s = String(title || "");
  if (phone) s = s.replace(phone, "").replace(formatRussianPhone(phone), "");
  s = s.replace(/(?:\+?7|8)?[\s\-()]*\d{3}[\s\-()]*\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}/g, " ");
  [service, company, "тонировка", "атермальная", "балкон", "окна", "окно", "витрина", "витрины", "замер", "бронирование", "фары", "пленка", "плёнка", "монтаж", "солнцанет"].forEach((word) => { if (word) s = s.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), " "); });
  s = s.replace(/[—–_:;,.|/\\]+/g, " ").replace(/\s+/g, " ").trim();
  return s.length >= 2 && s.length <= 80 ? s : "";
}

function extractAddress(text, location) {
  if (location) return String(location).trim();
  const lines = String(text || "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const addr = lines.find((line) => /(?:ул\.|улица|проспект|пр-т|пер\.|переулок|шоссе|бульвар|наб\.|дом|д\.|офис|Екатеринбург)/i.test(line));
  return addr || "";
}

function detectServiceFromText(text) {
  const s = norm(text);
  if (/фар/.test(s)) return "Бронирование фар";
  if (/полиур|ppf|капот|бампер|кузов|антиграв/.test(s)) return "Защита авто полиуретановой пленкой";
  if (/атерм/.test(s)) return "Атермальная тонировка автомобиля";
  if (/балкон|лоджи|окн/.test(s)) return "Тонировка балконов и окон";
  if (/офис|перегород/.test(s)) return "Декоративное тонирование офисных перегородок";
  if (/брон|укреп|safety|безопас|стекл/.test(s) && /витрин|стекл/.test(s)) return "Бронирование стекол и витрин";
  if (/витрин/.test(s)) return "Тонирование витрин";
  if (/авто|машин|лобов|задн|передн|тонир/.test(s)) return "Тонировка стекол автомобиля";
  if (/замер|консультац/.test(s)) return "Замер / консультация";
  return "Замер / консультация";
}
