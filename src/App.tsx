import { FormEvent, useEffect, useState } from 'react';
import { AnchorButton, Button, Card, Input, Textarea } from './components/ui';
import { copy, languages } from './lib/translations';
import type { Language, LeadForm, PageSlug, SubmitState, Theme } from './types';

const initialForm: LeadForm = {
  name: '',
  contact: '',
  product: '',
  message: '',
  company: ''
};

const orders = {
  sr: [
    ['Chili džem, 4 kom', 'spremno'],
    ['Granola, 2 kese', 'u toku'],
    ['Sušeno meso, 1 kg', 'novo'],
    ['Fermentisani sos', 'završeno']
  ],
  ru: [
    ['Чили-джем, 4 шт', 'готово'],
    ['Гранола, 2 пакета', 'в работе'],
    ['Сушеное мясо, 1 кг', 'новый'],
    ['Ферментированный соус', 'завершено']
  ],
  en: [
    ['Chili jam, 4 pcs', 'ready'],
    ['Granola, 2 bags', 'in progress'],
    ['Dried meat, 1 kg', 'new'],
    ['Fermented sauce', 'finished']
  ]
} satisfies Record<Language, Array<[string, string]>>;

const supportedLanguages = ['sr', 'ru', 'en'] satisfies Language[];
const legalPageSlugs = ['privacy', 'data-deletion'] satisfies Array<Exclude<PageSlug, 'landing'>>;
const contactEmailLabel = 'me [at] dzarlax [dot] dev';

type LegalPageSlug = (typeof legalPageSlugs)[number];

type LegalPageCopy = {
  title: string;
  lead: string;
  updated: string;
  contact: string;
  sections: Array<{
    title: string;
    text: string[];
  }>;
};

const legalPages = {
  sr: {
    privacy: {
      title: 'Privacy Policy',
      lead:
        'Ova stranica objašnjava koje podatke BatchVault prikuplja kroz sajt, web aplikaciju i mobilne aplikacije.',
      updated: 'Poslednje ažuriranje: 3. jun 2026.',
      contact: 'Za pitanja o privatnosti koristi kontakt dugme ispod.',
      sections: [
        {
          title: 'Podaci koje prikupljamo',
          text: [
            'Kada koristiš BatchVault, možemo čuvati podatke naloga, kontakt, jezik, tehničke podatke uređaja i sadržaj koji uneseš u servis.',
            'Sadržaj servisa može uključivati recepte, sastojke, cene, proizvode, porudžbine, kupce, napomene i podatke iz pilot ili kontakt forme.'
          ]
        },
        {
          title: 'Zašto ih koristimo',
          text: [
            'Podatke koristimo da servis radi: za čuvanje tvojih poslovnih zapisa, računanje cena, prikaz porudžbina, podršku i komunikaciju.',
            'Tehnički podaci pomažu da sprečimo spam, popravimo greške i održimo web i mobilne aplikacije stabilnim.'
          ]
        },
        {
          title: 'Gde se čuvaju',
          text: [
            'Podaci se čuvaju na BatchVault serverima i u operativnim bazama koje pokreću servis. Obaveštenja o kontakt formama mogu biti poslata u Telegram kanal vlasnika projekta.',
            'Podatke ne prodajemo i ne delimo sa oglašivačima.'
          ]
        },
        {
          title: 'Koliko dugo ih čuvamo',
          text: [
            'Podatke naloga i poslovne zapise čuvamo dok koristiš servis ili dok su potrebni za podršku, sigurnost i osnovnu evidenciju.',
            'Možeš zatražiti brisanje podataka ili naloga u bilo kom trenutku.'
          ]
        },
        {
          title: 'Tvoja prava',
          text: [
            'Možeš zatražiti kopiju podataka, ispravku ili brisanje preko kontakt dugmeta na ovoj stranici.',
            'Ako želiš brisanje, koristi i stranicu za zahtev za brisanje podataka.'
          ]
        }
      ]
    },
    'data-deletion': {
      title: 'Zahtev za brisanje ličnih podataka',
      lead: 'Ako želiš da BatchVault obriše tvoje lične podatke ili podatke naloga iz servisa, pošalji zahtev.',
      updated: 'Obično odgovaramo ručno, čim proverimo koji nalog ili zapis pripada tvom kontaktu.',
      contact: 'Pošalji zahtev preko kontakt dugmeta ispod.',
      sections: [
        {
          title: 'Šta poslati',
          text: [
            'U poruci navedi kontakt koji si koristio u servisu ili formi: email, telefon ili Instagram nalog.',
            'Ako imaš nalog, navedi email naloga. Ako si slao samo kontakt formu, dodaj ime, tip proizvoda ili kratku poruku da lakše pronađemo zapis.'
          ]
        },
        {
          title: 'Šta brišemo',
          text: [
            'Brišemo lične podatke naloga i sadržaj povezan sa nalogom, uključujući zapise kao što su recepti, sastojci, cene, proizvodi, porudžbine, kupci i poruke, kada se mogu povezati sa tobom.',
            'Ne brišemo anonimne tehničke logove koji više ne mogu pouzdano da se povežu sa tobom, niti podatke koje moramo privremeno zadržati zbog sigurnosti, zloupotrebe ili zakonskih razloga.'
          ]
        },
        {
          title: 'Kako poslati zahtev',
          text: [
            'Klikni na kontakt dugme ispod ili napiši novu poruku sa naslovom "BatchVault data deletion request".',
            'Odgovorićemo kada zahtev bude obrađen ili ako nam treba dodatna potvrda identiteta kontakta.'
          ]
        }
      ]
    }
  },
  ru: {
    privacy: {
      title: 'Политика конфиденциальности',
      lead: 'На этой странице описано, какие данные BatchVault собирает через сайт, web-приложение и мобильные приложения.',
      updated: 'Последнее обновление: 3 июня 2026.',
      contact: 'По вопросам приватности используйте кнопку контакта ниже.',
      sections: [
        {
          title: 'Какие данные мы собираем',
          text: [
            'Когда вы используете BatchVault, мы можем хранить данные аккаунта, контакт, язык, технические данные устройства и контент, который вы добавляете в сервис.',
            'Контент сервиса может включать рецепты, ингредиенты, цены, продукты, заказы, клиентов, заметки и данные из пилотной или контактной формы.'
          ]
        },
        {
          title: 'Зачем мы их используем',
          text: [
            'Данные нужны, чтобы сервис работал: сохранял ваши рабочие записи, считал цены, показывал заказы, поддерживал пользователей и позволял связаться с вами.',
            'Технические данные помогают бороться со спамом, исправлять ошибки и поддерживать стабильную работу web и мобильных приложений.'
          ]
        },
        {
          title: 'Где они хранятся',
          text: [
            'Данные хранятся на серверах BatchVault и в операционных базах, которые обеспечивают работу сервиса. Уведомления из контактных форм могут отправляться в Telegram-канал владельца проекта.',
            'Мы не продаем данные и не передаем их рекламным сервисам.'
          ]
        },
        {
          title: 'Как долго мы их храним',
          text: [
            'Данные аккаунта и рабочие записи хранятся, пока вы используете сервис или пока они нужны для поддержки, безопасности и базового учета.',
            'Вы можете запросить удаление данных или аккаунта в любой момент.'
          ]
        },
        {
          title: 'Ваши права',
          text: [
            'Можно запросить копию данных, исправление или удаление через кнопку контакта на этой странице.',
            'Для удаления также можно использовать страницу запроса удаления персональных данных.'
          ]
        }
      ]
    },
    'data-deletion': {
      title: 'Запрос удаления персональных данных',
      lead: 'Если вы хотите, чтобы BatchVault удалил ваши персональные данные или данные аккаунта из сервиса, отправьте запрос.',
      updated: 'Мы отвечаем вручную после проверки, какой аккаунт или запись относится к вашему контакту.',
      contact: 'Отправьте запрос через кнопку контакта ниже.',
      sections: [
        {
          title: 'Что указать',
          text: [
            'В письме укажите контакт, который вы использовали в сервисе или форме: email, телефон или Instagram.',
            'Если у вас есть аккаунт, укажите email аккаунта. Если вы отправляли только контактную форму, добавьте имя, тип продукта или короткое сообщение, чтобы проще найти запись.'
          ]
        },
        {
          title: 'Что мы удаляем',
          text: [
            'Мы удаляем персональные данные аккаунта и связанный с аккаунтом контент, включая рецепты, ингредиенты, цены, продукты, заказы, клиентов и сообщения, если их можно связать с вами.',
            'Мы не удаляем анонимные технические логи, которые уже нельзя надежно связать с вами, а также данные, которые нужно временно сохранить для безопасности, расследования злоупотреблений или юридических причин.'
          ]
        },
        {
          title: 'Как отправить запрос',
          text: [
            'Нажмите на кнопку контакта ниже или напишите новое письмо с темой "BatchVault data deletion request".',
            'Мы ответим, когда запрос будет обработан, или если потребуется дополнительное подтверждение контакта.'
          ]
        }
      ]
    }
  },
  en: {
    privacy: {
      title: 'Privacy Policy',
      lead: 'This page explains what data BatchVault collects through the website, web app, and mobile apps.',
      updated: 'Last updated: June 3, 2026.',
      contact: 'For privacy questions, use the contact button below.',
      sections: [
        {
          title: 'Data we collect',
          text: [
            'When you use BatchVault, we may store account data, contact details, language, technical device data, and content you add to the service.',
            'Service content may include recipes, ingredients, prices, products, orders, customers, notes, and data from pilot or contact forms.'
          ]
        },
        {
          title: 'Why we use it',
          text: [
            'We use this data to run the service: save your business records, calculate prices, show orders, provide support, and communicate with you.',
            'Technical data helps prevent spam, fix bugs, and keep the web and mobile apps stable.'
          ]
        },
        {
          title: 'Where it is stored',
          text: [
            'Data is stored on BatchVault servers and in the operational databases that run the service. Notifications from contact forms may be sent to the project owner in Telegram.',
            'We do not sell the data or share it with advertising services.'
          ]
        },
        {
          title: 'How long we keep it',
          text: [
            'Account data and business records are kept while you use the service or while they are needed for support, security, and basic records.',
            'You can ask us to delete your data or account at any time.'
          ]
        },
        {
          title: 'Your rights',
          text: [
            'You can request a copy, correction, or deletion through the contact button on this page.',
            'For deletion, you can also use the personal data deletion request page.'
          ]
        }
      ]
    },
    'data-deletion': {
      title: 'Personal Data Deletion Request',
      lead: 'If you want BatchVault to delete your personal data or account data from the service, send a request.',
      updated: 'We reply manually after checking which account or record belongs to your contact.',
      contact: 'Send the request through the contact button below.',
      sections: [
        {
          title: 'What to include',
          text: [
            'Include the contact you used in the service or form: email, phone number, or Instagram account.',
            'If you have an account, include the account email. If you only submitted a contact form, include your name, product type, or short message so we can find the record faster.'
          ]
        },
        {
          title: 'What we delete',
          text: [
            'We delete personal account data and content linked to the account, including records such as recipes, ingredients, prices, products, orders, customers, and messages when they can be connected to you.',
            'We do not delete anonymous technical logs that can no longer be reliably connected to you, or data we must temporarily retain for security, abuse prevention, or legal reasons.'
          ]
        },
        {
          title: 'How to send the request',
          text: [
            'Use the contact button below or write a new message with the subject "BatchVault data deletion request".',
            'We will reply when the request is processed or if we need extra confirmation of the contact identity.'
          ]
        }
      ]
    }
  }
} satisfies Record<Language, Record<LegalPageSlug, LegalPageCopy>>;

function detectBrowserLanguage(): Language {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const candidate of browserLanguages) {
    const normalized = candidate.toLowerCase();
    const baseLanguage = normalized.split('-')[0];
    const match = supportedLanguages.find((item) => item === normalized || item === baseLanguage);

    if (match) {
      return match;
    }
  }

  return 'sr';
}

function getInitialLanguage(): Language {
  const stored = localStorage.getItem('batchvault-lang');
  return stored === 'ru' || stored === 'en' || stored === 'sr' ? stored : detectBrowserLanguage();
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('batchvault-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getCurrentPage(): PageSlug {
  const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (path === 'privacy' || path === 'data-deletion') {
    return path;
  }

  const hashPath = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  return hashPath === 'privacy' || hashPath === 'data-deletion' ? hashPath : 'landing';
}

function openContactEmail() {
  const email = ['me', 'dzarlax', 'dev'];
  window.location.href = `mailto:${email[0]}@${email[1]}.${email[2]}`;
}

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [page, setPage] = useState<PageSlug>(getCurrentPage);
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [statusText, setStatusText] = useState('');
  const t = copy[language];

  useEffect(() => {
    const syncPage = () => setPage(getCurrentPage());
    window.addEventListener('popstate', syncPage);
    window.addEventListener('hashchange', syncPage);

    return () => {
      window.removeEventListener('popstate', syncPage);
      window.removeEventListener('hashchange', syncPage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('batchvault-lang', language);
    setStatusText('');
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('batchvault-theme', theme);
  }, [theme]);

  const updateForm = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.contact.trim()) {
      setSubmitState('error');
      setStatusText(t.formMissingContact);
      return;
    }

    setSubmitState('submitting');
    setStatusText('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          language,
          source: 'batchvault-landing'
        })
      });

      if (!response.ok) {
        throw new Error(`Lead submission failed: ${response.status}`);
      }

      setForm(initialForm);
      setSubmitState('success');
      setStatusText(t.formSuccess);
    } catch (error) {
      setSubmitState('error');
      setStatusText(t.formError);
    }
  };

  return (
    <div className="page-shell">
      <nav className="top-nav" aria-label="BatchVault">
        <a className="brand" href="/">
          <span className="brand-mark">
            <img src="/batchvault-logo.png" alt="" />
          </span>
          <span>BatchVault</span>
        </a>
        <div className="nav-links">
          <a href="/#workflow">{t.navWorkflow}</a>
          <a href="/#features">{t.navFeatures}</a>
          <a href="/#pricing">{t.navPricing}</a>
        </div>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'dark' ? '☀' : '☾'}
            </span>
          </button>
          <div className="lang-switcher" aria-label="Language">
            {languages.map((item) => (
              <button
                className={item.code === language ? 'active' : ''}
                key={item.code}
                onClick={() => setLanguage(item.code)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <AnchorButton className="nav-cta" href="/#pilot" variant="secondary">
            {t.navCta}
          </AnchorButton>
        </div>
      </nav>

      <main>
        {page === 'landing' ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <h1>{t.heroTitle}</h1>
                <p className="lead">{t.heroLead}</p>
                <div className="actions">
                  <AnchorButton href="#pilot">{t.heroPrimary}</AnchorButton>
                  <AnchorButton href="#workflow" variant="secondary">
                    {t.heroSecondary}
                  </AnchorButton>
                </div>
                <div className="trust-grid">
                  <TrustItem title={t.trustPriceTitle} text={t.trustPriceText} />
                  <TrustItem title={t.trustPlatformsTitle} text={t.trustPlatformsText} />
                  <TrustItem title={t.trustSimpleTitle} text={t.trustSimpleText} />
                </div>
              </div>

              <div className="stage" aria-label="BatchVault product preview">
                <DashboardPreview language={language} />
              </div>
            </section>

            <section className="content-section" id="workflow">
              <SectionTitle title={t.workflowTitle} text={t.workflowText} />
              <div className="flow-grid">
                <FlowCard number="1" title={t.flowRecipeTitle} text={t.flowRecipeText} />
                <FlowCard number="2" title={t.flowIngredientsTitle} text={t.flowIngredientsText} />
                <FlowCard number="3" title={t.flowPriceTitle} text={t.flowPriceText} />
                <FlowCard number="4" title={t.flowOrderTitle} text={t.flowOrderText} />
                <FlowCard number="5" title={t.flowProfitTitle} text={t.flowProfitText} />
              </div>
            </section>

            <section className="content-section" id="features">
              <SectionTitle title={t.featuresTitle} text={t.featuresText} />
              <div className="feature-grid">
                <Feature icon="∑" title={t.featureCostTitle} text={t.featureCostText} />
                <Feature icon="✓" title={t.featureOrdersTitle} text={t.featureOrdersText} />
                <Feature icon="↗" title={t.featureGrowthTitle} text={t.featureGrowthText} />
              </div>
            </section>

            <section className="content-section pricing-section" id="pricing">
              <SectionTitle title={t.pricingTitle} text={t.pricingText} />
              <Card className="price-panel">
                <strong>{t.pricingPlan}</strong>
                <div className="price">
                  990 RSD <span>{t.pricingPeriod}</span>
                </div>
                <p>{t.pricingNote}</p>
                <ul>
                  <li>{t.pricingItem1}</li>
                  <li>{t.pricingItem2}</li>
                  <li>{t.pricingItem3}</li>
                  <li>{t.pricingItem4}</li>
                </ul>
              </Card>
            </section>

            <section className="content-section" id="pilot">
              <div className="contact-panel">
                <div>
                  <h2>{t.closingTitle}</h2>
                  <p>{t.closingText}</p>
                </div>
                <form className="lead-form" onSubmit={submitLead}>
                  <input
                    autoComplete="off"
                    className="honeypot"
                    name="company"
                    onChange={(event) => updateForm('company', event.target.value)}
                    tabIndex={-1}
                    value={form.company}
                  />
                  <div className="form-row">
                    <Field label={t.formNameLabel}>
                      <Input
                        autoComplete="name"
                        id="lead-name"
                        name="name"
                        onChange={(event) => updateForm('name', event.target.value)}
                        placeholder={t.formNamePlaceholder}
                        value={form.name}
                      />
                    </Field>
                    <Field label={t.formContactLabel}>
                      <Input
                        autoComplete="email"
                        id="lead-contact"
                        name="contact"
                        onChange={(event) => updateForm('contact', event.target.value)}
                        placeholder={t.formContactPlaceholder}
                        required
                        value={form.contact}
                      />
                    </Field>
                  </div>
                  <Field label={t.formProductLabel}>
                    <Input
                      id="lead-product"
                      name="product"
                      onChange={(event) => updateForm('product', event.target.value)}
                      placeholder={t.formProductPlaceholder}
                      value={form.product}
                    />
                  </Field>
                  <Field label={t.formMessageLabel}>
                    <Textarea
                      id="lead-message"
                      name="message"
                      onChange={(event) => updateForm('message', event.target.value)}
                      placeholder={t.formMessagePlaceholder}
                      value={form.message}
                    />
                  </Field>
                  <div className="form-actions">
                    <Button disabled={submitState === 'submitting'} type="submit">
                      {submitState === 'submitting' ? t.formSubmitting : t.formSubmit}
                    </Button>
                    <p className="form-note">{t.formNote}</p>
                  </div>
                  <p className={`form-status form-status--${submitState}`} aria-live="polite">
                    {statusText}
                  </p>
                </form>
              </div>
            </section>
          </>
        ) : (
          <LegalPage language={language} page={page} />
        )}
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark footer-mark">
            <img src="/batchvault-logo.png" alt="" />
          </span>
          <div>
            <strong>BatchVault</strong>
            <p>{t.footerText}</p>
          </div>
        </div>
        <div className="footer-links">
          <a href="/#workflow">{t.navWorkflow}</a>
          <a href="/#features">{t.navFeatures}</a>
          <a href="/#pricing">{t.navPricing}</a>
          <a href="/#pilot">{t.footerPilot}</a>
          <a href="/privacy">{t.footerPrivacy}</a>
          <a href="/data-deletion">{t.footerDataDeletion}</a>
          <button className="footer-link-button" onClick={openContactEmail} type="button">
            {t.footerContact}
          </button>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ title, text }: { title: string; text: string }) {
  return (
    <Card className="trust-item">
      <b>{title}</b>
      <span>{text}</span>
    </Card>
  );
}

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function FlowCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <Card className="flow-card">
      <span className="flow-number">{number}</span>
      <b>{title}</b>
      <span>{text}</span>
    </Card>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <Card className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </Card>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function LegalPage({ language, page }: { language: Language; page: Exclude<PageSlug, 'landing'> }) {
  const content = legalPages[language][page];

  return (
    <section className="legal-page">
      <div className="legal-header">
        <h1>{content.title}</h1>
        <p>{content.lead}</p>
        <span>{content.updated}</span>
      </div>

      <div className="legal-layout">
        <Card className="legal-card legal-contact">
          <b>{content.contact}</b>
          <span className="contact-email-label">{contactEmailLabel}</span>
          <Button onClick={openContactEmail} type="button" variant="secondary">
            {copy[language].footerContact}
          </Button>
        </Card>
        <div className="legal-card-list">
          {content.sections.map((section) => (
            <Card className="legal-card legal-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview({ language }: { language: Language }) {
  const t = copy[language];
  const dashboardNav = [
    t.mockNavDashboard,
    t.mockNavRecipes,
    t.mockNavIngredients,
    t.mockNavPrices,
    t.mockNavOrders,
    t.mockNavClients
  ];

  return (
    <div className="dashboard-preview">
      <div className="dash-top">
        <span />
        <span />
        <span />
        {t.mockWindowTitle}
      </div>
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <strong>BatchVault</strong>
          {dashboardNav.map((item, index) => (
            <div className={index === 0 ? 'active' : ''} key={item}>
              {item}
            </div>
          ))}
        </aside>
        <div className="dash-main">
          <div className="dash-title">
            <h2>{t.mockTitle}</h2>
            <span>{t.mockRefresh}</span>
          </div>
          <div className="metrics-grid">
            <Metric label={t.mockOrders} value="38" />
            <Metric label={t.mockProfit} value="12.450" />
            <Metric label={t.mockRecipes} value="7" />
            <Metric label={t.mockClients} value="24" />
          </div>
          <div className="dash-panels">
            <Card className="mini-panel">
              <h3>{t.mockRecent}</h3>
              {orders[language].map(([name, status]) => (
                <div className="order-row" key={`${name}-${status}`}>
                  <span>{name}</span>
                  <b>{status}</b>
                </div>
              ))}
            </Card>
            <Card className="mini-panel">
              <h3>{t.mockChart}</h3>
              <div className="bars" aria-hidden="true">
                <i style={{ width: '88%' }} />
                <i style={{ width: '52%' }} />
                <i style={{ width: '38%' }} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </Card>
  );
}
