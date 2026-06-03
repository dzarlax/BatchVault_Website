import { FormEvent, useEffect, useState } from 'react';
import { AnchorButton, Button, Card, Input, Textarea } from './components/ui';
import { copy, languages } from './lib/translations';
import type { Language, LeadForm, SubmitState, Theme } from './types';

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
    ['Chili džem, 4 шт', 'готово'],
    ['Granola, 2 пакета', 'в работе'],
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

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('batchvault-lang');
    return stored === 'ru' || stored === 'en' || stored === 'sr' ? stored : 'sr';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('batchvault-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [statusText, setStatusText] = useState('');
  const t = copy[language];

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
        <a className="brand" href="#">
          <span className="brand-mark">
            <img src="/batchvault-logo.png" alt="" />
          </span>
          <span>BatchVault</span>
        </a>
        <div className="nav-links">
          <a href="#workflow">{t.navWorkflow}</a>
          <a href="#features">{t.navFeatures}</a>
          <a href="#pricing">{t.navPricing}</a>
        </div>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
            <span>{theme === 'dark' ? t.themeLight : t.themeDark}</span>
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
          <AnchorButton className="nav-cta" href="#pilot" variant="secondary">
            {t.navCta}
          </AnchorButton>
        </div>
      </nav>

      <main>
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
          <a href="#workflow">{t.navWorkflow}</a>
          <a href="#features">{t.navFeatures}</a>
          <a href="#pricing">{t.navPricing}</a>
          <a href="#pilot">{t.footerPilot}</a>
          <a href="mailto:hello@batchvault.app">{t.footerContact}</a>
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

function DashboardPreview({ language }: { language: Language }) {
  const t = copy[language];
  return (
    <div className="dashboard-preview">
      <div className="dash-top">
        <span />
        <span />
        <span />
        BatchVault dashboard
      </div>
      <div className="dash-shell">
        <aside className="dash-sidebar">
          <strong>BatchVault</strong>
          {['Dashboard', 'Recipes', 'Ingredients', 'Prices', 'Orders', 'Clients'].map((item, index) => (
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
