export type Language = 'sr' | 'ru' | 'en';

export type Theme = 'light' | 'dark';

export type PageSlug = 'landing' | 'privacy' | 'data-deletion';

export type LeadForm = {
  name: string;
  contact: string;
  product: string;
  message: string;
  company: string;
};

export type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
