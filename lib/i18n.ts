// Lightweight i18n. Two locales: ru, uz. The active locale is stored in a
// cookie called `locale`. Server components read it via next/headers, client
// components via document.cookie.

export type Locale = 'ru' | 'uz';
export const LOCALES: Locale[] = ['ru', 'uz'];
export const DEFAULT_LOCALE: Locale = 'ru';

export type Dict = Record<string, string>;

const ru: Dict = {
  app_name: 'LUME Quiz',
  app_subtitle: 'Проверьте, насколько хорошо вы знаете admin.lume.uz',
  nav_home: 'Главная',
  nav_login: 'Войти',
  nav_register: 'Регистрация',
  nav_admin: 'Админ',
  nav_logout: 'Выйти',
  nav_test: 'Пройти тест',
  nav_profile: 'Профиль',

  // Landing
  landing_title: 'Тест на знание системы LUME Admin',
  landing_lead:
    'Платформа тестирования по системе администрирования lume.uz. Зарегистрируйтесь, пройдите тест из 20 случайных вопросов и узнайте свой балл.',
  landing_cta_register: 'Зарегистрироваться',
  landing_cta_login: 'У меня уже есть аккаунт',
  landing_features_1_t: '200 уникальных вопросов',
  landing_features_1_d: 'Каждый раз случайные 20 — два прохождения никогда не совпадут.',
  landing_features_2_t: 'Скриншоты системы',
  landing_features_2_d: 'Каждый вопрос сопровождается реальным скриншотом из admin.lume.uz.',
  landing_features_3_t: 'Реальное время',
  landing_features_3_d: 'Счётчики правильных и неправильных ответов обновляются мгновенно.',
  landing_features_4_t: 'Только одна попытка',
  landing_features_4_d: 'Один аккаунт — один тест за всё время. Подходите ответственно.',

  // Auth
  auth_email: 'E-mail',
  auth_name: 'Имя',
  auth_password: 'Пароль',
  auth_login_title: 'Вход',
  auth_register_title: 'Регистрация',
  auth_login_btn: 'Войти',
  auth_register_btn: 'Зарегистрироваться',
  auth_have_account: 'Уже есть аккаунт?',
  auth_no_account: 'Нет аккаунта?',
  auth_admin_login: 'Вход для администратора',
  auth_or: 'или',
  auth_required: 'Это поле обязательно',
  auth_invalid_email: 'Неверный e-mail',
  auth_short_password: 'Пароль должен содержать минимум 6 символов',
  auth_taken: 'Этот e-mail уже зарегистрирован',
  auth_bad_credentials: 'Неверный e-mail или пароль',

  // Test
  test_intro_title: 'Готовы пройти тест?',
  test_intro_lead:
    'Вам будет предложено 20 случайных вопросов из базы в 200 вопросов о системе admin.lume.uz. У вас есть только одна попытка. Удачи!',
  test_start: 'Начать тест',
  test_already_done: 'Вы уже проходили тест. Повторное прохождение запрещено.',
  test_question: 'Вопрос',
  test_of: 'из',
  test_correct: 'Правильно',
  test_incorrect: 'Неправильно',
  test_remaining: 'Осталось',
  test_submit_answer: 'Ответить',
  test_next: 'Следующий вопрос',
  test_finish: 'Завершить тест',
  test_finished_title: 'Тест завершён',
  test_your_score: 'Ваш результат',
  test_score_correct: 'Правильных ответов',
  test_score_incorrect: 'Неправильных ответов',
  test_back_home: 'На главную',
  test_view_screenshot: 'Скриншот к вопросу',

  // Admin
  admin_title: 'Панель администратора',
  admin_search_placeholder: 'Поиск по имени или e-mail…',
  admin_total_users: 'Всего пользователей',
  admin_total_attempts: 'Всего попыток',
  admin_avg_score: 'Средний балл',
  admin_th_name: 'Имя',
  admin_th_email: 'E-mail',
  admin_th_score: 'Результат',
  admin_th_status: 'Статус',
  admin_th_date: 'Дата',
  admin_status_done: 'Завершён',
  admin_status_in_progress: 'В процессе',
  admin_status_not_started: 'Не начинал',
  admin_no_users: 'Пользователи не найдены',

  // Common
  common_loading: 'Загрузка…',
  common_error: 'Произошла ошибка',
  common_save: 'Сохранить',
  common_cancel: 'Отмена',
  ip_limit_exceeded: 'С этого IP-адреса в этом месяце уже был пройден тест. Попробуйте в следующем месяце.',
};

const uz: Dict = {
  app_name: 'LUME Quiz',
  app_subtitle: 'admin.lume.uz tizimini qanchalik yaxshi bilishingizni sinab ko‘ring',
  nav_home: 'Bosh sahifa',
  nav_login: 'Kirish',
  nav_register: 'Ro‘yxatdan o‘tish',
  nav_admin: 'Admin',
  nav_logout: 'Chiqish',
  nav_test: 'Testni boshlash',
  nav_profile: 'Profil',

  landing_title: 'LUME Admin tizimi bo‘yicha test',
  landing_lead:
    'lume.uz boshqaruv tizimi bo‘yicha test platformasi. Ro‘yxatdan o‘ting, 20 ta tasodifiy savoldan iborat testni topshiring va ballaringizni biling.',
  landing_cta_register: 'Ro‘yxatdan o‘tish',
  landing_cta_login: 'Mening akkauntim bor',
  landing_features_1_t: '200 ta noyob savol',
  landing_features_1_d: 'Har safar 20 ta tasodifiy savol — ikkita urinish hech qachon mos kelmaydi.',
  landing_features_2_t: 'Tizim skrinshotlari',
  landing_features_2_d: 'Har bir savol admin.lume.uz dan haqiqiy skrinshot bilan birga keladi.',
  landing_features_3_t: 'Real vaqt',
  landing_features_3_d: 'To‘g‘ri va noto‘g‘ri javoblar hisoblagichi darhol yangilanadi.',
  landing_features_4_t: 'Faqat bitta urinish',
  landing_features_4_d: 'Bitta akkaunt — barcha vaqt uchun bitta test. Mas’uliyat bilan yondashing.',

  auth_email: 'E-mail',
  auth_name: 'Ism',
  auth_password: 'Parol',
  auth_login_title: 'Kirish',
  auth_register_title: 'Ro‘yxatdan o‘tish',
  auth_login_btn: 'Kirish',
  auth_register_btn: 'Ro‘yxatdan o‘tish',
  auth_have_account: 'Akkauntingiz bormi?',
  auth_no_account: 'Akkauntingiz yo‘qmi?',
  auth_admin_login: 'Administrator uchun kirish',
  auth_or: 'yoki',
  auth_required: 'Bu maydon majburiy',
  auth_invalid_email: 'Noto‘g‘ri e-mail',
  auth_short_password: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak',
  auth_taken: 'Bu e-mail allaqachon ro‘yxatdan o‘tgan',
  auth_bad_credentials: 'E-mail yoki parol noto‘g‘ri',

  test_intro_title: 'Testni boshlashga tayyormisiz?',
  test_intro_lead:
    'Sizga admin.lume.uz tizimi bo‘yicha 200 ta savoldan tasodifiy 20 tasi taklif etiladi. Sizda faqat bitta urinish bor. Omad!',
  test_start: 'Testni boshlash',
  test_already_done: 'Siz allaqachon testdan o‘tgansiz. Qayta urinish taqiqlangan.',
  test_question: 'Savol',
  test_of: '/',
  test_correct: 'To‘g‘ri',
  test_incorrect: 'Noto‘g‘ri',
  test_remaining: 'Qoldi',
  test_submit_answer: 'Javob berish',
  test_next: 'Keyingi savol',
  test_finish: 'Testni yakunlash',
  test_finished_title: 'Test tugadi',
  test_your_score: 'Sizning natijangiz',
  test_score_correct: 'To‘g‘ri javoblar',
  test_score_incorrect: 'Noto‘g‘ri javoblar',
  test_back_home: 'Bosh sahifaga',
  test_view_screenshot: 'Savolga skrinshot',

  admin_title: 'Administrator paneli',
  admin_search_placeholder: 'Ism yoki e-mail bo‘yicha qidirish…',
  admin_total_users: 'Jami foydalanuvchilar',
  admin_total_attempts: 'Jami urinishlar',
  admin_avg_score: 'O‘rtacha ball',
  admin_th_name: 'Ism',
  admin_th_email: 'E-mail',
  admin_th_score: 'Natija',
  admin_th_status: 'Holat',
  admin_th_date: 'Sana',
  admin_status_done: 'Yakunlangan',
  admin_status_in_progress: 'Jarayonda',
  admin_status_not_started: 'Boshlanmagan',
  admin_no_users: 'Foydalanuvchilar topilmadi',

  common_loading: 'Yuklanmoqda…',
  common_error: 'Xatolik yuz berdi',
  common_save: 'Saqlash',
  common_cancel: 'Bekor qilish',
  ip_limit_exceeded: 'Bu IP manzildan bu oyda allaqachon test topshirilgan. Keyingi oy qaytadan urinib ko‘ring.',
};

export const dictionaries: Record<Locale, Dict> = { ru, uz };

export function t(locale: Locale, key: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
}
